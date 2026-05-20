/**
 * Professor Chase creative response — the answer to the brief.
 *
 * Two halves:
 *  1. A link to the curated reel (the multi-director carousel at /s/<token>)
 *  2. A summary of the treatment thesis with a download/view link to the PDF
 */

import Link from "next/link";
import { ArrowUpRight, Film, FileText } from "lucide-react";

interface Props {
  /** Token of the screening link the recipient is viewing this pitch through.
   *  Used to deep-link them into the same reel without losing personalization. */
  reelScreeningToken?: string | null;
  /** Token of the treatment PDF on Terry's director profile. */
  treatmentToken?: string | null;
}

export function BriefAnswer({ reelScreeningToken, treatmentToken }: Props) {
  return (
    <section className="border-b border-white/10 bg-[#0c0c0c] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/40">
          Professor Chase — our answer to the brief
        </p>
        <h2 className="mb-10 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-white">
          A classroom built once. A system that runs for seven weeks.
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <PitchCard
            icon={<Film className="h-5 w-5" />}
            eyebrow="The reel"
            heading="Five to seven pieces that prove the register"
            body="Ensemble comedy with real stakes. Cinematic talent direction. The closest-match-to-Professor-Chase work across our roster, with a short curatorial note on each spot explaining why."
            href={reelScreeningToken ? `/s/${reelScreeningToken}` : null}
            ctaLabel="Watch the reel"
          />
          <PitchCard
            icon={<FileText className="h-5 w-5" />}
            eyebrow="The treatment"
            heading="12-page production response"
            body="Director's vision. Classroom set lookbook. Two-day shoot logic for drivers + celebrity. Green-screen contingency. The modular weekly-topical system that lets one classroom build cover seven weeks of stories."
            href={treatmentToken ? `/t/${treatmentToken}` : null}
            ctaLabel="Open the treatment"
          />
        </div>

        <div className="mt-12 rounded-md border border-white/10 bg-white/[0.02] p-8">
          <h3 className="mb-4 font-serif text-xl text-white">
            The thesis in one paragraph
          </h3>
          <p className="leading-relaxed text-white/75">
            Build the classroom set once — vintage-NCAA-meets-racing-trophy,
            dressed for cinematic lighting, designed with a modular chalkboard
            system that lets the dialogue and graphics swap weekly. Shoot the
            sixteen drivers across a single race weekend in their fire suits.
            Shoot the celebrity Professor on a separate day in the same set,
            with green-screen pickups planned for any unavoidable scheduling
            mismatch. Edit the anthem first, then peel back the weekly topicals
            on the same template, each tuned to that week&apos;s race
            (Bristol&apos;s contact-equals-history history lesson, Vegas&apos;s
            long-game-vs-all-in math, the final exam at Phoenix). One build,
            one shoot, seven weeks of stories, on budget.
          </p>
        </div>
      </div>
    </section>
  );
}

function PitchCard({
  icon,
  eyebrow,
  heading,
  body,
  href,
  ctaLabel,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  heading: string;
  body: string;
  href: string | null;
  ctaLabel: string;
}) {
  const inner = (
    <div className="group flex h-full flex-col justify-between gap-6 rounded-md border border-white/10 bg-white/[0.02] p-8 transition hover:border-white/25 hover:bg-white/[0.04]">
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/40">
          <span className="text-white/60">{icon}</span>
          {eyebrow}
        </div>
        <h3 className="mb-3 font-serif text-2xl leading-tight text-white">
          {heading}
        </h3>
        <p className="text-sm leading-relaxed text-white/70">{body}</p>
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-white/85 group-hover:text-white">
        {href ? ctaLabel : `${ctaLabel} (link coming this week)`}
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </div>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}
