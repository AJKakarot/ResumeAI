import type { Metadata } from "next";
import { FeaturesPageClient } from "./FeaturesPageClient";

export const metadata: Metadata = {
  title: "Features · ResumeAI",
  description: "ATS optimization, scoring, rewrites, and more — everything you need to improve your resume.",
};

export default function FeaturesPage() {
  return <FeaturesPageClient />;
}
