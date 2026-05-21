type Capability = {
  title: string;
  status: string;
  copy: string;
  rows: [string, string][];
  metric: string;
  treatment: string;
};

const CAPABILITIES: Capability[] = [
  {
    title: "Brand films",
    status: "Director-led",
    copy: "For moments that need tone, taste, and a clear point of view.",
    rows: [
      ["Best when", "the work needs a voice"],
      ["Output", "hero film, cutdowns, versioned edits"],
      ["F&F fit", "director match, production plan, finish path"],
    ],
    metric: "01",
    treatment: "lg:col-span-7 bg-[var(--versant-lime)] text-black",
  },
  {
    title: "Promos + opens",
    status: "Broadcast-ready",
    copy: "For work that has to move fast, hold a brand register, and survive repeat viewing.",
    rows: [
      ["Best when", "live schedules are tight"],
      ["Output", "opens, stings, promo systems"],
      ["F&F fit", "picture, motion, edit, delivery"],
    ],
    metric: "02",
    treatment: "lg:col-span-5 bg-[var(--versant-black)] text-white",
  },
  {
    title: "Talent windows",
    status: "Fast capture",
    copy: "For athletes, hosts, anchors, creators, and voices with limited time and a lot of deliverables attached.",
    rows: [
      ["Best when", "access is short"],
      ["Output", "stills, motion, social, promo-safe versions"],
      ["F&F fit", "calm sets, clear shot lists, strong faces"],
    ],
    metric: "18m",
    treatment: "lg:col-span-4 bg-[var(--versant-white)] text-black",
  },
  {
    title: "Sponsor work",
    status: "Editorial feel",
    copy: "For brand-backed pieces that still need to be watchable.",
    rows: [
      ["Best when", "the guardrails are real"],
      ["Output", "hero piece, cutdowns, clean versions"],
      ["F&F fit", "taste, restraint, performance"],
    ],
    metric: "04",
    treatment: "lg:col-span-4 bg-[var(--versant-orange)] text-black",
  },
  {
    title: "Social cutdowns",
    status: "Versioned delivery",
    copy: "For work that needs to move across formats without feeling chopped up.",
    rows: [
      ["Best when", "one shoot has many homes"],
      ["Output", "verticals, teasers, captions, crops"],
      ["F&F fit", "plan for the edit before shoot day"],
    ],
    metric: "9:16",
    treatment: "lg:col-span-4 bg-[var(--versant-mint)] text-black",
  },
  {
    title: "Post + motion",
    status: "With Colossal when needed",
    copy: "For jobs that need design, motion, cleanup, compositing, finishing, or a post-heavy path.",
    rows: [
      ["Best when", "the idea lives in the finish"],
      ["Output", "motion, comp, color, delivery"],
      ["F&F fit", "creative production through final files"],
    ],
    metric: "100%",
    treatment: "lg:col-span-8 bg-[var(--versant-blue)] text-white",
  },
];

export function CapabilityDashboard() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-4 rounded-full bg-[var(--versant-white)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-black/55">
              Capability dashboard
            </p>
            <h2 className="text-[clamp(44px,7vw,104px)] font-medium leading-[0.9] tracking-[-0.055em]">
              Many molds.
              <br />
              Same taste.
            </h2>
          </div>
          <p className="max-w-[58ch] text-[clamp(17px,1.5vw,22px)] leading-[1.35] tracking-[-0.025em] text-black/68 lg:col-span-5">
            Versant does not need a vendor with one house style. It needs a
            partner that can read the assignment, match the director, build the
            production path, and finish the work in the right shape.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          {CAPABILITIES.map((capability, index) => (
            <CapabilityCard
              key={capability.title}
              capability={capability}
              tall={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityCard({
  capability,
  tall,
}: {
  capability: Capability;
  tall: boolean;
}) {
  const mutedText = capability.treatment.includes("text-white")
    ? "text-white/68"
    : "text-black/62";
  const rule = capability.treatment.includes("text-white")
    ? "border-white/18"
    : "border-black/16";

  return (
    <article
      className={`relative overflow-hidden rounded-[34px] p-6 shadow-[0_20px_70px_rgba(16,16,16,0.08)] sm:p-8 lg:rounded-[46px] ${
        tall ? "min-h-[31rem]" : "min-h-[25rem]"
      } ${capability.treatment}`}
    >
      <span
        aria-hidden="true"
        className={`absolute -right-3 -top-5 text-[clamp(110px,14vw,220px)] font-medium leading-none tracking-[-0.09em] ${
          capability.treatment.includes("text-white")
            ? "text-white/10"
            : "text-black/8"
        }`}
      >
        {capability.metric}
      </span>

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <span
              className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.18em] ${rule}`}
            >
              {capability.status}
            </span>
            <span className={`text-[10px] uppercase tracking-[0.18em] ${mutedText}`}>
              status · ready
            </span>
          </div>
          <h3 className="max-w-2xl text-[clamp(34px,5vw,74px)] font-medium leading-[0.9] tracking-[-0.06em]">
            {capability.title}
          </h3>
          <p className={`mt-5 max-w-[45ch] text-[16px] leading-[1.35] ${mutedText}`}>
            {capability.copy}
          </p>
        </div>

        <div className="space-y-3">
          {capability.rows.map(([label, value]) => (
            <div
              key={label}
              className={`grid gap-2 border-t pt-3 text-[13px] sm:grid-cols-[6.5rem_1fr] ${rule}`}
            >
              <span className={`text-[10px] uppercase tracking-[0.18em] ${mutedText}`}>
                {label}
              </span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
