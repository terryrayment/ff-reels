import { prisma } from "@/lib/db";
import { uploadBuffer, deleteObjects } from "@/lib/r2/client";
import {
  buildCandidates,
  buildMuxFrameUrl,
  scoreFrames,
  selectBestFrames,
  type ScoredFrame,
} from "./frame-scorer";
import { upscaleImage } from "./upscaler";

/**
 * Generate an AI-curated gallery for a reel.
 *
 * Pipeline:
 * 1. Sample candidate frames from each spot via Mux Image API
 * 2. Score candidates with GPT-4o-mini vision
 * 3. Select top 12-16 frames (min 1 per spot)
 * 4. Upscale via Real-ESRGAN on Replicate (2x)
 * 5. Upload to R2
 * 6. Create ReelGalleryImage records
 *
 * Returns stats about the generation.
 */
export async function generateReelGallery(reelId: string): Promise<{
  imageCount: number;
  candidatesScored: number;
  projectCount: number;
}> {
  console.log(`[Gallery] Starting generation for reel ${reelId}`);

  // 1. Fetch reel items with video metadata
  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    include: {
      items: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              brand: true,
              muxPlaybackId: true,
              duration: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!reel) throw new Error(`Reel ${reelId} not found`);

  // Clean up existing gallery images if regenerating
  const existingImages = await prisma.reelGalleryImage.findMany({
    where: { reelId },
    select: { id: true, r2Key: true, thumbnailR2Key: true },
  });

  if (existingImages.length > 0) {
    const keysToDelete = existingImages.flatMap((img) =>
      [img.r2Key, img.thumbnailR2Key].filter(Boolean) as string[],
    );
    await deleteObjects(keysToDelete).catch((err) =>
      console.warn("[Gallery] R2 cleanup failed (non-critical):", err),
    );
    await prisma.reelGalleryImage.deleteMany({ where: { reelId } });
    console.log(`[Gallery] Cleaned up ${existingImages.length} existing images`);
  }

  // 2. Build candidate frames from projects with video
  const projectsWithVideo = reel.items
    .map((item) => item.project)
    .filter(
      (p): p is typeof p & { muxPlaybackId: string; duration: number } =>
        !!p.muxPlaybackId && !!p.duration && p.duration > 1,
    );

  if (projectsWithVideo.length === 0) {
    throw new Error("No projects with video found in this reel");
  }

  console.log(
    `[Gallery] ${projectsWithVideo.length} projects with video, building candidates...`,
  );

  const candidates = buildCandidates(projectsWithVideo);
  console.log(`[Gallery] ${candidates.length} candidate frames to score`);

  // 3. Score candidates with GPT-4o-mini vision
  const scored = await scoreFrames(candidates);
  console.log(`[Gallery] Scored ${scored.length} frames`);

  // 4. Select best frames
  const targetCount = Math.min(16, Math.max(12, projectsWithVideo.length * 3));
  const selected = selectBestFrames(scored, targetCount);
  console.log(
    `[Gallery] Selected ${selected.length} best frames (target: ${targetCount})`,
  );

  // 5. Upscale and upload each selected frame
  const galleryImages = await processSelectedFrames(reelId, selected);

  // 6. Create database records
  await prisma.reelGalleryImage.createMany({
    data: galleryImages.map((img, i) => ({
      reelId,
      projectId: img.projectId,
      r2Key: img.r2Key,
      thumbnailR2Key: img.thumbnailR2Key,
      timeOffset: img.timeOffset,
      aiScore: img.aiScore,
      width: img.width,
      height: img.height,
      sortOrder: i,
    })),
  });

  // 7. Mark gallery as ready
  await prisma.reel.update({
    where: { id: reelId },
    data: { galleryStatus: "ready" },
  });

  console.log(
    `[Gallery] Done! ${galleryImages.length} images generated for reel ${reelId}`,
  );

  return {
    imageCount: galleryImages.length,
    candidatesScored: scored.length,
    projectCount: projectsWithVideo.length,
  };
}

interface ProcessedImage {
  projectId: string;
  r2Key: string;
  thumbnailR2Key: string;
  timeOffset: number;
  aiScore: number;
  width: number;
  height: number;
}

/**
 * Process selected frames: fetch from Mux at full res,
 * upscale via Replicate, upload both versions to R2.
 *
 * Processes with concurrency limit of 3 to avoid rate limits.
 */
async function processSelectedFrames(
  reelId: string,
  selected: ScoredFrame[],
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];
  const concurrency = 3;

  for (let i = 0; i < selected.length; i += concurrency) {
    const batch = selected.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((frame) => processFrame(reelId, frame)),
    );
    results.push(...batchResults.filter(Boolean) as ProcessedImage[]);
    console.log(
      `[Gallery] Processed ${Math.min(i + concurrency, selected.length)}/${selected.length} frames`,
    );
  }

  return results;
}

async function processFrame(
  reelId: string,
  frame: ScoredFrame,
): Promise<ProcessedImage | null> {
  try {
    // Fetch full-resolution frame from Mux (1920px wide)
    const hiResUrl = buildMuxFrameUrl(frame.muxPlaybackId, frame.timeOffset, 1920);
    const thumbUrl = buildMuxFrameUrl(frame.muxPlaybackId, frame.timeOffset, 960);

    // Try to upscale via Real-ESRGAN
    const upscaledUrl = await upscaleImage(hiResUrl, 2);

    // Download the image (upscaled or original)
    const imageToUpload = upscaledUrl || hiResUrl;
    const imageResponse = await fetch(imageToUpload);
    if (!imageResponse.ok) {
      console.warn(`[Gallery] Failed to fetch image: ${imageResponse.status}`);
      return null;
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    // Download thumbnail
    const thumbResponse = await fetch(thumbUrl);
    const thumbBuffer = thumbResponse.ok
      ? Buffer.from(await thumbResponse.arrayBuffer())
      : null;

    // Upload to R2
    const timeKey = frame.timeOffset.toFixed(1).replace(".", "_");
    const r2Key = `gallery/${reelId}/${frame.projectId}/${timeKey}.png`;
    const thumbnailR2Key = `gallery/${reelId}/${frame.projectId}/${timeKey}-thumb.jpg`;

    await uploadBuffer(r2Key, imageBuffer, "image/png");

    if (thumbBuffer) {
      await uploadBuffer(thumbnailR2Key, thumbBuffer, "image/jpeg");
    }

    // Estimate dimensions (Mux delivers 16:9 by default)
    const width = upscaledUrl ? 3840 : 1920;
    const height = upscaledUrl ? 2160 : 1080;

    return {
      projectId: frame.projectId,
      r2Key,
      thumbnailR2Key: thumbBuffer ? thumbnailR2Key : r2Key,
      timeOffset: frame.timeOffset,
      aiScore: frame.score,
      width,
      height,
    };
  } catch (err) {
    console.error(
      `[Gallery] Failed to process frame at ${frame.timeOffset}s:`,
      err,
    );
    return null;
  }
}
