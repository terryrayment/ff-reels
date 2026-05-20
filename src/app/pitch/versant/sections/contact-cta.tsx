/**
 * Final contact card + CTA — calendar link + direct contact.
 * Big airy centered finish to close the page with confidence.
 */

import { Phone, Mail, Calendar } from "lucide-react";

interface Props {
  ctaUrl?: string | null;
  ctaLabel?: string | null;
  recipientFirstName?: string | null;
}

const TERRY_EMAIL = "terry@friendsandfamily.tv";
const TERRY_PHONE_TEL = "+1-310-555-0100"; // TODO: real mobile before send
const TERRY_PHONE_DISPLAY = "(310) 555-0100";

export function ContactCta({ ctaUrl, ctaLabel, recipientFirstName }: Props) {
  const finalCta = ctaLabel ?? "Grab 30 minutes on the calendar";
  const finalCtaUrl = ctaUrl ?? `mailto:${TERRY_EMAIL}`;

  return (
    <section className="relative overflow-hidden bg-[#080808] px-6 py-32">
      {/* soft glow ring behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,255,255,0.05), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="mb-6 text-[10px] uppercase tracking-[0.2em] text-white/40">
          {recipientFirstName ? `${recipientFirstName} — over to you` : "Over to you"}
        </p>
        <h2 className="mb-3 text-[clamp(2.5rem,5vw,3.5rem)] font-light leading-[1.05] tracking-tight-2 text-white">
          Call us.
        </h2>
        <p className="mb-10 text-[18px] font-light tracking-tight text-white/55">
          We&apos;ll pick up. Probably on the first ring. Definitely by the
          second.
        </p>

        <a
          href={finalCtaUrl}
          className="group mb-16 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] text-black transition hover:gap-4 hover:bg-white/90"
        >
          <Calendar className="h-4 w-4" />
          {finalCta}
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </a>

        <div className="mx-auto flex max-w-md flex-col items-center gap-3 border-t border-white/[0.08] pt-10">
          <p className="text-[18px] font-light tracking-tight text-white">
            Terry Rayment
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Founder &amp; Creative Director · Friends &amp; Family
          </p>
          <div className="mt-4 flex flex-col items-center gap-2 text-[13px] text-white/65 sm:flex-row sm:gap-7">
            <a
              href={`mailto:${TERRY_EMAIL}`}
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <Mail className="h-3.5 w-3.5" />
              {TERRY_EMAIL}
            </a>
            <a
              href={`tel:${TERRY_PHONE_TEL}`}
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <Phone className="h-3.5 w-3.5" />
              {TERRY_PHONE_DISPLAY}
            </a>
          </div>
        </div>

        <p className="mt-20 text-[10px] uppercase tracking-[0.3em] text-white/20">
          Friends &amp; Family · reels.friendsandfamily.tv · 2026
        </p>
      </div>
    </section>
  );
}
