import type { Metadata } from "next";
import { PostAnalysisEditorClient } from "@/components/editor/PostAnalysisEditorClient";

export const metadata: Metadata = {
  title: "Resume editor · ResumeAI",
  description: "Edit your resume with AI suggestions.",
};

export default function EditorPage() {
  return <PostAnalysisEditorClient />;
}
