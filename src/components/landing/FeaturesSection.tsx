import Link from "next/link";
import { LANDING_FEATURES } from "@/data/features";
import { FeatureCard, type FeatureCardVariant } from "@/components/landing/FeatureCard";

function layoutToVariant(layout: (typeof LANDING_FEATURES)[number]["layout"]): FeatureCardVariant {
  if (layout === "hero") return "featured";
  if (layout === "pro") return "pro";
  return "default";
}

export function FeaturesSection() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/[0.06] bg-black/50 pt-5 pb-10 sm:pt-6 sm:pb-12 md:pt-6 md:pb-14"
      aria-labelledby="features-sr-only"
    >
      {/* Section radial wash */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,140,0,0.14),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" aria-hidden />

      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2
          id="features-sr-only"
          className="mx-auto max-w-4xl text-balance text-center text-lg font-medium uppercase tracking-[0.08em] text-white sm:text-xl md:text-2xl"
        >
          Smarter resumes
        </h2>
        <p className="mx-auto mt-2 max-w-md text-center text-pretty text-sm leading-relaxed text-zinc-500">
          Score, JD fit, editor—optional <span className="text-zinc-400">Gemini</span> polish on Pro.
        </p>

        {/* Grid — uniform cells, equal row heights via items-stretch + card h-full */}
        <div className="mt-5 grid grid-cols-1 items-stretch gap-6 sm:mt-6 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {LANDING_FEATURES.map((f) => {
            const variant = layoutToVariant(f.layout);

            return (
              <FeatureCard
                key={f.title}
                tag={f.tag}
                title={f.title}
                description={f.description}
                icon={f.icon}
                variant={variant}
              />
            );
          })}
        </div>

        {/* Footnote */}
        <p className="mx-auto mt-12 max-w-lg text-center text-xs leading-relaxed text-zinc-500 sm:mt-14">
          Free tier includes core analysis; Pro unlocks unlimited runs, deeper fit, and{" "}
          <span className="text-zinc-400">Gemini</span> polish where enabled.{" "}
          <Link href="/pricing" className="font-medium text-orange-400/95 underline-offset-2 transition-colors hover:text-orange-300 hover:underline">
            Compare plans
          </Link>
          .
        </p>

        {/* CTA */}
        <div className="mx-auto mt-14 max-w-xl text-center sm:mt-16">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-transparent p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-10">
            <p className="text-sm font-medium text-zinc-300">Ready to see your score?</p>
            <p className="mt-1 text-xs text-zinc-500">Upload a resume and get structured feedback in seconds.</p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/sign-up"
                className="group relative inline-flex min-h-[52px] items-center justify-center overflow-hidden rounded-xl px-8 text-sm font-semibold text-white shadow-[0_0_28px_-6px_rgba(249,115,22,0.55)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
              >
                <span
                  className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 transition-all duration-200 group-hover:brightness-110"
                  aria-hidden
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-70" aria-hidden />
                <span className="relative z-10 flex items-center gap-2">
                  Try Resume Analyzer
                  <span aria-hidden className="text-lg leading-none">
                    ⚡
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
