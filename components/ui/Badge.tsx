import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "warn" | "success" | "danger" | "info";

const tones: Record<Tone, string> = {
  neutral: "bg-ink-100 text-ink-700",
  accent: "bg-accent-100 text-accent-700",
  warn: "bg-amber-100 text-amber-800",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-load-5/20 text-red-700",
  info: "bg-blue-100 text-blue-800",
};

export function Badge({
  tone = "neutral",
  className,
  ...rest
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
