import { Dashboard } from "@/components/dashboard/Dashboard";
import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";

export default function DashboardPage() {
  return (
    <AppShell>
      <HydrationGate>
        <Dashboard />
      </HydrationGate>
    </AppShell>
  );
}
