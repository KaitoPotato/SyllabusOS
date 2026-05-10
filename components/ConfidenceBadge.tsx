import { Tooltip } from "./ui/Tooltip";

export function ConfidenceBadge({ value, terse = false }: { value: number; terse?: boolean }) {
  const pct = Math.round(value * 100);
  let tone = "text-emerald-700 bg-emerald-100";
  let label = "High confidence";
  let dot = "bg-emerald-500";
  if (value < 0.8) {
    tone = "text-amber-800 bg-amber-100";
    label = "Needs review";
    dot = "bg-amber-500";
  }
  if (value < 0.6) {
    tone = "text-red-700 bg-red-100";
    label = "Low confidence";
    dot = "bg-red-500";
  }
  return (
    <Tooltip content={`${label} — ${pct}% certainty. Always editable.`}>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {terse ? `${pct}%` : `${label} • ${pct}%`}
      </span>
    </Tooltip>
  );
}
