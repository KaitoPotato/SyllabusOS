"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardBody, CardHeader, CardSubtitle, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label, Select, Textarea } from "@/components/ui/Input";
import { translatePhrase, SUPPORTED_LANGUAGES } from "@/lib/adapters/translation";
import { GlossaryTerm } from "@/components/ui/Tooltip";
import { Languages } from "lucide-react";

export function TranslationPage() {
  const profile = useStore((s) => s.profile);
  const setTranslation = useStore((s) => s.setTranslation);
  const policies = useStore((s) => s.policies);

  const [demoIn, setDemoIn] = useState(
    "Late homework will be accepted up to 48 hours after the deadline at a 15% per-day penalty.",
  );
  const [demoOut, setDemoOut] = useState("");

  if (!profile) return null;

  async function translate() {
    const result = await translatePhrase(demoIn, profile!.translationLanguage);
    setDemoOut(result);
  }

  return (
    <div className="px-6 lg:px-10 py-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold">
          Translation
        </div>
        <h1 className="text-3xl font-bold tracking-tight">For international students</h1>
        <p className="text-ink-500 mt-1 max-w-xl">
          We translate plain-English policies and academic-term tooltips so
          international students never get confused by US syllabus conventions.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,1.4fr] gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardSubtitle>Toggle on to translate policies and definitions.</CardSubtitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.translationEnabled}
                onChange={(e) =>
                  setTranslation(e.target.checked, profile.translationLanguage)
                }
              />
              <div>
                <div className="font-medium text-sm">Enable translation overlay</div>
                <div className="text-xs text-ink-500">
                  Adds a “Translate” button on every syllabus review page.
                </div>
              </div>
            </label>
            <div>
              <Label>Language</Label>
              <Select
                value={profile.translationLanguage}
                onChange={(e) =>
                  setTranslation(profile.translationEnabled, e.target.value)
                }
                options={SUPPORTED_LANGUAGES.map((l) => ({
                  value: l.code,
                  label: l.label,
                }))}
              />
            </div>
            <div className="rounded-xl bg-ink-50 p-3 text-xs text-ink-500 leading-relaxed">
              <strong>Demo note:</strong> the translation adapter ships with a small
              built-in dictionary covering academic vocabulary. A production build
              would swap in DeepL or Google Translate behind the same interface — no
              UI changes needed.
            </div>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Languages className="text-accent-700" size={18} />
              <CardTitle>Try it</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <Label>English (input)</Label>
                <Textarea value={demoIn} onChange={(e) => setDemoIn(e.target.value)} />
              </div>
              <Button onClick={translate}>Translate</Button>
              {demoOut && (
                <div className="rounded-xl bg-accent-50 border border-accent-200 p-3 text-sm text-accent-900">
                  {demoOut}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hover-glossary built in</CardTitle>
              <CardSubtitle>
                We add tooltips on common terms whether or not translation is on.
              </CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="text-sm space-y-3 leading-relaxed">
                <p>
                  Hover any underlined word: your <GlossaryTerm term="syllabus" /> is the
                  course contract. <GlossaryTerm term="office hours" /> are when your
                  professor is available. A <GlossaryTerm term="midterm" /> usually
                  counts for 15–25% of your grade. The{" "}
                  <GlossaryTerm term="late policy" /> tells you what happens if you
                  submit work after the deadline.
                </p>
                <p className="text-xs text-ink-400">
                  {policies.length} policies on your account are already translated to
                  plain English. Toggle settings on the left to also localize them.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
