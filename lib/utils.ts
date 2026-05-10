import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, opts ?? { month: "short", day: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday as start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function weeksBetween(start: string, end: string): Date[] {
  const s = startOfWeek(new Date(start));
  const e = new Date(end);
  const weeks: Date[] = [];
  let cur = new Date(s);
  while (cur <= e) {
    weeks.push(new Date(cur));
    cur = addDays(cur, 7);
  }
  return weeks;
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function plural(n: number, one: string, many?: string) {
  return n === 1 ? one : many ?? `${one}s`;
}

export function relativeDay(iso: string): string {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "today";
  if (diff === 1) return "tomorrow";
  if (diff === -1) return "yesterday";
  if (diff > 0 && diff < 7) return `in ${diff} days`;
  if (diff < 0 && diff > -7) return `${-diff} days ago`;
  return formatDate(iso);
}
