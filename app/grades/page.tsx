import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";
import { GradesPage } from "@/components/grades/GradesPage";

export default function Grades() {
  return (
    <AppShell>
      <HydrationGate>
        <GradesPage />
      </HydrationGate>
    </AppShell>
  );
}
