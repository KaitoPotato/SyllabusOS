"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
  children,
  content,
  className,
}: {
  children: ReactNode;
  content: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs text-white shadow-pop">
          {content}
        </span>
      )}
    </span>
  );
}

const GLOSSARY: Record<string, string> = {
  "office hours": "Times when your professor is available outside class for questions.",
  "midterm": "An exam given mid-semester, usually counts for 15–25% of your grade.",
  "syllabus": "The course contract: schedule, grading, policies.",
  "late policy": "Rules for submitting work after the due date — penalty and limits.",
  "drop deadline": "Last day you can drop a class without it showing on your transcript.",
  "tba": "“To be announced” — your professor will share later.",
  "weight": "Percentage of your final grade this assignment is worth.",
};

export function GlossaryTerm({ term }: { term: string }) {
  const def = GLOSSARY[term.toLowerCase()];
  if (!def) return <span>{term}</span>;
  return (
    <Tooltip content={def}>
      <span className="underline decoration-dotted decoration-accent-400 underline-offset-4 cursor-help">
        {term}
      </span>
    </Tooltip>
  );
}
