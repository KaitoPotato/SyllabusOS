/**
 * Translation adapter. Demo uses an in-memory dictionary for the small set of
 * academic phrases the product surfaces; production would swap this for DeepL,
 * Google Translate, or an LLM endpoint. The call signature returns a Promise
 * deliberately so the adapter is real-API ready.
 */

const DICTIONARY: Record<string, Record<string, string>> = {
  zh: {
    "office hours": "答疑时间",
    "office hour": "答疑时间",
    "midterm": "期中考试",
    "final exam": "期末考试",
    "final": "期末考试",
    "homework": "作业",
    "assignment": "作业",
    "essay": "论文",
    "project": "项目",
    "quiz": "小测验",
    "late policy": "迟交政策",
    "late work": "迟交作业",
    "late": "迟交",
    "absence": "缺勤",
    "attendance": "出勤",
    "drop deadline": "退课截止日期",
    "syllabus": "教学大纲",
    "lecture": "讲座",
    "lab": "实验",
    "due": "截止",
    "professor": "教授",
    "review": "复习",
  },
  es: {
    "office hours": "horas de oficina",
    "office hour": "hora de oficina",
    "midterm": "examen parcial",
    "final exam": "examen final",
    "final": "examen final",
    "homework": "tarea",
    "assignment": "tarea",
    "essay": "ensayo",
    "project": "proyecto",
    "quiz": "examen breve",
    "late policy": "política de tareas tardías",
    "late work": "trabajo tardío",
    "late": "tarde",
    "absence": "ausencia",
    "attendance": "asistencia",
    "drop deadline": "fecha límite para retirarse",
    "syllabus": "programa del curso",
    "lecture": "clase",
    "lab": "laboratorio",
    "due": "vence",
    "professor": "profesor",
    "review": "repaso",
  },
  ko: {
    "office hours": "면담 시간",
    "midterm": "중간고사",
    "final exam": "기말고사",
    "homework": "과제",
    "assignment": "과제",
    "essay": "에세이",
    "project": "프로젝트",
    "quiz": "쪽지시험",
    "late policy": "지각 제출 정책",
    "attendance": "출석",
    "drop deadline": "수강 취소 마감일",
  },
};

export async function translatePhrase(
  text: string,
  language: string,
): Promise<string> {
  await new Promise((r) => setTimeout(r, 80));
  if (language === "en") return text;
  const dict = DICTIONARY[language];
  if (!dict) return text;
  let out = text;
  for (const [src, tgt] of Object.entries(dict).sort(
    (a, b) => b[0].length - a[0].length,
  )) {
    out = out.replace(new RegExp(`\\b${src}\\b`, "gi"), tgt);
  }
  return out;
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "中文 (Chinese)" },
  { code: "es", label: "Español (Spanish)" },
  { code: "ko", label: "한국어 (Korean)" },
];
