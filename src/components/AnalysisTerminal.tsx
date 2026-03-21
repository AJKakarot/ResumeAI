"use client";

import { useEffect, useState } from "react";

type Step = {
  text: string;
  kind: "command" | "muted" | "accent";
};

const STEPS: Step[] = [
  { text: "$ resume-ai analyze ./resume.pdf", kind: "command" },
  { text: "→ reading PDF… 142 KB", kind: "muted" },
  { text: "→ sections: contact · summary · experience · skills · education", kind: "muted" },
  { text: "→ ATS scan: keywords 24 matched · 3 gaps flagged", kind: "muted" },
  { text: "→ scoring model… done in 1.8s", kind: "muted" },
  { text: "✓ ATS score: 84/100 — suggestions ready", kind: "accent" },
];

const CHAR_MS = 42;
const LINE_PAUSE_MS = 520;
const LOOP_RESET_MS = 5200;

function lineClass(kind: Step["kind"]) {
  switch (kind) {
    case "command":
      return "text-emerald-400/95";
    case "accent":
      return "text-orange-400/95";
    default:
      return "text-zinc-500";
  }
}

/**
 * Code-style pipeline preview — lines type in slowly inside a faux editor panel.
 */
export function AnalysisTerminal() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= STEPS.length) {
      const reset = window.setTimeout(() => {
        setLineIdx(0);
        setCharIdx(0);
      }, LOOP_RESET_MS);
      return () => window.clearTimeout(reset);
    }

    const line = STEPS[lineIdx].text;

    if (charIdx < line.length) {
      const t = window.setTimeout(() => setCharIdx((c) => c + 1), CHAR_MS);
      return () => window.clearTimeout(t);
    }

    const t = window.setTimeout(() => {
      setLineIdx((n) => n + 1);
      setCharIdx(0);
    }, LINE_PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [lineIdx, charIdx]);

  const current = lineIdx < STEPS.length ? STEPS[lineIdx] : null;

  return (
    <div
      className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 ease-out hover:border-orange-500/15"
      aria-hidden
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/90" />
          </div>
          <span className="hidden font-mono text-[10px] text-zinc-500 sm:inline sm:text-[11px]">
            pipeline.log
          </span>
        </div>
        <span className="truncate font-mono text-[10px] text-zinc-500 sm:text-xs">resume-ai — analyze</span>
      </div>

      <div className="flex min-h-[min(200px,38vh)] max-h-[min(240px,42vh)] font-mono text-[10px] leading-[1.65] sm:min-h-[min(220px,40vh)] sm:text-[11px] md:text-xs md:leading-relaxed">
        <div className="select-none border-r border-white/10 bg-black/20 px-2 py-3 text-right text-zinc-600 sm:px-3 sm:py-4">
          {STEPS.map((_, i) => (
            <div key={i} className="tabular-nums">
              {i + 1}
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto px-2 py-3 sm:px-4 sm:py-4">
          {STEPS.slice(0, lineIdx).map((step, i) => (
            <p key={`done-${i}`} className={`mb-1.5 text-left whitespace-pre-wrap break-all ${lineClass(step.kind)}`}>
              {step.text}
            </p>
          ))}
          {current && (
            <p className={`mb-0 text-left whitespace-pre-wrap break-all ${lineClass(current.kind)}`}>
              {current.text.slice(0, charIdx)}
              <span
                className="ml-0.5 inline-block h-[1.1em] w-px translate-y-0.5 animate-pulse bg-orange-500/80 align-middle motion-reduce:animate-none"
                aria-hidden
              />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
