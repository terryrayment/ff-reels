const NOTES = [
  {
    label: "01",
    line: "Golf is central, not adjacent.",
  },
  {
    label: "02",
    line: "USA Sports needs a voice.",
  },
  {
    label: "03",
    line: "The vendor map is being drawn now.",
  },
];

export function GolfReadStrip() {
  return (
    <section className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="versant-reveal mx-auto grid max-w-[1500px] gap-3 rounded-[42px] bg-[var(--versant-lime)] p-4 text-black shadow-[0_22px_70px_rgba(16,16,16,0.08)] sm:p-5 lg:grid-cols-3 lg:rounded-[52px]">
        {NOTES.map((note) => (
          <article
            key={note.label}
            className="rounded-[30px] border border-black/14 bg-black/[0.03] p-5"
          >
            <p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-black/50">
              Golf read / {note.label}
            </p>
            <p className="max-w-[18ch] text-[clamp(28px,4vw,56px)] font-medium leading-[0.96] tracking-[-0.055em]">
              {note.line}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

