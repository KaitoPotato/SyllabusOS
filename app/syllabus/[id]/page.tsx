import { AppShell } from "@/components/AppShell";
import { HydrationGate } from "@/components/HydrationGate";
import { SyllabusReview } from "@/components/syllabus/SyllabusReview";

export default function SyllabusPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <HydrationGate>
        <SyllabusReview courseId={params.id} />
      </HydrationGate>
    </AppShell>
  );
}
