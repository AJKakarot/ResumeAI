import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { analyzeResume } from "@/lib/analyzer/analyzeResume";
import { applyFreeTierSummary, withProTier } from "@/lib/analyzer/tieredAnalysis";
import { enhanceAnalyzeWithGemini } from "@/lib/analyzer/geminiSuggest";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";
import {
  checkGeminiRateLimit,
  estimateGeminiTokensFromChars,
  geminiRateLimitJsonResponse,
  getClientIp,
} from "@/lib/geminiRateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as {
    text?: unknown;
    jobTitle?: unknown;
    jobDescription?: unknown;
    enhanceWithGemini?: unknown;
  };

  const text = typeof b.text === "string" ? b.text : "";
  if (!text.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const jobTitle = typeof b.jobTitle === "string" ? b.jobTitle : "";
  const jobDescription = typeof b.jobDescription === "string" ? b.jobDescription : "";
  const wantGemini = Boolean(b.enhanceWithGemini);

  const { userId } = await auth();
  const user = userId ? await currentUser() : null;
  const meta = (user?.publicMetadata ?? undefined) as Record<string, unknown> | undefined;
  const isPro = Boolean(userId && isPremiumPublicMetadata(meta));

  let result = analyzeResume(text, { jobTitle, jobDescription });

  if (wantGemini) {
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in required for Gemini polish.", code: "GEMINI_AUTH" },
        { status: 401 }
      );
    }
    if (!isPro) {
      return NextResponse.json(
        {
          error: "Gemini polish requires a paid plan. Upgrade or contact support.",
          code: "GEMINI_PREMIUM_REQUIRED",
        },
        { status: 403 }
      );
    }
    const ip = getClientIp(req);
    const rl = checkGeminiRateLimit({
      userId,
      clientIp: ip,
      isPro: true,
      estimatedTokens: estimateGeminiTokensFromChars(
        text.length + jobTitle.length + jobDescription.length + JSON.stringify(result).length,
        1200
      ),
    });
    if (!rl.ok) return geminiRateLimitJsonResponse(rl);

    const ai = await enhanceAnalyzeWithGemini(result, text, jobTitle, jobDescription);
    if (ai?.length) {
      result = {
        ...result,
        aiSuggestions: ai,
        scanMode: "rule+gemini",
      };
    }
  }

  if (!isPro) {
    result = applyFreeTierSummary(result);
  } else {
    result = withProTier(result);
  }

  return NextResponse.json(result);
}
