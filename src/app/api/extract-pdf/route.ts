import { NextResponse } from "next/server";
import { extractPdfTextWithOcr } from "@/lib/ocr/extractPdfWithOcr";

export const runtime = "nodejs";

/** Vercel/serverless: allow PDF + optional OCR to finish (default is often 10s). */
export const maxDuration = 60;

const MIN_TEXT_BEFORE_OCR = 60;

async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  // Disable worker: Vercel serverless can't spawn Worker threads reliably.
  if (typeof pdfjs.GlobalWorkerOptions !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = "";
  }

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true,
    useWorkerFetch: false,
    useSystemFonts: false,
    isOffscreenCanvasSupported: false,
    isImageDecoderSupported: false,
    disableAutoFetch: true,
    disableStream: true,
  });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const line = content.items
        .map((item) => ("str" in item ? String(item.str ?? "") : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (line) pages.push(line);
      page.cleanup();
    }
  } finally {
    await pdf.destroy();
  }

  return pages.join("\n\n").trim();
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    // Support requested key "pdf" and backward-compatible "file".
    const file = formData.get("pdf") ?? formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "pdf/file required" }, { status: 400 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    let text = await extractPdfText(buf);

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
