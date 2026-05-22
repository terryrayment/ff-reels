export type VersantProjectMedia = {
  title: string;
  brand: string | null;
  duration: number | null;
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

function sampleWindow(
  duration: number | null | undefined,
  sampleStart?: number | null,
) {
  const fallbackStart = 8;
  if (sampleStart && sampleStart > 0) {
    const start = sampleStart;
    const maxEnd = duration ? Math.floor(duration - 1) : start + 5;
    const end = Math.max(start + 1, Math.min(start + 5, maxEnd));
    const still = Math.min(start + 2, end);

    return { start, still, end };
  }

  if (!duration || duration <= 10) {
    return { start: 2, still: 4, end: 7 };
  }

  const start = Math.max(fallbackStart, Math.round(duration * 0.45));
  const end = Math.max(start + 1, Math.min(start + 5, Math.floor(duration - 1)));
  const still = Math.min(start + 2, end);

  return { start, still, end };
}

export function muxAnimatedUrl(
  playbackId: string,
  width = 640,
  duration?: number | null,
  sampleStart?: number | null,
) {
  const { start, end } = sampleWindow(duration, sampleStart);
  return `https://image.mux.com/${playbackId}/animated.webp?width=${width}&fps=15&start=${start}&end=${end}`;
}

export function muxStillUrl(
  playbackId: string,
  width = 640,
  duration?: number | null,
  sampleStart?: number | null,
) {
  const { still } = sampleWindow(duration, sampleStart);
  return `https://image.mux.com/${playbackId}/thumbnail.webp?width=${width}&time=${still}`;
}

export function projectStillUrl(project: VersantProjectMedia | null, width = 640) {
  if (!project) return null;
  if (project.muxPlaybackId) {
    return muxStillUrl(project.muxPlaybackId, width, project.duration);
  }
  if (project.frameGrabs[0]?.imageUrl) return project.frameGrabs[0].imageUrl;
  if (project.thumbnailUrl) return project.thumbnailUrl;
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
    animated: project?.muxPlaybackId
      ? muxAnimatedUrl(project.muxPlaybackId, width, project.duration)
      : still,
  };
}
