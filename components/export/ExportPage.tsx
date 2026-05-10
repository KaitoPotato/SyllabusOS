"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CourseChip } from "@/components/CourseChip";
import { generateICS } from "@/lib/adapters/google-calendar";
import { Download, Calendar, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ExportPage() {
  const courses = useStore((s) => s.courses);
  const tasks = useStore((s) => s.tasks);
  const exportMappings = useStore((s) => s.exportMappings);
  const recordExport = useStore((s) => s.recordExport);

  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set(courses.map((c) => c.id)),
  );
  const [exported, setExported] = useState(false);

  const filteredTasks = tasks.filter((t) => selectedCourses.has(t.courseId));

  function doExport() {
    const ics = generateICS(filteredTasks, courses, { calendarName: "SyllabusOS" });
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "syllabus-os.ics";
    a.click();
    URL.revokeObjectURL(url);
    recordExport(filteredTasks.map((t) => t.id));
    setExported(true);
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold">
          Calendar export
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Send to Google Calendar</h1>
        <p className="text-ink-500 mt-1 max-w-xl">
          Download an .ics file or push to Google Calendar. Each event includes the
          original syllabus source text so you can verify context inside any
          calendar app.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.4fr,1fr] gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Pick courses to include</CardTitle>
            <CardSubtitle>
              {filteredTasks.length} events will be created. Includes due date,
              weight, and original source text.
            </CardSubtitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {courses.map((c) => {
              const ct = tasks.filter((t) => t.courseId === c.id).length;
              const checked = selectedCourses.has(c.id);
              return (
                <label
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 cursor-pointer hover:bg-ink-50"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = new Set(selectedCourses);
                      if (checked) next.delete(c.id);
                      else next.add(c.id);
                      setSelectedCourses(next);
                    }}
                  />
                  <CourseChip course={c} />
                  <div className="text-xs text-ink-400 ml-auto">{ct} events</div>
                </label>
              );
            })}
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card className={exported ? "border-emerald-200 bg-emerald-50/40" : ""}>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent-100 grid place-items-center">
                  <Calendar className="text-accent-700" size={18} />
                </div>
                <div>
                  <div className="font-semibold">Google Calendar</div>
                  <div className="text-xs text-ink-500">
                    Standard .ics. Import once, deadlines sync.
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={doExport}>
                <Download size={14} /> Download .ics file
              </Button>
              <div className="text-xs text-ink-400 leading-relaxed">
                In Google Calendar: ⚙ → Settings → Import & Export → Import.
                Choose the downloaded .ics file. Then pick the calendar to add to.
              </div>
              {exported && (
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-medium">
                  <CheckCircle2 size={14} /> {filteredTasks.length} events exported.
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export history</CardTitle>
            </CardHeader>
            <CardBody>
              {exportMappings.length === 0 ? (
                <p className="text-sm text-ink-400">No exports yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {Array.from(
                    new Set(exportMappings.map((m) => m.exportedAt.slice(0, 10))),
                  )
                    .slice(-5)
                    .reverse()
                    .map((day) => {
                      const ct = exportMappings.filter((m) =>
                        m.exportedAt.startsWith(day),
                      ).length;
                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between text-sm p-2 rounded-lg border border-ink-100"
                        >
                          <div>{formatDate(day + "T00:00:00Z")}</div>
                          <Badge tone="success">{ct} events</Badge>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
