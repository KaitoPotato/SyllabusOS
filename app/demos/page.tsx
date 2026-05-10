import { DemoPicker } from "@/components/DemoPicker";

export default function DemosPage() {
  return (
    <div className="min-h-screen px-6 lg:px-10 py-10 max-w-6xl mx-auto">
      <div className="max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-accent-600 font-semibold mb-2">
          Pick a demo profile
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          See how SyllabusOS adapts to different student lives.
        </h1>
        <p className="text-ink-600 mt-3 leading-relaxed">
          Each persona loads a complete term with real syllabi, deadlines, and (where
          applicable) personal commitments. Switch any time from the sidebar.
        </p>
      </div>
      <DemoPicker />
    </div>
  );
}
