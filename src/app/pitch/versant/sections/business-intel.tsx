/**
 * "The Read" — homework, shrunk to a single producer's-notebook page.
 *
 * No EBITDA, no buyback, no dividend, no margin language. Three notes
 * about what Versant actually needs made, sourced from public filings
 * and investor signal — but written from the production side.
 */

export function BusinessIntel() {
  return (
    <section className="border-b border-white/[0.06] bg-[#0a0a0a] px-6 py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-baseline justify-between text-[10px] uppercase tracking-[0.3em] text-white/35">
          <span>06 — The Read</span>
          <span className="font-mono normal-case tracking-normal text-white/25">
            producer&apos;s notebook, not analyst note
          </span>
        </div>

        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          {/* Sticky heading column */}
          <div className="md:sticky md:top-24 md:self-start">
            <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] font-normal leading-[1.05] tracking-tight-2 text-white">
              The read from
              <br />
              the production side.
            </h2>
            <p className="mt-5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-white/40">
              Sources · investor day · public filings · Variety · LBB
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-8 text-[15px] leading-[1.7] text-white/75">
            <Note
              n="i"
              heading="Golf is central, not adjacent."
              body={
                <>
                  Golf Channel ran 2,000+ live coverage hours across 200+
                  events last year — roughly 35% of every hour anyone watched
                  golf, anywhere. USGA rights run through 2032; PGA of America
                  and Ryder Cup through 2033. GolfNow moves 40 million tee
                  times across 9,000 courses. Rory anchors GolfPass through
                  2038. Firethorn is making originals. None of that gets
                  built without a defining film register.
                </>
              }
            />
            <Note
              n="ii"
              heading="USA Sports is a brand that needs a voice."
              body={
                <>
                  The umbrella was named in late 2025. The 10,000+ hours of
                  programming for 2026 across USA Network, Golf Channel, and
                  CNBC is now an inventory question, not a strategy question.
                  The opens, identity films, and promo system are open ground.
                  We&apos;d like to be in the room while the register is set.
                </>
              }
            />
            <Note
              n="iii"
              heading="The vendor map is being drawn."
              body={
                <>
                  Six months in, the production roster isn&apos;t hardened.
                  The hires Versant makes between now and the end of the year
                  define who gets the long-tail work for the rest of the
                  rights cycle. We&apos;d like to be added before the queue
                  forms.
                </>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Note({
  n,
  heading,
  body,
}: {
  n: string;
  heading: string;
  body: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[2.5rem_1fr] gap-x-4">
      <span className="pt-1 font-serif text-[1.1rem] italic leading-none text-[#c9a961]">
        {n}.
      </span>
      <div>
        <h3 className="mb-2 text-[16.5px] font-light tracking-tight text-white">
          {heading}
        </h3>
        <p>{body}</p>
      </div>
    </div>
  );
}
