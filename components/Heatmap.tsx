"use client";

import { WeekBucket, intensityColor, intensityLabel } from "@/lib/workload";
import { formatDate } from "@/lib/utils";
import { Tooltip } from "./ui/Tooltip";

export function Heatmap({
  weeks,
  onSelect,
  selectedIndex,
}: {
  weeks: WeekBucket[];
  onSelect?: (w: WeekBucket) => void;
  selectedIndex?: number;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {weeks.map((w) => {
          const label = `Week of ${formatDate(w.start.toISOString())} — ${intensityLabel(
            w.intensity,
          )} (${w.tasks.length} ${w.tasks.length === 1 ? "task" : "tasks"}, ~${w.estimatedHours}h)`;
          return (
            <Tooltip key={w.weekIndex} content={label}>
              <button
                onClick={() => onSelect?.(w)}
                className={`relative h-10 w-10 rounded-lg ${intensityColor(
                  w.intensity,
                )} transition hover:scale-105 ring-offset-2 ${
                  selectedIndex === w.weekIndex ? "ring-2 ring-accent-500" : ""
                }`}
              >
                <span className="absolute inset-0 grid place-items-center text-[10px] font-semibold">
                  {w.tasks.length || ""}
                </span>
                {w.hasExam && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-white border-2 border-accent-600" />
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3 text-[11px] text-ink-400">
        <span>Light</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`h-3 w-5 rounded ${intensityColor(i)}`} />
          ))}
        </div>
        <span>Overload</span>
        <span className="ml-auto inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-white border-2 border-accent-600" />
          Exam this week
        </span>
      </div>
    </div>
  );
}
