import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";
import { AccountPage } from "@/components/account/AccountPage";

export default function Account() {
  return (
    <AppShell>
      <HydrationGate>
        <AccountPage />
      </HydrationGate>
    </AppShell>
  );
}
