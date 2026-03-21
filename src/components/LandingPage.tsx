"use client";

import { useRef } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { MarketingShell } from "./MarketingShell";
import { AnalysisTerminal } from "./AnalysisTerminal";
import { GoogleSignInButton } from "./GoogleSignInButton";

type LandingPageProps = {
  onFileSelected?: (file: File) => void;
  onDemo?: () => void;
};

const heroPrimarySignedIn =
  "btn btn-primary min-h-[48px] w-full rounded-xl border-0 px-6 text-sm font-medium transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.99] sm:w-auto sm:min-w-[200px] sm:px-8";

const heroGoogle =
  "btn min-h-[48px] w-full rounded-xl border-0 bg-gradient-to-b from-orange-500 to-orange-600 px-6 text-sm font-medium text-white transition-all duration-300 ease-out hover:scale-[1.03] hover:from-orange-400 hover:to-orange-500 sm:w-auto sm:min-w-[220px] sm:px-8";

const outlineBtn =
  "btn btn-outline min-h-[48px] w-full rounded-xl border-white/20 bg-transparent px-6 text-white transition-all duration-300 ease-out hover:scale-[1.03] hover:border-orange-500/35 hover:bg-white/[0.04] sm:w-auto sm:min-w-[160px] sm:px-8";

const ctaBottomBtn =
  "inline-flex w-full max-w-xs items-center justify-center rounded-lg border-0 bg-orange-500 px-6 py-3 text-sm font-medium text-black transition-all duration-300 hover:scale-[1.03] hover:bg-orange-400 sm:w-auto sm:max-w-none";

export default function LandingPage({ onFileSelected, onDemo }: LandingPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pickFile = () => inputRef.current?.click();

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    onFileSelected?.(file);
  };

  return (
    <MarketingShell>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="relative mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-balance text-[clamp(1.625rem,6vw+0.35rem,3.25rem)] font-semibold leading-tight tracking-tight text-white">
            Analyze your{" "}
            <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              resume
            </span>{" "}
            with{" "}
            <span className="relative inline-block px-0.5">
              <span
                className="animate-glow-ai-halo pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[2em] w-[2.25em] rounded-full bg-orange-500/25 blur-xl motion-reduce:animate-none"
                aria-hidden
              />
              <span className="animate-glow-ai-text relative inline-block bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text font-semibold text-transparent motion-reduce:animate-none">
                AI
              </span>
            </span>
          </h1>
          <p className="mx-auto mb-4 max-w-md text-pretty text-sm leading-relaxed text-zinc-400 sm:max-w-lg md:max-w-xl md:text-base">
            ATS score, fixes, and phrasing—instantly. Upload once.
          </p>
          <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
            <SignedOut>
              <GoogleSignInButton className={heroGoogle} />
            </SignedOut>
            <SignedIn>
              <button type="button" className={heroPrimarySignedIn} onClick={pickFile}>
                Upload Resume
              </button>
            </SignedIn>
            <button type="button" className={outlineBtn} onClick={onDemo}>
              View Demo
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </section>

      <section className="mx-auto mt-6 max-w-6xl px-6 pb-0" aria-label="Analysis preview">
        <p className="mb-3 text-center text-sm font-medium tracking-tight text-zinc-400 md:text-base">
          What happens when you upload — instant pipeline preview
        </p>
        <div className="mb-6">
          <AnalysisTerminal />
        </div>

        <div className="mt-10 border-t border-white/[0.08] py-8">
          <div className="flex flex-col items-center gap-3">
            <p className="w-full text-center text-sm leading-normal text-zinc-400">
              <span className="font-semibold tabular-nums text-orange-400/95">1,000+</span>
              <span className="text-zinc-500"> </span>
              resumes analyzed successfully
            </p>
            <div className="w-full border-t border-white/[0.06] pt-4">
              <p className="mb-2 text-center text-xs font-medium tracking-tight text-zinc-500 sm:text-sm">
                Trusted by teams at
              </p>
              <div className="grid grid-cols-2 place-items-center gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 md:gap-4">
                {["Acme", "Northwind", "Globex", "Umbrella", "Stark"].map((name) => (
                  <span
                    key={name}
                    className="w-full max-w-[160px] cursor-default rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wider text-zinc-500 transition-all duration-300 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] hover:border-white/35 hover:bg-white/[0.12] hover:text-white hover:shadow-[0_0_28px_rgba(255,255,255,0.18)] sm:w-auto sm:max-w-none sm:px-5 sm:py-2.5 sm:text-xs"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl border-t border-white/10 px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-5 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Get your resume reviewed in seconds
          </h2>
          <div className="mt-4 flex justify-center">
            <SignedOut>
              <GoogleSignInButton className={ctaBottomBtn} />
            </SignedOut>
            <SignedIn>
              <button type="button" className={ctaBottomBtn} onClick={pickFile}>
                Start Now
              </button>
            </SignedIn>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
