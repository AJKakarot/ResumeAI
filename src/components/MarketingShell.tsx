"use client";

import { Navbar } from "./Navbar";
import { LandingFooter } from "./LandingFooter";
import { LandingBackground } from "./LandingBackground";

type MarketingShellProps = {
  children: React.ReactNode;
};

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="relative flex min-h-screen min-h-[100dvh] flex-col bg-gradient-to-b from-black via-black to-gray-950 font-sans text-zinc-100">
      <LandingBackground />
      <Navbar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
        <main className="marketing-shell-main relative z-10 flex-1">{children}</main>
        <LandingFooter />
      </div>
    </div>
  );
}
