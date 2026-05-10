"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PERSONA_META, buildDemos } from "@/lib/seed";
import { Card, CardBody } from "./ui/Card";
import { Button } from "./ui/Button";
import type { Persona } from "@/lib/types";

export function DemoPicker() {
  const router = useRouter();
  const switchPersona = useStore((s) => s.switchPersona);
  const activePersona = useStore((s) => s.activePersona);
  const demos = buildDemos();

  function pick(p: Persona) {
    switchPersona(p);
    router.push("/dashboard");
  }

  return (
    <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {demos.map((d) => {
        const meta = PERSONA_META[d.persona];
        const isActive = d.persona === activePersona;
        return (
          <Card key={d.persona} className={isActive ? "ring-2 ring-accent-300" : ""}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-xl bg-ink-50 grid place-items-center text-2xl">
                  {meta.emoji}
                </div>
                <span className="chip bg-ink-100 text-ink-700">{meta.tag}</span>
              </div>
              <h3 className="font-semibold mt-4">{d.profile.name}</h3>
              <div className="text-xs text-ink-400">
                {d.profile.major} · {d.profile.year}
              </div>
              <p className="text-sm text-ink-500 mt-3 leading-relaxed">
                {meta.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {d.courses.map((c) => (
                  <span
                    key={c.course.id}
                    className="chip text-[11px]"
                    style={{ background: `${c.course.color}1A`, color: c.course.color }}
                  >
                    {c.course.code}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2">
                <Button onClick={() => pick(d.persona)} className="flex-1">
                  {isActive ? "Re-enter demo" : "Load this demo"}
                </Button>
                <Link href="/" className="btn-ghost text-xs">
                  Back
                </Link>
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
