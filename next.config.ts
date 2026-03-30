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
};

export default nextConfig;
