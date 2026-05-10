import type { GradingWeight, OfficeHour, Policy, Syllabus, Task } from "./types";
import { uid } from "./utils";

/**
 * Rule-based syllabus extractor. Designed for speed of demo and clarity of behavior.
 *
 * Inputs: raw syllabus text + term start/end (used to resolve "Week N" style references)
 * Output: tasks with type, date, weight, confidence, source text
 *
 * The parser favors precision over recall. Low-confidence rows are flagged so the
 * Structured View can surface them for user review before they reach the calendar.
 */

type ExtractInput = {
  rawText: string;
  filename: string;
  courseId: string;
  termStartISO: string;
  termEndISO: string;
};

export type Extraction = {
  syllabus: Syllabus;
  tasks: Task[];
  policies: Policy[];
  gradingWeights: GradingWeight[];
  officeHours: OfficeHour[];
  warnings: string[];
};

const TYPE_KEYWORDS: Array<{ type: Task["type"]; words: string[]; workload: Task["workload"] }> = [
  { type: "exam", words: ["final exam", "final", "midterm", "exam"], workload: "high" },
  { type: "project", words: ["project", "presentation demo", "capstone"], workload: "high" },
  { type: "presentation", words: ["presentation", "demo"], workload: "medium" },
  { type: "quiz", words: ["quiz", "pop quiz"], workload: "low" },
  { type: "assignment", words: ["homework", "hw", "assignment", "essay", "lab", "problem set"], workload: "low" },
  { type: "reading", words: ["reading"], workload: "low" },
];

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9, sept: 9,
  september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

const ISO_RE = /\b(\d{4})-(\d{2})-(\d{2})\b/;
const NUMERIC_RE = /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/;
const WRITTEN_RE = /\b(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i;
const WEEK_RE = /\bweek\s+(\d{1,2})\b/i;
const PERCENT_RE = /(\d{1,3})\s?%/;
const FRACTION_RE = /\b(one[-\s]?(?:half|third|quarter|fifth)|two[-\s]?(?:thirds|fifths))\b/i;
const FRACTION_MAP: Record<string, number> = {
  "one-half": 50, "onehalf": 50, "one half": 50,
  "one-third": 33, "onethird": 33, "one third": 33,
  "one-quarter": 25, "onequarter": 25, "one quarter": 25,
  "one-fifth": 20, "onefifth": 20, "one fifth": 20,
  "two-thirds": 67, "twothirds": 67, "two thirds": 67,
  "two-fifths": 40, "twofifths": 40, "two fifths": 40,
};

function splitSentences(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/(?<=[.!?])\s+|\n+/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function detectType(sentence: string): { type: Task["type"]; workload: Task["workload"] } | null {
  const lc = sentence.toLowerCase();
  for (const k of TYPE_KEYWORDS) {
    if (k.words.some((w) => lc.includes(w))) {
      return { type: k.type, workload: k.workload };
    }
  }
  return null;
}

function resolveWeekToDate(weekNum: number, termStart: Date): Date {
  const d = new Date(termStart);
  d.setUTCDate(d.getUTCDate() + (weekNum - 1) * 7 + 4); // mid-week (Fri-ish)
  return d;
}

function parseDate(sentence: string, termStart: Date): { iso: string; confidence: number } | null {
  const iso = sentence.match(ISO_RE);
  if (iso) {
    return { iso: new Date(`${iso[1]}-${iso[2]}-${iso[3]}T23:59:00Z`).toISOString(), confidence: 0.95 };
  }
  const written = sentence.match(WRITTEN_RE);
  if (written) {
    const month = MONTHS[written[1].toLowerCase()];
    const day = parseInt(written[2], 10);
    const year = termStart.getUTCFullYear();
    const candidate = new Date(Date.UTC(year, month - 1, day, 23, 59));
    return { iso: candidate.toISOString(), confidence: 0.9 };
  }
  const numeric = sentence.match(NUMERIC_RE);
  if (numeric) {
    const month = parseInt(numeric[1], 10);
    const day = parseInt(numeric[2], 10);
    let year = numeric[3] ? parseInt(numeric[3], 10) : termStart.getUTCFullYear();
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return { iso: new Date(Date.UTC(year, month - 1, day, 23, 59)).toISOString(), confidence: 0.78 };
    }
  }
  const week = sentence.match(WEEK_RE);
  if (week) {
    const weekNum = parseInt(week[1], 10);
    return { iso: resolveWeekToDate(weekNum, termStart).toISOString(), confidence: 0.5 };
  }
  return null;
}

function parseWeight(sentence: string): { weight: number; confidence: number } | null {
  const pct = sentence.match(PERCENT_RE);
  if (pct) {
    return { weight: Math.min(100, parseInt(pct[1], 10)), confidence: 0.92 };
  }
  const frac = sentence.match(FRACTION_RE);
  if (frac) {
    const key = frac[1].toLowerCase().replace(/\s+/g, "-");
    const pctVal = FRACTION_MAP[key] ?? FRACTION_MAP[frac[1].toLowerCase()] ?? null;
    if (pctVal != null) return { weight: pctVal, confidence: 0.65 };
  }
  return null;
}

function extractTaskNameFromSentence(sentence: string): string {
  const cleaned = sentence.replace(/[.,;:]/g, " ").trim();
  const m = cleaned.match(/(midterm\s*\d?|final\s+exam|final|exam\s*\d?|quiz\s*\d?|homework\s*\d?|hw\s*\d?|essay\s*\d?|project\s*\w*|lab\s*\d?|problem\s*set\s*\d?|presentation)/i);
  return (m ? m[0] : cleaned.slice(0, 48)).replace(/\s+/g, " ").trim();
}

function extractPolicies(text: string, courseId: string): Policy[] {
  const sentences = splitSentences(text);
  const out: Policy[] = [];

  for (const s of sentences) {
    const lc = s.toLowerCase();
    if (/late|past the deadline|after the due date/.test(lc)) {
      out.push({
        id: uid("pol"),
        courseId,
        category: "late-work",
        sourceText: s,
        plainEnglish: humanizeLatePolicy(s),
        confidence: 0.86,
      });
    } else if (/attendance|miss(?:ed)? (?:class|lecture|lab)/.test(lc)) {
      out.push({
        id: uid("pol"),
        courseId,
        category: "attendance",
        sourceText: s,
        plainEnglish: humanizeAttendance(s),
        confidence: 0.78,
      });
    } else if (/plagiari|academic integrity|honor code|cheat/.test(lc)) {
      out.push({
        id: uid("pol"),
        courseId,
        category: "academic-integrity",
        sourceText: s,
        plainEnglish: s,
        confidence: 0.8,
      });
    }
  }
  return out;
}

function humanizeLatePolicy(s: string): string {
  const pctMatch = s.match(/(\d{1,2})\s?%/);
  const dayMatch = s.match(/(\d+)\s*(day|hour)/i);
  if (pctMatch && dayMatch) {
    return `Late work loses ${pctMatch[1]}% per ${dayMatch[2].toLowerCase()} for up to ${dayMatch[1]} ${dayMatch[2].toLowerCase()}s.`;
  }
  return "Late work is penalized — see syllabus for the exact terms.";
}

function humanizeAttendance(s: string): string {
  const m = s.match(/(\d+)\s*(absence|class|day)/i);
  if (m) return `Attendance matters: ${m[0]} affects your grade.`;
  return "Attendance impacts participation — try not to miss class.";
}

function extractOfficeHours(text: string, courseId: string): OfficeHour[] {
  const lines = text.split(/\n+/);
  const out: OfficeHour[] = [];
  for (const line of lines) {
    const m = line.match(/office\s+hours?:?\s*(.+)/i);
    if (!m) continue;
    const detail = m[1];
    const day = detail.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:day)?\b/i);
    const time = detail.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)?\s*[-–to]+\s*(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)?/i);
    out.push({
      id: uid("oh"),
      courseId,
      instructor: "Instructor",
      dayOfWeek: day ? day[0] : "TBD",
      startTime: time ? `${time[1]}:${time[2] ?? "00"}` : "TBD",
      endTime: time ? `${time[4]}:${time[5] ?? "00"}` : "TBD",
      location: detail.match(/in\s+([A-Z]{2,4}\s*\d+)/)?.[1] ?? "TBD",
    });
  }
  return out;
}

function extractGradingWeights(text: string, courseId: string): GradingWeight[] {
  const out: GradingWeight[] = [];
  const sentences = splitSentences(text);
  const keywords = ["homework", "midterm", "final", "exam", "quiz", "project", "lab", "essay", "participation", "portfolio", "problem set"];
  for (const s of sentences) {
    const lc = s.toLowerCase();
    const kw = keywords.find((k) => lc.includes(k));
    const w = parseWeight(s);
    if (kw && w) {
      out.push({
        id: uid("gw"),
        courseId,
        type: kw.replace(/\b\w/g, (c) => c.toUpperCase()),
        weight: w.weight,
        sourceText: s,
        confidence: w.confidence,
      });
    }
  }
  return out;
}

export function extractFromText(input: ExtractInput): Extraction {
  const termStart = new Date(input.termStartISO);
  const sentences = splitSentences(input.rawText);
  const warnings: string[] = [];

  const tasks: Task[] = [];
  for (const s of sentences) {
    const t = detectType(s);
    const d = parseDate(s, termStart);
    if (!t || !d) continue;
    const w = parseWeight(s);
    const confidence = Math.min(1, d.confidence * 0.6 + (w?.confidence ?? 0.5) * 0.3 + 0.1);
    const isRelativeWeek = /\bweek\s+\d+\b/i.test(s);
    if (isRelativeWeek) {
      warnings.push(`Resolved a "week" reference — verify date: ${s.slice(0, 80)}…`);
    }
    tasks.push({
      id: uid("task"),
      courseId: input.courseId,
      name: extractTaskNameFromSentence(s),
      type: t.type,
      dueDate: d.iso,
      weight: w?.weight ?? 0,
      workload: t.workload,
      confidence: Math.round(confidence * 100) / 100,
      sourceText: s,
      status: "pending",
    });
  }

  const policies = extractPolicies(input.rawText, input.courseId);
  const gradingWeights = extractGradingWeights(input.rawText, input.courseId);
  const officeHours = extractOfficeHours(input.rawText, input.courseId);

  const syllabus: Syllabus = {
    id: uid("syl"),
    courseId: input.courseId,
    filename: input.filename,
    uploadedAt: new Date().toISOString(),
    rawText: input.rawText,
    pages: Math.max(1, Math.ceil(input.rawText.length / 1800)),
  };

  return { syllabus, tasks, policies, gradingWeights, officeHours, warnings };
}

/**
 * Optional rule-based task decomposition for assignments with numbered deliverables
 * or Part 1 / Part 2 patterns.
 */
export function decomposeTask(task: Task): Task[] {
  const text = `${task.name} ${task.notes ?? ""}`;
  const parts = text.match(/(?:Part|Phase|Step)\s+(\d+|[IVX]+)[^,;.]*/gi) ?? [];
  const numbered = text.match(/(\d+)\.\s+[A-Z][^.]+/g) ?? [];
  const splits = [...new Set([...parts, ...numbered])];
  if (splits.length < 2) return [];
  return splits.slice(0, 6).map((label, i) => ({
    ...task,
    id: uid("subtask"),
    name: label.length > 60 ? label.slice(0, 60) + "…" : label,
    parentId: task.id,
    weight: 0,
    workload: "low",
    confidence: 0.7,
    dueDate: new Date(new Date(task.dueDate).getTime() - (splits.length - i) * 86400000).toISOString(),
  }));
}
