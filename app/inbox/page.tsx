import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";
import { Inbox } from "@/components/inbox/Inbox";

export default function InboxPage() {
  return (
    <AppShell>
      <HydrationGate>
        <Inbox />
      </HydrationGate>
    </AppShell>
  );
}
