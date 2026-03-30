"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SectionLink } from "./SectionLink";

export function NavbarClerkFallback() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="site-navbar"
      className={`sticky top-0 z-50 w-full shrink-0 border-b border-white/10 backdrop-blur-md backdrop-saturate-150 transition-all duration-300 ease-out ${
        scrolled ? "bg-black/70 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]" : "bg-black/60"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-4 md:px-6 md:py-3.5">
        <Link
          className="resume-ai-logo-static shrink-0 text-base font-semibold tracking-tight text-white transition-transform duration-300 ease-out hover:scale-[1.02] sm:text-lg"
          href="/sign-up"
        >
          ResumeAI
        </Link>

        <nav
          className="flex min-w-0 flex-1 justify-center gap-1 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-2 [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          <SectionLink
            section="features"
            className="shrink-0 cursor-pointer whitespace-nowrap px-2 py-2 text-xs font-medium text-zinc-400 transition-all duration-300 ease-out hover:text-white sm:px-3 sm:text-sm"
          >
            Features
          </SectionLink>
          <SectionLink
            section="pricing"
            className="shrink-0 cursor-pointer whitespace-nowrap px-2 py-2 text-xs font-medium text-zinc-400 transition-all duration-300 ease-out hover:text-white sm:px-3 sm:text-sm"
          >
            Pricing
          </SectionLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/sign-up"
            className="btn btn-ghost min-h-0 px-2 text-xs font-medium text-zinc-400 hover:text-white sm:px-3 sm:text-sm"
          >
            Sign up
          </Link>
          <button
            type="button"
            className="btn min-h-[44px] rounded-xl border border-white/20 bg-white/[0.05] px-3 text-xs font-medium text-zinc-500 transition-all duration-300 ease-out sm:min-h-10 sm:px-4 sm:text-sm"
            disabled
            title="Add Clerk keys in .env"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </header>
  );
}
