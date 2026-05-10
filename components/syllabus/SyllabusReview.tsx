"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { CourseChip } from "@/components/CourseChip";
import { GlossaryTerm } from "@/components/ui/Tooltip";
import { TaskDrawer } from "@/components/TaskDrawer";
import { Badge } from "@/components/ui/Badge";
import { extractFromText } from "@/lib/parser";
import { translatePhrase, SUPPORTED_LANGUAGES } from "@/lib/adapters/translation";
import type { Task } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { RotateCcw, Eye, EyeOff, Languages, FileText, AlertTriangle } from "lucide-react";

export function SyllabusReview({ courseId }: { courseId: string }) {
  const course = useStore((s) => s.courses.find((c) => c.id === courseId));
  const syllabus = useStore((s) => s.syllabi.find((sy) => sy.courseId === courseId));
  const tasks = useStore((s) => s.tasks.filter((t) => t.courseId === courseId));
  const policies = useStore((s) => s.policies.filter((p) => p.courseId === courseId));
  const officeHours = useStore((s) => s.officeHours.filter((o) => o.courseId === courseId));
  const weights = useStore((s) => s.gradingWeights.filter((g) => g.courseId === courseId));
  const profile = useStore((s) => s.profile);
  const updateTask = useStore((s) => s.updateTask);

  const [showSource, setShowSource] = useState(false);
  const [drawer, setDrawer] = useState<Task | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translatedPolicies, setTranslatedPolicies] = useState<Record<string, string>>({});

  const lowConfidence = useMemo(
    () => tasks.filter((t) => t.confidence < 0.8),
    [tasks],
  );

  if (!course) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-ink-500">Course not found.</p>
        <Link href="/dashboard" className="btn-secondary mt-4 inline-flex">
          Back to dashboard
        </Link>
      </div>
    );
  }

  async function translatePolicies() {
    if (!profile?.translationEnabled) return;
    setTranslating(true);
    const out: Record<string, string> = {};
    for (const p of policies) {
      out[p.id] = await translatePhrase(p.plainEnglish, profile.translationLanguage);
    }
    setTranslatedPolicies(out);
    setTranslating(false);
  }

  function reparse() {
    if (!syllabus || !profile) return;
    const result = extractFromText({
      rawText: syllabus.rawText,
      filename: syllabus.filename,
      courseId,
      termStartISO: profile.termStartDate,
      termEndISO: profile.termEndDate,
    });
    // Replace this course's tasks/policies/etc. in place to preserve the course id.
    const s = useStore.getState();
    useStore.setState({
      tasks: [...s.tasks.filter((t) => t.courseId !== courseId), ...result.tasks],
      policies: [...s.policies.filter((p) => p.courseId !== courseId), ...result.policies],
      gradingWeights: [
        ...s.gradingWeights.filter((g) => g.courseId !== courseId),
        ...result.gradingWeights,
      ],
      officeHours: [
        ...s.officeHours.filter((o) => o.courseId !== courseId),
        ...result.officeHours,
      ],
      syllabi: [
        ...s.syllabi.filter((sy) => sy.courseId !== courseId),
        { ...result.syllabus, courseId },
      ],
    });
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <Link href="/dashboard" className="text-xs text-ink-400 hover:text-ink-700">
            ← Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <CourseChip course={course} />
            <Badge tone="neutral">
              <FileText size={12} /> {syllabus?.pages ?? 0} pages
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2">{course.name}</h1>
          <p className="text-ink-500 mt-1">
            Taught by {course.instructor} · {course.meetingPattern}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowSource((v) => !v)}
          >
            {showSource ? <EyeOff size={14} /> : <Eye size={14} />}
            {showSource ? "Hide source" : "Show source text"}
          </Button>
          <Button variant="secondary" size="sm" onClick={reparse}>
            <RotateCcw size={14} /> Re-parse
          </Button>
          {profile?.translationEnabled && (
            <Button variant="secondary" size="sm" onClick={translatePolicies} disabled={translating}>
              <Languages size={14} />
              {translating ? "Translating…" : `Translate to ${
                SUPPORTED_LANGUAGES.find((l) => l.code === profile.translationLanguage)?.label
              }`}
            </Button>
          )}
        </div>
      </div>

      {lowConfidence.length > 0 && (
        <Card className="mb-5 bg-amber-50 border-amber-200">
          <CardBody className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <div className="flex-1">
              <div className="font-semibold text-amber-900">
                {lowConfidence.length} {lowConfidence.length === 1 ? "task needs" : "tasks need"} a quick review
              </div>
              <div className="text-sm text-amber-800 mt-0.5">
                We extracted these but aren't fully confident. Review or edit before
                they affect your calendar.
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tasks & deadlines</CardTitle>
            <CardSubtitle>
              Inline-editable. Click any row for the full editor with source text.
            </CardSubtitle>
          </CardHeader>
          <CardBody className="space-y-1.5">
            {tasks.map((t) => (
              <TaskInlineRow
                key={t.id}
                task={t}
                showSource={showSource}
                onSave={(patch) => updateTask(t.id, patch)}
                onOpen={() => setDrawer(t)}
              />
            ))}
            {tasks.length === 0 && (
              <p className="text-sm text-ink-400 px-3 py-6 text-center">
                No tasks extracted yet.
              </p>
            )}
          </CardBody>
        </Card>

        {/* Right rail: policies, OH, weights */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Grading weights</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {weights.map((w) => (
                <div key={w.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{w.type}</div>
                    {showSource && (
                      <div className="text-[11px] text-ink-400 italic mt-0.5">
                        “{w.sourceText}”
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-bold">{w.weight}%</span>
                  <ConfidenceBadge value={w.confidence} terse />
                </div>
              ))}
              <div className="hairline my-2" />
              <div className="flex items-center gap-2 text-xs text-ink-400">
                Total:{" "}
                <span className="font-semibold text-ink-700">
                  {weights.reduce((s, w) => s + w.weight, 0)}%
                </span>
                {weights.reduce((s, w) => s + w.weight, 0) !== 100 && (
                  <span className="text-amber-700">— does not sum to 100, please review</span>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policies (plain English)</CardTitle>
              <CardSubtitle>Hover over <GlossaryTerm term="midterm" /> or other jargon for a quick definition.</CardSubtitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {policies.map((p) => (
                <div key={p.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
                      {p.category.replace("-", " ")}
                    </span>
                    <ConfidenceBadge value={p.confidence} terse />
                  </div>
                  <p className="text-sm text-ink-700 mt-1 leading-relaxed">
                    {translatedPolicies[p.id] ?? p.plainEnglish}
                  </p>
                  {showSource && (
                    <p className="text-[11px] text-ink-400 italic mt-1">
                      “{p.sourceText}”
                    </p>
                  )}
                </div>
              ))}
              {policies.length === 0 && (
                <p className="text-sm text-ink-400">No policies extracted.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Office hours</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {officeHours.map((oh) => (
                <div key={oh.id} className="text-sm">
                  <div className="font-medium">{oh.instructor}</div>
                  <div className="text-ink-500 text-xs">
                    {oh.dayOfWeek} · {oh.startTime}–{oh.endTime} · {oh.location}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <TaskDrawer
        open={drawer != null}
        task={drawer}
        course={course}
        onClose={() => setDrawer(null)}
      />
    </div>
  );
}

function TaskInlineRow({
  task,
  showSource,
  onSave,
  onOpen,
}: {
  task: Task;
  showSource: boolean;
  onSave: (patch: Partial<Task>) => void;
  onOpen: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [due, setDue] = useState(toLocalDT(task.dueDate));
  const [weight, setWeight] = useState(String(task.weight));

  function save() {
    onSave({ name, dueDate: new Date(due).toISOString(), weight: Number(weight) });
    setEditing(false);
  }

  return (
    <div className="rounded-xl border border-ink-100 hover:border-ink-200 transition">
      <div className="p-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          ) : (
            <button
              onClick={onOpen}
              className="text-left text-sm font-medium hover:text-accent-700 transition"
            >
              {task.name}
            </button>
          )}
          <div className="text-xs text-ink-500 mt-0.5 capitalize">
            {task.type} · due {formatDateTime(task.dueDate)} · {task.weight}% of grade
          </div>
        </div>
        <ConfidenceBadge value={task.confidence} terse />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => (editing ? save() : setEditing(true))}
        >
          {editing ? "Save" : "Edit"}
        </Button>
      </div>
      {editing && (
        <div className="px-3 pb-3 grid grid-cols-2 gap-2">
          <div>
            <Label>Due date</Label>
            <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div>
            <Label>Weight</Label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
      )}
      {showSource && (
        <div className="px-3 pb-3 -mt-1 text-[11px] italic text-ink-400">
          source: “{task.sourceText}”
          {task.sourcePage ? ` · p.${task.sourcePage}` : ""}
        </div>
      )}
    </div>
  );
}

function toLocalDT(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
