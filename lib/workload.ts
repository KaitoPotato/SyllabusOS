import type { PersonalEvent, Task, Workload } from "./types";
import { addDays, startOfWeek, weeksBetween } from "./utils";

export type WeekBucket = {
  start: Date;
  end: Date;
  weekIndex: number;
  tasks: Task[];
  intensity: number; // 0-5
  totalWeight: number;
  estimatedHours: number;
  hasExam: boolean;
};

const WORKLOAD_HOURS: Record<Workload, number> = {
  low: 2,
  medium: 5,
  high: 10,
};

export function classifyWorkload(task: Task): Workload {
  if (task.type === "exam" || task.weight >= 20) return "high";
  if (task.type === "project" || task.weight >= 10) return "medium";
  if (task.type === "presentation") return "medium";
  return "low";
}

export function bucketByWeek(
  tasks: Task[],
  termStart: string,
  termEnd: string,
): WeekBucket[] {
  const weeks = weeksBetween(termStart, termEnd);
  return weeks.map((w, i) => {
    const start = startOfWeek(w);
    const end = addDays(start, 6);
    const weekTasks = tasks.filter((t) => {
      const d = new Date(t.dueDate);
      return d >= start && d <= addDays(end, 1);
    });
    const totalWeight = weekTasks.reduce((acc, t) => acc + t.weight, 0);
    const hasExam = weekTasks.some((t) => t.type === "exam");
    const estimatedHours =
      weekTasks.reduce(
        (acc, t) =>
          acc + (t.estimatedHours ?? WORKLOAD_HOURS[t.workload ?? classifyWorkload(t)]),
        0,
      );
    let intensity = 0;
    if (estimatedHours > 0) intensity = 1;
    if (estimatedHours >= 6) intensity = 2;
    if (estimatedHours >= 12 || totalWeight >= 15) intensity = 3;
    if (estimatedHours >= 18 || totalWeight >= 25) intensity = 4;
    if (estimatedHours >= 26 || totalWeight >= 35 || (hasExam && totalWeight >= 25)) intensity = 5;
    return {
      start,
      end,
      weekIndex: i,
      tasks: weekTasks.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      ),
      intensity,
      totalWeight,
      estimatedHours,
      hasExam,
    };
  });
}

export function heaviestWeek(buckets: WeekBucket[]): WeekBucket | null {
  if (buckets.length === 0) return null;
  return buckets.reduce((max, b) => (b.intensity > max.intensity ? b : max), buckets[0]);
}

export function thisWeek(buckets: WeekBucket[]): WeekBucket | null {
  const now = new Date();
  return (
    buckets.find((b) => now >= b.start && now <= addDays(b.end, 1)) ??
    buckets.find((b) => now < b.start) ??
    null
  );
}

export function upcomingThreeDayTasks(tasks: Task[]): Task[] {
  const now = new Date();
  const end = addDays(now, 3);
  return tasks
    .filter((t) => t.status !== "complete")
    .filter((t) => {
      const d = new Date(t.dueDate);
      return d >= now && d <= end;
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

/**
 * Priority score blends remaining grade impact with chronological urgency.
 * If a task already has a grade recorded, we treat its remaining impact as 0 for sorting.
 */
export function priorityScore(task: Task): number {
  const days = Math.max(
    1,
    (new Date(task.dueDate).getTime() - Date.now()) / 86400000,
  );
  const remainingImpact = task.grade != null ? 0 : task.weight;
  const urgency = 1 / days;
  return remainingImpact * 0.7 + urgency * 30;
}

export function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => priorityScore(b) - priorityScore(a));
}

export function detectConflicts(
  tasks: Task[],
  events: PersonalEvent[],
): Array<{ task: Task; event: PersonalEvent }> {
  const conflicts: Array<{ task: Task; event: PersonalEvent }> = [];
  for (const task of tasks) {
    const taskDay = new Date(task.dueDate);
    taskDay.setHours(0, 0, 0, 0);
    for (const ev of events) {
      const start = new Date(ev.startDate);
      const end = new Date(ev.endDate);
      const sameDay =
        taskDay.getTime() >= startOfDay(start).getTime() &&
        taskDay.getTime() <= startOfDay(end).getTime();
      if (sameDay) conflicts.push({ task, event: ev });
    }
  }
  return conflicts;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function intensityColor(intensity: number): string {
  switch (intensity) {
    case 0:
      return "bg-load-0 text-ink-400";
    case 1:
      return "bg-load-1 text-ink-700";
    case 2:
      return "bg-load-2 text-ink-700";
    case 3:
      return "bg-load-3 text-ink-800";
    case 4:
      return "bg-load-4 text-ink-900";
    case 5:
      return "bg-load-5 text-white";
    default:
      return "bg-load-0";
  }
}

export function intensityLabel(intensity: number): string {
  return ["Light", "Easy", "Steady", "Busy", "Heavy", "Overloaded"][intensity] ?? "—";
}
