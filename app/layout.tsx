import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyllabusOS — Built for school, built to make student life easier",
  description:
    "Turn messy syllabi into a structured academic planner that stays synced over the term.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
