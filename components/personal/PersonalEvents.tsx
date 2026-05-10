"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { detectConflicts } from "@/lib/workload";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Briefcase, Plus, Trash2 } from "lucide-react";

const CATEGORY_COLOR: Record<string, string> = {
  work: "#10b981",
  practice: "#ef6c8a",
  game: "#dc2626",
  travel: "#f59e0b",
  personal: "#6366f1",
};

export function PersonalEvents() {
  const profile = useStore((s) => s.profile);
  const events = useStore((s) => s.personalEvents);
  const tasks = useStore((s) => s.tasks);
  const courses = useStore((s) => s.courses);
  const addEvent = useStore((s) => s.addPersonalEvent);
  const removeEvent = useStore((s) => s.removePersonalEvent);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"work" | "practice" | "game" | "travel" | "personal">("work");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [notes, setNotes] = useState("");

  if (!profile) return null;

  const isPaid = profile.plan === "paid";
  const conflicts = detectConflicts(tasks, events);

  function add() {
    if (!title || !start || !end) return;
    addEvent({
      title,
      category,
      startDate: new Date(start).toISOString(),
      endDate: new Date(end).toISOString(),
      color: CATEGORY_COLOR[category],
      notes,
    });
    setTitle("");
    setStart("");
    setEnd("");
    setNotes("");
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent-600 font-semibold">
            Personal events <Badge tone="accent">Paid</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Real life on the same calendar.</h1>
          <p className="text-ink-500 mt-1 max-w-xl">
            Work shifts, practice, games, travel — all on one timeline. We flag when a
            deadline lands on a day you've already committed elsewhere.
          </p>
        </div>
      </div>

      {!isPaid ? (
        <Card className="bg-gradient-to-br from-accent-50 to-white border-accent-200">
          <CardBody className="text-center py-10">
            <Briefcase className="mx-auto text-accent-700 mb-3" size={32} />
            <div className="font-semibold">Personal events are a paid feature.</div>
            <p className="text-sm text-ink-500 mt-1 max-w-md mx-auto">
              Upgrade to layer in shifts, practice, and travel — and get conflict
              warnings before a deadline collides with a game day.
            </p>
            <Link href="/account" className="btn-primary mt-5 inline-flex">
              Go to account
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[1.4fr,1fr] gap-5">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Your commitments ({events.length})</CardTitle>
                <CardSubtitle>Layered on top of every course view.</CardSubtitle>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              {events
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
                )
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-ink-100"
                  >
                    <div
                      className="h-9 w-9 rounded-lg grid place-items-center text-white"
                      style={{ background: ev.color }}
                    >
                      {EMOJI[ev.category] ?? "📅"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{ev.title}</div>
                      <div className="text-xs text-ink-500">
                        {ev.category} ·{" "}
                        {ev.recurringRule
                          ? `recurring (${ev.recurringRule.replace("weekly:", "")})`
                          : `${formatDateTime(ev.startDate)} → ${formatDateTime(ev.endDate)}`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEvent(ev.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              {events.length === 0 && (
                <div className="text-sm text-ink-400 text-center py-6">
                  Add your first commitment on the right →
                </div>
              )}
            </CardBody>
          </Card>

          <div className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Add a commitment</CardTitle>
              </CardHeader>
              <CardBody className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Track practice"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    options={[
                      { value: "work", label: "Work / shift" },
                      { value: "practice", label: "Practice" },
                      { value: "game", label: "Game / meet" },
                      { value: "travel", label: "Travel" },
                      { value: "personal", label: "Personal" },
                    ]}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start</Label>
                    <Input
                      type="datetime-local"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input
                      type="datetime-local"
                      value={end}
                      onChange={(e) => setEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <Button className="w-full" onClick={add} disabled={!title || !start || !end}>
                  <Plus size={14} /> Add commitment
                </Button>
              </CardBody>
            </Card>

            {conflicts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Conflicts we caught</CardTitle>
                </CardHeader>
                <CardBody className="space-y-2">
                  {conflicts.slice(0, 8).map(({ task, event }, i) => {
                    const course = courses.find((c) => c.id === task.courseId);
                    return (
                      <div
                        key={i}
                        className="text-xs p-2.5 rounded-lg border border-amber-200 bg-amber-50"
                      >
                        <div className="font-semibold text-amber-900">
                          ⚠️ {task.name} ↔ {event.title}
                        </div>
                        <div className="text-amber-800">
                          {course?.code} deadline on {formatDate(task.dueDate)}
                        </div>
                      </div>
                    );
                  })}
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const EMOJI: Record<string, string> = {
  work: "💼",
  practice: "🏃",
  game: "🏟",
  travel: "✈️",
  personal: "📅",
};
