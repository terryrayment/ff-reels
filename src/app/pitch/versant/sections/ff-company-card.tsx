/**
 * F&F company card — who we are, who reps us, what we bring beyond the reel.
 * Brief-agnostic. Asymmetric layout for visual rhythm vs. the symmetrical
 * stat grid above.
 */

export function FFCompanyCard() {
  return (
    <section className="border-b border-white/[0.06] bg-[#111] px-6 py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-baseline justify-between gap-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
            05 — Who we actually are
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            The small print, in normal-sized print
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div className="md:sticky md:top-24 md:self-start">
            <h2 className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-[1.1] tracking-tight-2 text-white">
              Director-led.
              <br />
              <span className="text-white/55">Talent-attached.</span>
              <br />
              <span className="text-white/35">Founder picks up.</span>
            </h2>
            <p className="mt-6 text-[13px] leading-relaxed text-white/60">
              Four reasons to put us in your phone now and not later.
            </p>
          </div>

          <div className="space-y-4">
            <Pillar
              number="01"
              heading="A talent guy hiding inside a production company"
              body={
                <>
                  Gunder Kehoe — our partner at CCCo. — spent twenty years
                  managing actors and directors in Hollywood before pivoting
                  to advertising. If the brief calls for a face, he can get a
                  name on the phone faster than CAA can find your email.
                  That&apos;s a competitive advantage we did not invent
                  ourselves. It just happens to live on our roster.
                </>
              }
            />
            <Pillar
              number="02"
              heading="Post that already speaks to itself"
              body={
                <>
                  CCCo. also reps Union Editorial, Brand New School, Laundry,
                  Elevado, New Math. One rep. One call. The cut, the design
                  system, the finishing — all under the same roof. No three
                  vendor onboarding cycles eating your timeline.
                </>
              }
            />
            <Pillar
              number="03"
              heading="Coast-to-coast representation"
              body={
                <>
                  Talk Shop in NYC (Katie Northy + Kenard Jackson). CCCo. in
                  Chicago and LA (Chiara Chung + Gunder Kehoe). The
                  relationship work happens in the months between bids.
                  That&apos;s how the next conversation gets earned.
                </>
              }
            />
            <Pillar
              number="04"
              heading="The founder is annoyingly available"
              body={
                <>
                  Terry shows up to pre-pro. Terry is on the phone by
                  4&nbsp;p.m. if something is on fire at 2&nbsp;p.m. The
                  pitch deck promises the founder; the production delivers
                  him. He may also bring snacks.
                </>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Pillar({
  number,
  heading,
  body,
}: {
  number: string;
  heading: string;
  body: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-6 transition hover:bg-white/[0.04]">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-light leading-snug tracking-tight text-white">
          {heading}
        </h3>
        <span className="shrink-0 text-[10px] tabular-nums uppercase tracking-[0.2em] text-white/30">
          {number}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-white/65">{body}</p>
    </div>
  );
}
