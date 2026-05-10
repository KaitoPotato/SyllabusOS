"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
  bucketByWeek,
  heaviestWeek,
  intensityColor,
  intensityLabel,
  sortByPriority,
  thisWeek,
  upcomingThreeDayTasks,
  detectConflicts,
} from "@/lib/workload";
import { Heatmap } from "@/components/Heatmap";
import { TaskRow } from "@/components/TaskRow";
import { CalendarView } from "@/components/CalendarView";
import { TaskDrawer } from "@/components/TaskDrawer";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Task } from "@/lib/types";
import { CalendarDays, List, BookOpenText, Upload, Sparkles } from "lucide-react";
import { formatDate, startOfWeek } from "@/lib/utils";

type View = "calendar" | "list";
type Scope = "all" | string; // course id

export function Dashboard() {
  const profile = useStore((s) => s.profile);
  const courses = useStore((s) => s.courses);
  const tasks = useStore((s) => s.tasks);
  const personalEvents = useStore((s) => s.personalEvents);
  const pendingChanges = useStore((s) => s.changeFlags.filter((f) => f.status === "pending"));

  const [view, setView] = useState<View>("calendar");
  const [scope, setScope] = useState<Scope>("all");
  const [drawer, setDrawer] = useState<Task | null>(null);

  const scopedTasks = useMemo(
    () => (scope === "all" ? tasks : tasks.filter((t) => t.courseId === scope)),
    [tasks, scope],
  );

  const buckets = useMemo(
    () => bucketByWeek(scopedTasks, profile!.termStartDate, profile!.termEndDate),
    [scopedTasks, profile],
  );
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number | null>(null);

  const thisWk = thisWeek(buckets);
  const heavy = heaviestWeek(buckets);
  const upcoming = useMemo(() => upcomingThreeDayTasks(scopedTasks), [scopedTasks]);
  const priority = useMemo(
    () => sortByPriority(scopedTasks.filter((t) => t.status !== "complete")).slice(0, 6),
    [scopedTasks],
  );
  const conflicts = useMemo(
    () => detectConflicts(scopedTasks, personalEvents),
    [scopedTasks, personalEvents],
  );

  const isExamPeriod = useMemo(() => {
    if (!profile) return false;
    const end = new Date(profile.termEndDate);
    const twoWeeksBefore = new Date(end);
    twoWeeksBefore.setDate(end.getDate() - 14);
    return new Date() >= twoWeeksBefore && new Date() <= end;
  }, [profile]);

  const selectedWeek = selectedWeekIdx != null ? buckets[selectedWeekIdx] : null;
  const calendarWeekStart =
    selectedWeek?.start ?? (thisWk?.start ?? startOfWeek(new Date()));

  return (
    <div className="px-6 lg:px-10 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold">
            {profile?.university}
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-0.5">
            Hi {profile?.name.split(" ")[0]} — here's your term.
          </h1>
          <p className="text-ink-500 mt-1">
            {courses.length} {courses.length === 1 ? "course" : "courses"} ·{" "}
            {tasks.filter((t) => t.status === "complete").length}/{tasks.length} tasks done
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/onboarding/upload" className="btn-secondary">
            <Upload size={14} /> Upload another syllabus
          </Link>
        </div>
      </div>

      {/* Banners */}
      {pendingChanges.length > 0 && (
        <Link
          href="/inbox"
          className="flex items-center gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 mb-4 hover:bg-amber-100 transition"
        >
          <div className="h-9 w-9 rounded-xl bg-amber-200 grid place-items-center">
            📬
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-amber-900">
              {pendingChanges.length} pending {pendingChanges.length === 1 ? "change" : "changes"} from professor announcements
            </div>
            <div className="text-xs text-amber-800">
              Review and accept or override before your calendar reflows.
            </div>
          </div>
          <span className="text-sm font-medium text-amber-900">Open inbox →</span>
        </Link>
      )}

      {isExamPeriod && (
        <div className="flex items-center gap-3 rounded-2xl bg-accent-50 border border-accent-200 px-4 py-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-accent-200 grid place-items-center">
            🎯
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-accent-900">
              Exam-period mode on
            </div>
            <div className="text-xs text-accent-800">
              The study plan now blocks time proportional to each exam's grade weight.
            </div>
          </div>
          <Link href="/study-plan" className="text-sm font-medium text-accent-900">
            Open exam prep →
          </Link>
        </div>
      )}

      {/* Top stats */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Stat
          title="This week"
          accent="bg-accent-100 text-accent-700"
          big={`${thisWk?.tasks.length ?? 0}`}
          sub={`due ${thisWk ? "this week" : "next"}, ~${thisWk?.estimatedHours ?? 0}h of work`}
          dateLabel={thisWk ? `Week of ${formatDate(thisWk.start.toISOString())}` : ""}
        />
        <Stat
          title="Heaviest week"
          accent={`${intensityColor(heavy?.intensity ?? 0)}`}
          big={`${intensityLabel(heavy?.intensity ?? 0)}`}
          sub={`${heavy?.tasks.length ?? 0} deliverables — ~${heavy?.estimatedHours ?? 0}h`}
          dateLabel={heavy ? `Week of ${formatDate(heavy.start.toISOString())}` : ""}
        />
        <Stat
          title="Next 3 days"
          accent="bg-emerald-100 text-emerald-700"
          big={`${upcoming.length}`}
          sub="tasks coming up soon"
          dateLabel={upcoming[0] ? `Next: ${upcoming[0].name}` : "Nothing scheduled"}
        />
      </div>

      {/* Heatmap card */}
      <Card className="mb-6">
        <CardHeader className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle>Workload across the term</CardTitle>
            <CardSubtitle>
              Tap a week to drill in. Red weeks mean serious crunch — plan early.
            </CardSubtitle>
          </div>
          <div className="flex items-center gap-2">
            <ScopeSwitcher scope={scope} setScope={setScope} />
          </div>
        </CardHeader>
        <CardBody>
          <Heatmap
            weeks={buckets}
            selectedIndex={selectedWeekIdx ?? undefined}
            onSelect={(w) => setSelectedWeekIdx(w.weekIndex)}
          />
        </CardBody>
      </Card>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left column: calendar/list */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <CardTitle>
                  {selectedWeek
                    ? `Week of ${formatDate(selectedWeek.start.toISOString())}`
                    : "This week"}
                </CardTitle>
                <CardSubtitle>
                  {selectedWeek
                    ? `${intensityLabel(selectedWeek.intensity)} — ${selectedWeek.tasks.length} ${selectedWeek.tasks.length === 1 ? "task" : "tasks"}, ~${selectedWeek.estimatedHours}h`
                    : "Switch view, drill into a week, or filter to one course"}
                </CardSubtitle>
              </div>
              <div className="flex items-center gap-1.5">
                <ViewToggle view={view} setView={setView} />
                {selectedWeekIdx != null && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedWeekIdx(null)}
                  >
                    Clear week
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              {view === "calendar" ? (
                <CalendarView
                  weekStart={calendarWeekStart}
                  tasks={scopedTasks}
                  courses={courses}
                  events={personalEvents}
                  onSelectTask={setDrawer}
                />
              ) : (
                <div className="space-y-1">
                  {(selectedWeek?.tasks ?? scopedTasks)
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
                    )
                    .map((t) => (
                      <TaskRow
                        key={t.id}
                        task={t}
                        course={courses.find((c) => c.id === t.courseId)}
                        onClick={() => setDrawer(t)}
                        onToggle={() => useStore.getState().toggleTaskStatus(t.id)}
                      />
                    ))}
                  {(selectedWeek?.tasks ?? scopedTasks).length === 0 && (
                    <div className="text-sm text-ink-400 px-3 py-6 text-center">
                      Nothing scheduled here yet.
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {conflicts.length > 0 && profile?.plan === "paid" && (
            <Card>
              <CardHeader>
                <CardTitle>Conflicts across academics + life</CardTitle>
                <CardSubtitle>
                  These deadlines land on a day you've already committed elsewhere.
                </CardSubtitle>
              </CardHeader>
              <CardBody className="space-y-2">
                {conflicts.slice(0, 6).map(({ task, event }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-amber-200 bg-amber-50"
                  >
                    <span className="text-lg">⚠️</span>
                    <div className="flex-1 text-xs">
                      <div className="font-medium text-amber-900">
                        {task.name} ↔ {event.title}
                      </div>
                      <div className="text-amber-800">
                        Both fall on {formatDate(task.dueDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Right column: priorities, courses */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>By grade impact</CardTitle>
              <CardSubtitle>Sorted by remaining weight — not just by date.</CardSubtitle>
            </CardHeader>
            <CardBody className="space-y-1">
              {priority.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  course={courses.find((c) => c.id === t.courseId)}
                  onClick={() => setDrawer(t)}
                  onToggle={() => useStore.getState().toggleTaskStatus(t.id)}
                />
              ))}
              {priority.length === 0 && (
                <div className="text-sm text-ink-400 px-3 py-4 text-center">
                  You're all caught up.
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your courses</CardTitle>
              <CardSubtitle>One click to deep-dive structured view.</CardSubtitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {courses.map((c) => {
                const ct = tasks.filter((t) => t.courseId === c.id);
                const done = ct.filter((t) => t.status === "complete").length;
                return (
                  <Link
                    key={c.id}
                    href={`/syllabus/${c.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-50 transition"
                  >
                    <div
                      className="h-9 w-9 rounded-lg grid place-items-center"
                      style={{ background: `${c.color}1A`, color: c.color }}
                    >
                      <BookOpenText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                      <div className="text-xs text-ink-400 truncate">
                        {c.code} · {done}/{ct.length} done
                      </div>
                    </div>
                    <Badge tone="neutral">{c.color ? "→" : ""}</Badge>
                  </Link>
                );
              })}
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-accent-50 to-white">
            <CardBody>
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-accent-100 grid place-items-center">
                  <Sparkles size={16} className="text-accent-700" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Sunday plan ready</div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    Open the study plan to set this week's blocks.
                  </div>
                  <Link
                    href="/study-plan"
                    className="text-xs text-accent-700 font-medium mt-2 inline-block"
                  >
                    Open study plan →
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <TaskDrawer
        open={drawer != null}
        task={drawer}
        course={courses.find((c) => c.id === drawer?.courseId)}
        onClose={() => setDrawer(null)}
      />
    </div>
  );
}

function Stat({
  title,
  big,
  sub,
  dateLabel,
  accent,
}: {
  title: string;
  big: string;
  sub: string;
  dateLabel?: string;
  accent: string;
}) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs uppercase tracking-widest text-ink-400 font-semibold">
          {title}
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-2xl font-bold rounded-lg px-2 py-0.5 ${accent}`}>{big}</span>
        </div>
        <div className="text-sm text-ink-700 mt-1">{sub}</div>
        {dateLabel && <div className="text-xs text-ink-400 mt-0.5">{dateLabel}</div>}
      </CardBody>
    </Card>
  );
}

function ScopeSwitcher({
  scope,
  setScope,
}: {
  scope: Scope;
  setScope: (s: Scope) => void;
}) {
  const courses = useStore((s) => s.courses);
  return (
    <div className="flex items-center gap-1 bg-ink-100 p-1 rounded-xl flex-wrap">
      <button
        onClick={() => setScope("all")}
        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
          scope === "all" ? "bg-white shadow-soft" : "text-ink-600"
        }`}
      >
        All courses
      </button>
      {courses.map((c) => (
        <button
          key={c.id}
          onClick={() => setScope(c.id)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 ${
            scope === c.id ? "bg-white shadow-soft" : "text-ink-600"
          }`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: c.color }}
          />
          {c.code}
        </button>
      ))}
    </div>
  );
}

function ViewToggle({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="flex items-center bg-ink-100 p-1 rounded-xl">
      <button
        onClick={() => setView("calendar")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
          view === "calendar" ? "bg-white shadow-soft" : "text-ink-600"
        }`}
      >
        <CalendarDays size={14} /> Calendar
      </button>
      <button
        onClick={() => setView("list")}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
          view === "list" ? "bg-white shadow-soft" : "text-ink-600"
        }`}
      >
        <List size={14} /> List
      </button>
    </div>
  );
}
