"use client";

import { ReactNode } from "react";
import { useStore } from "@/lib/store";

export function HydrationGate({ children }: { children: ReactNode }) {
  const hydrated = useStore((s) => s.hydrated);
  if (!hydrated) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="flex items-center gap-2 text-ink-400 text-sm">
          <div className="h-2 w-2 rounded-full bg-accent-400 animate-pulse" />
          Loading SyllabusOS…
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
