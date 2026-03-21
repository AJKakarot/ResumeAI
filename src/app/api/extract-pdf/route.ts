import { NextResponse } from "next/server";
import { extractPdfTextWithOcr } from "@/lib/ocr/extractPdfWithOcr";

export const runtime = "nodejs";

const MIN_TEXT_BEFORE_OCR = 60;

export async function POST(req: Request) {
  try {
    const { PDFParse } = await import("pdf-parse");
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
    const msg = e instanceof Error ? e.message : "extract failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
