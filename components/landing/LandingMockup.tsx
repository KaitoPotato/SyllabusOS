// Pure visual mockup of the dashboard for the landing page. No interactivity, no
// store dependency — keeps the marketing page fast and SSR-safe.

import { CalendarClock, Inbox } from "lucide-react";

export function LandingMockup() {
  return (
    <div className="relative">
      <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-accent-200/50 blur-3xl" />
      <div className="absolute -bottom-8 -right-4 h-40 w-40 rounded-full bg-load-3/50 blur-3xl" />

      <div className="relative card p-5 shadow-pop">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-ink-400">Fall 2025 · 4 courses</div>
            <div className="font-semibold">Maya's term at a glance</div>
          </div>
          <div className="chip bg-accent-100 text-accent-700">15 weeks</div>
        </div>

        {/* heatmap */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {INTENSITIES.map((n, i) => (
            <div
              key={i}
              className={`h-8 w-8 rounded-md ${HEAT_COLORS[n]} relative`}
              title={`Week ${i + 1}`}
            >
              {EXAM_WEEKS.has(i) && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-white border-2 border-accent-600" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <Stat label="This week" value="3 due" color="bg-emerald-100 text-emerald-700" />
          <Stat label="Heaviest" value="Week 11" color="bg-red-100 text-red-700" />
          <Stat label="Next 3 days" value="2 tasks" color="bg-accent-100 text-accent-700" />
        </div>

        <div className="space-y-2">
          {TASKS.map((t) => (
            <div key={t.title} className="flex items-center gap-3 p-2.5 rounded-xl border border-ink-100">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: t.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-[11px] text-ink-400">{t.meta}</div>
              </div>
              <span
                className={`chip ${
                  t.confidence === "low"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {t.confidence === "low" ? "review" : `${t.weight}%`}
              </span>
            </div>
          ))}
        </div>

        <div className="hairline my-4" />

        <div className="flex items-center gap-3 text-xs text-ink-500">
          <Inbox size={14} className="text-load-5" />
          <span>
            <span className="font-semibold text-ink-800">Prof. Wallace</span> moved
            Essay 2 to Oct 16 →
          </span>
          <span className="ml-auto text-accent-700 font-medium">Review change</span>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 card p-3 flex items-center gap-2 hidden md:flex">
        <CalendarClock size={16} className="text-accent-600" />
        <span className="text-xs font-medium">Sunday plan ready</span>
      </div>
    </div>
  );
}

const INTENSITIES = [0, 1, 2, 1, 3, 2, 4, 5, 2, 1, 5, 4, 2, 3, 5];
const EXAM_WEEKS = new Set([6, 10, 14]);
const HEAT_COLORS = [
  "bg-load-0",
  "bg-load-1",
  "bg-load-2",
  "bg-load-3",
  "bg-load-4",
  "bg-load-5",
];

const TASKS = [
  { title: "Essay 1 draft", meta: "WRIT 150 · due Thu", color: "#7044e5", confidence: "ok", weight: 10 },
  { title: "Quiz 2", meta: "PSYC 100 · Mon 2pm", color: "#ef6c8a", confidence: "ok", weight: 2 },
  { title: "Lab 4 (week 5)", meta: "Resolved week ref — review", color: "#3aa6a6", confidence: "low", weight: 5 },
];

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3 bg-ink-50">
      <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold">
        {label}
      </div>
      <div className={`text-sm font-semibold mt-1 inline-flex rounded px-2 py-0.5 ${color}`}>
        {value}
      </div>
    </div>
  );
}
