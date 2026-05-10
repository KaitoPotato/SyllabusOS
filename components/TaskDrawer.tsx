"use client";

import { useEffect, useState } from "react";
import type { Course, Task } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Drawer } from "./ui/Drawer";
import { Button } from "./ui/Button";
import { Input, Label, Select } from "./ui/Input";
import { CourseChip } from "./CourseChip";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { formatDateTime } from "@/lib/utils";

export function TaskDrawer({
  open,
  task,
  course,
  onClose,
}: {
  open: boolean;
  task: Task | null;
  course?: Course;
  onClose: () => void;
}) {
  const updateTask = useStore((s) => s.updateTask);
  const toggleTaskStatus = useStore((s) => s.toggleTaskStatus);
  const [draft, setDraft] = useState<Task | null>(task);

  useEffect(() => setDraft(task), [task]);

  if (!task || !draft) return null;

  const isComplete = task.status === "complete";

  return (
    <Drawer open={open} onClose={onClose} title={task.name}>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <CourseChip course={course} terse />
          <ConfidenceBadge value={task.confidence} />
          {task.status === "changed" && (
            <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
              recently changed
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={draft.type}
              onChange={(e) =>
                setDraft({ ...draft, type: e.target.value as Task["type"] })
              }
              options={[
                { value: "assignment", label: "Assignment" },
                { value: "exam", label: "Exam" },
                { value: "project", label: "Project" },
                { value: "quiz", label: "Quiz" },
                { value: "presentation", label: "Presentation" },
                { value: "reading", label: "Reading" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>
          <div>
            <Label>Due date</Label>
            <Input
              type="datetime-local"
              value={toLocalDT(draft.dueDate)}
              onChange={(e) =>
                setDraft({ ...draft, dueDate: new Date(e.target.value).toISOString() })
              }
            />
          </div>
          <div>
            <Label>Weight (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={draft.weight}
              onChange={(e) =>
                setDraft({ ...draft, weight: Number(e.target.value) })
              }
            />
          </div>
          <div className="col-span-2">
            <Label>Notes</Label>
            <Input
              value={draft.notes ?? ""}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              placeholder="Anything to remember…"
            />
          </div>
        </div>

        <div>
          <Label>Source from syllabus</Label>
          <div className="rounded-xl bg-ink-50 p-3 text-xs text-ink-700 italic">
            “{task.sourceText}”
            {task.sourcePage ? (
              <span className="block mt-1 not-italic text-ink-400 text-[11px]">
                page {task.sourcePage}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={() => {
              updateTask(task.id, draft);
              onClose();
            }}
          >
            Save changes
          </Button>
          <Button
            variant="secondary"
            onClick={() => toggleTaskStatus(task.id)}
          >
            {isComplete ? "Mark incomplete" : "Mark complete"}
          </Button>
        </div>

        <div className="border-t border-ink-100 pt-4 text-[11px] text-ink-400">
          Originally due {formatDateTime(task.dueDate)} · ID {task.id}
        </div>
      </div>
    </Drawer>
  );
}

function toLocalDT(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
