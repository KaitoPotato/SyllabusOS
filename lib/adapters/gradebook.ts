import type { Course, Task } from "../types";

/**
 * Mock gradebook adapter. In production this would wrap Brightspace/Canvas/Blackboard
 * APIs; for the demo we return deterministic grades keyed off the task id so the
 * gradebook tab tells a coherent story over time.
 */

export type GradebookEntry = {
  taskId: string;
  grade: number; // 0-100
  letter: string;
  pulledAt: string;
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function deterministicGrade(taskId: string, type: string): number {
  // Simulate slightly lower performance on exams than homework.
  const base = type === "exam" ? 76 : type === "project" ? 84 : 88;
  const jitter = (hash(taskId) % 18) - 9;
  return Math.max(50, Math.min(100, base + jitter));
}

function letter(grade: number): string {
  if (grade >= 93) return "A";
  if (grade >= 90) return "A-";
  if (grade >= 87) return "B+";
  if (grade >= 83) return "B";
  if (grade >= 80) return "B-";
  if (grade >= 77) return "C+";
  if (grade >= 73) return "C";
  if (grade >= 70) return "C-";
  if (grade >= 60) return "D";
  return "F";
}

export async function pullGradebook(
  tasks: Task[],
  _courses: Course[],
): Promise<GradebookEntry[]> {
  await new Promise((r) => setTimeout(r, 240));
  const now = new Date();
  const past = tasks.filter((t) => new Date(t.dueDate) < now);
  return past.map((t) => {
    const grade = deterministicGrade(t.id, t.type);
    return {
      taskId: t.id,
      grade,
      letter: letter(grade),
      pulledAt: now.toISOString(),
    };
  });
}

export function computeCourseAverage(tasks: Task[]): number | null {
  const graded = tasks.filter((t) => t.grade != null);
  if (graded.length === 0) return null;
  const totalWeight = graded.reduce((s, t) => s + t.weight, 0);
  if (totalWeight === 0) return null;
  return graded.reduce((s, t) => s + (t.grade ?? 0) * t.weight, 0) / totalWeight;
}

/**
 * Re-priority: when a student's average in a course slips below 80, bump priority
 * for upcoming high-weight tasks in that course.
 */
export function gradeAwarePriorityBoost(
  task: Task,
  courseAverage: number | null,
): number {
  if (courseAverage == null) return 0;
  if (courseAverage >= 85) return 0;
  if (courseAverage >= 75) return task.weight * 0.4;
  return task.weight * 0.8;
}
