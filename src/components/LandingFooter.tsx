import Link from "next/link";
import { SectionLink } from "./SectionLink";

export function LandingFooter() {
  return (
    <footer className="relative z-10 mt-10 border-t border-white/10 bg-black/40 text-base-content backdrop-blur-sm">
      <div className="landing-footer-inner mx-auto max-w-6xl px-6 pt-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link
            href="/"
            className="resume-ai-logo-static text-base font-medium tracking-tight text-white transition-transform duration-300 ease-out hover:scale-[1.02]"
          >
            ResumeAI
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm sm:gap-x-10">
            <SectionLink
              section="features"
              className="cursor-pointer font-medium text-zinc-400 transition-all duration-300 ease-out hover:text-white"
            >
              Features
            </SectionLink>
            <SectionLink
              section="pricing"
              className="cursor-pointer font-medium text-zinc-400 transition-all duration-300 ease-out hover:text-white"
            >
              Pricing
            </SectionLink>
            <Link
              href="/docs"
              className="font-medium text-zinc-400 transition-all duration-300 ease-out hover:text-white"
            >
              Docs
            </Link>
          </nav>

          <div className="flex flex-wrap justify-center gap-2">
            <span className="badge badge-outline badge-sm rounded-full border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 transition-all duration-300 ease-out md:text-[11px]">
              ATS
            </span>
            <span className="badge badge-sm rounded-full border border-orange-500/25 bg-orange-500/[0.08] px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-orange-400/90 md:text-[11px]">
              AI-powered
            </span>
          </div>

          <p className="text-xs font-normal tracking-wide text-zinc-600">
            © 2026 ResumeAI · Built by Ajeet Gupta
          </p>
        </div>
      </div>
    </footer>
  );
}
