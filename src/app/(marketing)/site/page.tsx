import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { HeroVideo } from "@/components/marketing/hero-video";
import { DirectorCard } from "@/components/marketing/director-card";

export const metadata: Metadata = {
  title: { absolute: "Friends & Family — Commercial Production" },
};

export const revalidate = 300;

async function getHomepageData() {
  const [featuredDirectors, recentProjects] = await Promise.all([
    prisma.director.findMany({
      where: { isActive: true, rosterStatus: "ROSTER" },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 6,
      select: {
        id: true,
        slug: true,
        name: true,
        categories: true,
        videoIntroUrl: true,
        headshotUrl: true,
        heroThumbnailUrl: true,
        heroProjectId: true,
      },
    }),
    prisma.project.findMany({
      where: { muxStatus: "ready" },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        title: true,
        brand: true,
        thumbnailUrl: true,
        muxPlaybackId: true,
        director: { select: { slug: true, name: true } },
      },
    }),
  ]);

  return { featuredDirectors, recentProjects };
}

async function resolveHeroProjectThumb(heroProjectId: string | null) {
  if (!heroProjectId) return null;
  const p = await prisma.project.findUnique({
    where: { id: heroProjectId },
    select: { thumbnailUrl: true, muxPlaybackId: true },
  });
  if (!p) return null;
  return (
    p.thumbnailUrl ??
    (p.muxPlaybackId
      ? `https://image.mux.com/${p.muxPlaybackId}/thumbnail.jpg?width=1280`
      : null)
  );
}

export default async function MarketingHomePage() {
  const { featuredDirectors, recentProjects } = await getHomepageData();

  const directorWithIntro = featuredDirectors.find((d) => d.videoIntroUrl);
  const heroProject = recentProjects.find((p) => p.muxPlaybackId);

  const heroPlaybackId =
    directorWithIntro?.videoIntroUrl ?? heroProject?.muxPlaybackId ?? null;

  const heroPoster = directorWithIntro?.heroProjectId
    ? await resolveHeroProjectThumb(directorWithIntro.heroProjectId)
    : heroProject?.thumbnailUrl ?? null;

  const cardsWithStills = await Promise.all(
    featuredDirectors.map(async (d) => ({
      ...d,
      stillUrl:
        d.heroThumbnailUrl ??
        (await resolveHeroProjectThumb(d.heroProjectId)) ??
        d.headshotUrl ??
        null,
    })),
  );

  return (
    <>
      <HeroVideo muxPlaybackId={heroPlaybackId} posterUrl={heroPoster} />

      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 lg:py-32">
        <div className="flex items-end justify-between gap-6 mb-12">
          <h2 className="text-[28px] md:text-[36px] tracking-tight-3 font-light text-[#1A1A1A]">
            Selected directors
          </h2>
          <Link
            href="/site/directors"
            className="text-[12px] uppercase tracking-[0.14em] text-[#666] hover:text-[#1A1A1A] transition-colors"
          >
            View all →
          </Link>
        </div>

        {cardsWithStills.length === 0 ? (
          <EmptyMessage message="No directors published yet." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
            {cardsWithStills.map((d) => (
              <DirectorCard
                key={d.id}
                slug={d.slug}
                name={d.name}
                positioning={d.categories?.[0] ?? null}
                stillUrl={d.stillUrl}
                muxPlaybackId={d.videoIntroUrl}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-[#E8E7E3]">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 lg:py-32">
          <div className="flex items-end justify-between gap-6 mb-12">
            <h2 className="text-[28px] md:text-[36px] tracking-tight-3 font-light text-[#1A1A1A]">
              Recent work
            </h2>
            <Link
              href="/site/work"
              className="text-[12px] uppercase tracking-[0.14em] text-[#666] hover:text-[#1A1A1A] transition-colors"
            >
              View archive →
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <EmptyMessage message="No projects published yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-14">
              {recentProjects.map((p) => {
                const still =
                  p.thumbnailUrl ??
                  (p.muxPlaybackId
                    ? `https://image.mux.com/${p.muxPlaybackId}/thumbnail.jpg?width=1000`
                    : null);
                return (
                  <Link
                    key={p.id}
                    href={`/site/directors/${p.director.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-video overflow-hidden bg-[#EEEDEA]">
                      {still && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={still}
                          alt={p.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.015] group-hover:opacity-95"
                        />
                      )}
                    </div>
                    <div className="mt-4">
                      {p.brand && (
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#1A1A1A] font-medium">
                          {p.brand}
                        </p>
                      )}
                      <p className="text-[18px] md:text-[20px] tracking-tight-2 font-light text-[#1A1A1A] leading-[1.15] mt-1">
                        {p.title}
                      </p>
                      <p className="text-[12px] tracking-tight text-[#666] mt-2">
                        Dir. {p.director.name}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-[#E8E7E3] py-16 text-center">
      <p className="text-[13px] text-[#999]">{message}</p>
    </div>
  );
}
