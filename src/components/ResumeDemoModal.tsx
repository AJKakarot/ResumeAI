"use client";

import { useEffect } from "react";
import type { DemoReport } from "@/types/demoReport";

type ResumeDemoModalProps = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  error: string;
  data: DemoReport | null;
  onOpenEditor: () => void;
};

function Section({
  title,
  accent,
  items,
}: {
  title: string;
  accent: "red" | "amber" | "sky" | "emerald";
  items: string[];
}) {
  const border =
    accent === "red"
      ? "border-red-500/20 bg-red-500/[0.06]"
      : accent === "amber"
        ? "border-amber-500/20 bg-amber-500/[0.06]"
        : accent === "sky"
          ? "border-sky-500/20 bg-sky-500/[0.06]"
          : "border-emerald-500/20 bg-emerald-500/[0.06]";
  const label =
    accent === "red"
      ? "text-red-400/95"
      : accent === "amber"
        ? "text-amber-400/95"
        : accent === "sky"
          ? "text-sky-400/95"
          : "text-emerald-400/95";

  if (!items.length) return null;

  return (
    <div className={`rounded-xl border px-3 py-3 ${border}`}>
      <h3 className={`mb-2 text-[11px] font-semibold uppercase tracking-wide ${label}`}>{title}</h3>
      <ul className="list-inside list-disc space-y-1.5 text-[13px] leading-relaxed text-zinc-300">
        {items.map((x, i) => (
          <li key={i} className="marker:text-zinc-600">
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResumeDemoModal({
  open,
  onClose,
  loading,
  error,
  data,
  onOpenEditor,
}: ResumeDemoModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className="relative z-[101] flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-md sm:max-w-xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id="demo-modal-title" className="text-base font-semibold text-white">
            Resume demo — gaps & fixes
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <span className="loading loading-spinner loading-lg text-orange-500" />
              <p className="text-sm text-zinc-500">Building your personalized demo…</p>
            </div>
          )}

          {!loading && error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
          )}

          {!loading && !error && data && (
            <div className="flex flex-col gap-3">
              <p className="text-xs leading-relaxed text-zinc-500">
                What’s off, what’s missing in skills, what to learn next, and project ideas so your resume looks strong.
              </p>
              <Section title="What’s wrong" accent="red" items={data.mistakes} />
              <Section title="Skill gaps" accent="amber" items={data.skill_gaps} />
              <Section title="Learn more (level up)" accent="sky" items={data.learn_next} />
              <Section title="Add to projects / portfolio" accent="emerald" items={data.project_ideas} />
              {![
                ...data.mistakes,
                ...data.skill_gaps,
                ...data.learn_next,
                ...data.project_ideas,
              ].length && (
                <p className="text-sm text-zinc-500">No items returned. Close and tap View Demo again.</p>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-white/10 bg-black/30 px-4 py-3">
          <button
            type="button"
            onClick={() => {
              onOpenEditor();
              onClose();
            }}
            className="app-btn-ghost w-full rounded-xl border border-white/15 py-3 text-sm font-semibold text-white"
          >
            Open Resume Editor
          </button>
        </div>
      </div>
    </div>
  );
}
