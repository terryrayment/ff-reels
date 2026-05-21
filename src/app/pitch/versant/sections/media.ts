export type VersantProjectMedia = {
  title: string;
  brand: string | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
  frameGrabs: { imageUrl: string }[];
};

export type VersantDirectorMedia = {
  slug: string;
  name: string;
  headshotUrl: string | null;
  projects: VersantProjectMedia[];
};

export function topProjectOf(
  director: VersantDirectorMedia | undefined,
): VersantProjectMedia | null {
  return director?.projects?.[0] ?? null;
}

export function muxAnimatedUrl(playbackId: string, width = 640) {
  return `https://image.mux.com/${playbackId}/animated.webp?width=${width}&fps=15&start=2&end=7`;
}

export function muxStillUrl(playbackId: string, width = 640) {
  return `https://image.mux.com/${playbackId}/thumbnail.webp?time=3&width=${width}`;
}

export function projectStillUrl(project: VersantProjectMedia | null, width = 640) {
  if (!project) return null;
  if (project.thumbnailUrl) return project.thumbnailUrl;
  if (project.frameGrabs[0]?.imageUrl) return project.frameGrabs[0].imageUrl;
  if (project.muxPlaybackId) return muxStillUrl(project.muxPlaybackId, width);
  return null;
}

export function directorBySlug(
  directors: VersantDirectorMedia[],
  slug: string,
) {
  return directors.find((director) => director.slug === slug);
}

export function motionForDirector(
  directors: VersantDirectorMedia[],
  slug: string,
  width = 640,
) {
  const director = directorBySlug(directors, slug);
  const project = topProjectOf(director);
  const still = projectStillUrl(project, width) ?? director?.headshotUrl ?? null;
  return {
    director,
    project,
    still,
    animated: project?.muxPlaybackId ? muxAnimatedUrl(project.muxPlaybackId, width) : still,
  };
}

