/**
 * F&F company card — who we are, who reps us, what we bring beyond the reel.
 * The Gunder/CCCo. talent-access angle is the headline; the celebrity Professor
 * is "TBC" in the brief, and Gunder is uniquely positioned to attach one.
 */

export function FFCompanyCard() {
  return (
    <section className="border-b border-white/10 bg-[#111] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/40">
          Who Friends &amp; Family actually is
        </p>
        <h2 className="mb-12 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-white">
          A director-led shop with talent access, integrated post, and a
          founder who picks up the phone.
        </h2>

        <div className="grid gap-8 md:grid-cols-2">
          <Pillar
            heading="Talent access (Gunder Kehoe, CCCo. partner)"
            body={
              <>
                Twenty years managing Hollywood directors and actors before
                pivoting to advertising. The Professor in your brief is
                marked TBC. Gunder is one of the very few people in the
                business who can credibly bring celebrity candidates that
                most production companies can&apos;t reach in this timeline.
                That changes who you can cast — and who walks on set in
                June.
              </>
            }
          />
          <Pillar
            heading="Integrated post (CCCo. roster)"
            body={
              <>
                One-rep, one-call packaging across Union Editorial, Brand
                New School, Laundry, Elevado, New Math. That means the cut,
                the design system for the chalkboard graphics, and the
                week-to-week topical pipeline come from a single seam — not
                three vendor onboarding cycles.
              </>
            }
          />
          <Pillar
            heading="Rep coverage"
            body={
              <>
                Talk Shop in NYC (Katie Northy + Kenard Jackson). CCCo. in
                the Midwest with a West Coast partner (Chiara Chung +
                Gunder Kehoe). The relationship work happens between
                bids; that&apos;s how we earn the next conversation.
              </>
            }
          />
          <Pillar
            heading="Founder posture"
            body={
              <>
                Terry Rayment is reachable. Terry shows up to pre-pro.
                Terry is on the phone by 4&nbsp;p.m. if something goes
                sideways at 2&nbsp;p.m. The pitch deck commits the
                founder; the production delivers him.
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
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-8">
      <h3 className="mb-3 font-serif text-xl leading-tight text-white">
        {heading}
      </h3>
      <p className="text-sm leading-relaxed text-white/70">{body}</p>
    </div>
  );
}
