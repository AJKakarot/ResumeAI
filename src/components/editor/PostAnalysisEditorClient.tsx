"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { loadEditorPayload, saveEditorPayload } from "@/lib/editorSession";
import type { ResumeEditorPayloadV2 } from "@/lib/buildEditorPayload";
import type { AnalyzeResult } from "@/lib/analyzer";
import { mapRuleAnalysisToEditorPayload } from "@/lib/mapRuleAnalysisToEditor";
import { loadStoredAnalysisFromStorage, type StoredAnalysis } from "@/lib/analysisStorage";
import { buildRecruiterBrief } from "@/lib/recruiterBrief";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import { ResumePreviewPanel } from "@/components/ResumePreviewPanel";
import { ProDeepReportPanel } from "@/components/ProDeepReportPanel";
import { ResumeRoastPanel } from "@/components/ResumeRoastPanel";
import type { EditorTabId } from "@/components/editor/EditorTabs";
import { EditorNavbar } from "@/components/editor/EditorNavbar";
import { ResumeCodeEditor } from "@/components/editor/ResumeCodeEditor";
import { RecruiterInsightsDashboard } from "@/components/editor/RecruiterInsightsDashboard";
import { EditorPageSkeleton } from "@/components/editor/EditorPageSkeleton";

function InsightsRail({
  briefReady,
  children,
}: {
  briefReady: boolean;
  children: ReactNode;
}) {
  return (
    <aside className="flex min-h-0 flex-col gap-4 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto lg:pr-1">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-[#111]/90 px-4 py-3 shadow-[0_0_40px_-20px_rgba(249,115,22,0.2)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-orange-500/25 bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-300/95">
            AI powered
          </span>
          <span className="text-xs text-zinc-500">Recruiter insights</span>
        </div>
        {!briefReady && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-amber-500/90">Loading signals…</span>
        )}
      </div>
      {children}
    </aside>
  );
}

export function PostAnalysisEditorClient() {
  const { user, isLoaded } = useUser();
  const isPro = isPremiumPublicMetadata(user?.publicMetadata as Record<string, unknown> | undefined);

  const [booted, setBooted] = useState(false);
  const [payload, setPayload] = useState<ResumeEditorPayloadV2 | null>(null);
  const [resumeContent, setResumeContent] = useState("");
  const [storedAnalysis, setStoredAnalysis] = useState<StoredAnalysis | null>(null);
  const [tab, setTab] = useState<EditorTabId>("edit");
  const [roastMode, setRoastMode] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    const userId = user?.id;
    if (!userId) {
      setStoredAnalysis(null);
      setPayload(null);
      setResumeContent("");
      setBooted(true);
      return;
    }
    const fromAnalysis = loadStoredAnalysisFromStorage(userId);
    if (fromAnalysis) {
      setStoredAnalysis(fromAnalysis);
      const mapped = mapRuleAnalysisToEditorPayload(fromAnalysis.resumeText, fromAnalysis as AnalyzeResult);
      saveEditorPayload(mapped, userId);
      setPayload(mapped);
      setResumeContent(fromAnalysis.resumeText);
      setBooted(true);
      return;
    }
    const p = loadEditorPayload(userId);
    setPayload(p);
    setResumeContent(p?.content ?? "");
    setBooted(true);
  }, [isLoaded, user?.id]);

  useEffect(() => {
    if (!booted || !payload) return;
    const uid = user?.id;
    if (!uid) return;
    const t = window.setTimeout(() => {
      saveEditorPayload({ ...payload, content: resumeContent }, uid);
    }, 450);
    return () => window.clearTimeout(t);
  }, [resumeContent, booted, payload, user?.id]);

  const recruiterBrief = useMemo(() => {
    if (!storedAnalysis) return null;
    return buildRecruiterBrief(storedAnalysis as AnalyzeResult);
  }, [storedAnalysis]);

  const matchedSkills = storedAnalysis?.matchedSkills ?? [];
  const missingSkills = payload?.missingSkills ?? [];

  const dashboardProps = {
    brief: recruiterBrief,
    isPro,
    score: payload?.score ?? 0,
    matchedSkills,
    missingSkills,
    projectIdeas: isPro ? (payload?.suggestions?.projects ?? []) : [],
  };

  const aiBlocks = (
    <>
      <ProDeepReportPanel
        resumeText={resumeContent}
        jobTitle={storedAnalysis?.jobTitle ?? ""}
        jobDescription={storedAnalysis?.jobDescription ?? ""}
        isPro={isPro}
      />
      {roastMode && resumeContent.trim() ? (
        <ResumeRoastPanel resumeText={resumeContent} isPro={isPro} />
      ) : null}
    </>
  );

  if (!booted) {
    return <EditorPageSkeleton />;
  }

  if (!payload) {
    return (
      <div className="flex min-h-[100dvh] flex-col bg-[#0D0D0D]">
        <EditorNavbar
          activeTab={tab}
          onTabChange={setTab}
          roastMode={roastMode}
          onRoastModeChange={setRoastMode}
        />
        <div className="flex flex-1 items-center justify-center px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto w-full max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 shadow-[0_24px_80px_-40px_rgba(249,115,22,0.12)] backdrop-blur-xl"
          >
            <h1 className="text-lg font-semibold tracking-tight text-white">Resume workspace</h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Go <strong className="text-zinc-200">home</strong>, upload a resume, and run the analysis pipeline. Your
              editor and insights open here.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="btn btn-primary inline-flex min-h-11 w-full items-center justify-center rounded-xl border-0 px-4 text-sm font-semibold text-white shadow-[0_0_24px_-6px_rgba(249,115,22,0.55)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Back to home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#0D0D0D]">
      <EditorNavbar
        activeTab={tab}
        onTabChange={setTab}
        roastMode={roastMode}
        onRoastModeChange={setRoastMode}
      />

      <div className="flex-1 px-3 py-4 sm:px-5 md:px-8 md:py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto flex max-w-6xl flex-col gap-5"
        >
        {/* Recruiter-only tab: full-width dashboard */}
        {tab === "recruiter" ? (
          <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
            <RecruiterInsightsDashboard {...dashboardProps} />
            {aiBlocks}
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-start">
            {/* Left: editor / preview + AI report & roast (below) */}
            <div className="flex min-h-0 flex-col gap-4">
              <AnimatePresence mode="wait">
                {tab === "edit" ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[min(52vh,560px)]"
                  >
                    <ResumeCodeEditor value={resumeContent} onChange={setResumeContent} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="min-h-[min(52vh,400px)]"
                  >
                    {resumeContent.trim() ? (
                      <ResumePreviewPanel text={resumeContent} embedded />
                    ) : (
                      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-[#0a0a0a] p-8 text-center">
                        <p className="text-sm font-medium text-zinc-400">Nothing to preview yet</p>
                        <p className="mt-2 max-w-sm text-xs text-zinc-600">
                          Add resume text in <strong className="text-zinc-400">Edit</strong> or run analysis from home.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {(isPro || roastMode) && (
                <div className="mt-1 flex flex-col gap-4 border-t border-white/[0.08] pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">AI tools</p>
                  {aiBlocks}
                </div>
              )}
            </div>

            {/* Right: recruiter insights only (no AI report / roast here) */}
            <InsightsRail briefReady={!!recruiterBrief}>
              <RecruiterInsightsDashboard {...dashboardProps} />
            </InsightsRail>
          </div>
        )}
        </motion.div>
      </div>
    </div>
  );
}
