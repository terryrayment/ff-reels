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
  // Step 1: Fetch the screening link + reel + director + items
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
      },
    },
  });

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

  const reelProjectIds = link.reel.items.map((item) => item.project.id);
  const directorId = link.reel.director.id;
  const reelId = link.reel.id;

  // Detect multi-director reel — collect unique director IDs from items
  const directorIdSet = new Set(link.reel.items.map((item) => item.project.director.id));
  const allDirectorIds = Array.from(directorIdSet);
  const secondaryDirectorIds = allDirectorIds.filter((id) => id !== directorId);
  const isMultiDirector = secondaryDirectorIds.length > 0;

  // Step 2: Run ALL secondary queries in parallel (10 sequential → 1 parallel batch)
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
    // Portfolio stills (up to 20 thumbnails from projects NOT in this reel)
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

    // Roster highlights for the "About F&F" company panel
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

    // Unique client/brand list across ALL director's projects (for Bio panel)
    prisma.project.findMany({
      where: { directorId, brand: { not: null } },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),

    // Treatment samples for the director
    prisma.treatmentSample.findMany({
      where: { directorId },
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
    }),

    // Frame grabs per project in this reel
    prisma.frameGrab.findMany({
      where: { projectId: { in: reelProjectIds } },
      select: {
        id: true,
        projectId: true,
        imageUrl: true,
        caption: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
    }),

    // Lookbook items for the director
    prisma.lookbookItem.findMany({
      where: { directorId },
      select: {
        id: true,
        imageUrl: true,
        caption: true,
        source: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
      take: 24,
    }),

    // Case study / Director Commentary projects
    prisma.project.findMany({
      where: {
        directorId,
        isPublished: true,
        OR: [
          { contentType: "CASE_STUDY" },
          { title: { contains: "Director Commentary", mode: "insensitive" } },
        ],
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
    }),

    // Short film projects
    prisma.project.findMany({
      where: {
        directorId,
        isPublished: true,
        OR: [
          { contentType: "SHORT_FILM" },
          { category: { contains: "Short Film", mode: "insensitive" } },
          { title: { contains: "Short Film", mode: "insensitive" } },
        ],
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
    }),

    // AI gallery images for this reel
    prisma.reelGalleryImage.findMany({
      where: { reelId },
      orderBy: { sortOrder: "asc" },
      include: {
        project: { select: { id: true, title: true, brand: true } },
      },
    }),
  ]);

  const clientBrands = allDirectorProjects
    .map((p) => p.brand)
    .filter((b): b is string => b !== null);

  // Step 3: For multi-director reels, load secondary data for each additional director
  type DirectorSecondaryData = {
    portfolioStills: typeof portfolioStills;
    clientBrands: string[];
    treatmentSamples: typeof treatmentSamples;
    lookbookItems: typeof lookbookItems;
    caseStudies: typeof caseStudies;
    shortFilms: typeof shortFilms;
  };

  const directorsData: Record<string, DirectorSecondaryData> = {};

  // Primary director data is already loaded
  directorsData[directorId] = {
    portfolioStills,
    clientBrands,
    treatmentSamples,
    lookbookItems,
    caseStudies,
    shortFilms,
  };

  if (isMultiDirector) {
    const secondaryResults = await Promise.all(
      secondaryDirectorIds.map(async (dId) => {
        const [stills, brands, treatments, looks, cases, shorts] = await Promise.all([
          prisma.project.findMany({
            where: { directorId: dId, isPublished: true, id: { notIn: reelProjectIds }, thumbnailUrl: { not: null } },
            select: { id: true, title: true, brand: true, thumbnailUrl: true },
            take: 20,
            orderBy: { sortOrder: "asc" },
          }),
          prisma.project.findMany({
            where: { directorId: dId, brand: { not: null } },
            select: { brand: true },
            distinct: ["brand"],
            orderBy: { brand: "asc" },
          }),
          prisma.treatmentSample.findMany({
            where: { directorId: dId },
            select: { id: true, title: true, brand: true, previewUrl: true, pageCount: true, isRedacted: true },
            orderBy: { createdAt: "desc" },
            take: 6,
          }),
          prisma.lookbookItem.findMany({
            where: { directorId: dId },
            select: { id: true, imageUrl: true, caption: true, source: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
            take: 24,
          }),
          prisma.project.findMany({
            where: {
              directorId: dId, isPublished: true,
              OR: [{ contentType: "CASE_STUDY" }, { title: { contains: "Director Commentary", mode: "insensitive" } }],
            },
            select: { id: true, title: true, brand: true, agency: true, year: true, duration: true, muxPlaybackId: true, thumbnailUrl: true },
            orderBy: { sortOrder: "asc" },
          }),
          prisma.project.findMany({
            where: {
              directorId: dId, isPublished: true,
              OR: [{ contentType: "SHORT_FILM" }, { category: { contains: "Short Film", mode: "insensitive" } }, { title: { contains: "Short Film", mode: "insensitive" } }],
            },
            select: { id: true, title: true, brand: true, agency: true, year: true, duration: true, muxPlaybackId: true, thumbnailUrl: true },
            orderBy: { sortOrder: "asc" },
          }),
        ]);
        return {
          id: dId,
          data: {
            portfolioStills: stills,
            clientBrands: brands.map((b) => b.brand).filter((b): b is string => b !== null),
            treatmentSamples: treatments,
            lookbookItems: looks,
            caseStudies: cases,
            shortFilms: shorts,
          } as DirectorSecondaryData,
        };
      })
    );
    for (const r of secondaryResults) {
      directorsData[r.id] = r.data;
    }
  }

  // Group frame grabs by projectId for easy lookup
  const frameGrabsMap: Record<string, typeof frameGrabsByProject> = {};
  for (const fg of frameGrabsByProject) {
    if (!frameGrabsMap[fg.projectId]) frameGrabsMap[fg.projectId] = [];
    frameGrabsMap[fg.projectId].push(fg);
  }

  // Generate signed URLs for gallery images
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
        directorsData={isMultiDirector ? directorsData : undefined}
      />
    </ScreeningTracker>
  );
}
