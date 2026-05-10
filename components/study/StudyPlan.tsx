"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { sortByPriority } from "@/lib/workload";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { CourseChip } from "@/components/CourseChip";
import { Badge } from "@/components/ui/Badge";
import { formatDate, addDays } from "@/lib/utils";
import { CalendarClock, Sparkles } from "lucide-react";

type StudyBlockPlan = {
  date: Date;
  taskId: string;
  taskName: string;
  course?: { code: string; color: string };
  minutes: number;
  examPrep: boolean;
};

export function StudyPlan() {
  const profile = useStore((s) => s.profile);
  const courses = useStore((s) => s.courses);
  const tasks = useStore((s) => s.tasks);
  const events = useStore((s) => s.personalEvents);

  const examPeriod = useMemo(() => {
    if (!profile) return false;
    const end = new Date(profile.termEndDate);
    const twoWeeksBefore = new Date(end);
    twoWeeksBefore.setDate(end.getDate() - 14);
    return new Date() >= twoWeeksBefore && new Date() <= end;
  }, [profile]);

  const plan = useMemo(() => buildStudyPlan(tasks, courses, events, examPeriod), [
    tasks,
    courses,
    events,
    examPeriod,
  ]);

  const groupedByDay = groupBy(plan, (p) => formatDate(p.date.toISOString(), { weekday: "short", month: "short", day: "numeric" }));

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold">
            Study plan
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {examPeriod ? "Exam-period mode" : "Sunday plan, ready"}
          </h1>
          <p className="text-ink-500 mt-1">
            {examPeriod
              ? "Blocks weighted by remaining grade impact for each upcoming exam."
              : "Blocks scheduled around your commitments and weighted by grade impact."}
          </p>
        </div>
        <Link href="/dashboard" className="btn-secondary">
          ← Back to dashboard
        </Link>
      </div>

      {examPeriod && (
        <Card className="mb-5 bg-gradient-to-br from-accent-50 to-white border-accent-200">
          <CardBody className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent-200 grid place-items-center">
              🎯
            </div>
            <div>
              <div className="font-semibold">Final two weeks of the term</div>
              <div className="text-sm text-ink-500 mt-0.5">
                We've shifted prep blocks earlier and given larger exams proportionally
                more time. Personal events still take priority — study time goes around
                them.
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1fr,320px] gap-5">
        <div className="space-y-5">
          {Object.entries(groupedByDay).map(([day, blocks]) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle>{day}</CardTitle>
                <CardSubtitle>
                  {blocks.length} {blocks.length === 1 ? "block" : "blocks"} ·{" "}
                  {blocks.reduce((s, b) => s + b.minutes, 0)} minutes total
                </CardSubtitle>
              </CardHeader>
              <CardBody className="space-y-2">
                {blocks.map((b, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border border-ink-100"
                  >
                    <div
                      className="h-9 w-9 rounded-lg grid place-items-center"
                      style={{ background: `${b.course?.color}1A`, color: b.course?.color }}
                    >
                      <CalendarClock size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{b.taskName}</div>
                      <div className="text-xs text-ink-500">
                        {b.minutes} min · {b.course?.code}
                      </div>
                    </div>
                    {b.examPrep && <Badge tone="accent">Exam prep</Badge>}
                  </div>
                ))}
              </CardBody>
            </Card>
          ))}
          {plan.length === 0 && (
            <Card>
              <CardBody className="text-center text-sm text-ink-400 py-10">
                Nothing to plan. You're caught up.
              </CardBody>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Top priorities</CardTitle>
              <CardSubtitle>Weighted by grade impact, not just date.</CardSubtitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {sortByPriority(tasks.filter((t) => t.status !== "complete"))
                .slice(0, 5)
                .map((t) => {
                  const c = courses.find((c) => c.id === t.courseId);
                  return (
                    <div key={t.id} className="flex items-center gap-2">
                      <CourseChip course={c} terse />
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="truncate font-medium">{t.name}</div>
                        <div className="text-ink-400">
                          {t.weight}% · due {formatDate(t.dueDate)}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-accent-50 to-white">
            <CardBody className="flex items-start gap-3">
              <Sparkles className="text-accent-700 shrink-0" />
              <div>
                <div className="font-semibold text-sm">Sunday tip</div>
                <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                  Pick the heaviest item on your list and schedule its first block
                  this week — even just 25 minutes. Momentum beats motivation.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function buildStudyPlan(
  tasks: any[],
  courses: any[],
  events: any[],
  examPeriod: boolean,
): StudyBlockPlan[] {
  const out: StudyBlockPlan[] = [];
  const eventDays = new Set<string>();
  for (const ev of events) {
    const s = new Date(ev.startDate);
    const e = new Date(ev.endDate);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      eventDays.add(ymd(d));
    }
  }
  const upcoming = tasks
    .filter((t) => t.status !== "complete")
    .filter((t) => new Date(t.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 12);

  for (const task of upcoming) {
    const course = courses.find((c) => c.id === task.courseId);
    const isExam = task.type === "exam";
    const totalMinutes = isExam
      ? examPeriod
        ? task.weight * 18 // exam-period boost
        : task.weight * 9
      : task.workload === "high"
      ? 240
      : task.workload === "medium"
      ? 120
      : 45;
    const sessions = Math.min(5, Math.max(1, Math.round(totalMinutes / 60)));
    const minutesPerSession = Math.max(30, Math.round(totalMinutes / sessions));

    const due = new Date(task.dueDate);
    let scheduled = 0;
    for (let dayOffset = sessions; dayOffset >= 1; dayOffset--) {
      const date = addDays(due, -dayOffset);
      if (date < new Date()) continue;
      if (eventDays.has(ymd(date))) continue;
      out.push({
        date,
        taskId: task.id,
        taskName: task.name,
        course: course ? { code: course.code, color: course.color } : undefined,
        minutes: minutesPerSession,
        examPrep: isExam,
      });
      scheduled++;
      if (scheduled >= sessions) break;
    }
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const it of items) {
    const k = key(it);
    map[k] ??= [];
    map[k].push(it);
  }
  return map;
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
