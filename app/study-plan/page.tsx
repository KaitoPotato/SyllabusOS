import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";
import { StudyPlan } from "@/components/study/StudyPlan";

export default function StudyPlanPage() {
  return (
    <AppShell>
      <HydrationGate>
        <StudyPlan />
      </HydrationGate>
    </AppShell>
  );
}
