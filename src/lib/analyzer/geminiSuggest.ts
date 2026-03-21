import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalyzeResult } from "./analyzeResume";

const MAX_RESUME = 5_000;
const MAX_JD = 4_000;

/**
 * Optional Gemini pass: turns rule output + resume + JD into extra actionable lines.
 * Returns null if no API key or on failure.
 */
export async function enhanceAnalyzeWithGemini(
  base: AnalyzeResult,
  resumeText: string,
  jobTitle: string,
  jobDescription: string
): Promise<string[] | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;

  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

  const userPrompt = `RULE_BASED_JSON:
${JSON.stringify({
  score: base.score,
  category: base.category,
  matchedSkills: base.matchedSkills,
  missingSkills: base.missingSkills,
  weaknesses: base.weaknesses,
  jdMissingKeywords: base.jdMissingKeywords ?? [],
})}

JOB_TITLE:
${jobTitle || "(not provided)"}

JOB_DESCRIPTION:
${(jobDescription || "(not provided)").slice(0, MAX_JD)}

RESUME_TEXT:
${resumeText.slice(0, MAX_RESUME)}

Return ONLY valid JSON: {"suggestions": string[]}
Use 4–7 short, actionable strings. No markdown. Each string is one concrete resume fix (wording, section, or JD alignment). Do not repeat the rule suggestions verbatim; add new angles.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction:
        "You are a concise resume coach. Output valid JSON only. No code fences.",
    });
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    const parsed = JSON.parse(
      text.replace(/```json\s*/gi, "").replace(/```\s*$/g, "").trim()
    ) as { suggestions?: unknown };

    if (!Array.isArray(parsed.suggestions)) return null;
    const out = parsed.suggestions
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((s) => s.trim())
      .slice(0, 8);
    return out.length ? out : null;
  } catch {
    return null;
  }
}
