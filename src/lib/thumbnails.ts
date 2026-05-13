export type ThumbnailProject = {
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
};

export function buildMuxThumbnailUrl(
  playbackId: string,
  width: number,
  height: number,
  thumbnailUrl?: string | null
) {
  const params = new URLSearchParams();
  let baseUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;

  if (thumbnailUrl?.includes("image.mux.com")) {
    try {
      const url = new URL(thumbnailUrl);
      baseUrl = `${url.origin}${url.pathname}`;
      const time = url.searchParams.get("time");
      if (time) params.set("time", time);
    } catch {
      // Fall back to the default Mux thumbnail URL.
    }
  }

  params.set("width", String(width));
  params.set("height", String(height));
  params.set("fit_mode", "smartcrop");

  return `${baseUrl}?${params.toString()}`;
}

export function getProjectThumbnailUrl(
  project: ThumbnailProject,
  width: number,
  height: number
) {
  if (project.muxPlaybackId) {
    return buildMuxThumbnailUrl(
      project.muxPlaybackId,
      width,
      height,
      project.thumbnailUrl
    );
  }

  return project.thumbnailUrl || null;
}
