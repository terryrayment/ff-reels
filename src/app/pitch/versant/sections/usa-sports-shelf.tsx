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
    <section className="px-4 py-3 sm:px-6 lg:px-8">
      <div className="versant-reveal versant-mw-panel mx-auto max-w-[1400px] rounded-[14px] border border-[var(--versant-soft-gray)] bg-[var(--versant-white)] px-5 py-5 text-[var(--versant-ink)] shadow-[0_18px_54px_rgba(17,17,14,0.045)] sm:px-6 lg:px-7">
        <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-start">
          <p className="text-[11px] font-medium uppercase leading-none tracking-[0.16em] text-black/46">
            WHAT YOU CARRY
          </p>
          <div className="min-w-0">
            <p className="mb-4 max-w-4xl text-[clamp(18px,1.6vw,24px)] font-medium leading-[1.16] tracking-[-0.025em] text-black/72">
              USA Sports is one shelf with different rhythms: appointment TV,
              weekly franchises, rights rules, fan habits, and social demand.
            </p>
            <ul className="flex flex-wrap gap-2">
              {USA_SPORTS_PROPERTIES.map((property) => (
                <li
                  key={property}
                  className="versant-mw-pill rounded-full border border-[var(--versant-soft-gray)] bg-[var(--versant-mint)] px-3 py-1.5 text-[13px] font-medium leading-none text-[var(--versant-ink)]"
                >
                  {property}
                </li>
              ))}
            </ul>
            <p className="mt-4 max-w-4xl text-[15px] leading-[1.35] text-black/58">
              Golf is not the only thing we see. It is where we can prove the
              partnership fastest.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
