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
  "LA / NY / SP / CWB",
  "Production / post / VFX",
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
            <h1 className="text-[54px] md:text-[90px] lg:text-[118px] font-medium text-[#1A1A1A] font-helveticaDisplay leading-[0.92]">
              A creative network across the Americas.
            </h1>
          </div>
          <p className="lg:col-span-4 lg:col-start-9 text-[16px] md:text-[18px] leading-relaxed text-[#555]">
            Director-led and independently run from Los Angeles and New York,
            connected with production, post, animation, and VFX in Brazil.
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
        <div className="lg:col-span-7 space-y-5 text-[20px] md:text-[26px] leading-snug text-[#1A1A1A]">
          <p>
            Friends &amp; Family is a creative network of three connected
            practices across the Americas: production in Los Angeles and New
            York, post and animation in Curitiba, and a wider culture practice
            in São Paulo. Director-led, independently run.
          </p>
          <p className="text-[#555]">
            A small roster, picked carefully. Long relationships with
            directors, brands, and the people that come back.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-20 lg:mt-28 pt-12 border-t border-[#E8E7E3] grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-[#999]">
            NETWORK
          </p>
        </div>
        <div className="lg:col-span-7 space-y-6 text-[20px] md:text-[26px] leading-snug text-[#1A1A1A]">
          <p>
            COLOSSAL in Curitiba and THE YOUTH in São Paulo connect post,
            animation, VFX, production, and culture work to Friends &amp;
            Family&apos;s Los Angeles and New York offices. One network across the
            Americas.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
            <a
              href="https://colossal.film/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#1A1A1A] hover:text-[#666] transition-colors"
            >
              Visit COLOSSAL →
            </a>
            <a
              href="https://theyouth.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#1A1A1A] hover:text-[#666] transition-colors"
            >
              Visit THE YOUTH →
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
                  <p className="text-[26px] md:text-[34px] text-[#1A1A1A] font-helveticaDisplay font-medium leading-none">
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
                <p className="text-[26px] md:text-[34px] text-[#1A1A1A] font-helveticaDisplay font-medium leading-none">
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
