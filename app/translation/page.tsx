import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";
import { TranslationPage } from "@/components/translation/TranslationPage";

export default function Translation() {
  return (
    <AppShell>
      <HydrationGate>
        <TranslationPage />
      </HydrationGate>
    </AppShell>
  );
}
