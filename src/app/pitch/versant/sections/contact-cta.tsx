/**
 * The Call Sheet — close styled as the back cover of a production
 * document. Fixed-width grid of ROLE / PROD CO / CALL / CONTACT fields.
 * Single CTA: a 30-minute call.
 */

import { Calendar } from "lucide-react";

interface Props {
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  recipientFirstName?: string | null;
}

const TERRY_EMAIL = "terry@friendsandfamily.tv";
const TERRY_PHONE_TEL = "+1-310-555-0100"; // TODO: replace before send
const TERRY_PHONE_DISPLAY = "(310) 555-0100";

export function ContactCta({ ctaUrl, ctaLabel, recipientFirstName }: Props) {
  const finalCta = ctaLabel ?? "Grab 30 minutes on the calendar";
  const finalCtaUrl = ctaUrl ?? `mailto:${TERRY_EMAIL}`;

  return (
    <section className="bg-[#080808] px-6 py-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-baseline justify-between text-[10px] uppercase tracking-[0.3em] text-white/35">
          <span>07 — The Call Sheet</span>
          <span className="font-mono normal-case tracking-normal text-white/25">
            END OF DAY · Hand-off to Versant
          </span>
        </div>

        <div className="grid items-end gap-6 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
              {recipientFirstName
                ? `${recipientFirstName} — over to you`
                : "Over to you"}
            </p>
            <h2 className="font-serif text-[clamp(2.5rem,5.5vw,4.25rem)] font-normal leading-[0.95] tracking-tight-2 text-white">
              Call us.
            </h2>
            <p className="mt-4 max-w-md text-[16px] font-light leading-snug tracking-tight text-white/60">
              Probably on the first ring. Definitely by the second.
            </p>
          </div>

          <a
            href={finalCtaUrl}
            className="group inline-flex items-center justify-between gap-3 self-end rounded-sm border border-white/15 bg-white px-6 py-4 font-mono text-[11px] uppercase tracking-[0.22em] text-black transition hover:bg-white/90"
          >
            <span className="inline-flex items-center gap-2.5">
              <Calendar className="h-3.5 w-3.5" />
              {finalCta}
            </span>
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>

        {/* Call-sheet grid */}
        <div className="mt-16 border-t border-white/10 pt-10">
          <div className="grid gap-x-10 gap-y-6 font-mono text-[12px] uppercase tracking-[0.15em] sm:grid-cols-2 md:grid-cols-3">
            <Field label="Production Co." value="Friends & Family" sub="LA · NYC" />
            <Field
              label="Call"
              value="Terry Rayment"
              sub="Founder & Creative Director"
            />
            <Field
              label="Email"
              value={TERRY_EMAIL}
              href={`mailto:${TERRY_EMAIL}`}
            />
            <Field
              label="Mobile"
              value={TERRY_PHONE_DISPLAY}
              href={`tel:${TERRY_PHONE_TEL}`}
            />
            <Field
              label="Reps"
              value="Talk Shop · CCCo."
              sub="NYC · Chicago + LA"
            />
            <Field
              label="Next"
              value="A 30-min call"
              sub="Before the next thing becomes urgent"
            />
          </div>
        </div>

        <p className="mt-16 text-center font-mono text-[10px] uppercase tracking-[0.35em] text-white/20">
          Friends &amp; Family · reels.friendsandfamily.tv · vol. I · 2026
        </p>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const valueClass = "text-white";
  const inner = (
    <>
      <p className="text-[10px] tracking-[0.22em] text-white/35">{label}</p>
      <p className={`mt-2 normal-case tracking-tight text-[14.5px] font-light ${valueClass}`}>
        {value}
      </p>
      {sub && (
        <p className="mt-1 text-[10px] tracking-[0.18em] text-white/40">
          {sub}
        </p>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className="block transition hover:bg-white/[0.02]">
        {inner}
      </a>
    );
  }
  return <div>{inner}</div>;
}
