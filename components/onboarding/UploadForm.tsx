"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody } from "../ui/Card";
import { Input, Label, Textarea } from "../ui/Input";
import { Button } from "../ui/Button";
import { extractFromText } from "@/lib/parser";
import { Upload, Sparkles, AlertTriangle } from "lucide-react";
import { ConfidenceBadge } from "../ConfidenceBadge";
import { COURSE_PALETTE } from "@/lib/seed";
import type { Extraction } from "@/lib/parser";

const SAMPLE_SYLLABUS = `MATH 226 Calculus II — Fall 2025
Instructor: Dr. Wong (wong@usc.edu)
Office hours: Tuesday 3–4:30pm in KAP 410.

Grading: Homework 25%, Midterm 1 (20%) on October 9, Midterm 2 (20%) on November 13, Final 35% on December 11.

Homework 1 due 9/8. Homework 2 due 9/15. Homework 3 due 9/22. Homework 4 due 10/20. Homework 5 due 10/27. Homework 6 due 11/24.

Late homework: Submissions up to 48 hours past the deadline will be accepted at a 10% per-day penalty. After 48 hours, no credit.

Attendance is not mandatory but missed in-class quizzes cannot be made up.
`;

export function UploadForm() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const addCourse = useStore((s) => s.addCourse);
  const addTasksFromExtraction = useStore((s) => s.addTasksFromExtraction);
  const courses = useStore((s) => s.courses);

  const [filename, setFilename] = useState("Sample_Syllabus.pdf");
  const [code, setCode] = useState("MATH 226");
  const [name, setName] = useState("Calculus II");
  const [instructor, setInstructor] = useState("Dr. Wong");
  const [email, setEmail] = useState("wong@usc.edu");
  const [text, setText] = useState(SAMPLE_SYLLABUS);
  const [parsing, setParsing] = useState(false);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [courseId, setCourseId] = useState<string>("");

  function handleFile(file: File) {
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      // For demo: treat any uploaded file as text. Real PDF parsing would happen here.
      const result = typeof reader.result === "string" ? reader.result : "";
      setText(result || text);
    };
    reader.readAsText(file);
  }

  function parse() {
    if (!profile) return;
    setParsing(true);
    const color = COURSE_PALETTE[(courses.length) % COURSE_PALETTE.length];
    const id = addCourse({
      code,
      name,
      color,
      instructor,
      professorEmail: email || undefined,
    });
    const result = extractFromText({
      rawText: text,
      filename,
      courseId: id,
      termStartISO: profile.termStartDate,
      termEndISO: profile.termEndDate,
    });
    setCourseId(id);
    setExtraction(result);
    setParsing(false);
  }

  function commitAndContinue() {
    if (!extraction) return;
    addTasksFromExtraction(
      extraction.tasks,
      extraction.syllabus,
      extraction.policies,
      extraction.gradingWeights,
      extraction.officeHours,
    );
    const hasLowConfidence = extraction.tasks.some((t) => t.confidence < 0.8);
    if (hasLowConfidence) {
      router.push(`/syllabus/${courseId}?review=1`);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <Card>
        <CardBody className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Course code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} />
            </div>
            <div>
              <Label>Course name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Instructor</Label>
              <Input value={instructor} onChange={(e) => setInstructor(e.target.value)} />
            </div>
            <div>
              <Label>Professor email (for change detection)</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Upload PDF or paste syllabus text</Label>
            <label className="flex items-center gap-2 border-2 border-dashed border-ink-200 rounded-xl px-4 py-6 text-sm text-ink-500 hover:bg-ink-50 cursor-pointer">
              <Upload size={18} />
              <span>
                {filename}{" "}
                <span className="text-ink-400">— click to replace, or paste below</span>
              </span>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
            <Textarea
              className="mt-3"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste raw syllabus text here…"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-400">
              We won't auto-commit anything. You'll review extraction first.
            </p>
            <Button onClick={parse} disabled={parsing || !text}>
              <Sparkles size={16} /> {parsing ? "Extracting…" : "Extract structured tasks"}
            </Button>
          </div>
        </CardBody>
      </Card>

      {extraction && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">
                  Found {extraction.tasks.length} tasks · {extraction.policies.length} policies · {extraction.gradingWeights.length} grading weights
                </h3>
                <p className="text-xs text-ink-400 mt-0.5">
                  {extraction.tasks.filter((t) => t.confidence < 0.8).length} need your review
                  before they hit the calendar.
                </p>
              </div>
              <Button onClick={commitAndContinue}>Continue to review →</Button>
            </div>

            {extraction.warnings.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900 mb-4 flex gap-2 items-start">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold mb-1">A few items need review</div>
                  {extraction.warnings.map((w, i) => (
                    <div key={i}>· {w}</div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {extraction.tasks.slice(0, 8).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-2 rounded-lg border border-ink-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{t.name}</div>
                    <div className="text-xs text-ink-400 truncate">
                      {t.type} · {new Date(t.dueDate).toLocaleDateString()} ·{" "}
                      {t.weight || "—"}%
                    </div>
                  </div>
                  <ConfidenceBadge value={t.confidence} terse />
                </div>
              ))}
              {extraction.tasks.length > 8 && (
                <div className="text-xs text-ink-400 italic pl-2">
                  + {extraction.tasks.length - 8} more — full list on the next step
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
