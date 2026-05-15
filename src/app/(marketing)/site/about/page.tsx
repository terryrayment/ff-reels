import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

const ABOUT_IMAGES = [
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02012_gallery-225_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df0207c_gallery-277_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02096_gallery-290_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02073_gallery-273_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f85_gallery-154_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02046_gallery-260_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01e67_gallery-010_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df0204c_gallery-234_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ee3_gallery-072_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01e81_gallery-023_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df0208a_gallery-284_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01fd2_gallery-193_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df02000_gallery-216_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01fb8_gallery-180_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f71_gallery-144_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f81_gallery-152_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f1b_gallery-100_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ffe_gallery-215_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f5b_gallery-133_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ec7_gallery-058_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f9d_gallery-169_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df0203f_gallery-252_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01ed1_gallery-063_low-res.jpg",
  "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01f34_gallery-115_low-res.jpg",
];

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

        <div className="columns-2 md:columns-4 lg:columns-6 gap-1 [column-fill:_balance]">
          {ABOUT_IMAGES.map((src, index) => (
            <figure
              key={src}
              className="group relative mb-1 break-inside-avoid overflow-hidden bg-[#E8E7E3]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Friends and Family archive ${index + 1}`}
                loading={index < 10 ? "eager" : "lazy"}
                className="w-full object-cover grayscale-[12%] transition duration-[900ms] ease-out group-hover:scale-[1.035] group-hover:grayscale-0"
              />
            </figure>
          ))}
        </div>
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
