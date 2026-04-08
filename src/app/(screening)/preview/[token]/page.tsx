import crypto from "crypto";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScreeningCarousel } from "@/components/video/screening-carousel";
import { PreviewTrackerClient } from "./preview-tracker-client";

interface PreviewPayload {
  directorId: string;
  projectIds: string[];
  title: string;
  brand: string | null;
  curatorialNote: string | null;
  agencyName: string | null;
  campaignName: string | null;
  exp: number;
}

function decodePreviewToken(token: string): PreviewPayload | null {
  try {
    const [payloadB64, signature] = token.split(".");
    if (!payloadB64 || !signature) return null;

    const secret = process.env.NEXTAUTH_SECRET || "preview-fallback-secret";
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    if (signature !== expectedSig) return null;

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    ) as PreviewPayload;

    // Check expiration
    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export default async function PreviewPage({
  params,
}: {
  params: { token: string };
}) {
  const payload = decodePreviewToken(params.token);
  if (!payload) return notFound();

  const { directorId, projectIds, title, brand, curatorialNote, agencyName, campaignName } = payload;

  // Fetch the director
  const director = await prisma.director.findUnique({
    where: { id: directorId },
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      statement: true,
      headshotUrl: true,
      websiteUrl: true,
    },
  });

  if (!director) return notFound();

  // Fetch projects in the order specified by projectIds
  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
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
  });

  // Re-order to match the projectIds order
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const orderedProjects = projectIds
    .map((id) => projectMap.get(id))
    .filter(Boolean) as typeof projects;

  // Build items in the same shape as the real screening page
  const items = orderedProjects.map((project, i) => ({
    id: `preview-item-${i}`,
    project,
  }));

  const reelProjectIds = orderedProjects.map((p) => p.id);

  // Detect multi-director
  const directorIdSet = new Set(orderedProjects.map((p) => p.director.id));
  const allDirectorIds = Array.from(directorIdSet);
  const secondaryDirectorIds = allDirectorIds.filter((id) => id !== directorId);
  const isMultiDirector = secondaryDirectorIds.length > 0;

  // Fetch all secondary data in parallel (same pattern as real screening page)
  const [
    portfolioStills,
    rosterHighlights,
    allDirectorProjects,
    treatmentSamples,
    frameGrabsByProject,
    lookbookItems,
    caseStudies,
    shortFilms,
  ] = await Promise.all([
    prisma.project.findMany({
      where: { directorId, isPublished: true, id: { notIn: reelProjectIds }, thumbnailUrl: { not: null } },
      select: { id: true, title: true, brand: true, thumbnailUrl: true },
      take: 20,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.director.findMany({
      where: { isActive: true, rosterStatus: "ROSTER", id: { not: directorId }, headshotUrl: { not: null } },
      select: { id: true, name: true, slug: true, headshotUrl: true, categories: true },
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
        directorId, isPublished: true,
        OR: [{ contentType: "CASE_STUDY" }, { title: { contains: "Director Commentary", mode: "insensitive" } }],
      },
      select: { id: true, title: true, brand: true, agency: true, year: true, duration: true, muxPlaybackId: true, thumbnailUrl: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.project.findMany({
      where: {
        directorId, isPublished: true,
        OR: [{ contentType: "SHORT_FILM" }, { category: { contains: "Short Film", mode: "insensitive" } }, { title: { contains: "Short Film", mode: "insensitive" } }],
      },
      select: { id: true, title: true, brand: true, agency: true, year: true, duration: true, muxPlaybackId: true, thumbnailUrl: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const clientBrands = allDirectorProjects
    .map((p) => p.brand)
    .filter((b): b is string => b !== null);

  // Frame grabs map
  const frameGrabsMap: Record<string, typeof frameGrabsByProject> = {};
  for (const fg of frameGrabsByProject) {
    if (!frameGrabsMap[fg.projectId]) frameGrabsMap[fg.projectId] = [];
    frameGrabsMap[fg.projectId].push(fg);
  }

  // Multi-director secondary data
  type DirectorSecondaryData = {
    portfolioStills: typeof portfolioStills;
    clientBrands: string[];
    treatmentSamples: typeof treatmentSamples;
    lookbookItems: typeof lookbookItems;
    caseStudies: typeof caseStudies;
    shortFilms: typeof shortFilms;
  };

  const directorsData: Record<string, DirectorSecondaryData> = {};
  directorsData[directorId] = { portfolioStills, clientBrands, treatmentSamples, lookbookItems, caseStudies, shortFilms };

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

  return (
    <PreviewTrackerClient>
      {/* PREVIEW badge */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
        <div className="px-3 py-1 rounded-full bg-amber-500/90 text-white text-[10px] font-semibold uppercase tracking-[0.15em] shadow-lg backdrop-blur-sm">
          Preview
        </div>
      </div>

      <ScreeningCarousel
        items={items}
        director={director}
        reelTitle={title}
        brand={brand}
        agencyName={agencyName}
        campaignName={campaignName}
        curatorialNote={curatorialNote}
        portfolioStills={portfolioStills}
        rosterHighlights={rosterHighlights}
        treatmentSamples={treatmentSamples}
        clientBrands={clientBrands}
        frameGrabsMap={frameGrabsMap}
        lookbookItems={lookbookItems}
        caseStudies={caseStudies}
        shortFilms={shortFilms}
        galleryImages={[]}
        directorsData={isMultiDirector ? directorsData : undefined}
      />
    </PreviewTrackerClient>
  );
}
