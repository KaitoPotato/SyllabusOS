import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100",
          className,
        )}
        {...rest}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100 min-h-[120px]",
          className,
        )}
        {...rest}
      />
    );
  },
);

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-ink-500 mb-1.5">
      {children}
    </label>
  );
}

export function Select({
  options,
  className,
  ...rest
}: { options: Array<{ value: string; label: string }> } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-100",
        className,
      )}
      {...rest}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
