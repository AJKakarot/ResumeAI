type PricingSectionProps = {
  onPickFile?: () => void;
  onPro?: () => void;
};

export function PricingSection({ onPickFile, onPro }: PricingSectionProps) {
  return (
    <section className="border-t border-white/[0.04] py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">Simple pricing</h1>
          <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
            Start free. Upgrade when you&apos;re ready to move faster.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 transition-all duration-300 hover:border-white/[0.12] sm:p-8">
            <h2 className="text-lg font-semibold text-white">Free</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              $0<span className="text-base font-normal text-zinc-500">/mo</span>
            </p>
            <ul className="mt-8 flex flex-col gap-3 text-sm text-zinc-400">
              <li className="flex gap-2">
                <span className="text-orange-500/90">✓</span> 3 analyses / month
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500/90">✓</span> ATS score & summary
              </li>
              <li className="flex gap-2">
                <span className="text-orange-500/90">✓</span> Basic suggestions
              </li>
            </ul>
            <button
              type="button"
              className="btn btn-outline mt-8 min-h-[48px] w-full rounded-xl border-white/15 transition-all duration-300 hover:border-orange-500/40 hover:bg-orange-500/[0.08] sm:mt-10"
              onClick={onPickFile}
            >
              Get started
            </button>
          </div>

          <div className="relative flex flex-col rounded-2xl border border-orange-500/40 bg-gradient-to-b from-orange-500/[0.08] to-transparent p-6 shadow-[0_0_50px_-18px_rgba(249,115,22,0.35)] transition-all duration-300 hover:border-orange-400/55 sm:p-8">
            <span className="badge badge-primary badge-sm mb-2 w-fit">Popular</span>
            <h2 className="text-lg font-semibold text-white">Pro</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              $12<span className="text-base font-normal text-zinc-500">/mo</span>
            </p>
            <ul className="mt-8 flex flex-col gap-3 text-sm text-zinc-300">
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Unlimited analyses
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Deep keyword & role fit
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Rewrite blocks & export
              </li>
              <li className="flex gap-2">
                <span className="text-orange-400">✓</span> Priority processing
              </li>
            </ul>
            <button type="button" className="btn btn-primary mt-8 min-h-[48px] w-full rounded-xl sm:mt-10" onClick={onPro}>
              Go Pro
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
