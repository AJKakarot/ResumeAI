export function DemoPreviewSection() {
  return (
    <section className="border-t border-white/[0.04] bg-black/30 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">See your dashboard</h2>
          <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">A calm, scannable view of what matters.</p>
        </div>
        <div className="mx-auto mt-8 max-w-4xl sm:mt-10">
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950/80 shadow-[0_0_60px_-20px_rgba(249,115,22,0.25)] ring-1 ring-white/[0.04] sm:rounded-2xl">
            <div className="flex min-w-0 items-center gap-2 border-b border-white/[0.06] bg-white/[0.03] px-3 py-2.5 sm:px-4 sm:py-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-600" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-600" />
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-600" />
              <span className="ml-1 min-w-0 truncate text-[10px] text-zinc-500 sm:ml-3 sm:text-xs">resumeai.app / analysis</span>
            </div>
            <div className="grid gap-4 p-4 sm:gap-6 sm:p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
              <div className="space-y-4">
                <div className="h-3 w-24 rounded bg-zinc-700/80" />
                <div className="h-28 rounded-lg border border-white/[0.06] bg-white/[0.04] p-4">
                  <div className="mx-auto flex h-full max-w-[120px] flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-orange-400">84</div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500">ATS score</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded bg-zinc-800" />
                  <div className="h-2 w-4/5 rounded bg-zinc-800" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-32 rounded bg-zinc-700/80" />
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-white/[0.03] p-3">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-orange-500/70" />
                    <div className="flex-1 space-y-2">
                      <div className="h-2 w-full rounded bg-zinc-800" />
                      <div className="h-2 w-5/6 rounded bg-zinc-800/80" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
