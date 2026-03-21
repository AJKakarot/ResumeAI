/** Single soft hero glow — pairs with gradient shell in MarketingShell */
export function LandingBackground() {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[10%] z-0 h-[min(440px,92vw)] w-[min(440px,92vw)] -translate-x-1/2 rounded-full bg-orange-500/[0.07] blur-[120px]"
      aria-hidden
    />
  );
}
