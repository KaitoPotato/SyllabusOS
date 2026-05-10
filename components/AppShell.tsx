"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { PERSONA_META } from "@/lib/seed";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Inbox,
  GraduationCap,
  CreditCard,
  CalendarClock,
  Languages,
  Briefcase,
  Send,
  LineChart,
  BookOpen,
  Sparkles,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Calendar", icon: Calendar },
  { href: "/study-plan", label: "Study plan", icon: CalendarClock },
  { href: "/inbox", label: "Inbox", icon: Inbox, badge: "changes" },
  { href: "/grades", label: "Grades", icon: LineChart },
  { href: "/personal", label: "Personal events", icon: Briefcase, paid: true },
  { href: "/export", label: "Google Calendar", icon: Send },
  { href: "/translation", label: "Translation", icon: Languages },
  { href: "/account", label: "Plan & account", icon: CreditCard },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const profile = useStore((s) => s.profile);
  const activePersona = useStore((s) => s.activePersona);
  const pendingChanges = useStore((s) =>
    s.changeFlags.filter((f) => f.status === "pending").length,
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-ink-100 bg-white">
        <div className="px-5 py-5 border-b border-ink-100 flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-accent-600 text-white grid place-items-center">
            <BookOpen size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold">SyllabusOS</div>
            <div className="text-[11px] text-ink-400 -mt-0.5">v2 · Built for school</div>
          </div>
        </div>

        <div className="px-3 py-3">
          <div className="px-2 py-2 rounded-xl bg-ink-50 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white border border-ink-200 grid place-items-center text-base">
              {PERSONA_META[activePersona].emoji}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{profile?.name}</div>
              <div className="text-[11px] text-ink-400 truncate">
                {profile?.major} · {profile?.year}
              </div>
            </div>
          </div>
        </div>

        <nav className="px-2 flex-1 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const dimmed = item.paid && profile?.plan === "free";
            const badge =
              item.badge === "changes" && pendingChanges > 0
                ? pendingChanges
                : null;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm mb-0.5 transition relative",
                  active
                    ? "bg-accent-50 text-accent-700 font-medium"
                    : "text-ink-600 hover:bg-ink-50",
                  dimmed && "opacity-60",
                )}
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
                {dimmed && (
                  <span className="text-[10px] uppercase tracking-wider text-accent-600 font-semibold">
                    paid
                  </span>
                )}
                {badge != null && (
                  <span className="rounded-full bg-load-5 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] grid place-items-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-ink-100">
          <Link
            href="/demos"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-500 hover:bg-ink-50"
          >
            <Sparkles size={14} /> Switch demo persona
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-ink-500 hover:bg-ink-50"
          >
            <GraduationCap size={14} /> Back to landing
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-ink-100 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent-600 text-white grid place-items-center">
            <BookOpen size={14} />
          </div>
          <span className="font-semibold text-sm">SyllabusOS</span>
        </Link>
        <Link href="/demos" className="text-xs text-accent-700 font-medium">
          Switch demo
        </Link>
      </div>

      <main className="flex-1 min-w-0 lg:pt-0 pt-14">{children}</main>
    </div>
  );
}
