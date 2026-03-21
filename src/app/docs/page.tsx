import type { Metadata } from "next";
import { DocsPageClient } from "./DocsPageClient";

export const metadata: Metadata = {
  title: "Documentation · ResumeAI",
  description:
    "Getting started, features, scoring, pricing, privacy, and FAQs for ResumeAI — ATS resume analysis and editing.",
};

export default function DocsPage() {
  return <DocsPageClient />;
}
