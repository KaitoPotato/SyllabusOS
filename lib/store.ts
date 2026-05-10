"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { buildDemos } from "./seed";
import type {
  ChangeFlag,
  Course,
  ExportMapping,
  GradingWeight,
  OfficeHour,
  Persona,
  PersonalEvent,
  Policy,
  Profile,
  StudyBlock,
  Syllabus,
  Task,
} from "./types";
import { uid } from "./utils";

type AppState = {
  hydrated: boolean;
  activePersona: Persona;
  profile: Profile | null;
  courses: Course[];
  syllabi: Syllabus[];
  tasks: Task[];
  policies: Policy[];
  officeHours: OfficeHour[];
  gradingWeights: GradingWeight[];
  personalEvents: PersonalEvent[];
  changeFlags: ChangeFlag[];
  studyBlocks: StudyBlock[];
  exportMappings: ExportMapping[];
  // ui
  onboardingComplete: boolean;
  hasUploaded: boolean;
  showLowConfidenceReview: boolean;

  // actions
  switchPersona: (persona: Persona) => void;
  resetToSeed: (persona?: Persona) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  completeOnboarding: () => void;
  setHasUploaded: (v: boolean) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTaskStatus: (id: string) => void;
  addPersonalEvent: (ev: Omit<PersonalEvent, "id">) => void;
  removePersonalEvent: (id: string) => void;
  acceptChangeFlag: (id: string) => void;
  overrideChangeFlag: (id: string) => void;
  dismissChangeFlag: (id: string) => void;
  addCourse: (course: Omit<Course, "id">) => string;
  removeCourse: (id: string) => void;
  addTasksFromExtraction: (tasks: Task[], syllabus: Syllabus, policies: Policy[], gradingWeights: GradingWeight[], officeHours: OfficeHour[]) => void;
  addStudyBlock: (block: Omit<StudyBlock, "id">) => void;
  setTaskGrade: (id: string, grade: number) => void;
  recordExport: (taskIds: string[]) => void;
  setPlan: (plan: "free" | "paid") => void;
  setTranslation: (enabled: boolean, language?: string) => void;
};

function snapshotFromPersona(persona: Persona) {
  const demos = buildDemos();
  const demo = demos.find((d) => d.persona === persona) ?? demos[0];
  return {
    profile: demo.profile,
    courses: demo.courses.map((c) => c.course),
    syllabi: demo.courses.map((c) => c.syllabus),
    tasks: demo.courses.flatMap((c) => c.tasks),
    policies: demo.courses.flatMap((c) => c.policies),
    officeHours: demo.courses.flatMap((c) => c.officeHours),
    gradingWeights: demo.courses.flatMap((c) => c.gradingWeights),
    personalEvents: demo.personalEvents,
    changeFlags: demo.changeFlags,
  };
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      activePersona: "first-year",
      ...snapshotFromPersona("first-year"),
      studyBlocks: [],
      exportMappings: [],
      onboardingComplete: true,
      hasUploaded: true,
      showLowConfidenceReview: false,

      switchPersona: (persona) => {
        const snap = snapshotFromPersona(persona);
        set({
          activePersona: persona,
          ...snap,
          studyBlocks: [],
          exportMappings: [],
          onboardingComplete: true,
          hasUploaded: true,
        });
      },

      resetToSeed: (persona) => {
        const p = persona ?? get().activePersona;
        const snap = snapshotFromPersona(p);
        set({
          activePersona: p,
          ...snap,
          studyBlocks: [],
          exportMappings: [],
          onboardingComplete: true,
          hasUploaded: true,
        });
      },

      updateProfile: (patch) => {
        const cur = get().profile;
        if (!cur) return;
        set({ profile: { ...cur, ...patch } });
      },

      completeOnboarding: () => set({ onboardingComplete: true }),
      setHasUploaded: (v) => set({ hasUploaded: v }),

      updateTask: (id, patch) =>
        set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }),

      toggleTaskStatus: (id) => {
        const t = get().tasks.find((x) => x.id === id);
        if (!t) return;
        const next = t.status === "complete" ? "pending" : "complete";
        get().updateTask(id, { status: next });
      },

      addPersonalEvent: (ev) =>
        set({ personalEvents: [...get().personalEvents, { ...ev, id: uid("pe") }] }),

      removePersonalEvent: (id) =>
        set({ personalEvents: get().personalEvents.filter((p) => p.id !== id) }),

      acceptChangeFlag: (id) => {
        const flag = get().changeFlags.find((f) => f.id === id);
        if (!flag) return;
        if (flag.kind === "potential-change" && flag.taskId && flag.proposedDate) {
          get().updateTask(flag.taskId, { dueDate: flag.proposedDate, status: "changed" });
        } else if (flag.kind === "new-item" && flag.proposedTitle && flag.proposedDate) {
          const newTask: Task = {
            id: uid("task"),
            courseId: flag.courseId,
            name: flag.proposedTitle,
            type: "assignment",
            dueDate: flag.proposedDate,
            weight: 0,
            workload: "medium",
            confidence: 0.7,
            sourceText: flag.announcementText,
            status: "pending",
          };
          set({ tasks: [...get().tasks, newTask] });
        }
        set({
          changeFlags: get().changeFlags.map((f) =>
            f.id === id ? { ...f, status: "accepted" } : f,
          ),
        });
      },

      overrideChangeFlag: (id) =>
        set({
          changeFlags: get().changeFlags.map((f) =>
            f.id === id ? { ...f, status: "overridden" } : f,
          ),
        }),

      dismissChangeFlag: (id) =>
        set({
          changeFlags: get().changeFlags.map((f) =>
            f.id === id ? { ...f, status: "dismissed" } : f,
          ),
        }),

      addCourse: (course) => {
        const id = uid("course");
        set({ courses: [...get().courses, { ...course, id }] });
        return id;
      },

      removeCourse: (id) => {
        set({
          courses: get().courses.filter((c) => c.id !== id),
          tasks: get().tasks.filter((t) => t.courseId !== id),
          syllabi: get().syllabi.filter((s) => s.courseId !== id),
          policies: get().policies.filter((p) => p.courseId !== id),
          officeHours: get().officeHours.filter((o) => o.courseId !== id),
          gradingWeights: get().gradingWeights.filter((g) => g.courseId !== id),
        });
      },

      addTasksFromExtraction: (tasks, syllabus, policies, gradingWeights, officeHours) => {
        set({
          tasks: [...get().tasks, ...tasks],
          syllabi: [...get().syllabi, syllabus],
          policies: [...get().policies, ...policies],
          gradingWeights: [...get().gradingWeights, ...gradingWeights],
          officeHours: [...get().officeHours, ...officeHours],
          hasUploaded: true,
        });
        if (tasks.some((t) => t.confidence < 0.8)) {
          set({ showLowConfidenceReview: true });
        }
      },

      addStudyBlock: (block) =>
        set({ studyBlocks: [...get().studyBlocks, { ...block, id: uid("sb") }] }),

      setTaskGrade: (id, grade) => get().updateTask(id, { grade }),

      recordExport: (taskIds) => {
        const stamps = taskIds.map((tid) => ({
          id: uid("exp"),
          taskId: tid,
          externalId: `gcal_${Math.random().toString(36).slice(2, 10)}`,
          destination: "google-calendar" as const,
          exportedAt: new Date().toISOString(),
        }));
        set({ exportMappings: [...get().exportMappings, ...stamps] });
      },

      setPlan: (plan) => {
        const cur = get().profile;
        if (!cur) return;
        set({ profile: { ...cur, plan } });
      },

      setTranslation: (enabled, language) => {
        const cur = get().profile;
        if (!cur) return;
        set({
          profile: {
            ...cur,
            translationEnabled: enabled,
            translationLanguage: language ?? cur.translationLanguage,
          },
        });
      },
    }),
    {
      name: "syllabusos-v2",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

// React-safe hydration helper to avoid SSR/CSR mismatch
export function useHydrated(): boolean {
  return useStore((s) => s.hydrated);
}
