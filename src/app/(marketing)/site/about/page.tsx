import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

const TEAM = [
  {
    name: "Scott",
    role: "Executive Producer / Partner",
    email: "scott@friendsandfamily.tv",
  },
  {
    name: "Jed",
    role: "Executive Producer / Partner",
    email: "jed@friendsandfamily.tv",
  },
  {
    name: "Alana",
    role: "Head of Production",
    email: "alana@friendsandfamily.tv",
  },
];

const REPS = [
  { region: "West Coast", name: "Uncle Lefty" },
  { region: "Midwest", name: "CCCo" },
  { region: "East Coast", name: "Talk Shop" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-32 lg:pt-40 pb-24">
      <header className="mb-20">
        <h1 className="text-[48px] md:text-[72px] tracking-[-0.04em] font-bold text-[#1A1A1A] max-w-4xl leading-[0.98] font-helveticaDisplay">
          A commercial production company, independently run, director-led.
        </h1>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-24">
        <div className="lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#999]">
            Who we are
          </p>
        </div>
        <div className="lg:col-span-7 space-y-5 text-[17px] md:text-[19px] leading-relaxed tracking-tight-2 text-[#1A1A1A]">
          <p>
            Friends &amp; Family is a commercial production company based in Los
            Angeles and New York, with over 25 years of production experience
            across our partners.
          </p>
          <p>
            We represent a small, curated roster of directors and build every
            project around long-running relationships — with agencies, with
            brands, and with the people we make work for.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-24 pt-16 border-t border-[#E8E7E3]">
        <div className="lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#999]">
            Team
          </p>
        </div>
        <div className="lg:col-span-9">
          <ul className="divide-y divide-[#E8E7E3] -mt-2">
            {TEAM.map((m) => (
              <li
                key={m.email}
                className="py-5 flex flex-col md:flex-row md:items-baseline md:justify-between gap-1"
              >
                <div>
                  <p className="text-[20px] tracking-tight-2 text-[#1A1A1A]">
                    {m.name}
                  </p>
                  <p className="text-[12px] uppercase tracking-[0.12em] text-[#666] mt-1">
                    {m.role}
                  </p>
                </div>
                <a
                  href={`mailto:${m.email}`}
                  className="text-[14px] text-[#1A1A1A] hover:text-[#666] transition-colors"
                >
                  {m.email}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-16 border-t border-[#E8E7E3]">
        <div className="lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#999]">
            Sales reps
          </p>
        </div>
        <div className="lg:col-span-9">
          <ul className="divide-y divide-[#E8E7E3] -mt-2">
            {REPS.map((r) => (
              <li
                key={r.region}
                className="py-5 flex items-baseline justify-between gap-6"
              >
                <p className="text-[20px] tracking-tight-2 text-[#1A1A1A]">
                  {r.name}
                </p>
                <p className="text-[12px] uppercase tracking-[0.12em] text-[#666]">
                  {r.region}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
