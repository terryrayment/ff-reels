import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { getDownloadUrl } from "@/lib/r2/client";
import { ScreeningCarousel } from "@/components/video/screening-carousel";

export default async function MyReelViewPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "DIRECTOR") redirect("/dashboard");

  const directorId = session.user.directorId;
  if (!directorId) redirect("/portfolio");

  // Fetch the reel — verify it belongs to this director
  const reel = await prisma.reel.findUnique({
    where: { id: params.id },
    include: {
      director: {
        select: {
          id: true,
          name: true,
          slug: true,
          bio: true,
          statement: true,
          headshotUrl: true,
          websiteUrl: true,
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
              director: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  headshotUrl: true,
                  bio: true,
                  statement: true,
                  websiteUrl: true,
                },
              },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!reel) return notFound();
  if (reel.directorId !== directorId) return notFound();

  const reelProjectIds = reel.items.map((item) => item.project.id);

  // Load secondary data for the screening carousel (same as public screening page, minus tracking)
  const [
    portfolioStills,
    rosterHighlights,
    allDirectorProjects,
    treatmentSamples,
    frameGrabsByProject,
    lookbookItems,
    caseStudies,
    shortFilms,
    galleryImages,
  ] = await Promise.all([
    prisma.project.findMany({
      where: {
        directorId,
        isPublished: true,
        id: { notIn: reelProjectIds },
        thumbnailUrl: { not: null },
      },
      select: { id: true, title: true, brand: true, thumbnailUrl: true },
      take: 20,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.director.findMany({
      where: {
        isActive: true,
        rosterStatus: "ROSTER",
        id: { not: directorId },
        headshotUrl: { not: null },
      },
      select: { id: true, name: true, headshotUrl: true, categories: true },
      take: 8,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.findMany({
      where: { directorId, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
    prisma.treatmentSample.findMany({
      where: { directorId },
      select: { id: true, title: true, brand: true, previewUrl: true, pageCount: true, isRedacted: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.frameGrab.findMany({
      where: { projectId: { in: reelProjectIds } },
      select: { id: true, projectId: true, imageUrl: true, caption: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.lookbookItem.findMany({
      where: { directorId },
      select: { id: true, imageUrl: true, caption: true, source: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
      take: 24,
    }),
    prisma.project.findMany({
      where: {
        directorId,
        isPublished: true,
        OR: [{ contentType: "CASE_STUDY" }, { title: { contains: "Director Commentary", mode: "insensitive" } }],
      },
      select: { id: true, title: true, brand: true, agency: true, year: true, duration: true, muxPlaybackId: true, thumbnailUrl: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.findMany({
      where: {
        directorId,
        isPublished: true,
        OR: [{ contentType: "SHORT_FILM" }, { category: { contains: "Short Film", mode: "insensitive" } }, { title: { contains: "Short Film", mode: "insensitive" } }],
      },
      select: { id: true, title: true, brand: true, agency: true, year: true, duration: true, muxPlaybackId: true, thumbnailUrl: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.reelGalleryImage.findMany({
      where: { reelId: reel.id },
      orderBy: { sortOrder: "asc" },
      include: {
        project: { select: { id: true, title: true, brand: true } },
      },
    }),
  ]);

  const clientBrands = allDirectorProjects
    .map((p) => p.brand)
    .filter((b): b is string => b !== null);

  const frameGrabsMap: Record<string, typeof frameGrabsByProject> = {};
  for (const fg of frameGrabsByProject) {
    if (!frameGrabsMap[fg.projectId]) frameGrabsMap[fg.projectId] = [];
    frameGrabsMap[fg.projectId].push(fg);
  }

  const galleryWithUrls = await Promise.all(
    galleryImages.map(async (img) => ({
      id: img.id,
      projectId: img.projectId,
      projectTitle: img.project.title,
      projectBrand: img.project.brand,
      timeOffset: img.timeOffset,
      aiScore: img.aiScore,
      width: img.width,
      height: img.height,
      sortOrder: img.sortOrder,
      imageUrl: await getDownloadUrl(img.r2Key, 3600),
      thumbnailUrl: img.thumbnailR2Key
        ? await getDownloadUrl(img.thumbnailR2Key, 3600)
        : await getDownloadUrl(img.r2Key, 3600),
    })),
  );

  // Render the same screening carousel — without tracking (no ScreeningTracker wrapper)
  return (
    <div className="fixed inset-0 z-50 bg-[#0e0e0e]">
      <ScreeningCarousel
        items={reel.items}
        director={reel.director}
        reelTitle={reel.title}
        brand={reel.brand}
        agencyName={reel.agencyName}
        campaignName={reel.campaignName}
        curatorialNote={reel.curatorialNote}
        portfolioStills={portfolioStills}
        rosterHighlights={rosterHighlights}
        treatmentSamples={treatmentSamples}
        clientBrands={clientBrands}
        frameGrabsMap={frameGrabsMap}
        lookbookItems={lookbookItems}
        caseStudies={caseStudies}
        shortFilms={shortFilms}
        galleryImages={galleryWithUrls}
        reelId={reel.id}
      />
    </div>
  );
}
