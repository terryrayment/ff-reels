/**
 * Golf Channel section — the strategic differentiator.
 * Reels-platform design language: Inter sans, light weights, small labels.
 */

export function GolfTab() {
  return (
    <section className="border-b border-white/[0.06] bg-[#0e1410] px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-emerald-300/60">
          Why we&apos;re really here
        </p>
        <h2 className="mb-10 text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-[1.15] tracking-tight-2 text-white">
          Golf Channel is the most under-served brand opportunity inside
          USA&nbsp;Sports.
        </h2>

        <div className="space-y-5 text-[15px] leading-relaxed tracking-tight text-white/70">
          <p>
            We don&apos;t have a thick golf reel. Most production companies
            pitching Versant won&apos;t either. Here&apos;s what we do have: a
            director-led shop that understands the audience, the cadence, and
            what the brand is for.
          </p>

          <ul className="my-8 space-y-5 border-l border-emerald-400/20 pl-6">
            <li>
              <span className="text-white">The rights horizon is long.</span>{" "}
              NBCUniversal extended USGA media rights through 2032. PGA Tour
              partnerships sit alongside. That&apos;s a decade of premium
              storytelling pipeline.
            </li>
            <li>
              <span className="text-white">The audience is your most
              valuable.</span> Golf Channel viewers index high on discretionary
              spend, brand affinity, and time-on-property. That&apos;s where
              prestige creative belongs, not just tune-in promos.
            </li>
            <li>
              <span className="text-white">The brand voice is open
              ground.</span> Golf Channel doesn&apos;t yet have a defining brand
              film for the USA Sports era. The first one written and shot well
              sets the register for the next five years.
            </li>
            <li>
              <span className="text-white">The crossover is real.</span> USA
              Sports as an umbrella means motorsport, golf, women&apos;s
              basketball, and tentpole entertainment all live under one
              marketing budget now. A partner who can move between those
              worlds is more valuable than a specialist in any single one.
            </li>
          </ul>

          <p>
            We&apos;d like to be Versant&apos;s partner across the portfolio.
            Golf Channel is where the conversation should start.
          </p>
        </div>
      </div>
    </section>
  );
}
