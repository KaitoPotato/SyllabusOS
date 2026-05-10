import type {
  ChangeFlag,
  Course,
  GradingWeight,
  OfficeHour,
  Persona,
  PersonalEvent,
  Policy,
  Profile,
  Syllabus,
  Task,
} from "./types";

// Term spans Aug 26, 2025 – Dec 12, 2025 so the dashboard always has rich, plausible content
// regardless of when a demo viewer loads the app.
const TERM_START = "2025-08-26";
const TERM_END = "2025-12-12";

const COURSE_PALETTE = ["#7044e5", "#ef6c8a", "#3aa6a6", "#e9a23b", "#3b82f6", "#10b981"];

// ---------- helpers ----------
const iso = (y: number, m: number, d: number, hh = 23, mm = 59) =>
  new Date(Date.UTC(y, m - 1, d, hh, mm)).toISOString();

type CoursePack = {
  course: Course;
  syllabus: Syllabus;
  tasks: Task[];
  policies: Policy[];
  officeHours: OfficeHour[];
  gradingWeights: GradingWeight[];
};

type Demo = {
  persona: Persona;
  profile: Profile;
  courses: CoursePack[];
  personalEvents: PersonalEvent[];
  changeFlags: ChangeFlag[];
};

// ---------- shared course factories ----------

function csCourse(id: string, color: string): CoursePack {
  const courseId = id;
  return {
    course: {
      id: courseId,
      code: "CSCI 270",
      name: "Algorithms",
      color,
      instructor: "Dr. Adamchik",
      professorEmail: "adamchik@usc.edu",
      meetingPattern: "TTh 9:30–10:50am",
      syllabusId: `syl_${id}`,
    },
    syllabus: {
      id: `syl_${id}`,
      courseId,
      filename: "CSCI270_F25_Syllabus.pdf",
      uploadedAt: iso(2025, 8, 27, 14, 12),
      pages: 6,
      rawText:
        "CSCI 270 Algorithms (Fall 2025). Homework comprises 30% of the final grade. Midterm 1 worth 20% on October 14. Midterm 2 worth 20% on November 18. Final exam worth 30%. Late homework accepted up to 48 hours after the deadline with a 15% penalty. Office hours: M 2–4pm in SAL 218.",
    },
    tasks: [
      mkTask(courseId, "HW 1: Divide & Conquer", "assignment", iso(2025, 9, 5), 5, "low", 0.97, "Homework 1 due Sept 5 covering divide and conquer."),
      mkTask(courseId, "HW 2: Greedy", "assignment", iso(2025, 9, 19), 5, "low", 0.96, "Homework 2 due Sept 19."),
      mkTask(courseId, "HW 3: DP Practice", "assignment", iso(2025, 10, 3), 5, "medium", 0.94, "Homework 3 due Oct 3."),
      mkTask(courseId, "Midterm 1", "exam", iso(2025, 10, 14, 18, 30), 20, "high", 0.99, "Midterm 1 on October 14. Covers Units 1–4."),
      mkTask(courseId, "HW 4: Graphs", "assignment", iso(2025, 10, 24), 5, "medium", 0.55, "Homework on graphs around mid-October."),
      mkTask(courseId, "HW 5: Network Flow", "assignment", iso(2025, 11, 7), 5, "medium", 0.86, "Homework 5 due Nov 7."),
      mkTask(courseId, "Midterm 2", "exam", iso(2025, 11, 18, 18, 30), 20, "high", 0.98, "Midterm 2 on November 18. Covers Units 5–8."),
      mkTask(courseId, "HW 6: NP-hardness", "assignment", iso(2025, 12, 2), 5, "medium", 0.9, "Homework 6 due Dec 2."),
      mkTask(courseId, "Final Exam", "exam", iso(2025, 12, 10, 19, 0), 30, "high", 0.99, "Cumulative final exam December 10, 7pm."),
    ],
    policies: [
      pol(courseId, "late-work", "You can submit homework up to 2 days late with a 15% penalty per day.", "Late homework will be accepted up to 48 hours past the deadline at a 15% per-day penalty.", 0.93),
      pol(courseId, "academic-integrity", "Discussions are encouraged but every line of code or proof must be your own.", "Students may discuss problems but final write-ups must be solo work.", 0.92),
      pol(courseId, "attendance", "Attendance is not graded, but lectures introduce material not in the textbook.", "Attendance is not required. Note that some material is only covered in lecture.", 0.85),
    ],
    officeHours: [
      oh(courseId, "Dr. Adamchik", "Monday", "14:00", "16:00", "SAL 218"),
      oh(courseId, "TA: Priya", "Wednesday", "15:00", "17:00", "SAL 213"),
      oh(courseId, "TA: Daniel", "Friday", "10:00", "12:00", "Zoom"),
    ],
    gradingWeights: [
      gw(courseId, "Homework", 30, "Homework comprises 30% of the final grade.", 0.96),
      gw(courseId, "Midterm 1", 20, "Midterm 1 worth 20%", 0.97),
      gw(courseId, "Midterm 2", 20, "Midterm 2 worth 20%", 0.97),
      gw(courseId, "Final", 30, "Final exam worth 30%", 0.98),
    ],
  };
}

function writingCourse(id: string, color: string): CoursePack {
  const courseId = id;
  return {
    course: {
      id: courseId,
      code: "WRIT 150",
      name: "Writing & Critical Reasoning",
      color,
      instructor: "Prof. Wallace",
      professorEmail: "wallace@usc.edu",
      meetingPattern: "MW 12:00–1:50pm",
      syllabusId: `syl_${id}`,
    },
    syllabus: {
      id: `syl_${id}`,
      courseId,
      filename: "WRIT150_Syllabus.pdf",
      uploadedAt: iso(2025, 8, 27, 14, 30),
      pages: 9,
      rawText:
        "WRIT 150. Essay 1 (10%) due Week 4. Essay 2 (15%) due Week 7. Essay 3 (20%) due Week 11. Portfolio (35%) due finals week. Participation 20%. Late work loses one letter grade per 24 hours.",
    },
    tasks: [
      mkTask(courseId, "Essay 1: Argument Draft", "assignment", iso(2025, 9, 18), 10, "medium", 0.78, "Essay 1 due Week 4 — needs review (Week reference)."),
      mkTask(courseId, "Peer Review for Essay 2", "assignment", iso(2025, 10, 6), 5, "low", 0.7, "Peer review session."),
      mkTask(courseId, "Essay 2: Rhetorical Analysis", "assignment", iso(2025, 10, 13), 15, "high", 0.88, "Essay 2 due Week 7."),
      mkTask(courseId, "Essay 3: Research Paper", "project", iso(2025, 11, 10), 20, "high", 0.9, "Essay 3 due Week 11."),
      mkTask(courseId, "Portfolio", "project", iso(2025, 12, 8), 35, "high", 0.92, "Final portfolio submission."),
    ],
    policies: [
      pol(courseId, "late-work", "Every 24 hours your essay is late, it drops one full letter grade.", "Late submissions lose one letter grade per 24 hours.", 0.94),
      pol(courseId, "attendance", "More than three unexcused absences lowers your participation grade.", "Three or more unexcused absences may affect participation.", 0.88),
    ],
    officeHours: [
      oh(courseId, "Prof. Wallace", "Tuesday", "13:00", "14:30", "JEF 211"),
      oh(courseId, "Prof. Wallace", "Thursday", "10:00", "11:00", "By appointment"),
    ],
    gradingWeights: [
      gw(courseId, "Essay 1", 10, "Essay 1 — 10%", 0.92),
      gw(courseId, "Essay 2", 15, "Essay 2 — 15%", 0.92),
      gw(courseId, "Essay 3", 20, "Essay 3 — 20%", 0.92),
      gw(courseId, "Portfolio", 35, "Portfolio — 35%", 0.95),
      gw(courseId, "Participation", 20, "Participation 20%", 0.86),
    ],
  };
}

function biologyCourse(id: string, color: string): CoursePack {
  const courseId = id;
  return {
    course: {
      id: courseId,
      code: "BISC 220",
      name: "Cell Biology & Physiology",
      color,
      instructor: "Dr. Hines",
      professorEmail: "hines@usc.edu",
      meetingPattern: "MWF 9:00–9:50am + Lab T 1–4pm",
      syllabusId: `syl_${id}`,
    },
    syllabus: {
      id: `syl_${id}`,
      courseId,
      filename: "BISC220.pdf",
      uploadedAt: iso(2025, 8, 27, 14, 45),
      pages: 11,
      rawText:
        "BISC 220 Cell Biology. Three midterms 15% each. Lab reports 25%. Final exam 30%. Lab attendance mandatory.",
    },
    tasks: [
      mkTask(courseId, "Lab Report 1", "assignment", iso(2025, 9, 12), 5, "medium", 0.85, "First lab report due."),
      mkTask(courseId, "Midterm 1", "exam", iso(2025, 9, 26, 9, 0), 15, "high", 0.97, "Midterm 1 in class."),
      mkTask(courseId, "Lab Report 2", "assignment", iso(2025, 10, 10), 5, "medium", 0.85, "Second lab report due."),
      mkTask(courseId, "Midterm 2", "exam", iso(2025, 10, 24, 9, 0), 15, "high", 0.97, "Midterm 2."),
      mkTask(courseId, "Lab Report 3", "assignment", iso(2025, 11, 7), 5, "medium", 0.85, "Third lab report due."),
      mkTask(courseId, "Midterm 3", "exam", iso(2025, 11, 14, 9, 0), 15, "high", 0.97, "Midterm 3."),
      mkTask(courseId, "Lab Report 4", "assignment", iso(2025, 11, 21), 5, "medium", 0.85, "Fourth lab report due."),
      mkTask(courseId, "Lab Practical", "exam", iso(2025, 12, 2, 13, 0), 5, "high", 0.9, "Lab practical."),
      mkTask(courseId, "Final Exam", "exam", iso(2025, 12, 11, 8, 0), 30, "high", 0.99, "Cumulative final exam."),
    ],
    policies: [
      pol(courseId, "attendance", "If you miss lab, you cannot make it up — that grade becomes a zero.", "Lab attendance is mandatory. Missed labs cannot be made up.", 0.93),
      pol(courseId, "late-work", "Lab reports drop 10% per day for up to 3 days, then no credit.", "Late lab reports lose 10% per day, max 3 days.", 0.89),
    ],
    officeHours: [
      oh(courseId, "Dr. Hines", "Wednesday", "14:00", "15:30", "RRI 320"),
      oh(courseId, "TA: Mei", "Friday", "13:00", "15:00", "RRI Lab Suite"),
    ],
    gradingWeights: [
      gw(courseId, "Midterm 1", 15, "Midterm 15%", 0.96),
      gw(courseId, "Midterm 2", 15, "Midterm 15%", 0.96),
      gw(courseId, "Midterm 3", 15, "Midterm 15%", 0.96),
      gw(courseId, "Lab", 25, "Lab reports 25%", 0.92),
      gw(courseId, "Final", 30, "Final 30%", 0.97),
    ],
  };
}

function chemCourse(id: string, color: string): CoursePack {
  const courseId = id;
  return {
    course: {
      id: courseId,
      code: "CHEM 105A",
      name: "General Chemistry",
      color,
      instructor: "Dr. Pierce",
      professorEmail: "pierce@usc.edu",
      meetingPattern: "MWF 10:00–10:50am",
      syllabusId: `syl_${id}`,
    },
    syllabus: {
      id: `syl_${id}`,
      courseId,
      filename: "CHEM105A.pdf",
      uploadedAt: iso(2025, 8, 27, 15, 0),
      pages: 7,
      rawText: "CHEM 105A. Problem sets weekly 20%. Two midterms 20% each. Final 30%. Lab 10%.",
    },
    tasks: [
      mkTask(courseId, "Problem Set 1", "assignment", iso(2025, 9, 8), 2, "low", 0.92, "PS1 due."),
      mkTask(courseId, "Problem Set 2", "assignment", iso(2025, 9, 15), 2, "low", 0.92, "PS2 due."),
      mkTask(courseId, "Problem Set 3", "assignment", iso(2025, 9, 22), 2, "low", 0.92, "PS3 due."),
      mkTask(courseId, "Midterm 1", "exam", iso(2025, 10, 6, 10, 0), 20, "high", 0.97, "Midterm 1."),
      mkTask(courseId, "Problem Set 4", "assignment", iso(2025, 10, 20), 2, "low", 0.92, "PS4 due."),
      mkTask(courseId, "Problem Set 5", "assignment", iso(2025, 10, 27), 2, "low", 0.92, "PS5 due."),
      mkTask(courseId, "Midterm 2", "exam", iso(2025, 11, 10, 10, 0), 20, "high", 0.97, "Midterm 2."),
      mkTask(courseId, "Problem Set 6", "assignment", iso(2025, 12, 1), 2, "low", 0.92, "PS6 due."),
      mkTask(courseId, "Final Exam", "exam", iso(2025, 12, 8, 11, 0), 30, "high", 0.99, "Final."),
    ],
    policies: [
      pol(courseId, "late-work", "Problem sets cannot be turned in late — but your lowest two are dropped.", "Problem sets are not accepted late. Lowest two scores are dropped.", 0.94),
    ],
    officeHours: [
      oh(courseId, "Dr. Pierce", "Tuesday", "10:00", "11:30", "SGM 124"),
    ],
    gradingWeights: [
      gw(courseId, "Problem Sets", 20, "Problem sets 20%", 0.94),
      gw(courseId, "Midterm 1", 20, "Midterm 20%", 0.96),
      gw(courseId, "Midterm 2", 20, "Midterm 20%", 0.96),
      gw(courseId, "Lab", 10, "Lab 10%", 0.92),
      gw(courseId, "Final", 30, "Final 30%", 0.98),
    ],
  };
}

function dataSciCourse(id: string, color: string): CoursePack {
  const courseId = id;
  return {
    course: {
      id: courseId,
      code: "DSCI 351",
      name: "Data Science Foundations",
      color,
      instructor: "Dr. Tanaka",
      professorEmail: "tanaka@usc.edu",
      meetingPattern: "TTh 2:00–3:20pm",
      syllabusId: `syl_${id}`,
    },
    syllabus: {
      id: `syl_${id}`,
      courseId,
      filename: "DSCI351.pdf",
      uploadedAt: iso(2025, 8, 27, 15, 15),
      pages: 8,
      rawText:
        "DSCI 351. Weekly labs 25%. Two midterms 15% each. Group project 25%. Final 20%.",
    },
    tasks: [
      mkTask(courseId, "Lab 1", "assignment", iso(2025, 9, 4), 3, "low", 0.95, "Lab 1 due."),
      mkTask(courseId, "Lab 2", "assignment", iso(2025, 9, 11), 3, "low", 0.95, "Lab 2 due."),
      mkTask(courseId, "Lab 3", "assignment", iso(2025, 9, 25), 3, "low", 0.95, "Lab 3 due."),
      mkTask(courseId, "Midterm 1", "exam", iso(2025, 10, 9, 14, 0), 15, "high", 0.97, "Midterm 1."),
      mkTask(courseId, "Project Proposal", "project", iso(2025, 10, 16), 5, "medium", 0.78, "Group project proposal."),
      mkTask(courseId, "Lab 4", "assignment", iso(2025, 10, 23), 3, "low", 0.95, "Lab 4 due."),
      mkTask(courseId, "Midterm 2", "exam", iso(2025, 11, 13, 14, 0), 15, "high", 0.97, "Midterm 2."),
      mkTask(courseId, "Project Milestone", "project", iso(2025, 11, 20), 8, "high", 0.86, "Project milestone."),
      mkTask(courseId, "Project Presentation", "presentation", iso(2025, 12, 4, 14, 0), 12, "high", 0.9, "Final group presentation."),
      mkTask(courseId, "Final Exam", "exam", iso(2025, 12, 11, 16, 0), 20, "high", 0.98, "Final exam."),
    ],
    policies: [
      pol(courseId, "late-work", "Labs lose 20% per day late, max 2 days.", "Labs accepted up to 2 days late at 20%/day penalty.", 0.9),
      pol(courseId, "academic-integrity", "AI tools allowed but cite them in your code or report.", "AI tool use is permitted with proper citation in your submission.", 0.87),
    ],
    officeHours: [
      oh(courseId, "Dr. Tanaka", "Thursday", "15:30", "17:00", "OHE 200"),
    ],
    gradingWeights: [
      gw(courseId, "Labs", 25, "Labs 25%", 0.94),
      gw(courseId, "Midterm 1", 15, "Midterm 15%", 0.96),
      gw(courseId, "Midterm 2", 15, "Midterm 15%", 0.96),
      gw(courseId, "Group Project", 25, "Project 25%", 0.94),
      gw(courseId, "Final", 20, "Final 20%", 0.97),
    ],
  };
}

function econCourse(id: string, color: string): CoursePack {
  const courseId = id;
  return {
    course: {
      id: courseId,
      code: "ECON 203",
      name: "Principles of Microeconomics",
      color,
      instructor: "Prof. Romero",
      professorEmail: "romero@usc.edu",
      meetingPattern: "TTh 11:00am–12:20pm",
      syllabusId: `syl_${id}`,
    },
    syllabus: {
      id: `syl_${id}`,
      courseId,
      filename: "ECON203.pdf",
      uploadedAt: iso(2025, 8, 27, 15, 30),
      pages: 5,
      rawText:
        "ECON 203. Quizzes 15%. Two midterms 25% each. Final 30%. Participation 5%.",
    },
    tasks: [
      mkTask(courseId, "Quiz 1", "quiz", iso(2025, 9, 9, 11, 0), 3, "low", 0.94, "Quiz 1."),
      mkTask(courseId, "Quiz 2", "quiz", iso(2025, 9, 23, 11, 0), 3, "low", 0.94, "Quiz 2."),
      mkTask(courseId, "Midterm 1", "exam", iso(2025, 10, 7, 11, 0), 25, "high", 0.97, "Midterm 1."),
      mkTask(courseId, "Quiz 3", "quiz", iso(2025, 10, 21, 11, 0), 3, "low", 0.94, "Quiz 3."),
      mkTask(courseId, "Midterm 2", "exam", iso(2025, 11, 11, 11, 0), 25, "high", 0.97, "Midterm 2."),
      mkTask(courseId, "Quiz 4", "quiz", iso(2025, 11, 25, 11, 0), 3, "low", 0.94, "Quiz 4."),
      mkTask(courseId, "Quiz 5", "quiz", iso(2025, 12, 2, 11, 0), 3, "low", 0.94, "Quiz 5."),
      mkTask(courseId, "Final Exam", "exam", iso(2025, 12, 9, 11, 0), 30, "high", 0.99, "Cumulative final."),
    ],
    policies: [
      pol(courseId, "attendance", "Cold-calling happens in class. Showing up matters for participation.", "Participation involves cold-calling; attendance impacts your participation score.", 0.83),
    ],
    officeHours: [
      oh(courseId, "Prof. Romero", "Wednesday", "10:00", "12:00", "KAP 313"),
    ],
    gradingWeights: [
      gw(courseId, "Quizzes", 15, "Quizzes 15%", 0.94),
      gw(courseId, "Midterm 1", 25, "Midterm 25%", 0.96),
      gw(courseId, "Midterm 2", 25, "Midterm 25%", 0.96),
      gw(courseId, "Final", 30, "Final 30%", 0.97),
      gw(courseId, "Participation", 5, "Participation 5%", 0.83),
    ],
  };
}

function engrCourse(id: string, color: string): CoursePack {
  const courseId = id;
  return {
    course: {
      id: courseId,
      code: "EE 109L",
      name: "Intro to Embedded Systems",
      color,
      instructor: "Dr. Singh",
      professorEmail: "singh@usc.edu",
      meetingPattern: "TTh 9:30–10:50am + Lab F 2–5pm",
      syllabusId: `syl_${id}`,
    },
    syllabus: {
      id: `syl_${id}`,
      courseId,
      filename: "EE109L.pdf",
      uploadedAt: iso(2025, 8, 27, 15, 45),
      pages: 10,
      rawText:
        "EE 109L. Labs 35%. Midterm 1 (15%) October 9. Midterm 2 (15%) November 13. Final project 25%. Quizzes 10%.",
    },
    tasks: [
      mkTask(courseId, "Lab 1: Toolchain Setup", "assignment", iso(2025, 9, 5, 17, 0), 5, "medium", 0.93, "Lab 1 — set up the toolchain."),
      mkTask(courseId, "Lab 2: GPIO", "assignment", iso(2025, 9, 12, 17, 0), 5, "medium", 0.93, "Lab 2 — GPIO control."),
      mkTask(courseId, "Quiz 1", "quiz", iso(2025, 9, 18, 9, 30), 2, "low", 0.9, "Quiz 1."),
      mkTask(courseId, "Lab 3: Interrupts", "assignment", iso(2025, 9, 26, 17, 0), 5, "high", 0.92, "Lab 3 — interrupt-driven IO."),
      mkTask(courseId, "Midterm 1", "exam", iso(2025, 10, 9, 9, 30), 15, "high", 0.98, "Midterm 1 on Oct 9."),
      mkTask(courseId, "Lab 4: SPI", "assignment", iso(2025, 10, 17, 17, 0), 5, "medium", 0.93, "Lab 4 — SPI."),
      mkTask(courseId, "Lab 5: I2C", "assignment", iso(2025, 10, 24, 17, 0), 5, "medium", 0.93, "Lab 5 — I2C."),
      mkTask(courseId, "Quiz 2", "quiz", iso(2025, 10, 30, 9, 30), 2, "low", 0.9, "Quiz 2."),
      mkTask(courseId, "Project Proposal", "project", iso(2025, 11, 6, 17, 0), 5, "medium", 0.78, "Final project proposal."),
      mkTask(courseId, "Midterm 2", "exam", iso(2025, 11, 13, 9, 30), 15, "high", 0.98, "Midterm 2 on Nov 13."),
      mkTask(courseId, "Project Build Demo", "project", iso(2025, 12, 5, 17, 0), 20, "high", 0.9, "Final project demo."),
    ],
    policies: [
      pol(courseId, "academic-integrity", "Reusing code requires citation, even from past iterations of this class.", "All borrowed code must be cited, including prior offerings.", 0.88),
      pol(courseId, "late-work", "Labs lose 25% per day. After 2 days, no credit.", "Labs lose 25%/day, hard cutoff at 2 days.", 0.91),
    ],
    officeHours: [
      oh(courseId, "Dr. Singh", "Monday", "13:00", "15:00", "EEB 248"),
      oh(courseId, "TA: Wei", "Wednesday", "13:00", "15:00", "EEB Hardware Lab"),
    ],
    gradingWeights: [
      gw(courseId, "Labs", 35, "Labs 35%", 0.95),
      gw(courseId, "Midterm 1", 15, "Midterm 15%", 0.96),
      gw(courseId, "Midterm 2", 15, "Midterm 15%", 0.96),
      gw(courseId, "Quizzes", 10, "Quizzes 10%", 0.93),
      gw(courseId, "Final Project", 25, "Project 25%", 0.96),
    ],
  };
}

function psychCourse(id: string, color: string): CoursePack {
  const courseId = id;
  return {
    course: {
      id: courseId,
      code: "PSYC 100",
      name: "Introduction to Psychology",
      color,
      instructor: "Dr. Park",
      professorEmail: "park@usc.edu",
      meetingPattern: "MW 2:00–3:20pm",
      syllabusId: `syl_${id}`,
    },
    syllabus: {
      id: `syl_${id}`,
      courseId,
      filename: "PSYC100.pdf",
      uploadedAt: iso(2025, 8, 27, 16, 0),
      pages: 4,
      rawText:
        "PSYC 100. Quizzes (best 8/10) 20%. Two midterms 20% each. Final 30%. Reflection journal 10%.",
    },
    tasks: [
      mkTask(courseId, "Reflection 1", "assignment", iso(2025, 9, 8), 1, "low", 0.84, "First reflection."),
      mkTask(courseId, "Quiz 1", "quiz", iso(2025, 9, 15, 14, 0), 2, "low", 0.92, "Quiz 1."),
      mkTask(courseId, "Quiz 2", "quiz", iso(2025, 9, 22, 14, 0), 2, "low", 0.92, "Quiz 2."),
      mkTask(courseId, "Midterm 1", "exam", iso(2025, 10, 6, 14, 0), 20, "high", 0.97, "Midterm 1."),
      mkTask(courseId, "Quiz 3", "quiz", iso(2025, 10, 20, 14, 0), 2, "low", 0.92, "Quiz 3."),
      mkTask(courseId, "Reflection 2", "assignment", iso(2025, 10, 27), 1, "low", 0.84, "Reflection 2."),
      mkTask(courseId, "Midterm 2", "exam", iso(2025, 11, 10, 14, 0), 20, "high", 0.97, "Midterm 2."),
      mkTask(courseId, "Quiz 4", "quiz", iso(2025, 11, 24, 14, 0), 2, "low", 0.92, "Quiz 4."),
      mkTask(courseId, "Final Exam", "exam", iso(2025, 12, 8, 14, 0), 30, "high", 0.99, "Final."),
    ],
    policies: [
      pol(courseId, "attendance", "Pop quizzes are not announced — missing class means missing a quiz.", "Unannounced quizzes will be given. Missing class likely means missing a quiz.", 0.86),
    ],
    officeHours: [oh(courseId, "Dr. Park", "Thursday", "13:00", "14:30", "SGM 706")],
    gradingWeights: [
      gw(courseId, "Quizzes", 20, "Quizzes 20%", 0.94),
      gw(courseId, "Midterm 1", 20, "Midterm 20%", 0.95),
      gw(courseId, "Midterm 2", 20, "Midterm 20%", 0.95),
      gw(courseId, "Final", 30, "Final 30%", 0.97),
      gw(courseId, "Journal", 10, "Reflection journal 10%", 0.86),
    ],
  };
}

// ---------- task factory ----------
function mkTask(
  courseId: string,
  name: string,
  type: Task["type"],
  dueDate: string,
  weight: number,
  workload: Task["workload"],
  confidence: number,
  sourceText: string,
  status: Task["status"] = "pending",
): Task {
  return {
    id: `task_${courseId}_${name.replace(/\s+/g, "_").toLowerCase()}`,
    courseId,
    name,
    type,
    dueDate,
    weight,
    workload,
    confidence,
    sourceText,
    status,
    sourcePage: 1 + Math.floor(Math.random() * 4),
    estimatedHours:
      workload === "high" ? 8 + Math.round(Math.random() * 6) : workload === "medium" ? 3 + Math.round(Math.random() * 3) : 1 + Math.round(Math.random() * 2),
  };
}

function pol(
  courseId: string,
  category: Policy["category"],
  plainEnglish: string,
  sourceText: string,
  confidence: number,
): Policy {
  return {
    id: `pol_${courseId}_${category}_${Math.random().toString(36).slice(2, 6)}`,
    courseId,
    category,
    plainEnglish,
    sourceText,
    confidence,
  };
}

function oh(
  courseId: string,
  instructor: string,
  dayOfWeek: string,
  startTime: string,
  endTime: string,
  location: string,
): OfficeHour {
  return {
    id: `oh_${courseId}_${dayOfWeek}_${Math.random().toString(36).slice(2, 5)}`,
    courseId,
    instructor,
    dayOfWeek,
    startTime,
    endTime,
    location,
  };
}

function gw(
  courseId: string,
  type: string,
  weight: number,
  sourceText: string,
  confidence: number,
): GradingWeight {
  return {
    id: `gw_${courseId}_${type.replace(/\s+/g, "_").toLowerCase()}`,
    courseId,
    type,
    weight,
    sourceText,
    confidence,
  };
}

// ---------- demo definitions ----------

function baseProfile(persona: Persona, overrides: Partial<Profile> = {}): Profile {
  return {
    id: `profile_${persona}`,
    name: "Sam Chen",
    university: "University of Southern California",
    major: "Undeclared",
    year: "Freshman",
    termStartDate: TERM_START,
    termEndDate: TERM_END,
    notificationPrefs: { email: true, push: false, daysAhead: 3 },
    coursePalette: COURSE_PALETTE,
    plan: "free",
    persona,
    translationEnabled: false,
    translationLanguage: "en",
    ...overrides,
  };
}

export function buildDemos(): Demo[] {
  const firstYear: Demo = {
    persona: "first-year",
    profile: baseProfile("first-year", {
      name: "Maya Patel",
      major: "Undeclared",
      year: "Freshman",
    }),
    courses: [
      writingCourse("c_fy_writ", COURSE_PALETTE[0]),
      psychCourse("c_fy_psyc", COURSE_PALETTE[1]),
      econCourse("c_fy_econ", COURSE_PALETTE[2]),
      chemCourse("c_fy_chem", COURSE_PALETTE[3]),
    ],
    personalEvents: [],
    changeFlags: [
      {
        id: "flag_fy_1",
        courseId: "c_fy_writ",
        taskId: "task_c_fy_writ_essay_2:_rhetorical_analysis",
        kind: "potential-change",
        proposedDate: iso(2025, 10, 16),
        originalDate: iso(2025, 10, 13),
        announcementText:
          "Hi all — I am pushing Essay 2 to Thursday Oct 16 to give you the long weekend. — Prof. Wallace",
        sender: "wallace@usc.edu",
        subject: "Essay 2 deadline shift",
        receivedAt: iso(2025, 10, 8, 19, 30),
        status: "pending",
      },
    ],
  };

  const engineering: Demo = {
    persona: "engineering",
    profile: baseProfile("engineering", {
      name: "Jordan Lee",
      major: "Computer Engineering",
      year: "Junior",
    }),
    courses: [
      csCourse("c_eng_csci", COURSE_PALETTE[0]),
      engrCourse("c_eng_ee", COURSE_PALETTE[1]),
      dataSciCourse("c_eng_dsci", COURSE_PALETTE[2]),
      writingCourse("c_eng_writ", COURSE_PALETTE[3]),
    ],
    personalEvents: [],
    changeFlags: [
      {
        id: "flag_eng_1",
        courseId: "c_eng_csci",
        taskId: "task_c_eng_csci_hw_4:_graphs",
        kind: "potential-change",
        proposedDate: iso(2025, 10, 27),
        originalDate: iso(2025, 10, 24),
        announcementText: "HW4 deadline moved to Monday Oct 27 due to lecture cancellation Tuesday.",
        sender: "adamchik@usc.edu",
        subject: "HW4 deadline update",
        receivedAt: iso(2025, 10, 21, 16, 10),
        status: "pending",
      },
      {
        id: "flag_eng_2",
        courseId: "c_eng_ee",
        kind: "new-item",
        proposedTitle: "Bonus Lab: ADC sampling",
        proposedDate: iso(2025, 11, 7, 17, 0),
        announcementText:
          "Optional bonus lab available — ADC sampling lab worth +3% extra credit, due Nov 7.",
        sender: "singh@usc.edu",
        subject: "Bonus lab announcement",
        receivedAt: iso(2025, 11, 1, 10, 0),
        status: "pending",
      },
    ],
  };

  const international: Demo = {
    persona: "international",
    profile: baseProfile("international", {
      name: "Chen Yuwen",
      major: "Business Administration",
      year: "Sophomore",
      translationEnabled: true,
      translationLanguage: "zh",
    }),
    courses: [
      writingCourse("c_int_writ", COURSE_PALETTE[0]),
      econCourse("c_int_econ", COURSE_PALETTE[1]),
      psychCourse("c_int_psyc", COURSE_PALETTE[2]),
      dataSciCourse("c_int_dsci", COURSE_PALETTE[3]),
    ],
    personalEvents: [],
    changeFlags: [],
  };

  const athlete: Demo = {
    persona: "athlete",
    profile: baseProfile("athlete", {
      name: "Amari Robinson",
      major: "Communication",
      year: "Sophomore",
      plan: "paid",
    }),
    courses: [
      econCourse("c_ath_econ", COURSE_PALETTE[0]),
      psychCourse("c_ath_psyc", COURSE_PALETTE[1]),
      writingCourse("c_ath_writ", COURSE_PALETTE[2]),
    ],
    personalEvents: [
      pe("Track practice", "practice", iso(2025, 9, 1, 6, 0), iso(2025, 9, 1, 8, 0), "weekly:MON,TUE,WED,THU,FRI", "#ef6c8a"),
      pe("Home meet vs UCLA", "game", iso(2025, 10, 11, 12, 0), iso(2025, 10, 11, 18, 0), undefined, "#dc2626"),
      pe("Away meet — Stanford", "game", iso(2025, 11, 8, 8, 0), iso(2025, 11, 9, 22, 0), undefined, "#dc2626"),
      pe("Travel to Stanford", "travel", iso(2025, 11, 7, 14, 0), iso(2025, 11, 7, 22, 0), undefined, "#f59e0b"),
    ],
    changeFlags: [],
  };

  const working: Demo = {
    persona: "working",
    profile: baseProfile("working", {
      name: "Riley Nguyen",
      major: "Public Policy",
      year: "Senior",
      plan: "paid",
    }),
    courses: [
      econCourse("c_wrk_econ", COURSE_PALETTE[0]),
      writingCourse("c_wrk_writ", COURSE_PALETTE[1]),
      psychCourse("c_wrk_psyc", COURSE_PALETTE[2]),
    ],
    personalEvents: [
      pe("Coffee shop shift", "work", iso(2025, 9, 2, 14, 0), iso(2025, 9, 2, 20, 0), "weekly:TUE,THU,SAT", "#10b981"),
      pe("Family visit", "travel", iso(2025, 10, 17, 17, 0), iso(2025, 10, 19, 22, 0), undefined, "#f59e0b"),
    ],
    changeFlags: [],
  };

  return [firstYear, engineering, international, athlete, working];
}

function pe(
  title: string,
  category: PersonalEvent["category"],
  startDate: string,
  endDate: string,
  recurringRule: string | undefined,
  color: string,
): PersonalEvent {
  return {
    id: `pe_${title.replace(/\s+/g, "_").toLowerCase()}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    category,
    startDate,
    endDate,
    recurringRule,
    color,
  };
}

export const PERSONA_META: Record<Persona, { label: string; emoji: string; tag: string; summary: string }> = {
  "first-year": {
    label: "First-year student",
    emoji: "🌱",
    tag: "New to college",
    summary: "Four very different syllabi, no idea what 'office hours' means, easily overwhelmed.",
  },
  engineering: {
    label: "Engineering student",
    emoji: "⚙️",
    tag: "High workload",
    summary: "Two midterms in the same week. Labs, problem sets, and an embedded systems project.",
  },
  international: {
    label: "International student",
    emoji: "🌏",
    tag: "Translation on",
    summary: "Needs plain-English policies and a Mandarin translation toggle to feel confident.",
  },
  athlete: {
    label: "Student-athlete",
    emoji: "🏃",
    tag: "Paid plan",
    summary: "Daily practice, travel weekends, and an away meet on a project deadline.",
  },
  working: {
    label: "Working student",
    emoji: "💼",
    tag: "Paid plan",
    summary: "Three shifts a week. Needs the planner to schedule study time around work.",
  },
};

export { TERM_START, TERM_END, COURSE_PALETTE };
