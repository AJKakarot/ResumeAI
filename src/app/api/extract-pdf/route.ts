import { NextResponse } from "next/server";
import { extractPdfTextWithOcr } from "@/lib/ocr/extractPdfWithOcr";
import { getPdfJsWorkerPath } from "@/lib/pdfjsWorkerPath";

export const runtime = "nodejs";

/** Vercel/serverless: allow PDF + optional OCR to finish (default is often 10s). */
export const maxDuration = 60;

const MIN_TEXT_BEFORE_OCR = 60;

export async function POST(req: Request) {
  try {
    const { PDFParse } = await import("pdf-parse");
    PDFParse.setWorker(getPdfJsWorkerPath());
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    let text = "";
    try {
      const textResult = await parser.getText();
      text = typeof textResult.text === "string" ? textResult.text : "";
    } finally {
      await parser.destroy();
    }

    let ocrUsed = false;
    if (text.trim().length < MIN_TEXT_BEFORE_OCR) {
      const ocrText = await extractPdfTextWithOcr(buf);
      if (ocrText.trim().length > text.trim().length) {
        text = ocrText;
        ocrUsed = true;
      }
    }

    return NextResponse.json({ text, ocrUsed });
  } catch (e) {
    console.error("[api/extract-pdf]", e);
    const msg = e instanceof Error ? e.message : "extract failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
