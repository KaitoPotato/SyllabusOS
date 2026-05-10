import { UploadForm } from "@/components/onboarding/UploadForm";

export default function OnboardingUploadPage() {
  return (
    <div className="min-h-screen px-6 lg:px-10 py-10 max-w-3xl mx-auto">
      <OnboardingHeader step={2} />
      <div className="mt-8">
        <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold mb-2">
          Step 2 · Upload your first syllabus
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Drop in a syllabus to get started.
        </h1>
        <p className="text-ink-500 mt-2">
          PDF or paste the raw text. We'll extract every deadline, exam, weight, and
          policy — and flag anything we're not sure about for you to review.
        </p>
        <UploadForm />
      </div>
    </div>
  );
}

function OnboardingHeader({ step }: { step: number }) {
  const steps = [
    { n: 1, title: "Profile" },
    { n: 2, title: "Upload syllabus" },
    { n: 3, title: "Calendar populated" },
  ];
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} className="flex items-center gap-3 flex-1">
            <div
              className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold ${
                done
                  ? "bg-emerald-500 text-white"
                  : active
                  ? "bg-accent-600 text-white"
                  : "bg-ink-100 text-ink-400"
              }`}
            >
              {done ? "✓" : s.n}
            </div>
            <span
              className={`text-sm ${active ? "font-semibold text-ink-900" : "text-ink-500"}`}
            >
              {s.title}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px ${done ? "bg-emerald-300" : "bg-ink-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
