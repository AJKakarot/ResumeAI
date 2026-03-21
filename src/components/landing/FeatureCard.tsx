"use client";

import { cn } from "@/lib/cn";

export type FeatureCardVariant = "default" | "featured" | "pro";

export type FeatureCardProps = {
  tag: string;
  title: string;
  description: string;
  icon: string;
  variant?: FeatureCardVariant;
  className?: string;
};

/** Shared card chrome — equal padding across variants for grid alignment */
const cardPadding = "p-6";

export function FeatureCard({
  tag,
  title,
  description,
  icon,
  variant = "default",
  className,
}: FeatureCardProps) {
  const isFeatured = variant === "featured";
  const isPro = variant === "pro";

  return (
    <div
      className={cn(
        "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b transition-all duration-200 ease-out will-change-transform",
        "motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02]",
        "motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100",
        "hover:shadow-[0_0_25px_rgba(255,140,0,0.18),0_20px_40px_-20px_rgba(0,0,0,0.5)]",
        "hover:border-orange-500/35 active:scale-[0.99] active:duration-150",
        cardPadding,
        isFeatured &&
          "bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(255,140,0,0.18),transparent_52%),linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent)]",
        isPro &&
          "border-orange-500/25 bg-[radial-gradient(circle_at_100%_0%,rgba(249,115,22,0.14),transparent_45%),linear-gradient(to_bottom,rgba(249,115,22,0.08),rgba(0,0,0,0.35))]",
        !isFeatured &&
          !isPro &&
          "from-white/[0.05] to-transparent",
        isFeatured && "motion-safe:hover:scale-[1.03]",
        isPro && "motion-safe:hover:scale-[1.03]",
        className
      )}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255, 140, 0, 0.12), transparent 55%)",
        }}
        aria-hidden
      />

      {isPro && (
        <span className="badge badge-sm absolute right-4 top-4 z-[2] border border-orange-500/50 bg-orange-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-200 shadow-[0_0_20px_rgba(249,115,22,0.35)] transition-all duration-200 group-hover:border-orange-400/60 group-hover:bg-orange-500/30">
          Pro
        </span>
      )}

      <div className="relative z-[1] flex min-h-0 flex-1 flex-col gap-5">
        {/* Icon */}
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center self-start rounded-2xl text-[1.75rem] leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-200 sm:h-14 sm:w-14 sm:text-[2rem]",
            "ring-1 ring-inset",
            isFeatured &&
              "bg-orange-500/20 ring-orange-400/35 shadow-[0_0_32px_-8px_rgba(249,115,22,0.45)] motion-safe:group-hover:scale-105",
            isPro &&
              "bg-orange-500/20 ring-orange-400/30 shadow-[0_0_28px_-6px_rgba(249,115,22,0.4)] motion-safe:group-hover:scale-105",
            !isFeatured &&
              !isPro &&
              "bg-white/[0.06] ring-white/10 motion-safe:group-hover:scale-105 motion-safe:group-hover:bg-orange-500/15 motion-safe:group-hover:ring-orange-500/25"
          )}
          aria-hidden
        >
          {icon}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500 transition-colors duration-200 group-hover:text-zinc-400">
            {tag}
          </p>
          <h3
            className={cn(
              "font-semibold leading-snug tracking-tight text-white transition-colors duration-200",
              isFeatured && "text-lg sm:text-xl",
              isPro && "text-base sm:text-lg",
              !isFeatured && !isPro && "text-base sm:text-lg"
            )}
          >
            {title}
          </h3>
          <p
            className="line-clamp-2 text-sm leading-relaxed text-zinc-400 transition-colors duration-200 group-hover:text-zinc-300"
            title={description}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
