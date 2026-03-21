export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-3 py-12 sm:px-4 sm:py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">How it works</h2>
        <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">Three steps. No learning curve.</p>
      </div>
      <div className="mt-10 flex flex-col gap-6 sm:mt-12 md:flex-row md:items-stretch md:justify-between md:gap-6">
        {[
          { step: "1", title: "Upload Resume", body: "PDF or DOCX—drag in or pick from your device." },
          { step: "2", title: "AI Analysis", body: "We parse structure, keywords, and role fit signals." },
          { step: "3", title: "Get Score & Suggestions", body: "See your score and prioritized improvements." },
        ].map((item) => (
          <div
            key={item.step}
            className="relative flex flex-1 flex-col rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 text-center sm:p-6 md:text-left"
          >
            <span className="mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-500/30 bg-orange-500/10 text-sm font-bold text-orange-400 md:mx-0">
              {item.step}
            </span>
            <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
