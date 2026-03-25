import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildCareerAdvisorPrompt, parseGeminiCareerGuideJson } from "@/lib/careerGuideGemini";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import {
  checkGeminiRateLimit,
  estimateGeminiTokensFromChars,
  geminiRateLimitJsonResponse,
  getClientIp,
} from "@/lib/geminiRateLimit";
import { friendlyGeminiErrorMessage, httpStatusForGeminiFailure, isGeminiQuotaOrRateLimitError } from "@/lib/geminiClientError";
import { resolveGeminiModel } from "@/lib/geminiDefaultModel";

const MAX_SKILLS_CHARS = 4_000;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it to .env.local (see .env.example)." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const skills =
    typeof (body as { skills?: unknown }).skills === "string"
      ? (body as { skills: string }).skills.trim()
      : "";

  if (!skills) {
    return NextResponse.json({ error: "skills is required (comma-separated list)." }, { status: 400 });
  }

  const skillsTruncated = skills.slice(0, MAX_SKILLS_CHARS);
  const userPrompt = buildCareerAdvisorPrompt(skillsTruncated);

  const { userId } = await auth();
  const clerkUser = userId ? await currentUser() : null;
  const meta = (clerkUser?.publicMetadata ?? undefined) as Record<string, unknown> | undefined;
  const isPro = Boolean(userId && isPremiumPublicMetadata(meta));
  const ip = getClientIp(req);
  const rl = checkGeminiRateLimit({
    userId: userId ?? null,
    clientIp: ip,
    isPro,
    estimatedTokens: estimateGeminiTokensFromChars(userPrompt.length, 400),
  });
  if (!rl.ok) return geminiRateLimitJsonResponse(rl);

  const modelName = resolveGeminiModel(process.env.GEMINI_MODEL);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Empty response from Gemini. Try again or check GEMINI_MODEL." },
        { status: 502 }
      );
    }

    const guide = parseGeminiCareerGuideJson(text);
    return NextResponse.json({ guide, skillsUsed: skillsTruncated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Career guide generation failed";
    console.error("[career-guide]", message);
    const status = httpStatusForGeminiFailure(message);
    return NextResponse.json(
      {
        error: friendlyGeminiErrorMessage(message),
        code: isGeminiQuotaOrRateLimitError(message) ? "GEMINI_QUOTA" : "GEMINI_ERROR",
      },
      { status }
    );
  }
}
