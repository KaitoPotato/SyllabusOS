"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { CourseChip } from "@/components/CourseChip";
import { formatDate, formatDateTime } from "@/lib/utils";
import { detectChange } from "@/lib/change-detection";
import { uid } from "@/lib/utils";
import { Mail, ArrowRight, Sparkles } from "lucide-react";

export function Inbox() {
  const courses = useStore((s) => s.courses);
  const tasks = useStore((s) => s.tasks);
  const flags = useStore((s) => s.changeFlags);
  const accept = useStore((s) => s.acceptChangeFlag);
  const override = useStore((s) => s.overrideChangeFlag);
  const dismiss = useStore((s) => s.dismissChangeFlag);
  const profile = useStore((s) => s.profile);

  const [sender, setSender] = useState(courses[0]?.professorEmail ?? "professor@usc.edu");
  const [subject, setSubject] = useState("Heads up: deadline change");
  const [body, setBody] = useState(
    "Hi all — the midterm is moved to Oct 16 instead of Oct 14. Sorry for the late notice. — Prof.",
  );

  function simulateForward() {
    if (!profile) return;
    const fallbackYear = new Date(profile.termStartDate).getFullYear();
    const flag = detectChange(
      { sender, subject, body, receivedAt: new Date().toISOString() },
      courses,
      tasks,
      fallbackYear,
    );
    if (!flag) {
      useStore.setState({
        changeFlags: [
          ...flags,
          {
            id: uid("flag"),
            courseId: courses[0]?.id ?? "unknown",
            kind: "ambiguous",
            announcementText: body,
            sender,
            subject,
            receivedAt: new Date().toISOString(),
            status: "pending",
          },
        ],
      });
      return;
    }
    useStore.setState({ changeFlags: [...flags, flag] });
  }

  const pending = flags.filter((f) => f.status === "pending");
  const resolved = flags.filter((f) => f.status !== "pending");

  return (
    <div className="px-6 lg:px-10 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold">
          Change detection
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Announcement inbox</h1>
        <p className="text-ink-500 mt-1">
          Forward course emails here. We diff announced dates against your syllabus and
          surface only confident matches. You confirm — we never auto-update.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-5">
        {/* Pending */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Pending review ({pending.length})</CardTitle>
              <CardSubtitle>
                Each card shows the old date next to the new date. Accept reflows your
                calendar. Override keeps your existing schedule.
              </CardSubtitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {pending.length === 0 && (
                <p className="text-sm text-ink-400 text-center py-6">
                  Nothing pending. Forward an email below to try the flow.
                </p>
              )}
              {pending.map((f) => {
                const course = courses.find((c) => c.id === f.courseId);
                const task = tasks.find((t) => t.id === f.taskId);
                return (
                  <Card key={f.id} className="border-amber-200 bg-amber-50/40">
                    <CardBody className="space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tone={f.kind === "new-item" ? "info" : "warn"}>
                          {f.kind === "potential-change"
                            ? "Date change detected"
                            : f.kind === "new-item"
                            ? "New item"
                            : "Ambiguous"}
                        </Badge>
                        <CourseChip course={course} terse />
                        <span className="text-xs text-ink-400">
                          from {f.sender} · {formatDateTime(f.receivedAt)}
                        </span>
                      </div>
                      <div className="text-sm font-medium">"{f.subject}"</div>
                      <div className="rounded-lg bg-white border border-ink-100 p-3 text-xs text-ink-700 italic">
                        “{f.announcementText}”
                      </div>

                      {f.kind === "potential-change" && task && (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-white border border-ink-100 p-3">
                            <div className="text-xs text-ink-400">Was</div>
                            <div className="font-semibold">{task.name}</div>
                            <div className="text-ink-700">
                              {formatDateTime(task.dueDate)}
                            </div>
                          </div>
                          <div className="rounded-lg bg-white border border-emerald-200 p-3">
                            <div className="text-xs text-emerald-600">Now</div>
                            <div className="font-semibold">{task.name}</div>
                            <div className="text-emerald-700">
                              {formatDateTime(f.proposedDate!)}
                            </div>
                          </div>
                        </div>
                      )}

                      {f.kind === "new-item" && (
                        <div className="rounded-lg bg-white border border-blue-200 p-3 text-sm">
                          <div className="text-xs text-blue-600">Suggested new task</div>
                          <div className="font-semibold">{f.proposedTitle}</div>
                          <div className="text-blue-700">
                            Due {formatDate(f.proposedDate!)}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <Button onClick={() => accept(f.id)}>Accept & reflow</Button>
                        <Button variant="secondary" onClick={() => override(f.id)}>
                          Override (keep mine)
                        </Button>
                        <Button variant="ghost" onClick={() => dismiss(f.id)}>
                          Dismiss
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </CardBody>
          </Card>

          {resolved.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent decisions</CardTitle>
              </CardHeader>
              <CardBody className="space-y-2">
                {resolved.slice(0, 8).map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-ink-100"
                  >
                    <Badge
                      tone={
                        f.status === "accepted"
                          ? "success"
                          : f.status === "overridden"
                          ? "neutral"
                          : "neutral"
                      }
                    >
                      {f.status}
                    </Badge>
                    <div className="flex-1 text-xs">
                      <div className="font-medium truncate">{f.subject}</div>
                      <div className="text-ink-400">
                        {formatDateTime(f.receivedAt)} · {f.sender}
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>

        {/* Simulator */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Simulate a forwarded email</CardTitle>
              <CardSubtitle>
                Real product hooks into a dedicated forwarding address; for the demo
                you can craft an announcement here.
              </CardSubtitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <Label>From</Label>
                <Input value={sender} onChange={(e) => setSender(e.target.value)} />
              </div>
              <div>
                <Label>Subject</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} />
              </div>
              <Button onClick={simulateForward} className="w-full">
                <Mail size={14} /> Run detection
              </Button>
              <p className="text-xs text-ink-400">
                Precision-first: if the announced date matches what we already have, we
                stay silent rather than spamming you.
              </p>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-accent-50 to-white">
            <CardBody>
              <div className="flex items-start gap-3">
                <Sparkles className="text-accent-700 shrink-0" />
                <div>
                  <div className="font-semibold text-sm">Try these examples</div>
                  <div className="mt-2 space-y-2">
                    {[
                      {
                        s: "wallace@usc.edu",
                        subj: "Essay 2 push",
                        b: "Hi all — pushing Essay 2 to Oct 16 so you can enjoy the long weekend.",
                      },
                      {
                        s: "adamchik@usc.edu",
                        subj: "Bonus problem set",
                        b: "Optional bonus problem set due Nov 18, worth 3% extra credit.",
                      },
                    ].map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSender(ex.s);
                          setSubject(ex.subj);
                          setBody(ex.b);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-white transition text-xs"
                      >
                        <div className="font-medium text-ink-900">{ex.subj}</div>
                        <div className="text-ink-500 truncate">{ex.b}</div>
                        <div className="text-accent-700 text-[11px] mt-0.5 inline-flex items-center gap-1">
                          Load <ArrowRight size={10} />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
