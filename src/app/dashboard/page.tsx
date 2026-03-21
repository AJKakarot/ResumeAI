"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
      <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-black px-4 text-zinc-500">
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
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-black text-zinc-100">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[18%] h-[min(480px,95vw)] w-[min(480px,95vw)] -translate-x-1/2 rounded-full bg-orange-500/[0.07] blur-[120px]"
        animate={reduce ? undefined : { opacity: [0.38, 0.55, 0.38] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 py-16"
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
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Welcome back</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {user.primaryEmailAddress?.emailAddress ?? user.username ?? user.id}
            </p>
          </motion.div>

          <DashboardResumeSection />

          <motion.div
            className="mt-8 border-t border-white/10 pt-8"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease }}
          >
            <motion.div
              className="inline-block"
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              <Link
                href="/"
                className="btn btn-outline rounded-xl border-white/15 text-zinc-300 transition-all duration-300 hover:border-orange-500/40 hover:bg-orange-500/[0.08]"
              >
                ← Home
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
