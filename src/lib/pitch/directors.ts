import { prisma } from "@/lib/db";

/**
 * Shared director media loading for branded pitch pages.
 * Mirrors the curation rules on /pitch/versant: explicit clean-spot
 * allowlist, blocked slate-reel titles, and <= 75s motion sampling.
 */

export const PITCH_DIRECTOR_SLUGS = [
  "terry-rayment",
  "jack-turits",
  "matt-dilmore",
  "boma-iluma",
  "kelsey-larkin",
  "caleb-slain",
  "james-frost",
  "cody-cloud",
  "bueno",
  "le-ged",
  "leigh-marling",
  "brother-willis",
] as const;

const BLOCKED_MOTION_TITLES = /reel|sizzle|teaser|trailer|clip|short film|montage|^z_/i;

const CLEAN_PROJECT_TITLES: Record<
  (typeof PITCH_DIRECTOR_SLUGS)[number],
  string | null
> = {
  "terry-rayment": null,
  "jack-turits": "Twins",
  "matt-dilmore": "Mad Maxine",
  "boma-iluma": "Switch",
  "kelsey-larkin": "Made Precisely For You",
  "caleb-slain": "4Runner - Getaway",
  "james-frost": "Business",
  "cody-cloud": "Thanos",
  bueno: "Mejor Con Pepsi",
  "le-ged": "Les Soprano Burger",
  "leigh-marling": "Supermarket",
  "brother-willis": "Oktoberfest Part Zwei",
};

export type PitchDirector = {
  slug: string;
  name: string;
  headshotUrl: string | null;
  projects: {
    title: string;
    brand: string | null;
    duration: number | null;
    muxPlaybackId: string | null;
    thumbnailUrl: string | null;
    frameGrabs: { imageUrl: string }[];
  }[];
};

function isCleanMotionProject(project: PitchDirector["projects"][number]) {
  return (
    Boolean(project.brand) &&
    Boolean(project.muxPlaybackId) &&
    !BLOCKED_MOTION_TITLES.test(project.title) &&
    (project.duration ?? 999) <= 75
  );
}

function cleanProjectForDirector(
  director: PitchDirector,
): PitchDirector["projects"][number] | null {
  const titleMatch =
    CLEAN_PROJECT_TITLES[director.slug as (typeof PITCH_DIRECTOR_SLUGS)[number]];
  const cleanProjects = director.projects.filter(isCleanMotionProject);

  if (titleMatch) {
    const explicit = cleanProjects.find((project) =>
      project.title.toLowerCase().includes(titleMatch.toLowerCase()),
    );
    if (explicit) return explicit;
  }

  if (director.slug === "terry-rayment") {
    return (
      cleanProjects.find((project) => (project.duration ?? 999) <= 60) ??
      director.projects.find((project) =>
        project.title.toLowerCase().includes("wolverine"),
      ) ??
      cleanProjects[0] ??
      null
    );
  }

  return cleanProjects[0] ?? null;
}

export async function loadPitchDirectors(): Promise<PitchDirector[]> {
  const directors = await prisma.director.findMany({
    where: { slug: { in: [...PITCH_DIRECTOR_SLUGS] } },
    select: {
      slug: true,
      name: true,
      headshotUrl: true,
      projects: {
        where: { isPublished: true, muxPlaybackId: { not: null } },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          title: true,
          brand: true,
          duration: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
          frameGrabs: {
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { imageUrl: true },
          },
        },
      },
    },
  });

  return PITCH_DIRECTOR_SLUGS.map((slug) =>
    directors.find((director) => director.slug === slug),
  )
    .filter((director): director is NonNullable<typeof director> =>
      Boolean(director),
    )
    .map((director) => {
      const project = cleanProjectForDirector(director);
      return { ...director, projects: project ? [project] : [] };
    });
}
