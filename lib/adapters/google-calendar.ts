import type { Course, Task } from "../types";

/**
 * Mocked Google Calendar adapter. Generates a real ICS file so the export is genuinely
 * useful for the demo — drop the file into Google Calendar's "Import" flow and the
 * events land on the user's calendar.
 *
 * A production version would swap this for the Google Calendar Events API; the
 * call signature is intentionally narrow so swapping is mechanical.
 */

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toICSDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
    d.getUTCHours(),
  )}${pad(d.getUTCMinutes())}00Z`;
}

function escapeICS(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export type GoogleExportOptions = {
  includeStudyBlocks?: boolean;
  calendarName?: string;
};

export function generateICS(
  tasks: Task[],
  courses: Course[],
  opts: GoogleExportOptions = {},
): string {
  const name = opts.calendarName ?? "SyllabusOS";
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//SyllabusOS//${name}//EN`,
    `X-WR-CALNAME:${name}`,
    "CALSCALE:GREGORIAN",
  ];
  for (const task of tasks) {
    const course = courses.find((c) => c.id === task.courseId);
    const dtStart = new Date(task.dueDate);
    const dtEnd = new Date(dtStart.getTime() + 30 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${task.id}@syllabusos`,
      `DTSTAMP:${toICSDate(new Date().toISOString())}`,
      `DTSTART:${toICSDate(dtStart.toISOString())}`,
      `DTEND:${toICSDate(dtEnd.toISOString())}`,
      `SUMMARY:${escapeICS(`${course?.code ?? "Course"} — ${task.name}`)}`,
      `DESCRIPTION:${escapeICS(
        `${task.type.toUpperCase()} • ${task.weight}% of grade\\n\\n${task.sourceText ?? ""}`,
      )}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
