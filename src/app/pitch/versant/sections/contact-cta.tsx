/**
 * Final contact card + CTA. The whole pitch ladders to this:
 *   "Schedule a 30-minute creative call this week."
 * Terry's direct line + calendar link. No agency middle-layer.
 */

import { Phone, Mail, Calendar } from "lucide-react";

interface Props {
  /** Cal.com / Calendly link (configured per-pitch via ScreeningLink.ctaUrl). */
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  /** Recipient first name for the closing line. */
  recipientFirstName?: string | null;
}

const TERRY_EMAIL = "terry@friendsandfamily.tv";
const TERRY_PHONE_TEL = "+1-310-555-0100"; // TODO: replace with actual mobile before sending
const TERRY_PHONE_DISPLAY = "(310) 555-0100";

export function ContactCta({ ctaUrl, ctaLabel, recipientFirstName }: Props) {
  const finalCta = ctaLabel ?? "Schedule a 30-minute creative call this week";
  const finalCtaUrl = ctaUrl ?? "mailto:" + TERRY_EMAIL;

  return (
    <section className="bg-[#0a0a0a] px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.18em] text-white/40">
          {recipientFirstName ? `${recipientFirstName} —` : "Versant —"}
        </p>
        <h2 className="mb-10 font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-white">
          Call us. We&apos;ll pick up.
        </h2>

        <a
          href={finalCtaUrl}
          className="mb-12 inline-flex items-center gap-3 rounded-md bg-white px-7 py-4 text-base font-medium text-black transition hover:bg-white/90"
        >
          <Calendar className="h-5 w-5" />
          {finalCta}
        </a>

        <div className="mx-auto flex max-w-md flex-col items-center gap-3 border-t border-white/10 pt-10 text-sm text-white/70">
          <p className="font-serif text-lg text-white">Terry Rayment</p>
          <p className="text-xs uppercase tracking-[0.14em] text-white/40">
            Founder &amp; Creative Director — Friends &amp; Family
          </p>
          <div className="mt-3 flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
            <a
              href={`mailto:${TERRY_EMAIL}`}
              className="inline-flex items-center gap-2 hover:text-white"
            >
              <Mail className="h-4 w-4" />
              {TERRY_EMAIL}
            </a>
            <a
              href={`tel:${TERRY_PHONE_TEL}`}
              className="inline-flex items-center gap-2 hover:text-white"
            >
              <Phone className="h-4 w-4" />
              {TERRY_PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <p className="mt-16 text-xs text-white/30">
          Friends &amp; Family · reels.friendsandfamily.tv ·
          friendsandfamily.tv
        </p>
      </div>
    </section>
  );
}
