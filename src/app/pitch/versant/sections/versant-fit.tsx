const VERSANT_GIVES = [
  "live schedules",
  "talent windows",
  "archive",
  "brand rules",
  "sponsor needs",
  "social surfaces",
  "audience expectations",
];

const FF_BRINGS = [
  "director fit",
  "production plan",
  "crew shape",
  "post path",
  "motion support",
  "versioning",
  "taste under pressure",
];

export function VersantFit() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="versant-reveal mx-auto max-w-[1400px] rounded-[42px] bg-[var(--versant-white)] p-6 shadow-[0_24px_80px_rgba(16,16,16,0.08)] sm:p-8 lg:rounded-[52px] lg:p-10">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="mb-5 rounded-full bg-[var(--versant-soft-gray)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-black/54">
              Versant fit
            </p>
            <h2 className="max-w-4xl pb-2 text-[clamp(42px,6vw,86px)] font-medium leading-[0.96] tracking-[-0.055em]">
              Why Golf Channel first.
            </h2>
          </div>

          <div className="max-w-[58ch] border-l-4 border-[var(--versant-orange)] pl-6 text-[clamp(18px,2vw,26px)] leading-[1.18] tracking-[-0.035em] text-black/68 lg:col-span-6">
            <p>
              Golf Channel is the cleanest place to start because the
              assignment shapes are familiar to us: live pressure, talent,
              promos, sponsor guardrails, social versions, editorial pieces,
              and a fan base that can tell when the tone is off.
            </p>
            <p className="mt-5">
              We do not need to invent a new lane for Versant. We need to fit
              the lanes already moving.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Column label="Versant gives us" items={VERSANT_GIVES} />
          <Column label="F&F brings" items={FF_BRINGS} />
        </div>
      </div>
    </section>
  );
}

function Column({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-[32px] border border-black/12 p-5 sm:p-6">
      <h3 className="mb-5 text-[clamp(28px,4vw,52px)] font-medium leading-[0.98] tracking-[-0.055em]">
        {label}
      </h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-full border border-black/12 px-4 py-2 text-[13px] text-black/68"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
