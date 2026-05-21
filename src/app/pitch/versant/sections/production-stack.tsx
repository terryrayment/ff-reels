const STACK = [
  {
    name: "Friends & Family",
    number: "01",
    className: "bg-[var(--versant-white)] text-black lg:translate-y-0",
    copy:
      "Director-led production. Taste, casting, performance, crews, client process, and the judgment to know what the assignment actually needs.",
    rows: [
      ["Role", "creative production partner"],
      ["Useful for", "films, promos, talent, social, sponsor work"],
    ],
  },
  {
    name: "The Youth",
    number: "02",
    className: "bg-[var(--versant-lime)] text-black lg:translate-y-14",
    copy:
      "Collaborator production muscle when the job needs a wider footprint, more crew depth, more local production shape, or a different kind of making.",
    rows: [
      ["Role", "production partner when needed"],
      ["Useful for", "scaled shoots, complex builds, international production paths"],
    ],
  },
  {
    name: "Colossal",
    number: "03",
    className: "bg-[var(--versant-blue)] text-white lg:translate-y-5",
    copy:
      "Collaborator post and motion capability when the assignment needs design, animation, compositing, cleanup, finishing, or heavy versioning.",
    rows: [
      ["Role", "post and motion partner when needed"],
      ["Useful for", "motion, comp, finish, delivery systems"],
    ],
  },
];

export function ProductionStack() {
  return (
    <section className="bg-[var(--versant-black)] px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-5 rounded-full border border-white/14 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white/52">
              Production shape
            </p>
            <h2 className="text-[clamp(44px,7vw,104px)] font-medium leading-[0.9] tracking-[-0.055em]">
              Built to change shape.
            </h2>
          </div>
          <p className="max-w-[58ch] text-[clamp(17px,1.5vw,22px)] leading-[1.35] tracking-[-0.025em] text-white/66 lg:col-span-5">
            Some jobs need a small director-led crew. Some need a bigger
            production footprint. Some need a post-heavy finish. Friends &amp;
            Family can build the right shape around the assignment.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:pb-16">
          {STACK.map((item) => (
            <StackCard key={item.name} item={item} />
          ))}
        </div>

        <p className="mt-8 max-w-3xl rounded-[30px] border border-white/12 p-5 text-[15px] leading-[1.4] text-white/64 lg:mt-0">
          The point for Versant is simple: the team can flex without making the
          job feel bloated.
        </p>
      </div>
    </section>
  );
}

function StackCard({
  item,
}: {
  item: {
    name: string;
    number: string;
    className: string;
    copy: string;
    rows: string[][];
  };
}) {
  const dark = item.className.includes("text-white");
  const rule = dark ? "border-white/18" : "border-black/14";
  const muted = dark ? "text-white/62" : "text-black/56";

  return (
    <article
      className={`min-h-[34rem] rounded-[42px] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.22)] sm:p-8 xl:rounded-[52px] ${item.className}`}
    >
      <div className="flex h-full flex-col justify-between gap-10">
        <div>
          <div className="flex items-start justify-between gap-6">
            <h3 className="max-w-xs text-[clamp(32px,4vw,66px)] font-medium leading-[0.92] tracking-[-0.06em]">
              {item.name}
            </h3>
            <span className="text-[clamp(74px,11vw,150px)] font-medium leading-none tracking-[-0.08em]">
              {item.number}
            </span>
          </div>
          <p className={`mt-10 max-w-[42ch] text-[16px] leading-[1.38] ${muted}`}>
            {item.copy}
          </p>
        </div>

        <div className="space-y-4">
          {item.rows.map(([label, value]) => (
            <div
              key={label}
              className={`grid gap-2 border-t pt-4 text-[13px] ${rule}`}
            >
              <span className={`text-[10px] uppercase tracking-[0.18em] ${muted}`}>
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
