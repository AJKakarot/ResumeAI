import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { analyzeResume } from "@/lib/analyzer/analyzeResume";
import { enhanceAnalyzeWithGemini } from "@/lib/analyzer/geminiSuggest";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";

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

  let result = analyzeResume(text, { jobTitle, jobDescription });

  if (wantGemini) {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in required for Gemini polish.", code: "GEMINI_AUTH" },
        { status: 401 }
      );
    }
    const user = await currentUser();
    const meta = (user?.publicMetadata ?? undefined) as Record<string, unknown> | undefined;
    if (!isPremiumPublicMetadata(meta)) {
      return NextResponse.json(
        {
          error: "Gemini polish is available on Pro. Upgrade or contact support.",
          code: "GEMINI_PREMIUM_REQUIRED",
        },
        { status: 403 }
      );
    }
    const ai = await enhanceAnalyzeWithGemini(result, text, jobTitle, jobDescription);
    if (ai?.length) {
      result = {
        ...result,
        aiSuggestions: ai,
        scanMode: "rule+gemini",
      };
    }
  }

  return NextResponse.json(result);
}
