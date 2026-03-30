"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { NavbarClerkFallback } from "./NavbarClerkFallback";
import { NavbarUserButton } from "./NavbarUserButton";
import { SectionLink } from "./SectionLink";
import { GoogleSignInButton } from "./GoogleSignInButton";

const googleBtnClass =
  "btn min-h-[44px] rounded-xl border border-white/20 bg-white/[0.05] px-3 text-xs font-medium text-white transition-all duration-300 ease-out hover:scale-[1.02] hover:border-white/30 hover:bg-white/[0.08] sm:min-h-10 sm:px-4 sm:text-sm";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <NavbarClerkFallback />;
  }

  return (
    <header
      id="site-navbar"
      className={`sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-md transition-all duration-300 ease-out ${
        scrolled ? "bg-black/70 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]" : "bg-black/60"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-3 sm:px-4 md:px-6 md:py-3.5">
        <SignedOut>
          <Link
            className="resume-ai-logo-static shrink-0 text-base font-semibold tracking-tight text-white transition-transform duration-300 ease-out hover:scale-[1.02] sm:text-lg"
            href="/sign-up"
          >
            ResumeAI
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            className="resume-ai-logo-static shrink-0 text-base font-semibold tracking-tight text-white transition-transform duration-300 ease-out hover:scale-[1.02] sm:text-lg"
            href="/"
          >
            ResumeAI
          </Link>
        </SignedIn>

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
          <SignedOut>
            <Link
              href="/sign-up"
              className="btn btn-ghost min-h-0 px-2 text-xs font-medium text-zinc-400 transition-colors hover:text-white sm:px-3 sm:text-sm"
            >
              Sign up
            </Link>
            <GoogleSignInButton className={googleBtnClass} />
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="btn btn-ghost hidden min-h-0 px-2 text-xs text-zinc-400 transition-all duration-300 ease-out hover:text-white sm:inline-flex sm:px-3 sm:text-sm"
            >
              Dashboard
            </Link>
            <NavbarUserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
