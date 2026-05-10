import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";
import { ExportPage } from "@/components/export/ExportPage";

export default function Export() {
  return (
    <AppShell>
      <HydrationGate>
        <ExportPage />
      </HydrationGate>
    </AppShell>
  );
}
