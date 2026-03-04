import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScreeningTracker } from "@/components/video/screening-tracker";
import { ScreeningCarousel } from "@/components/video/screening-carousel";

export default async function ScreeningPage({
  params,
}: {
  params: { token: string };
}) {
  const link = await prisma.screeningLink.findUnique({
    where: { token: params.token, isActive: true },
    include: {
      reel: {
        include: {
          director: {
            select: {
              id: true,
              name: true,
              bio: true,
              statement: true,
              headshotUrl: true,
            },
          },
          items: {
            include: {
              project: {
                select: {
                  id: true,
                  title: true,
                  brand: true,
                  agency: true,
                  year: true,
                  duration: true,
                  muxPlaybackId: true,
                  thumbnailUrl: true,
                  contextNote: true,
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  // Fetch still grabs from the director's broader portfolio
  // (up to 20 random thumbnails from projects NOT in this reel)
  const reelProjectIds = link
    ? link.reel.items.map((item) => item.project.id)
    : [];

  const portfolioStills = link
    ? await prisma.project.findMany({
        where: {
          directorId: link.reel.director.id,
          isPublished: true,
          id: { notIn: reelProjectIds },
          thumbnailUrl: { not: null },
        },
        select: {
          id: true,
          title: true,
          brand: true,
          thumbnailUrl: true,
        },
        take: 20,
        orderBy: { sortOrder: "asc" },
      })
    : [];

  if (!link) return notFound();

  if (link.expiresAt && link.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-white/40">This link has expired.</p>
          <p className="text-xs text-white/20 mt-2">
            Contact the sender for a new link.
          </p>
        </div>
      </div>
    );
  }

  const { reel } = link;
  const { director } = reel;

  return (
    <ScreeningTracker screeningLinkId={link.id}>
      <ScreeningCarousel
        items={reel.items}
        director={director}
        reelTitle={reel.title}
        brand={reel.brand}
        agencyName={reel.agencyName}
        campaignName={reel.campaignName}
        curatorialNote={reel.curatorialNote}
        portfolioStills={portfolioStills}
      />
    </ScreeningTracker>
  );
}
