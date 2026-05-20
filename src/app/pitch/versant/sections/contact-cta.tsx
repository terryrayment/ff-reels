/**
 * Final contact card + CTA — "Schedule a 30-minute creative call this week."
 * Reels-platform design language: Inter sans, light weight headings, controlled type.
 */

import { Phone, Mail, Calendar } from "lucide-react";

interface Props {
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  recipientFirstName?: string | null;
}

const TERRY_EMAIL = "terry@friendsandfamily.tv";
const TERRY_PHONE_TEL = "+1-310-555-0100"; // TODO: replace with actual mobile before sending
const TERRY_PHONE_DISPLAY = "(310) 555-0100";

export function ContactCta({ ctaUrl, ctaLabel, recipientFirstName }: Props) {
  const finalCta = ctaLabel ?? "Schedule a 30-minute creative call this week";
  const finalCtaUrl = ctaUrl ?? `mailto:${TERRY_EMAIL}`;

  return (
    <section className="bg-[#080808] px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-white/40">
          {recipientFirstName ? `${recipientFirstName} —` : "Versant —"}
        </p>
        <h2 className="mb-10 text-[clamp(2rem,4vw,3rem)] font-light leading-[1.1] tracking-tight-2 text-white">
          Call us. We&apos;ll pick up.
        </h2>

        <a
          href={finalCtaUrl}
          className="mb-14 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white px-6 py-3 text-[11px] uppercase tracking-[0.15em] text-black transition hover:bg-white/90"
        >
          <Calendar className="h-3.5 w-3.5" />
          {finalCta}
        </a>

        <div className="mx-auto flex max-w-md flex-col items-center gap-3 border-t border-white/[0.08] pt-10">
          <p className="text-[16px] font-light tracking-tight text-white">
            Terry Rayment
          </p>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
            Founder &amp; Creative Director — Friends &amp; Family
          </p>
          <div className="mt-3 flex flex-col items-center gap-2 text-[12px] text-white/65 sm:flex-row sm:gap-6">
            <a
              href={`mailto:${TERRY_EMAIL}`}
              className="inline-flex items-center gap-2 hover:text-white"
            >
              <Mail className="h-3.5 w-3.5" />
              {TERRY_EMAIL}
            </a>
            <a
              href={`tel:${TERRY_PHONE_TEL}`}
              className="inline-flex items-center gap-2 hover:text-white"
            >
              <Phone className="h-3.5 w-3.5" />
              {TERRY_PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <p className="mt-16 text-[10px] uppercase tracking-[0.2em] text-white/25">
          Friends &amp; Family · reels.friendsandfamily.tv
        </p>
      </div>
    </section>
  );
}
