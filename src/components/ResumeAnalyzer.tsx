"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { CSSProperties } from "react";

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

function ScoreRing({ score }: { score: number }) {
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
        <span className="app-score-label">ATS SCORE</span>
      </div>
    </div>
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

  const callClaude = async (userPrompt: string, systemPrompt: string): Promise<string> => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text ?? "";
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { setError("Please paste or upload your resume first."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const raw = await callClaude(
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
    } catch {
      setError("Analysis failed. Check your resume text and try again.");
    }
    setLoading(false);
  };

  const handleTailor = async () => {
    if (!resumeText.trim() || !jdText.trim()) { setError("Paste both resume and job description."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const raw = await callClaude(
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
    } catch {
      setError("Tailoring failed. Try again.");
    }
    setLoading(false);
  };

  const handleCoverLetter = async () => {
    if (!resumeText.trim() || !jdText.trim()) { setError("Paste both resume and job description."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const text = await callClaude(
        `Write a compelling cover letter.\n\nResume:\n${resumeText.slice(0, 2000)}\n\nJob Description:\n${jdText.slice(0, 1500)}`,
        `You are an expert cover letter writer. Write a professional, personalized cover letter in 3 paragraphs. Be specific, confident, and concise. No placeholders like [Your Name]. Return plain text only.`,
      );
      setResult({ type: "cover", data: text });
    } catch {
      setError("Cover letter generation failed.");
    }
    setLoading(false);
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

          {result?.type === "analyze" && (
            <div className="fade-up app-result-card">
              <ScoreRing score={result.data.score} />
              <div className="app-spacer-16" />
              <p className="app-summary">{result.data.summary}</p>

              <span className="app-label">✅ Strengths</span>
              {result.data.strengths.map((s, i) => (
                <div key={i} className="app-list-item">
                  <div className="app-dot app-dot-green" />
                  <span className="app-text-strength">{s}</span>
                </div>
              ))}

              <div className="app-spacer-16" />
              <span className="app-label">🔧 Improvements</span>
              {result.data.improvements.map((s, i) => (
                <div key={i} className="app-list-item">
                  <div className="app-dot app-dot-amber" />
                  <span className="app-text-improvement">{s}</span>
                </div>
              ))}

              <div className="app-spacer-16" />
              <span className="app-label">🔑 Missing Keywords</span>
              <div>
                {result.data.keywords_missing.map((k, i) => (
                  <span key={i} className="app-chip app-chip-red">{k}</span>
                ))}
              </div>
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

          {result?.type === "tailor" && (
            <div className="fade-up app-result-card">
              <div className="app-match-block">
                <div className="app-match-label">JOB MATCH</div>
                <div className={`app-match-value ${result.data.match_score >= 70 ? "app-match-high" : "app-match-mid"}`}>
                  {result.data.match_score}%
                </div>
              </div>

              <span className="app-label">❌ Missing Keywords</span>
              <div className="app-chip-row">
                {result.data.missing_keywords.map((k, i) => (
                  <span key={i} className="app-chip app-chip-red">{k}</span>
                ))}
              </div>

              <span className="app-label">✍️ Rewritten Summary</span>
              <div className="app-rewritten-box">
                {result.data.rewritten_summary}
              </div>

              <span className="app-label">💡 Tips</span>
              {result.data.tips.map((t, i) => (
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

          {result?.type === "cover" && (
            <div className="fade-up app-result-card">
              <div className="app-cover-header">
                <span className="app-cover-title">✉️ Your Cover Letter</span>
                <button
                  type="button"
                  className="app-copy-btn"
                  onClick={() => navigator.clipboard.writeText(result.data)}
                >
                  Copy
                </button>
              </div>
              <div className="app-cover-body">{result.data}</div>
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
    </div>
  );
}
