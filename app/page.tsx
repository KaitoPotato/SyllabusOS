import Link from "next/link";
import {
  BookOpen,
  CalendarClock,
  Inbox,
  Languages,
  Send,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { LandingMockup } from "@/components/landing/LandingMockup";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-accent-50 via-white to-white">
      <header className="px-6 lg:px-10 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-accent-600 text-white grid place-items-center">
            <BookOpen size={18} />
          </div>
          <span className="font-semibold">SyllabusOS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-600">
          <a href="#how" className="hover:text-ink-900">How it works</a>
          <a href="#story" className="hover:text-ink-900">Maya's story</a>
          <a href="#features" className="hover:text-ink-900">Features</a>
          <a href="#pricing" className="hover:text-ink-900">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/demos" className="btn-secondary hidden sm:inline-flex">
            Try a demo
          </Link>
          <Link href="/onboarding/profile" className="btn-primary">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 lg:px-10 max-w-7xl mx-auto pt-10 lg:pt-20 pb-14 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 text-accent-700 px-3 py-1 text-xs font-medium mb-5">
            <Sparkles size={14} /> Built by students, for students
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-ink-900 tracking-tight leading-[1.05]">
            Your syllabi, finally
            <br />
            <span className="text-accent-600">in one calm place.</span>
          </h1>
          <p className="text-lg text-ink-600 mt-6 max-w-xl leading-relaxed">
            Upload your syllabi once. SyllabusOS extracts every deadline, exam, and
            policy, shows you a workload heatmap across the whole term, and stays
            synced when your professor changes plans mid-semester.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link href="/onboarding/profile" className="btn-primary h-12 px-6 text-base">
              Get started — it's free
            </Link>
            <Link href="/demos" className="btn-secondary h-12 px-6 text-base">
              See a live demo <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex items-center gap-5 mt-7 text-xs text-ink-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Never silently auto-updates your calendar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap size={14} className="text-accent-500" />
              5 demo personas
            </span>
          </div>
        </div>

        <LandingMockup />
      </section>

      {/* Maya's story */}
      <section id="story" className="px-6 lg:px-10 max-w-7xl mx-auto py-16">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold mb-2">
            A student you might know
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Meet Maya, a USC sophomore taking 5 classes this fall.
          </h2>
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-5">
          <div className="card p-6">
            <div className="h-12 w-12 rounded-xl bg-load-3 grid place-items-center text-2xl">
              📚
            </div>
            <h3 className="font-semibold mt-4">5 syllabi. 5 formats.</h3>
            <p className="text-sm text-ink-500 mt-2 leading-relaxed">
              Her CS professor uses a 12-page PDF. Writing 150 is a Notion doc. Econ is
              a one-page table. Each one buries deadlines differently.
            </p>
          </div>
          <div className="card p-6">
            <div className="h-12 w-12 rounded-xl bg-load-4 grid place-items-center text-2xl">
              😰
            </div>
            <h3 className="font-semibold mt-4">Week 7 is a disaster.</h3>
            <p className="text-sm text-ink-500 mt-2 leading-relaxed">
              Two midterms, a 15-page essay, and a lab report — all by Friday. Maya
              only sees this on Monday morning of week 7.
            </p>
          </div>
          <div className="card p-6">
            <div className="h-12 w-12 rounded-xl bg-load-5 grid place-items-center text-2xl">
              📩
            </div>
            <h3 className="font-semibold mt-4">Then the email lands.</h3>
            <p className="text-sm text-ink-500 mt-2 leading-relaxed">
              Her algorithms professor pushes the midterm by three days. Now nothing in
              her calendar matches reality. She's behind without knowing it.
            </p>
          </div>
        </div>

        <div className="mt-12 card p-8 bg-gradient-to-br from-accent-50 to-white">
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-8 items-center">
            <div>
              <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold mb-2">
                With SyllabusOS
              </div>
              <h3 className="text-2xl font-bold">Maya sees week 7 by week 2.</h3>
              <p className="text-ink-600 mt-3 leading-relaxed">
                The first time she uploads her syllabi, SyllabusOS pulls out every
                deadline, ranks them by grade impact, and renders her whole term as a
                workload heatmap. Crunch weeks turn red. She can re-plan now — not on
                Sunday at 11pm.
              </p>
              <p className="text-ink-600 mt-3 leading-relaxed">
                When her professor's email arrives, the change shows up in her inbox
                with the old date next to the new one. One click and the calendar
                reflows.
              </p>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                ["Upload", "5 PDFs in, structured tasks out"],
                ["Review", "Low-confidence extracts flagged before they hit the calendar"],
                ["Visualize", "Workload heatmap across all 15 weeks"],
                ["Sync", "Email-based change detection with user confirmation"],
              ].map(([title, body]) => (
                <li key={title} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-accent-600 text-white text-xs font-bold grid place-items-center mt-0.5">
                    ✓
                  </div>
                  <div>
                    <div className="font-medium">{title}</div>
                    <div className="text-ink-500">{body}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 lg:px-10 max-w-7xl mx-auto py-16 border-t border-ink-100">
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight max-w-2xl">
          How it works, end to end.
        </h2>
        <p className="text-ink-600 mt-4 max-w-2xl">
          Five small steps, no behavioral change. SyllabusOS slots into the way you
          already work.
        </p>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { n: 1, title: "Upload", body: "PDF or paste-in text. Set your term dates once." },
            { n: 2, title: "Extract", body: "Deadlines, weights, exams, office hours, policies." },
            { n: 3, title: "Review", body: "Edit low-confidence rows before they hit the calendar." },
            { n: 4, title: "Plan", body: "Heatmap + study blocks weighted by grade impact." },
            { n: 5, title: "Sync", body: "Forward announcements. Approve changes. Reflow." },
          ].map((s) => (
            <div key={s.n} className="card p-5">
              <div className="text-xs font-semibold text-accent-600">Step {s.n}</div>
              <div className="text-lg font-semibold mt-1">{s.title}</div>
              <div className="text-sm text-ink-500 mt-2 leading-relaxed">{s.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="px-6 lg:px-10 max-w-7xl mx-auto py-16">
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight max-w-2xl">
          Designed for real student life.
        </h2>
        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: <CalendarClock className="text-accent-600" />,
              title: "Workload heatmap",
              body: "See your whole term on one screen. Crunch weeks light up red two weeks before they bite.",
            },
            {
              icon: <Inbox className="text-accent-600" />,
              title: "Change detection",
              body: "Forward announcements. We diff dates against your syllabus and ask before updating.",
            },
            {
              icon: <ShieldCheck className="text-accent-600" />,
              title: "Trust by design",
              body: "Confidence flags on every extraction. Inline editing. No silent auto-commits.",
            },
            {
              icon: <Send className="text-accent-600" />,
              title: "Google Calendar export",
              body: "One click sends every deadline to your existing calendar with full source context.",
            },
            {
              icon: <Languages className="text-accent-600" />,
              title: "International-student mode",
              body: "Plain-English policies, hover tooltips on academic terms, and Mandarin/Spanish translation.",
            },
            {
              icon: <Sparkles className="text-accent-600" />,
              title: "Personal events (paid)",
              body: "Layer in work shifts, practice, games. We flag when a deadline lands on a game day.",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div className="h-10 w-10 rounded-xl bg-accent-100 grid place-items-center">
                {f.icon}
              </div>
              <h3 className="font-semibold mt-4">{f.title}</h3>
              <p className="text-sm text-ink-500 mt-2 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 lg:px-10 max-w-7xl mx-auto py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Free for school. Paid for life.
          </h2>
          <p className="text-ink-600 mt-4">
            Core academic planning is free, forever. Students juggling jobs, sports, or
            travel can upgrade to layer real life on top.
          </p>
        </div>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          <div className="card p-6">
            <div className="text-xs uppercase tracking-widest text-ink-400 font-semibold">Free</div>
            <div className="text-3xl font-bold mt-2">$0</div>
            <ul className="mt-5 space-y-2 text-sm">
              <li>✓ Unlimited syllabus uploads</li>
              <li>✓ Structured extraction with confidence flags</li>
              <li>✓ Workload heatmap + study plan</li>
              <li>✓ Email-based change detection</li>
              <li>✓ Google Calendar export</li>
              <li>✓ Multi-course aggregation</li>
            </ul>
            <Link href="/onboarding/profile" className="btn-primary mt-6 w-full justify-center">
              Get started
            </Link>
          </div>
          <div className="card p-6 ring-1 ring-accent-200 bg-gradient-to-br from-accent-50 to-white">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-accent-700 font-semibold">Paid</div>
              <span className="chip bg-accent-600 text-white">Recommended for athletes & workers</span>
            </div>
            <div className="text-3xl font-bold mt-2">$4 <span className="text-base text-ink-500 font-normal">/ month</span></div>
            <ul className="mt-5 space-y-2 text-sm">
              <li>✓ Everything in free</li>
              <li>✓ Personal events: shifts, practice, games, travel</li>
              <li>✓ Smart conflict alerts across academics + life</li>
              <li>✓ Game-day warnings on deadlines</li>
              <li>✓ Travel-aware exam prep blocks</li>
            </ul>
            <Link href="/account" className="btn-secondary mt-6 w-full justify-center">
              Upgrade later from settings
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 lg:px-10 max-w-7xl mx-auto py-16">
        <div className="rounded-3xl bg-ink-900 text-white px-8 py-14 lg:p-16 grid lg:grid-cols-[2fr,1fr] gap-6 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Your syllabi are due now.
            </h2>
            <p className="text-ink-200 mt-3 max-w-xl">
              Upload one. See your whole term. Decide what to do about next Friday's
              midterm before it sneaks up on you.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link href="/onboarding/profile" className="btn-primary h-12 justify-center">
              Get started free
            </Link>
            <Link
              href="/demos"
              className="btn h-12 justify-center bg-white/10 text-white hover:bg-white/20"
            >
              Try a demo persona
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-6 lg:px-10 max-w-7xl mx-auto py-10 text-xs text-ink-400 flex flex-wrap items-center justify-between gap-3">
        <span>© SyllabusOS · TAC 459 Team C · v2</span>
        <span>Made with care for students.</span>
      </footer>
    </div>
  );
}
