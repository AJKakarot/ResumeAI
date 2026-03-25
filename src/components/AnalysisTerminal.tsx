"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { extractResumeText } from "@/lib/extractResumeText";
import { mapRuleAnalysisToEditorPayload } from "@/lib/mapRuleAnalysisToEditor";
import { saveEditorPayload } from "@/lib/editorSession";
import type { AnalyzeResult } from "@/lib/analyzer";
import { getAnalysisStorageKey, type StoredAnalysis } from "@/lib/analysisStorage";
import { saveStoredAtsReport } from "@/lib/atsReportStorage";
import type { AtsGeminiReport } from "@/lib/atsGeminiReport";

type LineKind = "command" | "muted" | "accent" | "warning" | "tip";

type TermLine = { text: string; kind: LineKind };

type Step = { text: string; kind: LineKind };

const IDLE_SEQUENCE: Step[] = [
  { text: "$ resume-ai analyze ./resume.pdf", kind: "command" },
  { text: "→ waiting for upload…", kind: "muted" },
  { text: "→ drop a file or click Upload resume", kind: "tip" },
];

const CHAR_MS = 26;
const LINE_PAUSE_MS = 480;
const IDLE_LOOP_GAP_MS = 2400;
const STEP_MS = () => 400 + Math.floor(Math.random() * 201);

function safeFileName(file: File) {
  const n = file.name.trim() || "resume.pdf";
  return n.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 80) || "resume.pdf";
}

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function lineClass(kind: LineKind) {
  switch (kind) {
    case "command":
      return "text-emerald-400/95";
    case "accent":
      return "text-orange-400/95";
    case "warning":
      return "text-amber-400/90";
    case "tip":
      return "text-orange-400/90";
    default:
      return "text-zinc-500";
  }
}

/** ~6 visible lines; inner scroll for overflow */
const TERMINAL_BODY_H =
  "h-[8.75rem] min-h-[8.75rem] max-h-[8.75rem] sm:h-[9.25rem] sm:min-h-[9.25rem] sm:max-h-[9.25rem]";

type AnalysisTerminalProps = {
  file: File | null;
  runKey: number;
  jobTitle?: string;
  jobDescription?: string;
  enhanceWithGemini?: boolean;
  /** When true: Gemini polish on /api/analyze and ATS JSON report when polish is on */
  isPro?: boolean;
  onAnalysisComplete?: () => void;
  /** Opens /resume-ats (ATS report or rule-based scan from your last analysis) */
  onViewResume?: () => void;
};

export function AnalysisTerminal({
  file,
  runKey,
  jobTitle = "",
  jobDescription = "",
  enhanceWithGemini = false,
  isPro = false,
  onAnalysisComplete,
  onViewResume,
}: AnalysisTerminalProps) {
  const { user } = useUser();
  const isPreview = runKey === 0;

  const [lines, setLines] = useState<TermLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showEditorCta, setShowEditorCta] = useState(false);
  const [errorDone, setErrorDone] = useState(false);
  const [atsReportReady, setAtsReportReady] = useState(false);

  /* Idle typewriter */
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const runIdRef = useRef(0);
  const terminalRootRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  /** Keep latest output pinned to bottom inside fixed-height panel */
  useEffect(() => {
    const el = scrollContentRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [lines, lineIdx, charIdx, isPreview, isRunning]);

  /** New upload/run: scroll page once so terminal stays in view */
  useEffect(() => {
    if (isPreview || runKey <= 0) return;
    const t = window.setTimeout(() => {
      terminalRootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [runKey, isPreview]);

  useEffect(() => {
    if (!isPreview) return;
    const seq = IDLE_SEQUENCE;
    if (lineIdx >= seq.length) {
      const t = window.setTimeout(() => {
        setLineIdx(0);
        setCharIdx(0);
      }, IDLE_LOOP_GAP_MS);
      return () => window.clearTimeout(t);
    }
    const line = seq[lineIdx].text;
    if (charIdx < line.length) {
      const t = window.setTimeout(() => setCharIdx((c) => c + 1), CHAR_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLineIdx((n) => n + 1);
      setCharIdx(0);
    }, LINE_PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [isPreview, lineIdx, charIdx]);

  useEffect(() => {
    if (isPreview || !file || runKey <= 0) return;
    const resumeFile = file;

    const id = ++runIdRef.current;
    let cancelled = false;

    async function run() {
      setLines([]);
      setShowEditorCta(false);
      setErrorDone(false);
      setIsRunning(true);
      setAtsReportReady(false);

      const push = (text: string, kind: LineKind) => {
        if (cancelled || runIdRef.current !== id) return;
        setLines((prev) => [...prev, { text, kind }]);
      };

      const fn = safeFileName(resumeFile);
      push(`$ resume-ai analyze ./${fn}`, "command");
      await delay(STEP_MS());
      if (cancelled || runIdRef.current !== id) return;

      push("→ reading file...", "muted");
      await delay(STEP_MS());
      let text = "";
      try {
        text = await extractResumeText(resumeFile);
      } catch {
        push("✖ could not read file", "warning");
        setIsRunning(false);
        setErrorDone(true);
        onAnalysisComplete?.();
        return;
      }
      if (cancelled || runIdRef.current !== id) return;

      push("→ extracting sections...", "muted");
      await delay(STEP_MS());
      push("→ matching skills...", "muted");
      await delay(STEP_MS());
      push("→ detecting gaps...", "muted");
      await delay(STEP_MS());
      if (jobDescription.trim()) {
        push("→ parsing job description (JD)...", "muted");
        await delay(STEP_MS());
      }
      if (enhanceWithGemini) {
        push("→ optional Gemini polish (server)...", "muted");
        await delay(STEP_MS());
      }
      push("→ calculating score...", "muted");
      await delay(STEP_MS());

      if (!text.trim()) {
        push("✖ no extractable text", "warning");
        setIsRunning(false);
        setErrorDone(true);
        onAnalysisComplete?.();
        return;
      }

      let data: AnalyzeResult;
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            jobTitle,
            jobDescription,
            enhanceWithGemini,
          }),
        });
        const j = (await res.json()) as AnalyzeResult & { error?: string };
        if (!res.ok) throw new Error(j.error ?? "analyze failed");
        data = j as AnalyzeResult;
      } catch {
        push("✖ analysis request failed", "warning");
        setIsRunning(false);
        setErrorDone(true);
        onAnalysisComplete?.();
        return;
      }
      if (cancelled || runIdRef.current !== id) return;

      push("✔ analysis complete", "accent");
      await delay(STEP_MS());
      push(`→ ATS Score: ${data.score}/100`, "accent");
      await delay(STEP_MS());
      push(`→ Role: ${data.category}${jobTitle.trim() ? ` · target: ${jobTitle.trim().slice(0, 48)}` : ""}`, "accent");
      await delay(STEP_MS());

      const isFreeTier = data.analysisTier === "free";

      if (isFreeTier) {
        push("→ Free plan: score + top insights (upgrade for full gap analysis & Gemini polish)", "muted");
        await delay(STEP_MS());
        for (const s of data.suggestions) {
          push(`💡 ${s}`, "tip");
          await delay(STEP_MS());
        }
      } else {
        push(`→ matched skills: ${data.matchedSkills.length}`, "muted");
        await delay(STEP_MS());
        const missing =
          data.missingSkills.length > 0 ? data.missingSkills.join(", ") : "(none)";
        push(`→ missing skills: ${missing}`, "warning");
        await delay(STEP_MS());

        if (jobDescription.trim() && data.jdCoverage !== undefined) {
          push(
            `→ JD keyword coverage: ${Math.round(data.jdCoverage * 100)}%`,
            "muted"
          );
          await delay(STEP_MS());
        }
        if (data.jdMatchedKeywords && data.jdMatchedKeywords.length > 0) {
          push(
            `→ JD matched terms: ${data.jdMatchedKeywords.slice(0, 10).join(", ")}`,
            "muted"
          );
          await delay(STEP_MS());
        }
        if (data.jdMissingKeywords && data.jdMissingKeywords.length > 0) {
          push(
            `→ JD gaps to add (if true): ${data.jdMissingKeywords.slice(0, 10).join(", ")}`,
            "warning"
          );
          await delay(STEP_MS());
        }
        if (data.scanMode === "rule+gemini") {
          push("→ scan: rules + Gemini extras", "accent");
          await delay(STEP_MS());
        }

        for (const s of data.suggestions) {
          push(`💡 ${s}`, "tip");
          await delay(STEP_MS());
        }
        for (const w of data.weaknesses) {
          push(`⚠ ${w}`, "warning");
          await delay(STEP_MS());
        }
        for (const s of data.aiSuggestions ?? []) {
          push(`✨ ${s}`, "tip");
          await delay(STEP_MS());
        }
      }

      const stored: StoredAnalysis = { ...data, resumeText: text, jobTitle, jobDescription };
      const uid = user?.id;
      if (!uid) {
        push("→ sign in to save analysis to your account", "warning");
      } else {
        try {
          localStorage.setItem(getAnalysisStorageKey(uid), JSON.stringify(stored));
          saveEditorPayload(mapRuleAnalysisToEditorPayload(text, data), uid);
        } catch {
          /* quota */
        }
      }

      if (enhanceWithGemini && isPro && uid) {
        push("→ Gemini ATS deep analysis (JSON)...", "muted");
        await delay(STEP_MS());
        try {
          const atsRes = await fetch("/api/ats-gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
          });
          const atsJson = (await atsRes.json()) as { report?: AtsGeminiReport; error?: string };
          if (!atsRes.ok) throw new Error(atsJson.error ?? "ATS analysis failed");
          if (!atsJson.report) throw new Error("Invalid ATS response");
          saveStoredAtsReport(uid, { resumeText: text, report: atsJson.report });
          setAtsReportReady(true);
          push(`✔ Gemini ATS score: ${atsJson.report.atsScore}/100`, "accent");
          await delay(STEP_MS());
        } catch (e) {
          push(
            `⚠ ATS Gemini: ${e instanceof Error ? e.message.slice(0, 96) : "failed"}`,
            "warning"
          );
          await delay(STEP_MS());
        }
      }

      setIsRunning(false);
      setShowEditorCta(true);
      onAnalysisComplete?.();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [isPreview, file, runKey, onAnalysisComplete, jobTitle, jobDescription, enhanceWithGemini, isPro, user?.id]);

  const gutterCount = useMemo(() => {
    if (isPreview) return Math.max(IDLE_SEQUENCE.length, lineIdx + 1);
    return Math.max(lines.length, 1);
  }, [isPreview, lineIdx, lines.length]);

  const idleDisplay = IDLE_SEQUENCE;

  return (
    <div ref={terminalRootRef} className="mx-auto w-full max-w-2xl scroll-mt-4">
      <motion.div
        initial={{ opacity: 0.92 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md"
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
          <span className="truncate font-mono text-[10px] text-zinc-500 sm:text-xs">
            resume-ai — analyze
          </span>
        </div>

        <div
          className={`flex min-h-0 ${TERMINAL_BODY_H} font-mono text-[10px] leading-snug sm:text-[11px] md:text-xs md:leading-snug`}
        >
          <div
            ref={scrollContentRef}
            className="flex min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="select-none shrink-0 border-r border-white/10 bg-black/20 px-2 py-2 text-right text-zinc-600 sm:px-3 sm:py-2.5">
              {Array.from({ length: gutterCount }, (_, i) => (
                <div key={i} className="tabular-nums leading-snug">
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="min-h-0 min-w-0 flex-1 px-2 py-2 sm:px-3 sm:py-2.5">
            {isPreview ? (
              <>
                {idleDisplay.slice(0, lineIdx).map((step, i) => (
                  <p
                    key={`d-${i}`}
                    className={`mb-1.5 text-left whitespace-pre-wrap break-all transition-colors duration-200 ${lineClass(step.kind)}`}
                  >
                    {step.text}
                  </p>
                ))}
                {lineIdx < idleDisplay.length && (
                  <p className={`mb-0 text-left whitespace-pre-wrap break-all ${lineClass(idleDisplay[lineIdx].kind)}`}>
                    {idleDisplay[lineIdx].text.slice(0, charIdx)}
                    <span
                      className="ml-0.5 inline-block h-[1.1em] w-px translate-y-0.5 animate-pulse bg-orange-500/80 align-middle motion-reduce:animate-none"
                      aria-hidden
                    />
                  </p>
                )}
              </>
            ) : (
              <>
                {lines.map((line, i) => (
                  <p
                    key={`${i}-${line.text.slice(0, 24)}`}
                    className={`mb-1.5 text-left whitespace-pre-wrap break-all last:mb-0 ${lineClass(line.kind)}`}
                  >
                    {line.text}
                  </p>
                ))}
                {isRunning && (
                  <p className="text-zinc-500">
                    <span
                      className="inline-block h-[1.1em] w-px animate-pulse bg-orange-500/80 align-middle motion-reduce:animate-none"
                      aria-hidden
                    />{" "}
                    <span className="sr-only">Running</span>
                  </p>
                )}
              </>
            )}
            </div>
          </div>
        </div>

        {!isPreview && showEditorCta && onViewResume && (
          <div className="border-t border-white/10 bg-black/20 px-3 py-3 sm:px-4">
            <button
              type="button"
              onClick={onViewResume}
              className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-orange-400 active:scale-[0.99]"
            >
              {atsReportReady ? "View resume & ATS report" : "View resume"}
            </button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {!isPreview && errorDone && !isRunning && !showEditorCta && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-xs text-zinc-500"
          >
            Fix the file and upload again.
          </motion.p>
        )}
      </AnimatePresence>

    </div>
  );
}
