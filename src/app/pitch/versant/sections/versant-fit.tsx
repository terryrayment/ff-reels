const VERSANT_GIVES = [
  "live schedules",
  "talent windows",
  "archive",
  "brand rules",
  "sponsor needs",
  "social surfaces",
  "audience expectations",
];

export function VersantFit() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="versant-reveal mx-auto max-w-[1400px] rounded-[42px] bg-[var(--versant-white)] p-6 shadow-[0_24px_80px_rgba(17,17,14,0.07)] sm:p-8 lg:rounded-[52px] lg:p-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="mb-5 text-[15px] font-medium text-black/46">
              Versant fit
            </p>
            <h2 className="versant-display max-w-4xl text-[clamp(42px,6vw,86px)] font-medium tracking-[-0.04em]">
              Golf feels like the right first lane.
            </h2>
          </div>

          <div className="max-w-[58ch] border-l-2 border-[var(--versant-orange)] pl-6 text-[clamp(18px,2vw,26px)] leading-[1.22] tracking-[-0.03em] text-black/68 lg:col-span-6">
            <p>
              Golf Channel carries the kind of work we know how to make:
              pressure, talent, promos, sponsor guardrails, social versions,
              editorial pieces, and an audience that can tell when the tone is
              off.
            </p>
            <p className="mt-5">
              Versant already has lanes in motion. F&amp;F can read the
              assignment, build the right crew and post path, and make the work
              feel like it belongs there.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5">
            <h3 className="text-[clamp(30px,4vw,52px)] font-medium leading-[1] tracking-[-0.04em]">
              Versant gives us
            </h3>
          </div>
          <ul className="grid gap-2 text-[15px] text-black/62 sm:grid-cols-2 lg:col-span-7">
            {VERSANT_GIVES.map((item) => (
              <li key={item} className="border-t border-black/12 py-2 sm:text-right">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-8 max-w-[54rem] text-[clamp(24px,3vw,40px)] leading-[1.08] tracking-[-0.04em] text-black/72">
          We bring director fit, production judgment, a clean post path, motion
          support when it helps, and calm when the calendar gets ugly.
        </p>
      </div>
    </section>
  );
}
