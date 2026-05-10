import type { ChangeFlag, Course, Task } from "./types";
import { uid } from "./utils";

/**
 * Diff an announcement text against known tasks to identify potential changes,
 * new items, or ambiguous mentions. Precision-first: only flag confident matches.
 */

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9,
  september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

export type Announcement = {
  sender: string;
  subject: string;
  body: string;
  receivedAt?: string;
};

function tryDate(text: string, fallbackYear: number): Date | null {
  const w = text.match(/\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(\d{1,2})/i);
  if (w) {
    const month = MONTHS[w[1].toLowerCase()];
    const day = parseInt(w[2], 10);
    return new Date(Date.UTC(fallbackYear, month - 1, day, 23, 59));
  }
  const n = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (n) {
    const month = parseInt(n[1], 10);
    const day = parseInt(n[2], 10);
    let year = n[3] ? parseInt(n[3], 10) : fallbackYear;
    if (year < 100) year += 2000;
    return new Date(Date.UTC(year, month - 1, day, 23, 59));
  }
  return null;
}

function similarity(a: string, b: string): number {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
  const aw = new Set(norm(a));
  const bw = new Set(norm(b));
  if (aw.size === 0 || bw.size === 0) return 0;
  const inter = [...aw].filter((w) => bw.has(w)).length;
  const union = new Set([...aw, ...bw]).size;
  return inter / union;
}

function bestTaskMatch(
  body: string,
  subject: string,
  courseTasks: Task[],
): { task: Task; score: number } | null {
  let best: { task: Task; score: number } | null = null;
  const haystack = `${subject} ${body}`;
  for (const task of courseTasks) {
    const score = similarity(haystack, task.name);
    if (!best || score > best.score) best = { task, score };
  }
  return best;
}

export function detectChange(
  ann: Announcement,
  courses: Course[],
  tasks: Task[],
  fallbackYear: number,
): ChangeFlag | null {
  // Match the course first via sender email or course code mention
  const senderLc = ann.sender.toLowerCase();
  let course = courses.find((c) => c.professorEmail?.toLowerCase() === senderLc);
  if (!course) {
    course = courses.find((c) => ann.body.toLowerCase().includes(c.code.toLowerCase()));
  }
  if (!course) return null;

  const proposed = tryDate(ann.subject, fallbackYear) ?? tryDate(ann.body, fallbackYear);
  if (!proposed) return null;

  const courseTasks = tasks.filter((t) => t.courseId === course!.id);
  const match = bestTaskMatch(ann.body, ann.subject, courseTasks);

  if (match && match.score >= 0.18) {
    const taskDate = new Date(match.task.dueDate);
    const sameDay = taskDate.toDateString() === proposed.toDateString();
    if (sameDay) {
      // No real change — drop signal (precision over recall).
      return null;
    }
    return {
      id: uid("flag"),
      taskId: match.task.id,
      courseId: course.id,
      kind: "potential-change",
      proposedDate: proposed.toISOString(),
      originalDate: match.task.dueDate,
      announcementText: ann.body,
      sender: ann.sender,
      subject: ann.subject,
      receivedAt: ann.receivedAt ?? new Date().toISOString(),
      status: "pending",
    };
  }

  if (!match || match.score < 0.08) {
    // Looks like a new item (date mentioned, no matching task)
    const titleGuess =
      ann.subject.replace(/(re:|fwd:)/gi, "").trim() || "New item from announcement";
    return {
      id: uid("flag"),
      courseId: course.id,
      kind: "new-item",
      proposedDate: proposed.toISOString(),
      proposedTitle: titleGuess,
      announcementText: ann.body,
      sender: ann.sender,
      subject: ann.subject,
      receivedAt: ann.receivedAt ?? new Date().toISOString(),
      status: "pending",
    };
  }

  // Ambiguous — log but don't surface noisily
  return {
    id: uid("flag"),
    courseId: course.id,
    kind: "ambiguous",
    announcementText: ann.body,
    sender: ann.sender,
    subject: ann.subject,
    receivedAt: ann.receivedAt ?? new Date().toISOString(),
    status: "pending",
  };
}
