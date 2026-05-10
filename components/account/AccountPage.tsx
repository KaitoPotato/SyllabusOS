"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Check, Sparkles } from "lucide-react";

export function AccountPage() {
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const setPlan = useStore((s) => s.setPlan);
  const resetToSeed = useStore((s) => s.resetToSeed);
  const activePersona = useStore((s) => s.activePersona);

  if (!profile) return null;
  const isPaid = profile.plan === "paid";

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold">
          Account & plan
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Your account</h1>
      </div>

      <div className="grid lg:grid-cols-[1fr,1.4fr] gap-5">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardSubtitle>Used to color your courses and resolve dates.</CardSubtitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) => updateProfile({ name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Major</Label>
                  <Input
                    value={profile.major}
                    onChange={(e) => updateProfile({ major: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Select
                    value={profile.year}
                    onChange={(e) => updateProfile({ year: e.target.value })}
                    options={["Freshman", "Sophomore", "Junior", "Senior", "Graduate"].map(
                      (v) => ({ value: v, label: v }),
                    )}
                  />
                </div>
              </div>
              <div>
                <Label>University</Label>
                <Input
                  value={profile.university}
                  onChange={(e) => updateProfile({ university: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Term start</Label>
                  <Input
                    type="date"
                    value={profile.termStartDate}
                    onChange={(e) => updateProfile({ termStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Term end</Label>
                  <Input
                    type="date"
                    value={profile.termEndDate}
                    onChange={(e) => updateProfile({ termEndDate: e.target.value })}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Demo data</CardTitle>
              <CardSubtitle>
                Reset to seed if you've experimented and want a clean state.
              </CardSubtitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="text-sm">
                Active persona:{" "}
                <span className="font-semibold capitalize">{activePersona}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => resetToSeed()}>
                  Reset to this persona's seed
                </Button>
                <Link href="/demos" className="btn-ghost">
                  Switch persona
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Plan */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Your plan</CardTitle>
              <CardSubtitle>
                Upgrade unlocks personal events and conflict alerts across academics +
                life.
              </CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="grid md:grid-cols-2 gap-4">
                <PlanCard
                  active={!isPaid}
                  title="Free"
                  price="$0"
                  bullets={[
                    "Unlimited syllabi",
                    "Structured extraction + review",
                    "Workload heatmap & study plan",
                    "Email-based change detection",
                    "Google Calendar export",
                  ]}
                  cta={isPaid ? "Downgrade" : "Current plan"}
                  onSelect={() => setPlan("free")}
                  disabled={!isPaid}
                />
                <PlanCard
                  active={isPaid}
                  paid
                  title="Paid"
                  price="$4/mo"
                  bullets={[
                    "Everything in free",
                    "Personal events (work, practice, games, travel)",
                    "Smart conflict alerts",
                    "Game-day & travel-aware exam prep",
                    "Priority support",
                  ]}
                  cta={isPaid ? "Current plan" : "Upgrade now"}
                  onSelect={() => setPlan("paid")}
                  disabled={isPaid}
                />
              </div>
            </CardBody>
          </Card>

          {!isPaid && (
            <Card className="bg-gradient-to-br from-accent-50 to-white">
              <CardBody>
                <div className="flex items-start gap-3">
                  <Sparkles className="text-accent-700 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">
                      Why we built the paid tier
                    </div>
                    <p className="text-xs text-ink-500 mt-1 leading-relaxed">
                      Most students don't only do school. Athletes have meets, workers
                      have shifts, everyone travels. The paid plan layers all of it
                      into one schedule so we can warn you when a project deadline
                      lands on a game day — before you find out the hard way.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function PlanCard({
  title,
  price,
  bullets,
  cta,
  onSelect,
  disabled,
  active,
  paid,
}: {
  title: string;
  price: string;
  bullets: string[];
  cta: string;
  onSelect: () => void;
  disabled?: boolean;
  active?: boolean;
  paid?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        active
          ? "border-accent-300 bg-accent-50/40 ring-2 ring-accent-100"
          : "border-ink-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest font-semibold text-ink-500">
          {title}
        </div>
        {paid && <Badge tone="accent">Recommended</Badge>}
        {active && <Badge tone="success">Current</Badge>}
      </div>
      <div className="text-2xl font-bold mt-2">{price}</div>
      <ul className="mt-4 space-y-1.5 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <Check size={14} className="mt-1 text-emerald-500 shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <Button
        className="w-full mt-5"
        variant={paid && !active ? "primary" : "secondary"}
        onClick={onSelect}
        disabled={disabled}
      >
        {cta}
      </Button>
    </div>
  );
}
