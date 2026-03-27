import { GoogleGenerativeAI } from "@google/generative-ai";
import { resolveGeminiModel } from "@/lib/geminiDefaultModel";

/** Server-only Gemini text generation (Pro tier). */
export async function geminiGenerateText(opts: {
  systemInstruction?: string;
  userPrompt: string;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const modelName = resolveGeminiModel(process.env.GEMINI_MODEL);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    ...(opts.systemInstruction?.trim() ? { systemInstruction: opts.systemInstruction.trim() } : {}),
  });

  const result = await model.generateContent(opts.userPrompt);
  const text = result.response.text();
  return text?.trim() ?? "";
}
