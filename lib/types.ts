export type Plan = "free" | "paid";

export type Persona =
  | "first-year"
  | "engineering"
  | "international"
  | "athlete"
  | "working";

export type Profile = {
  id: string;
  name: string;
  university: string;
  major: string;
  year: string;
  email?: string;
  termStartDate: string; // ISO yyyy-mm-dd
  termEndDate: string;
  notificationPrefs: {
    email: boolean;
    push: boolean;
    daysAhead: number;
  };
  coursePalette: string[]; // hex colors preference order
  plan: Plan;
  persona: Persona;
  translationEnabled: boolean;
  translationLanguage: string; // ISO 639-1 like "zh", "es"
};

export type Course = {
  id: string;
  code: string;
  name: string;
  color: string;
  instructor: string;
  professorEmail?: string;
  meetingPattern?: string;
  syllabusId?: string;
};

export type TaskType =
  | "assignment"
  | "exam"
  | "project"
  | "quiz"
  | "reading"
  | "presentation"
  | "office-hour"
  | "policy"
  | "other";

export type Workload = "low" | "medium" | "high";
export type TaskStatus = "pending" | "complete" | "deferred" | "changed";

export type Task = {
  id: string;
  courseId: string;
  name: string;
  type: TaskType;
  dueDate: string; // ISO datetime
  weight: number; // % of course grade
  workload: Workload;
  confidence: number; // 0-1
  notes?: string;
  sourceText: string;
  sourcePage?: number;
  status: TaskStatus;
  parentId?: string; // for subtasks from decomposition
  estimatedHours?: number;
  grade?: number; // received grade 0-100
};

export type Policy = {
  id: string;
  courseId: string;
  category: "late-work" | "attendance" | "academic-integrity" | "grading" | "other";
  plainEnglish: string;
  sourceText: string;
  confidence: number;
};

export type OfficeHour = {
  id: string;
  courseId: string;
  instructor: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
};

export type GradingWeight = {
  id: string;
  courseId: string;
  type: string;
  weight: number; // percent
  sourceText: string;
  confidence: number;
};

export type Syllabus = {
  id: string;
  courseId: string;
  filename: string;
  uploadedAt: string;
  rawText: string;
  pages: number;
};

export type PersonalEvent = {
  id: string;
  title: string;
  category: "work" | "practice" | "game" | "travel" | "personal";
  startDate: string; // ISO datetime
  endDate: string;
  recurringRule?: string; // simple "weekly:MON,WED,FRI"
  color: string;
  notes?: string;
};

export type ChangeFlag = {
  id: string;
  taskId?: string;
  courseId: string;
  kind: "potential-change" | "new-item" | "ambiguous";
  proposedDate?: string;
  originalDate?: string;
  proposedTitle?: string;
  announcementText: string;
  sender: string;
  subject: string;
  receivedAt: string;
  status: "pending" | "accepted" | "overridden" | "dismissed";
};

export type StudyBlock = {
  id: string;
  taskId: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  durationMinutes: number;
  kind: "study" | "exam-prep" | "buffer";
};

export type ExportMapping = {
  id: string;
  taskId: string;
  externalId: string;
  destination: "google-calendar";
  exportedAt: string;
};
