"use client";

import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Drawer({
  open,
  onClose,
  children,
  title,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-ink-900/30 backdrop-blur-sm" onClick={onClose} />
      <aside
        className={cn(
          "w-full max-w-md bg-white shadow-pop overflow-y-auto",
          className,
        )}
      >
        {title && (
          <div className="px-5 py-4 border-b border-ink-100 flex items-center justify-between">
            <div className="text-base font-semibold">{title}</div>
            <button
              onClick={onClose}
              className="text-ink-400 hover:text-ink-700 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </aside>
    </div>
  );
}
