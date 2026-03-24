import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const MAX_USER_CHARS = 14_000;
const MAX_SYSTEM_CHARS = 6_000;

/**
 * Server-only Gemini proxy — keeps GEMINI_API_KEY off the client.
 * Used by `fetchResumeInsights` (resume analyzing flow) and similar callers.
 */
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

  const { userPrompt, systemPrompt } = body as {
    userPrompt?: unknown;
    systemPrompt?: unknown;
  };

  if (typeof userPrompt !== "string" || !userPrompt.trim()) {
    return NextResponse.json({ error: "userPrompt is required" }, { status: 400 });
  }

  const user = userPrompt.slice(0, MAX_USER_CHARS);
  const system =
    typeof systemPrompt === "string" && systemPrompt.trim()
      ? systemPrompt.slice(0, MAX_SYSTEM_CHARS)
      : undefined;

  const modelName =
    process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      ...(system ? { systemInstruction: system } : {}),
    });

    const result = await model.generateContent(user);
    const text = result.response.text();

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "Empty response from Gemini. Try again or check GEMINI_MODEL." },
        { status: 502 }
      );
    }

    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gemini request failed";
    console.error("[gemini]", message);
    return NextResponse.json(
      { error: message.slice(0, 500) },
      { status: 502 }
    );
  }
}
