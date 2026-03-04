import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";

const FF_WEBSITE = "https://friendsandfamily.tv";

/* ── Static roster data with photos from friendsandfamily.tv ── */
const rosterPhotos: Record<string, string> = {
  "Bueno": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66029dca25e7ecd0ecbde6ed_FF_WEB_BUENO.jpg",
  "Cody Cloud": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d09_FF_WEB_CODYjpg.jpg",
  "Matt Dilmore": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/692e759e93d54ebe70a5ebb7_FF_WEB_DILMORE_5.jpg",
  "James Frost": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020a7_FF_WEB_JAMESFROST.jpg",
  "Le Ged": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/6668900dfdb5154b13bda62d_FF_WEB_LeGED.jpg",
  "Boma Iluma": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/687fd68ef30b936b35f41b67_FF_WEB_BOMA.jpg",
  "Tarik Karam": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df020ac_FF_WEB_TARIKKARAM.jpg",
  "Kelsey Larkin": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cd6_FF_WEB_KELSEY.jpg",
  "Leigh Marling": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/66ec55e9728446d85b57fae3_FF_WEB_LEIGH.jpg",
  "Sarah McColgan": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65f09cc8f01d0ffc94630e73_FF_Web_SARAHMCCOLGAN.jpg",
  "Alexander Cody Nguyen": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67d868924b0fcf1a169a65a8_FF_WEB_ALEXANDER.jpg",
  "Terry Rayment": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d08_FF_WEB_TERRY.jpg",
  "Caleb Slain": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01cea_FF_WEB_CALEB.jpg",
  "Nick Stach": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/68d587dab86d1ef8d046a4ec_FF_Web_NickStach.jpg",
  "Olivier Staub": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/67847311d60fecb346ca2a3b_FF_WEB_OLIVIER.jpg",
  "Jack Turits": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01d05_FF_WEB_JACK.jpg",
  "Brother Willis": "https://cdn.prod.website-files.com/65976573e20f53252df01c48/65976573e20f53252df01dea_FF_WEB_BROTHERWILLIS.jpg",
};

/* Slugs for linking to director pages on the main website */
const rosterSlugs: Record<string, string> = {
  "Bueno": "bueno",
  "Cody Cloud": "cody-cloud",
  "Matt Dilmore": "matt-dilmore",
  "James Frost": "james-frost",
  "Le Ged": "le-ged",
  "Boma Iluma": "boma-iluma",
  "Tarik Karam": "tarik",
  "Kelsey Larkin": "kelsey-larkin",
  "Leigh Marling": "leigh-marling",
  "Sarah McColgan": "sarah-mccolgan",
  "Alexander Cody Nguyen": "alexander-cody-nguyen",
  "Terry Rayment": "terry-rayment",
  "Caleb Slain": "caleb-slain",
  "Nick Stach": "nick-stach",
  "Olivier Staub": "olivier-staub",
  "Jack Turits": "jack-turits",
  "Brother Willis": "brother-willis",
};

export default async function AboutPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Pull directors from database for spot counts
  const directors = await prisma.director.findMany({
    where: { isActive: true, rosterStatus: "ROSTER" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      headshotUrl: true,
      _count: { select: { projects: true } },
    },
  });

  // Merge database directors with website photos
  const rosterNames = Object.keys(rosterPhotos);
  const roster = rosterNames.map((name) => {
    const dbDirector = directors.find(
      (d) => d.name.toLowerCase() === name.toLowerCase()
    );
    return {
      name,
      slug: rosterSlugs[name] || name.toLowerCase().replace(/\s+/g, "-"),
      photoUrl: rosterPhotos[name],
      headshotUrl: dbDirector?.headshotUrl || null,
      spotCount: dbDirector?._count.projects || 0,
      inDatabase: !!dbDirector,
    };
  });

  return (
    <div className="-mx-5 -mt-16 md:-mx-16 md:-mt-14 min-h-screen bg-[#111] text-white">
      {/* Header */}
      <div className="px-6 md:px-16 pt-20 md:pt-16 pb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-tight">FF</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white/90">
            Friends &amp; Family
          </h1>
        </div>
        <p className="text-[12px] text-white/30 ml-12">
          Commercial Directors &amp; Photographers
        </p>
      </div>

      {/* Roster section */}
      <div className="px-6 md:px-16 pb-20">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-white/25 mb-10">
          R O S T E R
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {roster.map((director) => (
            <a
              key={director.name}
              href={`${FF_WEBSITE}/directors/${director.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              {/* Photo */}
              <div className="aspect-square rounded-full overflow-hidden mb-4 bg-white/5 ring-1 ring-white/5 group-hover:ring-white/15 transition-all duration-500 group-hover:scale-[1.03]">
                <img
                  src={director.photoUrl}
                  alt={director.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 opacity-70 group-hover:opacity-100"
                  loading="lazy"
                />
              </div>

              {/* Name */}
              <p className="text-[14px] md:text-[15px] text-white/60 group-hover:text-white/90 transition-colors duration-300 text-center font-light">
                {director.name}
              </p>
              {director.spotCount > 0 && (
                <p className="text-[10px] text-white/20 text-center mt-0.5">
                  {director.spotCount} spot{director.spotCount !== 1 ? "s" : ""}
                </p>
              )}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
