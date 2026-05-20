/**
 * The Front Nine — nine production briefs hiding inside Versant's rights
 * and assets. Each hole is a brief, not a capability statement.
 *
 * Visual: navy "course program" treatment with a sticky scorecard rail
 * on desktop. Tabular-numeral hole numbers. Each hole has par, yardage
 * (scale), lay-up vs. heroic line, and suggested club (= F&F director).
 */

const NAVY = "#0a2856";
const CREAM = "#f5f0e0";
const GOLD = "#c9a961";

type Hole = {
  num: string;
  par: string;
  yardage: string;
  title: string;
  brief: string;
  layup: string;
  heroic: string;
  club: string;
};

const HOLES: Hole[] = [
  {
    num: "01",
    par: "5",
    yardage: "Anthem",
    title: "Golf Channel — the independent era",
    brief:
      "A defining brand film for Golf Channel under Versant. What the network sounds like when it names itself. Built to live three years.",
    layup: "Voiceover anthem cut from existing coverage.",
    heroic: "An original short film with a director on the property.",
    club: "Caleb Slain · James Frost",
  },
  {
    num: "02",
    par: "4",
    yardage: "Firethorn",
    title: "GolfPass × Rory — a life around the game",
    brief:
      "A short series that follows the player as a person, not a product. The morning, the range chair, the airport, the kid. Endorsement-free in tone.",
    layup: "A single profile film. 6 minutes.",
    heroic: "A four-part season. One per quarter. Festival-ready.",
    club: "Terry Rayment · Cody Cloud",
  },
  {
    num: "03",
    par: "3",
    yardage: "Tournament",
    title: "Big Break × Good Good",
    brief:
      "A campaign that respects the original Big Break audience and the YouTube golf audience without making either side feel pandered to. Comedy timing. Real-golfer texture.",
    layup: "A sizzle and three social cutdowns.",
    heroic: "An eight-episode return with a film aesthetic.",
    club: "Matt Dilmore · Boma Iluma · Bueno",
  },
  {
    num: "04",
    par: "5",
    yardage: "GolfNow",
    title: "Course Stories — the people who keep the doors open",
    brief:
      "40 million tee times across 9,000 courses is a content surface most of the industry forgets. Local rituals. Club pros. Strange holes. The supers who win the battle nobody watches.",
    layup: "A 6-spot series, vertical-first.",
    heroic: "A documentary anthology. One course, one piece, one season.",
    club: "Jack Turits · Le Ged · Brother Willis",
  },
  {
    num: "05",
    par: "4",
    yardage: "Identity",
    title: "USA Sports — a visual identity people can feel",
    brief:
      "Opens, promos, social, in-game packaging. A film system that makes the umbrella feel earned rather than announced. Designed to absorb golf, motorsport, and women's basketball under one register.",
    layup: "A 60-second sting + a graphics kit.",
    heroic: "A directed identity film + an open package built for live.",
    club: "James Frost · Caleb Slain · Kelsey Larkin",
  },
  {
    num: "06",
    par: "4",
    yardage: "Major",
    title: "Ryder Cup / USGA — tension, silence, memory",
    brief:
      "Mini-docs that respect what the events already are. Reverence without sleepiness. Weather. Crowds. The walk between shots. The shot itself.",
    layup: "A 90-second post-event short.",
    heroic: "A pre-event film that finishes by the trophy ceremony.",
    club: "Kelsey Larkin · Matt Dilmore · Caleb Slain",
  },
  {
    num: "07",
    par: "3",
    yardage: "Sponsor",
    title: "Editorial that still has a sponsor in it",
    brief:
      "Branded content somebody would actually finish watching. The combination is rarer than it should be. We&apos;d build a small framework Versant can resell.",
    layup: "Three sponsor-friendly editorial pieces.",
    heroic: "A custom-content slate as a recurring offering.",
    club: "Terry Rayment · Le Ged",
  },
  {
    num: "08",
    par: "4",
    yardage: "Talent",
    title: "Talent portrait package",
    brief:
      "Face cards: Golf Channel hosts, CNBC anchors, MS NOW reporters, USA Sports voices. Treated like portraits, not headshots. Built for promo, social, and screen.",
    layup: "Stills + a 30-second motion package per voice.",
    heroic: "A short film per anchor. Released as a system.",
    club: "Jack Turits · Boma Iluma · Cody Cloud",
  },
  {
    num: "09",
    par: "5",
    yardage: "19th",
    title: "The 19th — Fandango, Rotten Tomatoes, CNBC, MS NOW",
    brief:
      "Secondary, but real. Movie-culture work for Fandango and Rotten Tomatoes; talent and explainer film craft for CNBC and MS NOW. Not the lead, but worth the call.",
    layup: "A pilot piece in one of the four lanes.",
    heroic: "An evergreen system that pays rent across all four.",
    club: "Leigh Marling · Brother Willis",
  },
];

export function FrontNine() {
  return (
    <section
      className="relative overflow-hidden border-y border-white/10 px-6 py-24"
      style={{ backgroundColor: NAVY, color: CREAM }}
    >
      {/* gold rails */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-px md:block"
        style={{ background: `linear-gradient(${GOLD}, transparent 70%)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-px md:block"
        style={{ background: `linear-gradient(${GOLD}, transparent 70%)` }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Program header */}
        <div
          className="mb-10 flex items-center justify-between border-y py-4 text-[10px] uppercase tracking-[0.3em]"
          style={{ borderColor: `${GOLD}33`, color: `${CREAM}b3` }}
        >
          <span>03 — The Front Nine</span>
          <span className="hidden sm:inline" style={{ color: GOLD }}>
            ★
          </span>
          <span>9 production briefs · 1 short course</span>
        </div>

        <div className="mb-3 grid items-end gap-4 md:grid-cols-[1fr_auto]">
          <h2
            className="font-serif text-[clamp(2.5rem,5.5vw,4.25rem)] font-normal leading-[0.95] tracking-tight-2"
            style={{ color: CREAM }}
          >
            The calls we&apos;d
            <br />
            want to get.
          </h2>
          <p
            className="font-serif text-[clamp(1rem,1.4vw,1.25rem)] font-light italic leading-snug"
            style={{ color: `${CREAM}99` }}
          >
            Nine briefs. One short course. Versant Pro-Am, 2026.
          </p>
        </div>

        <p
          className="mb-14 max-w-2xl text-[15px] leading-relaxed"
          style={{ color: `${CREAM}b3` }}
        >
          Not a capability grid. Not a list of services. These are the actual
          films and campaigns we&apos;d like to be in the room for — pulled
          from the rights, the talent, and the surfaces already inside
          Versant.
        </p>

        {/* Holes */}
        <div className="grid gap-3 md:grid-cols-[6rem_1fr] md:gap-x-8">
          {HOLES.map((h, i) => (
            <HoleRow key={h.num} hole={h} last={i === HOLES.length - 1} />
          ))}
        </div>

        <p
          className="mt-14 max-w-2xl font-mono text-[11px] uppercase tracking-[0.2em]"
          style={{ color: `${CREAM}66` }}
        >
          Suggested clubs are the F&amp;F directors we&apos;d send to the tee.
          See No. 05 — The Caddie Cards — for the full bag.
        </p>
      </div>
    </section>
  );
}

function HoleRow({ hole, last }: { hole: Hole; last: boolean }) {
  const GOLD = "#c9a961";
  const CREAM = "#f5f0e0";

  return (
    <>
      {/* Hole number — left rail */}
      <div
        className={`relative pb-12 ${last ? "" : "border-b md:border-b-0"}`}
        style={{ borderColor: `${CREAM}1a` }}
      >
        <div className="flex items-baseline gap-3 md:flex-col md:items-start md:gap-2">
          <p
            className="font-serif text-[clamp(2.75rem,5vw,4.5rem)] font-light leading-none tabular-nums tracking-tight-2"
            style={{ color: GOLD }}
          >
            {hole.num}
          </p>
          <div className="text-[10px] uppercase tracking-[0.22em]" style={{ color: `${CREAM}80` }}>
            <p>Par {hole.par}</p>
            <p style={{ color: `${CREAM}55` }}>{hole.yardage}</p>
          </div>
        </div>
      </div>

      {/* Hole content */}
      <div
        className={`pb-12 ${last ? "" : "border-b"}`}
        style={{ borderColor: `${CREAM}1a` }}
      >
        <h3
          className="mb-3 text-[clamp(1.1rem,1.8vw,1.5rem)] font-light leading-snug tracking-tight"
          style={{ color: CREAM }}
        >
          {hole.title}
        </h3>
        <p className="mb-5 max-w-2xl text-[14px] leading-relaxed" style={{ color: `${CREAM}b3` }}>
          {hole.brief}
        </p>

        <div className="grid gap-x-8 gap-y-2 text-[12.5px] leading-snug sm:grid-cols-2" style={{ color: `${CREAM}99` }}>
          <p>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: `${CREAM}55` }}>
              Lay-up ·{" "}
            </span>
            {hole.layup}
          </p>
          <p>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: `${CREAM}55` }}>
              Heroic line ·{" "}
            </span>
            {hole.heroic}
          </p>
        </div>

        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: GOLD }}>
          Suggested club — {hole.club}
        </p>
      </div>
    </>
  );
}
