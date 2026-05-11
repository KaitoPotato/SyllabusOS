# SyllabusOS 
> Turn messy syllabi into a structured academic planner that stays synced over the term.

SyllabusOS v2 is a full-stack student planning product. Students upload their syllabi (PDF or pasted text); SyllabusOS extracts every deadline, exam, grading weight, and policy, renders a workload heatmap across the whole term, and stays synced when professors change plans mid-semester via forwarded announcements.

This repo belongs to Team C: Camille Dove, Cooper Lenahan, Eileen Yang, Jack Donell, Pinru Wang, Suin Lee, Vivian Ting

---

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

**Build & typecheck:**

```bash
npm run build
npm run typecheck
```

The app needs Node 18+. There are no required env vars — every external service is mocked behind an adapter (see *What is mocked* below).

---

## What you can do (end-to-end demo)

1. **Land on `/`** — the marketing page introduces Maya, a USC sophomore, and walks through the upload → extract → review → calendar → sync flow with a styled mockup.
2. **`/demos`** — switch between five demo personas (first-year, engineering, international, athlete, working student). Each loads a complete term with real syllabi, deadlines, and (where applicable) personal commitments.
3. **`/onboarding/profile` → `/onboarding/upload`** — first-time flow. Captures name, university, major, year, **term start/end dates** (required to resolve "Week 5" references), notification prefs, and course color palette. Then accepts a PDF or pasted text and runs the rule-based extractor.
4. **`/syllabus/[id]`** — structured view of a single course. Inline-edit every row, see confidence flags, expand to view source text, re-run extraction, and translate policies into Chinese/Spanish/Korean.
5. **`/dashboard`** — the main home screen. Workload heatmap across the term, "this week / heaviest week / next 3 days" stats, calendar/list toggle, single/multi-course toggle, priority-sorted task list, courses panel. Click any week or task to drill in.
6. **`/study-plan`** — auto-generated study blocks weighted by grade impact, routed around personal commitments. The final two weeks of the term flip into **exam-period mode**.
7. **`/inbox`** — change-detection inbox. Forward an announcement (or use the in-page simulator) and SyllabusOS diffs dates against your syllabus, surfaces the old date next to the new one, and asks you to accept, override, or dismiss before the calendar reflows.
8. **`/export`** — generate a real `.ics` file for Google Calendar (or any calendar app) with full source-text context in each event description.
9. **`/grades`** — pull a mock gradebook, see weighted course averages, and watch the priority engine re-rank upcoming tasks for courses where you're behind.
10. **`/personal`** *(paid)* — layer in work shifts, practice, games, travel. Conflict detector flags any deadline that lands on a committed day.
11. **`/translation`** — toggle translation overlay on; pick a language; live demo of the adapter.
12. **`/account`** — edit profile, switch plan, reset demo data to seed.

---

## Tech stack

A short, deliberately small stack so the code stays readable.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** + TypeScript | Familiar, fast, easy to deploy. App Router gives us per-route layouts and server actions when we need them. |
| Styling | **Tailwind CSS** + a hand-built shadcn-style component set | Speed without surrendering control. All UI primitives are in `components/ui/`. |
| Icons | **lucide-react** | Lightweight, consistent. |
| State | **Zustand** with `persist` middleware → localStorage | Trivial to read in any client component, persists user edits across reloads, easy to swap for a real backend. |
| Data shape | Hand-built TypeScript types in `lib/types.ts` | Self-documenting domain model. |
| Persistence | localStorage for now; **schema is ready for Prisma + SQLite** | The store is a thin repository pattern — swap `useStore` for Prisma calls and the UI doesn't change. |
| Domain logic | Pure functions in `lib/parser.ts`, `lib/workload.ts`, `lib/change-detection.ts` | Testable, no React in sight. |
| Dates | `date-fns` style helpers in `lib/utils.ts` | Tiny surface, no full library needed. |

---

## File map

```
app/
  page.tsx                  ← landing
  demos/                    ← persona switcher
  onboarding/
    profile/                ← step 1: profile setup
    upload/                 ← step 2: upload + parse
  dashboard/                ← step 3 + core home
  syllabus/[id]/            ← structured review
  study-plan/               ← weekly + exam-period planning
  inbox/                    ← change-detection inbox
  grades/                   ← mock gradebook sync
  personal/                 ← personal events (paid)
  export/                   ← Google Calendar export
  translation/              ← international-student mode
  account/                  ← plan & profile

components/
  ui/                       ← Button, Card, Badge, Input, Drawer, Tooltip primitives
  landing/                  ← LandingMockup
  onboarding/               ← ProfileForm, UploadForm
  dashboard/                ← Dashboard
  syllabus/                 ← SyllabusReview
  study/                    ← StudyPlan
  inbox/                    ← Inbox
  account/                  ← AccountPage
  personal/                 ← PersonalEvents
  export/                   ← ExportPage
  grades/                   ← GradesPage
  translation/              ← TranslationPage
  AppShell.tsx              ← Sidebar nav (shown on every authenticated page)
  Heatmap.tsx, CalendarView.tsx, TaskRow.tsx, TaskDrawer.tsx
  ConfidenceBadge.tsx, CourseChip.tsx, HydrationGate.tsx

lib/
  types.ts                  ← domain types
  store.ts                  ← Zustand store + persist
  seed.ts                   ← 5 demo personas, ~8 reusable course packs
  utils.ts                  ← cn, date helpers, formatting
  parser.ts                 ← rule-based syllabus extraction
  workload.ts               ← week bucketing, intensity, priority sorting, conflict detection
  change-detection.ts       ← announcement diffing
  adapters/
    google-calendar.ts      ← .ics generation
    gradebook.ts            ← mocked LMS pull + priority boost
    translation.ts          ← dictionary-backed translation
```

---

## How extraction works

The parser in `lib/parser.ts` is intentionally simple and rule-based:

1. **Sentence split** the raw syllabus text.
2. For each sentence, look for **type keywords** (`exam`, `final`, `midterm`, `homework`, `hw`, `essay`, `project`, `lab`, `problem set`, `quiz`, `presentation`, `reading`).
3. Try to parse a **date** in five formats:
   - ISO `2025-10-14`
   - written (`October 14`, `Oct 14th`)
   - numeric (`10/14`, `10/14/25`)
   - **`Week N`** (resolved against the term start date — flagged as low confidence)
4. Try to parse a **weight**: numeric percentage like `20%` or a fractional reference like `"one-third"`.
5. Compose a task with a **blended confidence score**: 60% date confidence + 30% weight confidence + 10% type signal.
6. Detect **policies** (late-work, attendance, academic integrity) and rewrite them into plain English (`humanizeLatePolicy`, `humanizeAttendance`).
7. Detect **office hours** and **grading weights** via separate keyword passes.

Anything below 0.8 confidence is flagged. **Nothing low-confidence ever reaches the calendar without user review.**

The product is deliberately *precision-first* — the trust risk on a student's first upload is so high that a missed item is much cheaper than a wrong one.

### Change detection

`lib/change-detection.ts` parses the announcement body for a date, finds the best Jaccard-similarity match against existing tasks for the inferred course (via sender email or course-code mention), and flags one of:

- **Potential change** — match score ≥ 0.18 AND the date differs.
- **New item** — match score < 0.08, with a date present.
- **Ambiguous** — somewhere in between; logged but not surfaced.
- *(silent drop)* — match exists AND the date is the same. Avoids "Remember, the midterm is next week" false positives.

User confirmation is always required before the calendar reflows.

---

## Workload + study plan

`lib/workload.ts` buckets every task into the week it's due (Monday-anchored) and computes an `intensity` score in 0–5 from a mix of **estimated hours**, **total grade weight**, and **whether an exam falls in the week**. The Heatmap component reads only that field and renders the right color.

The **study plan** schedules backwards from each due date in proportional chunks (longer for exams, shorter for routine homework). It checks personal events and skips committed days. When the current date falls within the last 14 days of the term, exam-prep blocks get a multiplier so the final stretch is weighted toward the heaviest exams.

The **priority sort** is grade-impact first, urgency second — not chronological. This is the engineering-student segment's biggest complaint about generic to-do apps.

---

## What is mocked vs real

| Feature | Status | How to make it real |
|---|---|---|
| Syllabus PDF upload | **Real** for `.txt`/`.md`. PDFs are accepted but treated as text — wire `pdf-parse` or `pdfjs-dist` in `UploadForm.handleFile` to extract real PDF text. The rest of the pipeline already works on raw text. |
| Rule-based extraction | **Real** — runs entirely client-side in `lib/parser.ts`. |
| Workload heatmap | **Real** computation over real data. |
| Change detection | **Real** logic, simulated input. Wire to a real inbox by adding a webhook route (e.g. `/api/announcements/incoming`) that calls `detectChange` with the inbound email. |
| Google Calendar export | **Real** `.ics` file output. Real API push would swap `generateICS` for the Google Calendar Events API — same call signature. |
| Gradebook | **Mocked** with a deterministic hash so the demo tells a coherent story. Adapter signature in `lib/adapters/gradebook.ts` is what a real Brightspace/Canvas client would implement. |
| Translation | **Mocked** with an in-repo dictionary covering academic vocabulary in Chinese, Spanish, Korean. Drop in DeepL/Google Translate behind the same `translatePhrase` function. |
| Persistence | **localStorage** today. Schema is Prisma-ready — every type in `lib/types.ts` maps 1:1 to a table. |

---

## Demo scenarios covered

- A student with 4–5 syllabi in different formats (every persona)
- A first-year student with academic-term tooltips (`first-year` persona, hover any underlined glossary term)
- A student-athlete with practices, games, and a travel weekend (`athlete` persona, paid)
- A part-time worker with shifts that get conflict-detected (`working` persona, paid)
- Multiple heavy weeks plus one overloaded week (`engineering` persona — see week of Nov 10)
- A syllabus that changes mid-semester via a forwarded announcement (every persona has at least one pending change flag; the engineering persona has two)
- A paid user layering in personal commitments (`athlete` and `working`)
- A student who wants to export the schedule to Google Calendar (any persona → `/export`)

---

## Design decisions worth knowing

- **Landing is *not* the upload page.** First-time visitors land on a marketing page that uses Maya's story to demonstrate the product before asking for anything.
- **Confidence flags on every extracted field.** Low-confidence items light up in amber and require review before they affect the calendar.
- **Multi-course aggregation is the default**, with a single-course toggle one click away — matches the doc's "users do not context-switch between per-course pages."
- **Priority by grade impact, not chronological order.** Visible in the dashboard's "By grade impact" panel.
- **Paid tier surfaces gracefully.** Personal-events page shows a clean upsell when the user is on free; doesn't gate other features.
- **Translation is *additive*.** Even without the toggle, every page uses plain-English policy summaries and hover tooltips on academic terms.

---

## Reset & demo tips

- Use the sidebar's **"Switch demo persona"** link to load a fresh persona at any time.
- On the **Account** page, **Reset to this persona's seed** wipes any edits and restores the demo data.
- All state lives in localStorage under the key `syllabusos-v2`. Clear it in DevTools to fully reset.

---

## Roadmap notes

- Swap localStorage for Prisma + SQLite (schema is already isomorphic).
- Real PDF parsing via `pdf-parse` server action.
- Wire `/api/announcements/incoming` for a true forwarding inbox.
- Replace `lib/adapters/translation.ts` with DeepL or Google Translate.
- Add a TF-IDF + Naive Bayes classifier as a secondary signal for grading-weight extraction (currently regex + fraction lookup is enough for the demo).
