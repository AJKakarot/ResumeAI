"use client";

import { useRouter } from "next/navigation";
import { MarketingShell } from "@/components/MarketingShell";
import { PricingSection } from "@/components/landing/PricingSection";

export function PricingPageClient() {
  const router = useRouter();
  const goHome = () => router.push("/");

  return (
    <MarketingShell>
      <PricingSection onPickFile={goHome} onPro={goHome} />
    </MarketingShell>
  );
}
