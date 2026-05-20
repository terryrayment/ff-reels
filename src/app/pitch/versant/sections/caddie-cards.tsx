/**
 * Caddie Cards — twelve F&F directors styled as scouting cards.
 *
 * Each card carries director name (serif), 2 lines of credits, and a
 * recommended Versant hole (monospace italic). Sits on the dark base,
 * with cream marginalia. No headshots yet — placeholder geometry
 * keeps cards consistent until images are uploaded.
 */

type Director = {
  name: string;
  shot: string; // for the FIG label
  signature: string; // 1-line directorial register
  credits: string[];
  hole: string; // suggested Versant hole + label
};

const DIRECTORS: Director[] = [
  {
    name: "Terry Rayment",
    shot: "F&F · LA",
    signature: "Emotional narrative · human experience",
    credits: ["Kodak — Understanding", "Purina · Cadillac · Jaguar"],
    hole: "No. 02 · Firethorn / GolfPass",
  },
  {
    name: "Jack Turits",
    shot: "F&F",
    signature: "Documentary charm · narrative skill",
    credits: ["Callaway — Forefront", "Real-people brand portraits"],
    hole: "No. 04 · GolfNow course stories",
  },
  {
    name: "Matt Dilmore",
    shot: "F&F",
    signature: "Offbeat campaigns · sports comedy",
    credits: ["ESPN 30 for 30 — The Great Imposter", "Sports folklore work"],
    hole: "No. 03 · Big Break × Good Good",
  },
  {
    name: "Boma Iluma",
    shot: "F&F",
    signature: "Culture-forward · athlete identity",
    credits: ["Oakley w/ Damian Lillard · Air Jordan Heirs", "The Chi · Tribeca"],
    hole: "No. 03 · Good Good audience",
  },
  {
    name: "Kelsey Larkin",
    shot: "F&F",
    signature: "Precision · dignity · performance",
    credits: ["Gillette — Look Good, Game Good", "Athlete image work"],
    hole: "No. 05 · USA Sports identity",
  },
  {
    name: "Caleb Slain",
    shot: "F&F",
    signature: "Anthem craft · short-doc instincts",
    credits: ["SXSW / Telluride short docs", "Ford · Lexus · Toyota · Microsoft"],
    hole: "No. 01 · The Anthem",
  },
  {
    name: "James Frost",
    shot: "F&F",
    signature: "Systems · scale · live-event",
    credits: ["Nike · IBM · AmEx", "OK Go · Radiohead"],
    hole: "No. 05 · Broadcast opens",
  },
  {
    name: "Cody Cloud",
    shot: "F&F",
    signature: "Editorial color · character portraits",
    credits: ["Apple · Adidas · Asics", "Gatorade · Nike · Target"],
    hole: "No. 08 · Talent portrait package",
  },
  {
    name: "Bueno",
    shot: "F&F",
    signature: "Inventive mixed-media comedy",
    credits: ["Doritos · Netflix · CNN", "Cannes Grand Prix"],
    hole: "No. 03 · Format / fan campaigns",
  },
  {
    name: "Le Ged",
    shot: "F&F",
    signature: "Kinetic camera · physical joy",
    credits: ["Hilton · McDonald's · YouTube", "Launch spots with motion"],
    hole: "No. 04 · GolfNow social-first",
  },
  {
    name: "Leigh Marling",
    shot: "F&F",
    signature: "Design-forward · brand comedy",
    credits: ["Super Bowl · Snickers · T-Mobile · LEGO", "Music-video roots"],
    hole: "No. 09 · Fandango / Rotten Tomatoes",
  },
  {
    name: "Brother Willis",
    shot: "F&F",
    signature: "Warm Americana · sports-card texture",
    credits: ["Topps Chrome Rush · Ford", "Collectible-culture work"],
    hole: "No. 04 · GolfNow local heroes",
  },
];

export function CaddieCards() {
  return (
    <section className="border-b border-white/[0.06] bg-[#0e0e0e] px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-baseline justify-between text-[10px] uppercase tracking-[0.3em] text-white/35">
          <span>05 — The Caddie Cards</span>
          <span className="font-mono normal-case tracking-normal text-white/25">
            12 in the bag
          </span>
        </div>

        <div className="mb-14 grid items-end gap-4 md:grid-cols-[1.6fr_1fr]">
          <h2 className="font-serif text-[clamp(2.25rem,5vw,3.75rem)] font-normal leading-[0.95] tracking-tight-2 text-white">
            Twelve directors.
            <br />
            <span className="text-white/55">One short bag for Versant.</span>
          </h2>
          <p className="text-[14px] leading-relaxed text-white/60">
            Pulled from the F&amp;F roster and matched to the holes on the
            front nine. Not a list — a recommendation.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {DIRECTORS.map((d) => (
            <CaddieCard key={d.name} dir={d} />
          ))}
        </div>

        <p className="mt-12 max-w-2xl font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
          Headshots, reels, and statements live on{" "}
          <span className="text-white/70">friendsandfamily.tv</span>. We&apos;ll
          send any of these as a deeper read on request.
        </p>
      </div>
    </section>
  );
}

function CaddieCard({ dir }: { dir: Director }) {
  return (
    <article className="group relative flex flex-col gap-4 rounded-sm border border-white/[0.08] bg-[#141312] p-5 transition hover:border-white/20 hover:bg-[#181614]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
            {dir.shot}
          </p>
          <h3 className="mt-1 font-serif text-[1.35rem] leading-none tracking-tight text-white">
            {dir.name}
          </h3>
        </div>
        {/* placeholder portrait square — replace with headshot upload */}
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-sm bg-gradient-to-br from-white/[0.06] to-white/[0.02] ring-1 ring-white/[0.06]">
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">
            FIG
          </span>
        </div>
      </div>

      <p className="font-serif text-[12px] italic leading-snug text-white/60">
        {dir.signature}
      </p>

      <ul className="space-y-1 text-[12.5px] leading-snug text-white/65">
        {dir.credits.map((c) => (
          <li key={c}>· {c}</li>
        ))}
      </ul>

      <div className="mt-2 border-t border-white/[0.08] pt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c9a961]">
          Suggested hole
        </p>
        <p className="mt-1 text-[12.5px] italic leading-snug text-white/75">
          {dir.hole}
        </p>
      </div>
    </article>
  );
}
