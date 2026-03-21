"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { saveEditorPayload } from "@/lib/editorSession";
import { buildEditorPayloadFromAnalysis } from "@/lib/buildEditorPayload";
import { ResumeDemoModal } from "@/components/ResumeDemoModal";
import { normalizeDemoReport, type DemoReport } from "@/types/demoReport";

const TABS = ["Analyze", "Tailor", "Cover Letter", "Tracker"] as const;
type Tab = (typeof TABS)[number];

interface Job {
  id: number;
  company: string;
  role: string;
  status: string;
  date: string;
  color: string;
}

interface AnalyzeResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywords_missing: string[];
}

interface TailorResult {
  match_score: number;
  missing_keywords: string[];
  rewritten_summary: string;
  tips: string[];
}

type Result =
  | { type: "analyze"; data: AnalyzeResult }
  | { type: "tailor"; data: TailorResult }
  | { type: "cover"; data: string };

const MOCK_JOBS: Job[] = [
  { id: 1, company: "Google", role: "Frontend Engineer", status: "Applied", date: "2024-03-10", color: "#4285F4" },
  { id: 2, company: "Atomity", role: "Full Stack Intern", status: "Interview", date: "2024-03-15", color: "#00C853" },
  { id: 3, company: "Razorpay", role: "React Developer", status: "Rejected", date: "2024-03-08", color: "#EF5350" },
  { id: 4, company: "Zepto", role: "SWE Intern", status: "Offer", date: "2024-03-18", color: "#FF9800" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Applied: { bg: "#1a2744", text: "#60a5fa", dot: "#3b82f6" },
  Interview: { bg: "#3a2818", text: "#fdba74", dot: "#f97316" },
  Rejected: { bg: "#3a1a1a", text: "#f87171", dot: "#ef4444" },
  Offer: { bg: "#3a2a00", text: "#fbbf24", dot: "#f59e0b" },
};

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </span>
  );
}

function ScoreRing({ score, label = "ATS SCORE" }: { score: number; label?: string }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;
  const color = score >= 75 ? "#f97316" : score >= 50 ? "#f59e0b" : "#ef4444";
  const numClass =
    score >= 75 ? "app-score-num-green" : score >= 50 ? "app-score-num-amber" : "app-score-num-red";

  return (
    <div className="app-score-ring">
      <svg width="140" height="140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e1b4b" strokeWidth="10" />
        <circle
          className="app-score-ring-fill"
          cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`} strokeLinecap="round"
        />
      </svg>
      <div className="app-score-value">
        <span className={numClass}>{score}</span>
        <span className="app-score-label">{label}</span>
      </div>
    </div>
  );
}

/** Toggle EN ↔ Hinglish for result blocks */
function HinglishToggle({
  active,
  loading,
  onClick,
}: {
  active: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={active ? "English में देखें" : "Hinglish में देखें"}
      aria-label={active ? "Show in English" : "Show in Hinglish"}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-orange-500/40 hover:bg-white/[0.1] hover:text-white disabled:opacity-50"
    >
      <span className="text-base leading-none" aria-hidden>
        अ
      </span>
      <span className="text-zinc-500">/</span>
      <span className="text-[10px] uppercase tracking-wide">En</span>
      {loading ? (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-orange-400/30 border-t-orange-400" />
      ) : null}
    </button>
  );
}

type ResumeAnalyzerProps = {
  onBackToLanding: () => void;
  pendingFile: File | null;
  onPendingFileConsumed: () => void;
};

export function ResumeAnalyzer({
  onBackToLanding,
  pendingFile,
  onPendingFileConsumed,
}: ResumeAnalyzerProps) {
  const router = useRouter();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("Analyze");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [newJob, setNewJob] = useState({ company: "", role: "", status: "Applied" });
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [resultLang, setResultLang] = useState<"en" | "hinglish">("en");
  const [hinglishAnalyze, setHinglishAnalyze] = useState<AnalyzeResult | null>(null);
  const [hinglishTailor, setHinglishTailor] = useState<TailorResult | null>(null);
  const [hinglishCover, setHinglishCover] = useState<string | null>(null);
  const [hinglishLoading, setHinglishLoading] = useState(false);

  const [demoOpen, setDemoOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoErr, setDemoErr] = useState("");
  const [demoData, setDemoData] = useState<DemoReport | null>(null);
  const demoInFlight = useRef(false);

  useEffect(() => {
    setResultLang("en");
    setHinglishAnalyze(null);
    setHinglishTailor(null);
    setHinglishCover(null);
  }, [result]);

  useEffect(() => {
    setDemoData(null);
    setDemoErr("");
    setDemoOpen(false);
  }, [result]);

  const handleFile = useCallback((file: File | null | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setResumeText(e.target?.result as string);
    reader.readAsText(file);
  }, []);

  useEffect(() => {
    if (!pendingFile) return;
    handleFile(pendingFile);
    onPendingFileConsumed();
  }, [pendingFile, handleFile, onPendingFileConsumed]);

  /** Calls server `/api/gemini` — API key stays on server (Google Gemini). */
  const callGemini = async (userPrompt: string, systemPrompt: string): Promise<string> => {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt, systemPrompt }),
    });
    const data = (await res.json()) as { text?: string; error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? `Request failed (${res.status})`);
    }
    return data.text ?? "";
  };

  const parseJsonFromGemini = (raw: string) =>
    JSON.parse(raw.replace(/```json|```/g, "").trim()) as unknown;

  const translateAnalyzeToHinglish = async (data: AnalyzeResult): Promise<AnalyzeResult> => {
    const raw = await callGemini(
      JSON.stringify(data),
      `Translate every string value in this JSON to Hinglish (natural Hindi–English mix used in India). Keep "score" exactly the same number. Same array lengths. Keep technical terms where natural. Return ONLY valid JSON with keys: score, summary, strengths, improvements, keywords_missing.`,
    );
    return parseJsonFromGemini(raw) as AnalyzeResult;
  };

  const translateTailorToHinglish = async (data: TailorResult): Promise<TailorResult> => {
    const raw = await callGemini(
      JSON.stringify(data),
      `Translate every string value in this JSON to Hinglish (natural Hindi–English mix used in India). Keep "match_score" exactly the same number. Same array lengths. Return ONLY valid JSON with keys: match_score, missing_keywords, rewritten_summary, tips.`,
    );
    return parseJsonFromGemini(raw) as TailorResult;
  };

  const translateCoverToHinglish = async (text: string): Promise<string> => {
    const out = await callGemini(
      text,
      `Translate this cover letter to Hinglish (natural Hindi–English mix for Indian readers). Preserve tone and structure (paragraphs). Return plain text only.`,
    );
    return out.trim();
  };

  const toggleHinglishAnalyze = async () => {
    if (result?.type !== "analyze") return;
    if (resultLang === "hinglish") {
      setResultLang("en");
      return;
    }
    if (hinglishAnalyze) {
      setResultLang("hinglish");
      return;
    }
    setHinglishLoading(true);
    setError("");
    try {
      const t = await translateAnalyzeToHinglish(result.data);
      setHinglishAnalyze(t);
      setResultLang("hinglish");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Translation failed.";
      setError(msg.length < 200 ? msg : "Hinglish translation failed. Try again.");
    }
    setHinglishLoading(false);
  };

  const toggleHinglishTailor = async () => {
    if (result?.type !== "tailor") return;
    if (resultLang === "hinglish") {
      setResultLang("en");
      return;
    }
    if (hinglishTailor) {
      setResultLang("hinglish");
      return;
    }
    setHinglishLoading(true);
    setError("");
    try {
      const t = await translateTailorToHinglish(result.data);
      setHinglishTailor(t);
      setResultLang("hinglish");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Translation failed.";
      setError(msg.length < 200 ? msg : "Hinglish translation failed. Try again.");
    }
    setHinglishLoading(false);
  };

  const toggleHinglishCover = async () => {
    if (result?.type !== "cover") return;
    if (resultLang === "hinglish") {
      setResultLang("en");
      return;
    }
    if (hinglishCover) {
      setResultLang("hinglish");
      return;
    }
    setHinglishLoading(true);
    setError("");
    try {
      const t = await translateCoverToHinglish(result.data);
      setHinglishCover(t);
      setResultLang("hinglish");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Translation failed.";
      setError(msg.length < 200 ? msg : "Hinglish translation failed. Try again.");
    }
    setHinglishLoading(false);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { setError("Please paste or upload your resume first."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const raw = await callGemini(
        `Analyze this resume:\n\n${resumeText.slice(0, 3000)}`,
        `You are an expert ATS resume analyzer. Return ONLY valid JSON (no markdown, no extra text):
{
  "score": <number 0-100>,
  "summary": "<2 sentence summary>",
  "strengths": ["<s1>", "<s2>", "<s3>"],
  "improvements": ["<i1>", "<i2>", "<i3>"],
  "keywords_missing": ["<k1>", "<k2>", "<k3>", "<k4>"]
}`,
      );
      const data: AnalyzeResult = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult({ type: "analyze", data });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed.";
      setError(
        msg.length < 200
          ? msg
          : "Analysis failed. Check your resume text and try again."
      );
    }
    setLoading(false);
  };

  const handleTailor = async () => {
    if (!resumeText.trim() || !jdText.trim()) { setError("Paste both resume and job description."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const raw = await callGemini(
        `Resume:\n${resumeText.slice(0, 2000)}\n\nJob Description:\n${jdText.slice(0, 1500)}`,
        `You are a resume tailoring expert. Return ONLY valid JSON (no markdown):
{
  "match_score": <number 0-100>,
  "missing_keywords": ["<k1>", "<k2>", "<k3>"],
  "rewritten_summary": "<rewritten professional summary tailored to JD>",
  "tips": ["<tip1>", "<tip2>", "<tip3>"]
}`,
      );
      const data: TailorResult = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult({ type: "tailor", data });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tailoring failed.";
      setError(msg.length < 200 ? msg : "Tailoring failed. Try again.");
    }
    setLoading(false);
  };

  const handleCoverLetter = async () => {
    if (!resumeText.trim() || !jdText.trim()) { setError("Paste both resume and job description."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const text = await callGemini(
        `Write a compelling cover letter.\n\nResume:\n${resumeText.slice(0, 2000)}\n\nJob Description:\n${jdText.slice(0, 1500)}`,
        `You are an expert cover letter writer. Write a professional, personalized cover letter in 3 paragraphs. Be specific, confident, and concise. No placeholders like [Your Name]. Return plain text only.`,
      );
      setResult({ type: "cover", data: text });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cover letter generation failed.";
      setError(msg.length < 200 ? msg : "Cover letter generation failed.");
    }
    setLoading(false);
  };

  const openResumeEditor = () => {
    if (result?.type !== "analyze") return;
    const uid = user?.id;
    if (!uid) return;
    const d = result.data;
    saveEditorPayload(
      buildEditorPayloadFromAnalysis(resumeText, {
        score: d.score,
        summary: d.summary,
        strengths: d.strengths,
        improvements: d.improvements,
        keywords_missing: d.keywords_missing,
      }),
      uid
    );
    router.push("/editor");
  };

  const handleViewDemo = async () => {
    if (result?.type !== "analyze") return;
    setDemoOpen(true);
    if (demoData || demoInFlight.current) return;
    demoInFlight.current = true;
    setDemoLoading(true);
    setDemoErr("");
    try {
      const d = result.data;
      const raw = await callGemini(
        `Resume text:\n${resumeText.slice(0, 3500)}\n\nCurrent analysis JSON:\n${JSON.stringify(d)}`,
        `You are a career coach. Return ONLY valid JSON, no markdown:
{
  "mistakes": ["<concrete weak or wrong thing in the resume 1>", "..."],
  "skill_gaps": ["<skill missing or underrepresented vs target roles 1>", "..."],
  "learn_next": ["<skill or topic to learn to strengthen the resume 1>", "..."],
  "project_ideas": ["<specific project to add so the resume/portfolio looks strong 1>", "..."],
}
Each array: 4–6 concise, actionable bullets. Be specific and honest.`,
      );
      setDemoData(normalizeDemoReport(parseJsonFromGemini(raw)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Demo failed.";
      setDemoErr(msg.length < 220 ? msg : "Could not load demo. Try again.");
    } finally {
      demoInFlight.current = false;
      setDemoLoading(false);
    }
  };

  const addJob = () => {
    if (!newJob.company || !newJob.role) return;
    setJobs((prev) => [
      ...prev,
      { ...newJob, id: Date.now(), date: new Date().toISOString().slice(0, 10), color: "#f97316" },
    ]);
    setNewJob({ company: "", role: "", status: "Applied" });
  };

  const tabLabel = (t: Tab) =>
    t === "Analyze" ? "⚡ Analyze"
    : t === "Tailor" ? "🎯 Tailor"
    : t === "Cover Letter" ? "✉️ Cover Letter"
    : "📋 Tracker";

  const analyzeDisplay =
    result?.type === "analyze"
      ? resultLang === "hinglish" && hinglishAnalyze
        ? hinglishAnalyze
        : result.data
      : null;
  const tailorDisplay =
    result?.type === "tailor"
      ? resultLang === "hinglish" && hinglishTailor
        ? hinglishTailor
        : result.data
      : null;
  const coverDisplay =
    result?.type === "cover"
      ? resultLang === "hinglish" && hinglishCover
        ? hinglishCover
        : result.data
      : null;

  const hi = resultLang === "hinglish";

  return (
    <div className="app-root">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#080b14]/95 px-4 py-3 backdrop-blur-sm">
        <button type="button" className="btn btn-ghost btn-sm text-zinc-400" onClick={onBackToLanding}>
          ← Home
        </button>
        <span className="font-semibold text-white [text-shadow:0_0_12px_rgba(255,255,255,0.4),0_0_24px_rgba(255,255,255,0.12)]">
          ResumeAI
        </span>
        <div className="w-16" aria-hidden />
      </div>

      <div className="app-hero">
        <div className="app-hero-glow" />
        <div className="app-badge">✦ AI-Powered</div>
        <h1 className="app-title">ResumeAI</h1>
        <p className="app-subtitle">Land your dream job with AI-tailored resumes</p>
      </div>

      <div className="app-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            className={activeTab === t ? "app-tab app-tab-active" : "app-tab"}
            onClick={() => { setActiveTab(t); setResult(null); setError(""); }}
          >
            {tabLabel(t)}
          </button>
        ))}
      </div>

      {error && (
        <div className="app-error">
          ⚠️ {error}
        </div>
      )}

      {activeTab === "Analyze" && (
        <div className="fade-up">
          <div className="app-card">
            <div
              className={dragOver ? "app-dropzone app-dropzone-over" : "app-dropzone"}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}
            >
              <div className="app-dropzone-icon">📄</div>
              <div className="app-dropzone-text">
                Drop resume PDF/TXT or{" "}
                <span className="app-dropzone-link">click to upload</span>
              </div>
              <input
                ref={fileRef} type="file" accept=".txt,.pdf"
                className="app-hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            <span className="app-label">Or paste resume text</span>
            <textarea
              className="app-textarea"
              placeholder="Paste your full resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="app-spacer-12" />
            <button className="app-btn" type="button" onClick={handleAnalyze} disabled={loading}>
              {loading ? <LoadingDots /> : "⚡ Analyze Resume"}
            </button>
          </div>

          {result?.type === "analyze" && analyzeDisplay && (
            <div className="fade-up app-result-card">
              <div className="mb-3 flex justify-end">
                <HinglishToggle
                  active={hi}
                  loading={hinglishLoading}
                  onClick={() => void toggleHinglishAnalyze()}
                />
              </div>
              <ScoreRing
                score={analyzeDisplay.score}
                label={hi ? "ATS स्कोर" : "ATS SCORE"}
              />
              <div className="app-spacer-16" />
              <p className="app-summary">{analyzeDisplay.summary}</p>

              <span className="app-label">{hi ? "✅ ताकतें" : "✅ Strengths"}</span>
              {analyzeDisplay.strengths.map((s, i) => (
                <div key={i} className="app-list-item">
                  <div className="app-dot app-dot-green" />
                  <span className="app-text-strength">{s}</span>
                </div>
              ))}

              <div className="app-spacer-16" />
              <span className="app-label">{hi ? "🔧 सुधार" : "🔧 Improvements"}</span>
              {analyzeDisplay.improvements.map((s, i) => (
                <div key={i} className="app-list-item">
                  <div className="app-dot app-dot-amber" />
                  <span className="app-text-improvement">{s}</span>
                </div>
              ))}

              <div className="app-spacer-16" />
              <span className="app-label">{hi ? "🔑 मिसिंग कीवर्ड्स" : "🔑 Missing Keywords"}</span>
              <div>
                {analyzeDisplay.keywords_missing.map((k, i) => (
                  <span key={i} className="app-chip app-chip-red">{k}</span>
                ))}
              </div>

              <div className="app-spacer-16" />
              <button
                type="button"
                className="app-btn w-full"
                onClick={() => void handleViewDemo()}
                disabled={demoLoading}
              >
                {demoLoading ? <LoadingDots /> : "View Demo"}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "Tailor" && (
        <div className="fade-up">
          <div className="app-card">
            <span className="app-label">Your Resume</span>
            <textarea className="app-textarea" placeholder="Paste your resume..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
            <div className="app-spacer-12" />
            <span className="app-label">Job Description</span>
            <textarea className="app-textarea" placeholder="Paste the job description..." value={jdText} onChange={(e) => setJdText(e.target.value)} />
            <div className="app-spacer-12" />
            <button className="app-btn" type="button" onClick={handleTailor} disabled={loading}>
              {loading ? <LoadingDots /> : "🎯 Tailor My Resume"}
            </button>
          </div>

          {result?.type === "tailor" && tailorDisplay && (
            <div className="fade-up app-result-card">
              <div className="mb-3 flex justify-end">
                <HinglishToggle
                  active={hi}
                  loading={hinglishLoading}
                  onClick={() => void toggleHinglishTailor()}
                />
              </div>
              <div className="app-match-block">
                <div className="app-match-label">{hi ? "जॉब मैच" : "JOB MATCH"}</div>
                <div className={`app-match-value ${tailorDisplay.match_score >= 70 ? "app-match-high" : "app-match-mid"}`}>
                  {tailorDisplay.match_score}%
                </div>
              </div>

              <span className="app-label">{hi ? "❌ मिसिंग कीवर्ड्स" : "❌ Missing Keywords"}</span>
              <div className="app-chip-row">
                {tailorDisplay.missing_keywords.map((k, i) => (
                  <span key={i} className="app-chip app-chip-red">{k}</span>
                ))}
              </div>

              <span className="app-label">{hi ? "✍️ रीराइटेड समरी" : "✍️ Rewritten Summary"}</span>
              <div className="app-rewritten-box">
                {tailorDisplay.rewritten_summary}
              </div>

              <span className="app-label">{hi ? "💡 टिप्स" : "💡 Tips"}</span>
              {tailorDisplay.tips.map((t, i) => (
                <div key={i} className="app-list-item">
                  <div className="app-dot app-dot-purple" />
                  <span className="app-text-tip">{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "Cover Letter" && (
        <div className="fade-up">
          <div className="app-card">
            <span className="app-label">Your Resume</span>
            <textarea className="app-textarea" placeholder="Paste your resume..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
            <div className="app-spacer-12" />
            <span className="app-label">Job Description</span>
            <textarea className="app-textarea" placeholder="Paste the job description..." value={jdText} onChange={(e) => setJdText(e.target.value)} />
            <div className="app-spacer-12" />
            <button className="app-btn" type="button" onClick={handleCoverLetter} disabled={loading}>
              {loading ? <LoadingDots /> : "✉️ Generate Cover Letter"}
            </button>
          </div>

          {result?.type === "cover" && coverDisplay && (
            <div className="fade-up app-result-card">
              <div className="app-cover-header flex-wrap gap-2">
                <span className="app-cover-title min-w-0 flex-1">{hi ? "✉️ आपका कवर लेटर" : "✉️ Your Cover Letter"}</span>
                <div className="flex items-center gap-2">
                  <HinglishToggle
                    active={hi}
                    loading={hinglishLoading}
                    onClick={() => void toggleHinglishCover()}
                  />
                  <button
                    type="button"
                    className="app-copy-btn"
                    onClick={() => navigator.clipboard.writeText(coverDisplay)}
                  >
                    {hi ? "कॉपी" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="app-cover-body">{coverDisplay}</div>
            </div>
          )}
        </div>
      )}

      {activeTab === "Tracker" && (
        <div className="fade-up">
          <div className="app-card">
            <span className="app-label">Add Application</span>
            <div className="app-tracker-form-row">
              <input
                className="app-input"
                placeholder="Company"
                value={newJob.company}
                onChange={(e) => setNewJob((p) => ({ ...p, company: e.target.value }))}
              />
              <input
                className="app-input"
                placeholder="Role"
                value={newJob.role}
                onChange={(e) => setNewJob((p) => ({ ...p, role: e.target.value }))}
              />
              <select
                className="app-select"
                value={newJob.status}
                onChange={(e) => setNewJob((p) => ({ ...p, status: e.target.value }))}
              >
                {Object.keys(STATUS_COLORS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button type="button" className="app-btn app-btn-inline" onClick={addJob}>
                + Add
              </button>
            </div>
          </div>

          <div className="app-stats-grid">
            {Object.entries(STATUS_COLORS).map(([status, colors]) => (
              <div
                key={status}
                className="app-stat-card"
                style={{
                  "--stat-bg": colors.bg,
                  "--stat-text": colors.text,
                  "--stat-dot": colors.dot,
                } as CSSProperties}
              >
                <div className="app-stat-value">
                  {jobs.filter((j) => j.status === status).length}
                </div>
                <div className="app-stat-label">
                  {status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          <div className="app-job-list">
            {jobs.map((job) => {
              const sc = STATUS_COLORS[job.status];
              return (
                <div key={job.id} className="app-job-row">
                  <div className="app-job-row-left">
                    <div
                      className="app-job-avatar"
                      style={{ "--job-color": job.color } as CSSProperties}
                    >
                      {job.company[0]}
                    </div>
                    <div>
                      <div className="app-job-title">{job.role}</div>
                      <div className="app-job-meta">{job.company} · {job.date}</div>
                    </div>
                  </div>
                  <span
                    className="app-status-badge"
                    style={{
                      "--badge-bg": sc.bg,
                      "--badge-text": sc.text,
                      "--badge-dot": sc.dot,
                    } as CSSProperties}
                  >
                    {job.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ResumeDemoModal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        loading={demoLoading}
        error={demoErr}
        data={demoData}
        onOpenEditor={openResumeEditor}
      />
    </div>
  );
}
