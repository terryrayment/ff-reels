import type { CanonicalProject } from "@/lib/marketing/canonical-source";
import { getDirectorPortfolioPlayId } from "@/lib/marketing/play-project-id";

/** Seconds to play per spot before advancing to the next slide. */
export const HOME_SPOT_CLIP_DURATION_SECONDS = 10;

/**
 * Curated in-points (seconds) for homepage hero clips — skip slates / slow opens.
 * Homepage-only; does not affect Work archive or viewer start position.
 */
export const HOME_SPOT_CLIP_START_SECONDS: Record<string, number> = {
  "source-work-001-caleb-slain-ford-lobo": 2,
  "source-work-003-bueno-citi-can-i-click-it": 5,
  "source-work-002-matt-dilmore-little-caesars-pizza-bot": 3,
  "source-work-055-terry-rayment-cadillac-tree-hunting": 16,
  "source-work-020-james-frost-nike-human-printing-press": 6,
};

export interface HomeSpotCarouselSlide {
  id: string;
  brand: string;
  title: string;
  directorName: string;
  directorSlug: string;
  thumbnailUrl: string | null;
  muxPlaybackId: string | null;
  sourceVideoUrl: string | null;
  href: string;
  clipStartSeconds: number;
}

export function buildHomeSpotCarouselSlides(
  projects: CanonicalProject[],
): HomeSpotCarouselSlide[] {
  return projects
    .map((project) => {
      const playId = getDirectorPortfolioPlayId(project);
      const canPlay =
        Boolean(playId) &&
        Boolean(project.muxPlaybackId || project.sourceVideoUrl || project.thumbnailUrl);
      if (!canPlay || !playId) return null;

      return {
        id: project.id,
        brand: project.brand,
        title: project.title,
        directorName: project.director.name,
        directorSlug: project.director.slug,
        thumbnailUrl: project.thumbnailUrl,
        muxPlaybackId: project.muxPlaybackId,
        sourceVideoUrl: project.sourceVideoUrl,
        href: `/site/directors/${project.director.slug}?play=${playId}`,
        clipStartSeconds: HOME_SPOT_CLIP_START_SECONDS[project.id] ?? 3,
      };
    })
    .filter((slide): slide is HomeSpotCarouselSlide => Boolean(slide));
}
