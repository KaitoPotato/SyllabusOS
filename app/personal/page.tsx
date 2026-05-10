import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";
import { PersonalEvents } from "@/components/personal/PersonalEvents";

export default function PersonalPage() {
  return (
    <AppShell>
      <HydrationGate>
        <PersonalEvents />
      </HydrationGate>
    </AppShell>
  );
}
