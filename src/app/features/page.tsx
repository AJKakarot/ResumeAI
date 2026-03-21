import type { Metadata } from "next";
import { FeaturesPageClient } from "./FeaturesPageClient";

export const metadata: Metadata = {
  title: "Features · ResumeAI",
  description:
    "ATS optimization, instant scoring, JD alignment, resume editor, Gemini polish (Pro), and secure checkout with Razorpay.",
};

export default function FeaturesPage() {
  return <FeaturesPageClient />;
}
