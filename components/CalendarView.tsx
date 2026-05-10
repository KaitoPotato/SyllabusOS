"use client";

import { useMemo } from "react";
import type { Course, PersonalEvent, Task } from "@/lib/types";
import { addDays, formatDate, startOfWeek } from "@/lib/utils";

type Item =
  | { kind: "task"; task: Task; course?: Course }
  | { kind: "event"; event: PersonalEvent };

export function CalendarView({
  tasks,
  courses,
  events = [],
  weekStart,
  onSelectTask,
}: {
  tasks: Task[];
  courses: Course[];
  events?: PersonalEvent[];
  weekStart?: Date;
  onSelectTask: (t: Task) => void;
}) {
  const start = useMemo(() => weekStart ?? startOfWeek(new Date()), [weekStart]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(start, i)),
    [start],
  );

  const byDay: Record<string, Item[]> = {};
  for (const t of tasks) {
    const key = ymd(new Date(t.dueDate));
    byDay[key] ??= [];
    byDay[key].push({ kind: "task", task: t, course: courses.find((c) => c.id === t.courseId) });
  }
  for (const ev of events) {
    const s = new Date(ev.startDate);
    const e = new Date(ev.endDate);
    // Add to each day it spans (only within the visible week)
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const key = ymd(d);
      if (days.some((day) => ymd(day) === key)) {
        byDay[key] ??= [];
        byDay[key].push({ kind: "event", event: ev });
      }
    }
    // Respect recurring rule for visible week
    if (ev.recurringRule?.startsWith("weekly:")) {
      const dayNames = ev.recurringRule.replace("weekly:", "").split(",");
      const map: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };
      for (const d of days) {
        if (dayNames.some((dn) => map[dn] === d.getDay())) {
          const key = ymd(d);
          byDay[key] ??= [];
          if (!byDay[key].some((i) => i.kind === "event" && (i as any).event.id === ev.id)) {
            byDay[key].push({ kind: "event", event: ev });
          }
        }
      }
    }
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-ink-100 rounded-2xl overflow-hidden border border-ink-100">
      {days.map((day) => {
        const key = ymd(day);
        const items = byDay[key] ?? [];
        const isToday = ymd(new Date()) === key;
        return (
          <div key={key} className="bg-white min-h-[140px] flex flex-col">
            <div
              className={`px-2 py-1.5 text-[11px] font-medium flex items-center justify-between ${
                isToday ? "bg-accent-50 text-accent-700" : "text-ink-500"
              }`}
            >
              <span>{day.toLocaleDateString(undefined, { weekday: "short" })}</span>
              <span className={isToday ? "font-bold text-accent-700" : ""}>
                {formatDate(day.toISOString())}
              </span>
            </div>
            <div className="px-1.5 py-1 space-y-1 flex-1">
              {items.length === 0 && (
                <div className="text-[10px] text-ink-300 px-1 pt-2">—</div>
              )}
              {items.map((it, idx) =>
                it.kind === "task" ? (
                  <button
                    key={`${it.task.id}-${idx}`}
                    onClick={() => onSelectTask(it.task)}
                    className="w-full text-left rounded-md px-1.5 py-1 text-[11px] hover:bg-ink-50 transition"
                    style={{
                      background: `${it.course?.color}1A`,
                      color: it.course?.color,
                    }}
                  >
                    <div className="font-medium truncate text-ink-900">
                      {it.task.name}
                    </div>
                    <div className="text-[10px] opacity-75 truncate">
                      {it.course?.code} · {it.task.type}
                    </div>
                  </button>
                ) : (
                  <div
                    key={`${(it as any).event.id}-${idx}`}
                    className="rounded-md px-1.5 py-1 text-[11px] border border-dashed"
                    style={{
                      borderColor: it.event.color,
                      color: it.event.color,
                      background: `${it.event.color}10`,
                    }}
                  >
                    <div className="font-medium truncate">{it.event.title}</div>
                    <div className="text-[10px] opacity-80 capitalize">
                      {it.event.category}
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ymd(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}
