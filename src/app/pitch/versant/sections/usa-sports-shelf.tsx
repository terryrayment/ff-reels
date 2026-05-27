const USA_SPORTS_PROPERTIES = [
  "PGA Tour",
  "U.S. Open",
  "The Open Championship",
  "U.S. Women's Open",
  "NASCAR Cup Playoffs",
  "Premier League",
  "WWE SmackDown",
  "WNBA",
  "College hoops (A10 + Pac-12)",
  "LOVB",
] as const;

export function UsaSportsShelf() {
  return (
    <section className="px-4 py-4 sm:px-6 lg:px-8">
      <div className="versant-reveal mx-auto max-w-[1400px] rounded-[16px] border border-[var(--versant-soft-gray)] bg-[var(--versant-white)] px-5 py-5 text-[var(--versant-ink)] shadow-[0_18px_54px_rgba(17,17,14,0.05)] sm:px-6 lg:px-7">
        <div className="grid gap-4 lg:grid-cols-[180px_1fr] lg:items-start">
          <p className="text-[11px] font-medium uppercase leading-none tracking-[0.16em] text-black/46">
            WHAT YOU CARRY
          </p>
          <div className="min-w-0">
            <ul className="flex flex-wrap gap-2">
              {USA_SPORTS_PROPERTIES.map((property) => (
                <li
                  key={property}
                  className="rounded-full border border-[var(--versant-soft-gray)] bg-[var(--versant-mint)] px-3 py-1.5 text-[13px] font-medium leading-none text-[var(--versant-ink)]"
                >
                  {property}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-4xl text-[15px] italic leading-[1.35] text-black/60">
              We&apos;re not pitching golf because golf is all we see.
              We&apos;re starting there because that&apos;s where we can prove
              it fastest.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
