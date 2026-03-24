import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { buildAtsGeminiUserPrompt, parseAtsGeminiJson } from "@/lib/atsGeminiReport";
import { isPremiumPublicMetadata } from "@/lib/clerkPremium";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Add it to .env.local." },
      { status: 503 }
    );
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in required.", code: "AUTH" }, { status: 401 });
  }

  const user = await currentUser();
  const meta = (user?.publicMetadata ?? undefined) as Record<string, unknown> | undefined;
  if (!isPremiumPublicMetadata(meta)) {
    return NextResponse.json(
      { error: "Gemini ATS report requires a paid plan.", code: "PRO_REQUIRED" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof (body as { text?: unknown }).text === "string" ? (body as { text: string }).text.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const userPrompt = buildAtsGeminiUserPrompt(text);
  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction:
        "Follow the user's instructions exactly. Respond with valid JSON only—no markdown fences or text outside the JSON object.",
    });
    const result = await model.generateContent(userPrompt);
    const raw = result.response.text();
    if (!raw?.trim()) {
      return NextResponse.json({ error: "Empty response from Gemini." }, { status: 502 });
    }
    const report = parseAtsGeminiJson(raw);
    return NextResponse.json({ report });
  } catch (e) {
    const message = e instanceof Error ? e.message : "ATS Gemini request failed";
    console.error("[ats-gemini]", message);
    return NextResponse.json({ error: message.slice(0, 500) }, { status: 502 });
  }
}
