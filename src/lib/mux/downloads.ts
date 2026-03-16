import { getDownloadUrl } from "@/lib/r2/client";
import { getMux } from "@/lib/mux/client";

type DownloadableProject = {
  id: string;
  title: string | null;
  muxAssetId: string | null;
  muxPlaybackId: string | null;
  r2Key?: string | null;
  originalFilename?: string | null;
};

type DownloadResolution =
  | {
      status: "ready";
      source: "r2" | "mux";
      url: string;
      extension: string;
      muxFilename?: string;
    }
  | {
      status: "preparing";
      message: string;
      requested: boolean;
    }
  | {
      status: "unavailable";
      message: string;
    };

const MUX_FILENAME_PRIORITY = [
  "highest.mp4",
  "capped-1080p.mp4",
  "2160p.mp4",
  "1440p.mp4",
  "1080p.mp4",
  "720p.mp4",
  "540p.mp4",
  "480p.mp4",
  "360p.mp4",
  "270p.mp4",
  "high.mp4",
  "medium.mp4",
  "low.mp4",
];

type StaticRenditionFile = {
  name?: string;
  ext?: string;
  status?: string;
  resolution?: string;
};

function buildMuxStaticUrl(
  playbackId: string,
  filename: string,
  downloadFilename?: string,
): string {
  const url = new URL(`https://stream.mux.com/${playbackId}/${filename}`);
  if (downloadFilename) {
    url.searchParams.set("download", downloadFilename);
  }
  return url.toString();
}

function isReadyMp4(file: StaticRenditionFile): file is StaticRenditionFile & {
  name: string;
} {
  return file.ext === "mp4" && file.status === "ready" && typeof file.name === "string";
}

function isPreparingMp4(file: StaticRenditionFile): boolean {
  return file.ext === "mp4" && file.status === "preparing";
}

function chooseBestReadyFile(
  files: StaticRenditionFile[],
): (StaticRenditionFile & { name: string }) | null {
  const ready = files.filter(isReadyMp4);
  if (ready.length === 0) return null;

  ready.sort((a, b) => {
    const aPriority = MUX_FILENAME_PRIORITY.indexOf(a.name);
    const bPriority = MUX_FILENAME_PRIORITY.indexOf(b.name);
    const safeA = aPriority === -1 ? Number.MAX_SAFE_INTEGER : aPriority;
    const safeB = bPriority === -1 ? Number.MAX_SAFE_INTEGER : bPriority;
    if (safeA !== safeB) return safeA - safeB;
    return a.name.localeCompare(b.name);
  });

  return ready[0];
}

async function requestHighestRendition(assetId: string) {
  const mux = getMux();
  try {
    return await mux.video.assets.createStaticRendition(assetId, {
      resolution: "highest",
    });
  } catch (error) {
    console.warn(`[Mux downloads] Could not request highest rendition for ${assetId}:`, error);
    return null;
  }
}

export async function resolveProjectDownload(
  project: DownloadableProject,
  downloadFilename?: string,
): Promise<DownloadResolution> {
  if (project.r2Key) {
    const ext = project.originalFilename?.split(".").pop() ?? "mp4";
    const disposition = downloadFilename
      ? `attachment; filename="${downloadFilename}"`
      : undefined;
    const url = await getDownloadUrl(project.r2Key, 3600, disposition);
    return {
      status: "ready",
      source: "r2",
      url,
      extension: ext,
    };
  }

  if (!project.muxAssetId || !project.muxPlaybackId) {
    return {
      status: "unavailable",
      message: "No downloadable source is configured for this video.",
    };
  }

  try {
    const mux = getMux();
    const asset = await mux.video.assets.retrieve(project.muxAssetId);
    const files = asset.static_renditions?.files ?? [];

    const readyFile = chooseBestReadyFile(files);
    if (readyFile) {
      return {
        status: "ready",
        source: "mux",
        url: buildMuxStaticUrl(project.muxPlaybackId, readyFile.name, downloadFilename),
        extension: "mp4",
        muxFilename: readyFile.name,
      };
    }

    if (files.some(isPreparingMp4) || asset.status !== "ready") {
      return {
        status: "preparing",
        message: "MP4 download is still being prepared by Mux. Try again shortly.",
        requested: false,
      };
    }

    const requested = await requestHighestRendition(project.muxAssetId);
    if (requested?.status === "ready" && requested.name) {
      return {
        status: "ready",
        source: "mux",
        url: buildMuxStaticUrl(project.muxPlaybackId, requested.name, downloadFilename),
        extension: "mp4",
        muxFilename: requested.name,
      };
    }

    return {
      status: "preparing",
      message: "MP4 download is being prepared by Mux. Please retry in a minute.",
      requested: true,
    };
  } catch (error) {
    console.error(`[Mux downloads] Failed to resolve source for ${project.id}:`, error);
    return {
      status: "unavailable",
      message: "Could not resolve a downloadable file for this video.",
    };
  }
}
