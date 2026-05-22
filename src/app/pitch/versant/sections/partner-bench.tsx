const PARTNERS = [
  {
    name: "The Youth",
    href: "https://theyouth.com.br/",
    role: "cross-cultural production reach",
    copy:
      "Brazil-based collaborator energy when a job needs local fluency, a wider production footprint, or a different kind of making.",
  },
  {
    name: "Colossal",
    href: "https://colossal.film/",
    role: "post, motion, finishing",
    copy:
      "A post-forward path when the work wants design, animation, compositing, cleanup, versioning, or a heavier finish.",
  },
] as const;

export function PartnerBench() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-6 rounded-[38px] bg-[var(--versant-white)] p-7 shadow-[0_22px_70px_rgba(17,17,14,0.06)] sm:p-10 lg:grid-cols-12 lg:rounded-[52px] lg:p-12">
          <div className="lg:col-span-5">
            <p className="mb-5 text-[15px] font-medium text-black/48">
              partner bench
            </p>
            <h2 className="versant-display text-[clamp(42px,6.4vw,96px)] font-medium tracking-[-0.04em]">
              More ways to make the work travel.
            </h2>
          </div>

          <div className="grid gap-4 lg:col-span-7">
            {PARTNERS.map((partner) => (
              <a
                key={partner.name}
                href={partner.href}
                target="_blank"
                rel="noreferrer"
                className="group grid gap-6 border-t border-black/12 py-6 transition hover:text-[var(--versant-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--versant-orange)] md:grid-cols-[0.7fr_1fr]"
              >
                <div>
                  <p className="text-[clamp(30px,4vw,58px)] font-medium leading-[0.98] tracking-[-0.04em]">
                    {partner.name}
                  </p>
                  <p className="mt-3 text-[15px] text-black/48 group-hover:text-black/60">
                    {partner.role}
                  </p>
                </div>
                <p className="max-w-[42rem] text-[clamp(20px,2vw,29px)] leading-[1.15] tracking-[-0.025em] text-black/70 group-hover:text-black/78">
                  {partner.copy}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
