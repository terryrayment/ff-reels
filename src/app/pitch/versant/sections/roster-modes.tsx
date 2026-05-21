const MODES = [
  {
    label: "Human + intimate",
    directors: ["Terry Rayment", "Cody Cloud", "Kelsey Larkin"],
    use:
      "The work needs faces, restraint, warmth, or a performance that cannot feel pushed.",
    className: "bg-[var(--versant-white)] text-black lg:col-span-5",
  },
  {
    label: "Sports + character",
    directors: ["Jack Turits", "Matt Dilmore", "Brother Willis"],
    use:
      "The work needs real people, timing, sports texture, or the strange little details fans remember.",
    className: "bg-[var(--versant-black)] text-white lg:col-span-7",
  },
  {
    label: "Culture + youth",
    directors: ["Boma Iluma", "Bueno", "Le Ged"],
    use:
      "The work needs speed, creator fluency, mixed-media energy, or a younger audience without pandering.",
    className: "bg-[var(--versant-orange)] text-black lg:col-span-4",
  },
  {
    label: "Premium film",
    directors: ["Caleb Slain", "Terry Rayment", "Kelsey Larkin"],
    use:
      "The work needs polish, emotional control, doc craft, and brand scale.",
    className: "bg-[var(--versant-mint)] text-black lg:col-span-4 lg:translate-y-10",
  },
  {
    label: "Design + systems",
    directors: ["James Frost", "Leigh Marling", "Bueno"],
    use:
      "The work needs motion language, identity, comedy systems, music, design, or visual invention.",
    className: "bg-[var(--versant-blue)] text-white lg:col-span-4",
  },
];

const ROSTER = [
  "Terry Rayment",
  "Jack Turits",
  "Matt Dilmore",
  "Boma Iluma",
  "Kelsey Larkin",
  "Caleb Slain",
  "James Frost",
  "Cody Cloud",
  "Bueno",
  "Le Ged",
  "Leigh Marling",
  "Brother Willis",
];

export function RosterModes() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-4 rounded-full bg-[var(--versant-black)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-white">
              Roster modes
            </p>
            <h2 className="text-[clamp(44px,7vw,104px)] font-medium leading-[0.9] tracking-[-0.055em]">
              A roster that changes with the brief.
            </h2>
          </div>
          <p className="max-w-[58ch] text-[clamp(17px,1.5vw,22px)] leading-[1.35] tracking-[-0.025em] text-black/66 lg:col-span-5">
            The director choice should come from the assignment, not from a
            preset style. Here is how we think about the roster when the mold
            changes.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:pb-10">
          {MODES.map((mode) => (
            <ModeCard key={mode.label} mode={mode} />
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-[32px] bg-[var(--versant-white)] p-4 shadow-[0_20px_70px_rgba(16,16,16,0.07)] lg:mt-0">
          <div className="mb-4 flex items-center justify-between gap-4 px-2 text-[10px] uppercase tracking-[0.18em] text-black/45">
            <span>Roster preset row</span>
            <span>12 directors</span>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:flex-wrap">
            {ROSTER.map((name) => (
              <span
                key={name}
                className="rounded-full border border-black/12 px-4 py-2 text-[13px] text-black/74"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModeCard({
  mode,
}: {
  mode: {
    label: string;
    directors: string[];
    use: string;
    className: string;
  };
}) {
  const dark = mode.className.includes("text-white");
  const rule = dark ? "border-white/18" : "border-black/14";
  const muted = dark ? "text-white/62" : "text-black/58";
  const pill = dark
    ? "border-white/18 text-white/72"
    : "border-black/14 text-black/62";

  return (
    <article
      className={`min-h-[25rem] rounded-[36px] p-6 shadow-[0_20px_70px_rgba(16,16,16,0.08)] sm:p-8 lg:rounded-[48px] ${mode.className}`}
    >
      <div className="flex h-full flex-col justify-between gap-8">
        <div>
          <span className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.18em] ${pill}`}>
            selectable mode
          </span>
          <h3 className="mt-8 text-[clamp(34px,5vw,76px)] font-medium leading-[0.9] tracking-[-0.06em]">
            {mode.label}
          </h3>
        </div>

        <div className="space-y-4">
          <div className={`border-t pt-4 ${rule}`}>
            <p className={`mb-3 text-[10px] uppercase tracking-[0.18em] ${muted}`}>
              Directors
            </p>
            <div className="flex flex-wrap gap-2">
              {mode.directors.map((director) => (
                <span
                  key={director}
                  className={`rounded-full border px-3 py-1.5 text-[12px] ${pill}`}
                >
                  {director}
                </span>
              ))}
            </div>
          </div>
          <div className={`border-t pt-4 ${rule}`}>
            <p className={`mb-2 text-[10px] uppercase tracking-[0.18em] ${muted}`}>
              Use when
            </p>
            <p className="max-w-[45ch] text-[15px] leading-[1.35]">{mode.use}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
