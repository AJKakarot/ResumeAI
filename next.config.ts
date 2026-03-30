import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse / pdfjs break when webpack bundles them (Object.defineProperty on non-object)
  serverExternalPackages: [
    "pdf-parse",
    "pdfjs-dist",
    "@napi-rs/canvas",
    "canvas",
    "tesseract.js",
  ],
  /** Ensure pdf.worker is present in the serverless bundle when not using CDN fallback */
  outputFileTracingIncludes: {
    "/api/extract-pdf": ["./node_modules/pdfjs-dist/legacy/build/**/*"],
  },
};

export default nextConfig;
