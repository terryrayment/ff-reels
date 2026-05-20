/**
 * F&F company card — who we are, who reps us, what we bring beyond the reel.
 * Brief-agnostic — pitches the partnership, not any single job.
 */

export function FFCompanyCard() {
  return (
    <section className="border-b border-white/[0.06] bg-[#111] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
          Who Friends &amp; Family actually is
        </p>
        <h2 className="mb-12 text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-[1.15] tracking-tight-2 text-white">
          A director-led shop with talent access, integrated post,{" "}
          <span className="text-white/60">
            and a founder who picks up the phone.
          </span>
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Pillar
            heading="Talent access — Gunder Kehoe, CCCo. partner"
            body={
              <>
                Twenty years managing Hollywood directors and actors before
                pivoting to advertising in 2020. When the brief calls for a
                recognizable on-screen face — athlete, actor, artist —
                Gunder is one of the very few people in the business who can
                credibly bring candidates that most production companies
                can&apos;t reach in the window you need.
              </>
            }
          />
          <Pillar
            heading="Integrated post — CCCo. roster"
            body={
              <>
                One-rep, one-call packaging across Union Editorial, Brand New
                School, Laundry, Elevado, New Math. The cut, the design
                system, and the finishing pipeline arrive from a single
                seam — not three vendor onboarding cycles. That matters when
                the season schedule is tight.
              </>
            }
          />
          <Pillar
            heading="Rep coverage"
            body={
              <>
                Talk Shop in NYC (Katie Northy + Kenard Jackson). CCCo. in
                the Midwest with a West Coast partner (Chiara Chung + Gunder
                Kehoe). The relationship work happens between bids;
                that&apos;s how we earn the next conversation.
              </>
            }
          />
          <Pillar
            heading="Founder posture"
            body={
              <>
                Terry Rayment is reachable. Terry shows up to pre-pro. Terry
                is on the phone by 4&nbsp;p.m. if something goes sideways at
                2&nbsp;p.m. The pitch deck commits the founder; the
                production delivers him.
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}

function Pillar({ heading, body }: { heading: string; body: React.ReactNode }) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-white/[0.02] p-6">
      <h3 className="mb-3 text-[15px] font-light leading-snug tracking-tight text-white">
        {heading}
      </h3>
      <p className="text-[13px] leading-relaxed text-white/65">{body}</p>
    </div>
  );
}
