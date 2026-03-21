"use client";

import Link from "next/link";
import { MarketingShell } from "@/components/MarketingShell";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";

export function FeaturesPageClient() {
  return (
    <MarketingShell>
      <FeaturesSection />
      <HowItWorksSection />
      <section className="mx-auto max-w-6xl px-3 pb-16 pt-4 text-center sm:px-4 md:px-6">
        <Link
          href="/pricing"
          className="btn btn-outline rounded-xl border-orange-500/30 bg-orange-500/[0.06] text-orange-200 transition-all duration-300 hover:border-orange-400/50"
        >
          See pricing →
        </Link>
      </section>
    </MarketingShell>
  );
}
