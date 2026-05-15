import type { Metadata } from "next";
import { InfinitePhotoLoop } from "@/components/marketing/infinite-photo-loop";
import { ABOUT_PHOTOS } from "@/lib/about/photos";

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

const PRINCIPLES = [
  "Director-led",
  "Independent",
  "Los Angeles / New York",
  "Production-forward",
];

export default function AboutPage() {
  return (
    <div className="pt-24 lg:pt-28 pb-24">
      <section className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <header className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#999] mb-4">
              About
            </p>
            <h1 className="text-[52px] md:text-[84px] lg:text-[110px] font-black text-[#1A1A1A] font-helveticaDisplay leading-[0.9]">
              Friends make the work possible.
            </h1>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-[15px] md:text-[17px] leading-relaxed tracking-tight text-[#555]">
            An independent commercial production company built around a close
            roster, long relationships, and the people behind the frame.
          </p>
        </header>

        <InfinitePhotoLoop photos={ABOUT_PHOTOS} />
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-20 lg:mt-28">
        <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[#E8E7E3]">
          {PRINCIPLES.map((item) => (
            <div
              key={item}
              className="py-5 md:py-7 border-b md:border-b-0 md:border-r last:border-r-0 border-[#E8E7E3]"
            >
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#666]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-20 lg:mt-28 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#999]">
            Company
          </p>
        </div>
        <div className="lg:col-span-7 space-y-5 text-[19px] md:text-[24px] leading-snug tracking-tight text-[#1A1A1A]">
          <p>
            Friends &amp; Family represents a curated group of commercial
            directors and builds each project around the right creative,
            production, and agency relationships.
          </p>
          <p className="text-[#555]">
            The work spans broadcast, brand films, music, culture, and
            campaign systems for agencies and brands that need taste,
            precision, and calm production instincts.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-20 lg:mt-28 pt-12 border-t border-[#E8E7E3] grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#999]">
            NETWORK
          </p>
        </div>
        <div className="lg:col-span-7 space-y-6 text-[19px] md:text-[24px] leading-snug tracking-tight text-[#1A1A1A]">
          <p>
            Friends &amp; Family is an imprint of THE YOUTH in São Paulo and
            COLOSSAL in Curitiba. Three studios. One creative network across
            the Americas.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
            <a
              href="https://theyouth.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#1A1A1A] hover:text-[#666] transition-colors"
            >
              Visit THE YOUTH →
            </a>
            <a
              href="https://colossal.film/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#1A1A1A] hover:text-[#666] transition-colors"
            >
              Visit COLOSSAL →
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-20 lg:mt-28 pt-12 border-t border-[#E8E7E3] grid grid-cols-1 lg:grid-cols-12 gap-10">
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
                  <p className="text-[24px] md:text-[30px] tracking-tight text-[#1A1A1A] font-helveticaDisplay">
                    {m.name}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-[#666] mt-1">
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

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-20 pt-12 border-t border-[#E8E7E3] grid grid-cols-1 lg:grid-cols-12 gap-10">
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
                <p className="text-[24px] md:text-[30px] tracking-tight text-[#1A1A1A] font-helveticaDisplay">
                  {r.name}
                </p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#666]">
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
