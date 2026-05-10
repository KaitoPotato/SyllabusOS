"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CourseChip } from "@/components/CourseChip";
import { pullGradebook, computeCourseAverage, gradeAwarePriorityBoost } from "@/lib/adapters/gradebook";
import { Cloud, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";

export function GradesPage() {
  const courses = useStore((s) => s.courses);
  const tasks = useStore((s) => s.tasks);
  const setTaskGrade = useStore((s) => s.setTaskGrade);

  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  async function sync() {
    setSyncing(true);
    const entries = await pullGradebook(tasks, courses);
    for (const e of entries) setTaskGrade(e.taskId, e.grade);
    setLastSynced(new Date().toLocaleTimeString());
    setSyncing(false);
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold">
            Grades & priorities
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Gradebook sync</h1>
          <p className="text-ink-500 mt-1 max-w-xl">
            We pull your current grades from the LMS, compute course averages, and
            quietly re-prioritize study time toward classes where you have the most
            ground to make up.
          </p>
        </div>
        <Button onClick={sync} disabled={syncing}>
          <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Pulling…" : "Sync gradebook"}
        </Button>
      </div>

      {lastSynced && (
        <div className="text-xs text-ink-400 mb-4 flex items-center gap-2">
          <Cloud size={14} /> Last sync at {lastSynced} from mock LMS adapter
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => {
          const ct = tasks.filter((t) => t.courseId === c.id);
          const avg = computeCourseAverage(ct);
          const upcoming = ct.filter((t) => !t.grade && new Date(t.dueDate) > new Date());
          const boost = upcoming.reduce(
            (s, t) => s + gradeAwarePriorityBoost(t, avg),
            0,
          );
          return (
            <Card key={c.id}>
              <CardBody>
                <CourseChip course={c} />
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-3xl font-bold">
                      {avg != null ? `${avg.toFixed(1)}%` : "—"}
                    </div>
                    <div className="text-xs text-ink-400">
                      {avg != null ? "weighted average" : "no graded items yet"}
                    </div>
                  </div>
                  {avg != null && (
                    <Badge tone={avg >= 85 ? "success" : avg >= 75 ? "warn" : "danger"}>
                      {avg >= 85 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {avg >= 90
                        ? "A-range"
                        : avg >= 80
                        ? "B-range"
                        : avg >= 70
                        ? "C-range"
                        : "At risk"}
                    </Badge>
                  )}
                </div>

                <div className="hairline my-3" />

                <div className="space-y-1.5">
                  {ct
                    .filter((t) => t.grade != null)
                    .slice(0, 4)
                    .map((t) => (
                      <div key={t.id} className="flex items-center justify-between text-xs">
                        <span className="text-ink-600 truncate">{t.name}</span>
                        <span className="font-semibold">{t.grade}%</span>
                      </div>
                    ))}
                  {ct.filter((t) => t.grade != null).length === 0 && (
                    <div className="text-xs text-ink-400">No grades pulled yet.</div>
                  )}
                </div>

                {boost > 0 && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2 text-xs text-amber-900">
                    Priority boosted on {upcoming.length} upcoming tasks (+
                    {boost.toFixed(0)} points)
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How priorities react to grades</CardTitle>
          <CardSubtitle>
            Rule-based today; pluggable for ML later.
          </CardSubtitle>
        </CardHeader>
        <CardBody className="text-sm text-ink-600 leading-relaxed space-y-2">
          <p>
            When a course's weighted average sits at <strong>85% or higher</strong>,
            we leave its priorities alone — you're doing fine.
          </p>
          <p>
            Between <strong>75 and 85%</strong>, each upcoming task gets a small
            priority bump proportional to its weight (40% of weight added to
            priority score).
          </p>
          <p>
            Below <strong>75%</strong>, that bump doubles (80% of weight). The
            study plan automatically allocates more time toward those tasks.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
