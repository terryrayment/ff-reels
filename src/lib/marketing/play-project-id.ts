import {
  type CanonicalProject,
  getCanonicalDirector,
} from "@/lib/marketing/canonical-source";

export function normalizeProjectKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function getHeroPlayProjectId(project: CanonicalProject | null | undefined) {
  if (!project) return null;
  if (project.muxPlaybackId || project.sourceVideoUrl || project.thumbnailUrl) {
    return project.id;
  }
  return null;
}

export function getDirectorPortfolioPlayId(
  project: {
    id: string;
    title: string;
    brand?: string | null;
    director: { slug: string; name: string };
  },
) {
  const director = getCanonicalDirector(project.director.slug);
  if (!director) return null;

  const brand = normalizeProjectKey(project.brand ?? "");
  const title = normalizeProjectKey(project.title ?? "");

  const matched = director.portfolio.find(
    (entry) =>
      normalizeProjectKey(entry.brand) === brand &&
      normalizeProjectKey(entry.title) === title,
  );
  if (matched) return matched.id;

  if (director.portfolio.some((entry) => entry.id === project.id)) {
    return project.id;
  }

  return null;
}

export function resolveProjectCardPlayId(project: {
  id: string;
  title: string;
  brand?: string | null;
  director: { slug: string; name: string };
  playProjectId?: string | null;
}) {
  if (project.playProjectId !== undefined && project.playProjectId !== null) {
    return project.playProjectId;
  }
  return getDirectorPortfolioPlayId(project);
}
