"use client";

import { useState, useCallback } from "react";
import LandingPage from "@/components/LandingPage";
import { ResumeAnalyzer } from "@/components/ResumeAnalyzer";

export function HomeClient() {
  const [view, setView] = useState<"landing" | "app">("landing");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const goApp = useCallback(() => setView("app"), []);
  const goLanding = useCallback(() => {
    setView("landing");
    setPendingFile(null);
  }, []);

  const clearPending = useCallback(() => setPendingFile(null), []);

  if (view === "landing") {
    return (
      <LandingPage
        onDemo={goApp}
        onFileSelected={(file) => {
          setPendingFile(file);
          setView("app");
        }}
      />
    );
  }

  return (
    <ResumeAnalyzer
      onBackToLanding={goLanding}
      pendingFile={pendingFile}
      onPendingFileConsumed={clearPending}
    />
  );
}
