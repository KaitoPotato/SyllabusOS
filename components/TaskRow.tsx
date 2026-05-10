"use client";

import type { Course, Task } from "@/lib/types";
import { formatDateTime, relativeDay } from "@/lib/utils";
import { CourseChip } from "./CourseChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { Check } from "lucide-react";

export function TaskRow({
  task,
  course,
  onClick,
  onToggle,
}: {
  task: Task;
  course?: Course;
  onClick: () => void;
  onToggle: () => void;
}) {
  const isComplete = task.status === "complete";
  return (
    <div
      onClick={onClick}
      className="group flex items-start gap-3 p-3 rounded-xl hover:bg-ink-50 cursor-pointer transition border border-transparent hover:border-ink-100"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={`mt-1 h-5 w-5 rounded-md border-2 grid place-items-center transition ${
          isComplete
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-ink-200 hover:border-accent-400"
        }`}
        aria-label={isComplete ? "Mark incomplete" : "Mark complete"}
      >
        {isComplete && <Check size={12} strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-sm font-medium truncate ${
              isComplete ? "text-ink-400 line-through" : "text-ink-900"
            }`}
          >
            {task.name}
          </span>
          <CourseChip course={course} terse />
          {task.weight > 0 && (
            <span className="text-[11px] text-ink-400 font-medium">
              {task.weight}% of grade
            </span>
          )}
          {task.confidence < 0.8 && <ConfidenceBadge value={task.confidence} terse />}
          {task.status === "changed" && (
            <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
              changed
            </span>
          )}
        </div>
        <div className="text-xs text-ink-500 mt-0.5">
          {task.type.replace("-", " ")} · due {formatDateTime(task.dueDate)} ·{" "}
          <span className="text-ink-400">{relativeDay(task.dueDate)}</span>
        </div>
      </div>
    </div>
  );
}
