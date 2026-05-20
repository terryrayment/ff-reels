/**
 * Professor Chase creative response — the answer to the brief.
 * Two cards: link to the reel + link to the treatment PDF.
 * Reels-platform design language: Inter sans, light weights, subtle borders.
 */

import Link from "next/link";
import { ArrowUpRight, Film, FileText } from "lucide-react";

interface Props {
  reelScreeningToken?: string | null;
  treatmentToken?: string | null;
}

export function BriefAnswer({ reelScreeningToken, treatmentToken }: Props) {
  return (
    <section className="border-b border-white/[0.06] bg-[#0e0e0e] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-white/40">
          Professor Chase — our answer to the brief
        </p>
        <h2 className="mb-10 text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-[1.15] tracking-tight-2 text-white">
          A classroom built once.{" "}
          <span className="text-white/60">A system that runs for seven weeks.</span>
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <PitchCard
            icon={<Film className="h-4 w-4" />}
            eyebrow="The reel"
            heading="Five to seven pieces that prove the register"
            body="Ensemble comedy with real stakes. Cinematic talent direction. The closest-match-to-Professor-Chase work across our roster, with a short curatorial note on each spot explaining why."
            href={reelScreeningToken ? `/s/${reelScreeningToken}` : null}
            ctaLabel="Watch the reel"
          />
          <PitchCard
            icon={<FileText className="h-4 w-4" />}
            eyebrow="The treatment"
            heading="12-page production response"
            body="Director's vision. Classroom set lookbook. Two-day shoot logic for drivers + celebrity. Green-screen contingency. The modular weekly-topical system that runs one classroom build across seven weeks."
            href={treatmentToken ? `/t/${treatmentToken}` : null}
            ctaLabel="Open the treatment"
          />
        </div>

        <div className="mt-10 rounded-md border border-white/[0.06] bg-white/[0.02] p-8">
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-white/40">
            The thesis in one paragraph
          </p>
          <p className="text-[14px] leading-relaxed tracking-tight text-white/70">
            Build the classroom set once — vintage-NCAA-meets-racing-trophy,
            dressed for cinematic lighting, designed with a modular chalkboard
            system that lets the dialogue and graphics swap weekly. Shoot the
            sixteen drivers across a single race weekend in their fire suits.
            Shoot the celebrity Professor on a separate day in the same set,
            with green-screen pickups planned for any unavoidable scheduling
            mismatch. Edit the anthem first, then peel back the weekly topicals
            on the same template, each tuned to that week&apos;s race
            (Bristol&apos;s contact-equals-history history lesson,
            Vegas&apos;s long-game-vs-all-in math, the final exam at Phoenix).
            One build, one shoot, seven weeks of stories, on budget.
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
    <div className="group flex h-full flex-col justify-between gap-6 rounded-md border border-white/[0.06] bg-white/[0.02] p-6 transition hover:border-white/15 hover:bg-white/[0.04]">
      <div>
        <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
          <span className="text-white/60">{icon}</span>
          {eyebrow}
        </div>
        <h3 className="mb-3 text-[18px] font-light leading-snug tracking-tight text-white">
          {heading}
        </h3>
        <p className="text-[13px] leading-relaxed text-white/60">{body}</p>
      </div>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-white/70 group-hover:text-white">
        {href ? ctaLabel : `${ctaLabel} — coming`}
        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
