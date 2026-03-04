import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDownloadUrl } from "@/lib/r2/client";
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

  // Roster highlights for the "About F&F" company panel
  const rosterHighlights = link
    ? await prisma.director.findMany({
        where: {
          isActive: true,
          rosterStatus: "ROSTER",
          id: { not: link.reel.director.id }, // exclude current director
          headshotUrl: { not: null },
        },
        select: {
          id: true,
          name: true,
          headshotUrl: true,
          categories: true,
        },
        take: 8,
        orderBy: { sortOrder: "asc" },
      })
    : [];

  // Unique client/brand list across ALL director's projects (for Bio panel)
  const allDirectorProjects = link
    ? await prisma.project.findMany({
        where: {
          directorId: link.reel.director.id,
          brand: { not: null },
        },
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      })
    : [];
  const clientBrands = allDirectorProjects
    .map((p) => p.brand)
    .filter((b): b is string => b !== null);

  // Treatment samples for the director (for "Treatment Examples" panel)
  const treatmentSamples = link
    ? await prisma.treatmentSample.findMany({
        where: { directorId: link.reel.director.id },
        select: {
          id: true,
          title: true,
          brand: true,
          previewUrl: true,
          pageCount: true,
          isRedacted: true,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      })
    : [];

  // Frame grabs per project in this reel (for "Frame Grabs" gallery panel)
  const frameGrabsByProject = link
    ? await prisma.frameGrab.findMany({
        where: { projectId: { in: reelProjectIds } },
        select: {
          id: true,
          projectId: true,
          imageUrl: true,
          caption: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  // Group frame grabs by projectId for easy lookup
  const frameGrabsMap: Record<string, typeof frameGrabsByProject> = {};
  for (const fg of frameGrabsByProject) {
    if (!frameGrabsMap[fg.projectId]) frameGrabsMap[fg.projectId] = [];
    frameGrabsMap[fg.projectId].push(fg);
  }

  // Lookbook items for the director (for "Lookbook" mood board panel)
  const lookbookItems = link
    ? await prisma.lookbookItem.findMany({
        where: { directorId: link.reel.director.id },
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          source: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: "asc" },
        take: 24,
      })
    : [];

  // Case study projects for the director (director commentary videos)
  const caseStudies = link
    ? await prisma.project.findMany({
        where: {
          directorId: link.reel.director.id,
          contentType: "CASE_STUDY",
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          brand: true,
          agency: true,
          year: true,
          duration: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
        },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  // Short film projects for the director
  const shortFilms = link
    ? await prisma.project.findMany({
        where: {
          directorId: link.reel.director.id,
          contentType: "SHORT_FILM",
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          brand: true,
          agency: true,
          year: true,
          duration: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
        },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  // AI gallery images for this reel
  const galleryImages = link?.reel
    ? await prisma.reelGalleryImage.findMany({
        where: { reelId: link.reel.id },
        orderBy: { sortOrder: "asc" },
        include: { project: { select: { id: true, title: true, brand: true } } },
      })
    : [];

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
    </ScreeningTracker>
  );
}
