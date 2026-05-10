"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { COURSE_PALETTE, TERM_END, TERM_START } from "@/lib/seed";
import { Card, CardBody } from "../ui/Card";
import { Input, Label, Select } from "../ui/Input";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";

export function ProfileForm() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);

  const [name, setName] = useState(profile?.name ?? "");
  const [university, setUniversity] = useState(profile?.university ?? "");
  const [major, setMajor] = useState(profile?.major ?? "");
  const [year, setYear] = useState(profile?.year ?? "Freshman");
  const [start, setStart] = useState(profile?.termStartDate ?? TERM_START);
  const [end, setEnd] = useState(profile?.termEndDate ?? TERM_END);
  const [daysAhead, setDaysAhead] = useState(profile?.notificationPrefs?.daysAhead ?? 3);
  const [emailPref, setEmailPref] = useState(profile?.notificationPrefs?.email ?? true);
  const [palette, setPalette] = useState<string[]>(profile?.coursePalette ?? COURSE_PALETTE);

  function save() {
    updateProfile({
      name,
      university,
      major,
      year,
      termStartDate: start,
      termEndDate: end,
      notificationPrefs: {
        email: emailPref,
        push: profile?.notificationPrefs?.push ?? false,
        daysAhead,
      },
      coursePalette: palette,
    });
    router.push("/onboarding/upload");
  }

  return (
    <Card className="mt-6">
      <CardBody className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Your name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maya Patel" />
          </div>
          <div>
            <Label>University</Label>
            <Input
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="University of Southern California"
            />
          </div>
          <div>
            <Label>Major</Label>
            <Input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Undeclared" />
          </div>
          <div>
            <Label>Year</Label>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              options={[
                { value: "Freshman", label: "Freshman" },
                { value: "Sophomore", label: "Sophomore" },
                { value: "Junior", label: "Junior" },
                { value: "Senior", label: "Senior" },
                { value: "Graduate", label: "Graduate" },
              ]}
            />
          </div>
        </div>

        <div className="hairline" />

        <div>
          <Label>Term dates</Label>
          <div className="text-xs text-ink-400 mb-2">
            We need these to resolve relative references like "Week 5" or "the Monday
            after Spring Break."
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        <div className="hairline" />

        <div>
          <Label>Notification preferences</Label>
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 rounded-xl border border-ink-200 px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                checked={emailPref}
                onChange={(e) => setEmailPref(e.target.checked)}
              />
              Email me daily digests
            </label>
            <div>
              <div className="text-xs text-ink-500 mb-1">Lead time (days before due)</div>
              <Input
                type="number"
                min={0}
                max={14}
                value={daysAhead}
                onChange={(e) => setDaysAhead(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="hairline" />

        <div>
          <Label>Course color palette</Label>
          <div className="flex flex-wrap items-center gap-2">
            {palette.map((c, i) => (
              <button
                key={i}
                onClick={() => {
                  const next = [...palette];
                  next.splice(i, 1);
                  next.push(c);
                  setPalette(next);
                }}
                className="h-9 w-9 rounded-lg ring-2 ring-offset-2 ring-white hover:ring-ink-200 transition"
                style={{ background: c }}
                title="Click to rotate"
              />
            ))}
            <span className="text-xs text-ink-400 ml-1">Click to rotate priority</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <span className="text-xs text-ink-400">Step 1 of 3</span>
          <Button onClick={save} disabled={!name || !university}>
            Save & continue
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
