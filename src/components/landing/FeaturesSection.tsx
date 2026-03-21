import { LANDING_FEATURES } from "@/data/features";

export function FeaturesSection() {
  return (
    <section className="border-t border-white/[0.04] bg-black/40 py-8 sm:py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
            Everything you need
          </h1>
          <p className="mt-2 text-xs text-zinc-400 sm:mt-3 sm:text-sm md:text-base">
            Focused tools—no clutter. Built for serious job seekers.
          </p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:mt-10 lg:grid-cols-3">
          {LANDING_FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.05] p-3 transition-all duration-300 hover:border-orange-500/25 hover:bg-white/[0.07] hover:shadow-[0_0_40px_-12px_rgba(249,115,22,0.2)] sm:p-5"
            >
              <div className="text-xl sm:text-2xl" aria-hidden>
                {f.icon}
              </div>
              <h2 className="mt-2 text-sm font-semibold text-white sm:mt-3 sm:text-base md:text-lg">{f.title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 sm:mt-2 sm:text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
