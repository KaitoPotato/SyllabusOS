import type { Course } from "@/lib/types";

export function CourseChip({ course, terse = false }: { course?: Course | null; terse?: boolean }) {
  if (!course) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        background: `${course.color}1A`,
        color: course.color,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: course.color }}
      />
      {terse ? course.code : `${course.code} • ${course.name}`}
    </span>
  );
}
