export type LandingFeatureLayout = "hero" | "pro" | "default";

export type LandingFeatureItem = {
  icon: string;
  title: string;
  description: string;
  /** Short category label above the title */
  tag: string;
  layout?: LandingFeatureLayout;
};

/** Marketing features — home pipeline, `/resume-ats`, `/editor` career guide, paid Gemini polish. */
export const LANDING_FEATURES: readonly LandingFeatureItem[] = [
  {
    icon: "📄",
    tag: "ATS",
    title: "Optimization that parsers understand",
    description:
      "Structure, headings, and keywords tuned for applicant tracking systems—so your resume survives the first filter.",
    layout: "hero",
  },
  {
    icon: "⚡",
    tag: "Speed",
    title: "Instant scoring",
    description: "A clear score and gap list in seconds—not hours of guessing what recruiters see first.",
    layout: "default",
  },
  {
    icon: "✨",
    tag: "Rewrites",
    title: "Actionable suggestions",
    description: "Concrete bullet tweaks and phrasing you can paste into your resume the same day.",
    layout: "default",
  },
  {
    icon: "🎯",
    tag: "Role fit",
    title: "JD & title alignment",
    description: "Paste a job description and target title—we compare your profile to the role you actually want.",
    layout: "default",
  },
  {
    icon: "🔒",
    tag: "Privacy",
    title: "Private by default",
    description: "Your file is processed for analysis—we don’t keep copies for marketing or training.",
    layout: "default",
  },
  {
    icon: "📊",
    tag: "Dashboard",
    title: "Clear breakdown",
    description: "Strengths, risks, and next steps in one calm view—no wall of generic advice.",
    layout: "default",
  },
  {
    icon: "🧭",
    tag: "Guide",
    title: "Career guide",
    description:
      "Enter your skills on the career page—we generate a structured path and milestones with Gemini (sign-in required).",
    layout: "default",
  },
  {
    icon: "✦",
    tag: "AI",
    title: "Gemini polish",
    description:
      "Optional on home analysis for paid plans: stronger suggestions plus a JSON ATS report after your scan (usage limits apply).",
    layout: "pro",
  },
] as const;
