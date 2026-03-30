"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { brandToast } from "@/lib/toast";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandaloneDisplay() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

export function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const ios = useMemo(() => isIosDevice(), []);

  useEffect(() => {
    setIsStandalone(isStandaloneDisplay());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      setPromptEvent(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canShow = !isStandalone && (Boolean(promptEvent) || ios);
  if (!canShow) return null;

  async function onInstallClick() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setPromptEvent(null);
      return;
    }

    brandToast("On iPhone: tap Share and choose 'Add to Home Screen'.");
  }

  return (
    <button
      type="button"
      onClick={() => {
        void onInstallClick();
      }}
      className={cn(
        "fixed bottom-4 right-4 z-[70] rounded-xl border border-orange-300/35 bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 active:scale-[0.98]"
      )}
      aria-label="Install ResumeAI app"
    >
      Install App
    </button>
  );
}
