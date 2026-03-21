import { normalizeResumeText } from "@/lib/formatResumeText";

/**
 * Extract plain text from resume file (txt in browser, PDF via /api/extract-pdf).
 * Output is normalized (OCR noise, bullets, section breaks) for display & analysis.
 */
export async function extractResumeText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type;

  if (type.startsWith("text/") || name.endsWith(".txt")) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(normalizeResumeText(String(r.result ?? "")));
      r.onerror = () => reject(new Error("Could not read file"));
      r.readAsText(file);
    });
  }

  if (type === "application/pdf" || name.endsWith(".pdf")) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/extract-pdf", { method: "POST", body: fd });
    const j = (await res.json()) as { text?: string; error?: string };
    if (!res.ok) throw new Error(j.error ?? "PDF extraction failed");
    return normalizeResumeText(j.text ?? "");
  }

  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(normalizeResumeText(String(r.result ?? "")));
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsText(file);
  });
}
