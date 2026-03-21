"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EditorTabs, type EditorTabId } from "@/components/editor/EditorTabs";
import { cn } from "@/lib/cn";

type EditorNavbarProps = {
  activeTab: EditorTabId;
  onTabChange: (id: EditorTabId) => void;
  roastMode: boolean;
  onRoastModeChange: (next: boolean) => void;
};

function RoastToggle({
  roastMode,
  onRoastModeChange,
}: {
  roastMode: boolean;
  onRoastModeChange: (next: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 transition-all hover:border-orange-500/25 sm:gap-2 sm:px-3 sm:py-2">
      <span className="hidden text-[11px] font-medium text-zinc-400 sm:inline">Roast</span>
      <span className="text-xs sm:text-sm" aria-hidden>
        🔥
      </span>
      <input
        type="checkbox"
        className="toggle toggle-sm toggle-primary border-orange-500/40 bg-zinc-800 [--tglbg:var(--color-zinc-700)]"
        checked={roastMode}
        onChange={(e) => onRoastModeChange(e.target.checked)}
      />
    </label>
  );
}

export function EditorNavbar({ activeTab, onTabChange, roastMode, onRoastModeChange }: EditorNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerClass = cn(
    "sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-md transition-all duration-300 ease-out",
    scrolled ? "bg-black/70 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]" : "bg-black/60"
  );

  return (
    <header id="editor-navbar" className={headerClass}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 md:px-6 md:py-3">
        <Link
          className="resume-ai-logo-static shrink-0 text-base font-semibold tracking-tight text-white transition-transform duration-300 ease-out hover:scale-[1.02] sm:text-lg"
          href="/"
        >
          ResumeAI
        </Link>

        <nav
          className="flex min-w-0 flex-1 justify-center overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Editor views"
        >
          <EditorTabs active={activeTab} onChange={onTabChange} variant="navbar" />
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end">
          <RoastToggle roastMode={roastMode} onRoastModeChange={onRoastModeChange} />
        </div>
      </div>
    </header>
  );
}
