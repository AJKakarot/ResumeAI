"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { getUserPlanLabel, isPremiumPublicMetadata } from "@/lib/clerkPremium";
import { Navbar } from "@/components/Navbar";
import { DashboardResumeSection } from "@/components/dashboard/DashboardResumeSection";

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (isLoaded && !user) router.replace("/");
  }, [isLoaded, user, router]);

  if (!isLoaded) {
    return (
      <div className="relative min-h-[100dvh] overflow-hidden bg-black text-zinc-100">
        <Navbar />
        <div className="relative z-10 flex min-h-[60dvh] items-center justify-center px-4 text-zinc-500">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/3 h-[min(420px,90vw)] w-[min(420px,90vw)] -translate-x-1/2 rounded-full bg-orange-500/[0.08] blur-[100px]"
            animate={reduce ? undefined : { opacity: [0.35, 0.5, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            Loading…
          </motion.p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const meta = user.publicMetadata as Record<string, unknown> | undefined;
  const isPro = isPremiumPublicMetadata(meta);
  const planLabel = getUserPlanLabel(meta);

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-black text-zinc-100">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] h-[min(480px,95vw)] w-[min(480px,95vw)] -translate-x-1/2 rounded-full bg-orange-500/[0.07] blur-[120px]"
        animate={reduce ? undefined : { opacity: [0.38, 0.55, 0.38] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <Navbar />

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 pb-10 pt-6 sm:pb-16 sm:pt-8"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease }}
      >
        <motion.div
          className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.55)] backdrop-blur-md"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Dashboard</p>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isPro
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-300 shadow-[0_0_20px_-4px_rgba(56,189,248,0.45)]"
                    : "border-zinc-600 bg-zinc-900/80 text-zinc-400"
                }`}
              >
                {planLabel} plan
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Welcome back</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {user.primaryEmailAddress?.emailAddress ?? user.username ?? user.id}
            </p>
            {!isPro && (
              <p className="mt-2 text-xs text-zinc-500">
                You&apos;re on the <span className="text-zinc-400">Free</span> plan — up to 2 resumes on the dashboard, basic analysis limits, and no Gemini polish until you upgrade.{" "}
                <Link href="/pricing" className="font-medium text-sky-400/95 underline-offset-2 hover:underline">
                  View pricing
                </Link>
              </p>
            )}
          </motion.div>

          <DashboardResumeSection />
        </motion.div>
      </motion.div>
    </div>
  );
}
