/**
 * Auto-post a Signal feed entry when someone views a screening link.
 * Rate-limited: skips if an identical notification was posted < 5 min ago.
 */

import { prisma } from "@/lib/db";

interface ViewSignalParams {
  recipientName: string | null;
  recipientCompany: string | null;
  directorName: string;
  directorId: string;
  reelTitle: string;
  reelOwnerId: string | null; // createdById on the Reel
  viewerCity: string | null;
}

export async function createViewSignal(params: ViewSignalParams): Promise<void> {
  const who = params.recipientName || "Someone";
  const company = params.recipientCompany
    ? ` at ${params.recipientCompany}`
    : "";
  const location = params.viewerCity ? ` from ${params.viewerCity}` : "";

  const title = `${who}${company} viewed ${params.directorName}\u2019s reel${location}`;

  // Rate-limit: skip if near-identical update posted within 5 minutes
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recent = await prisma.update.findFirst({
    where: {
      type: "REEL_VIEWED",
      directorId: params.directorId,
      title,
      createdAt: { gte: fiveMinAgo },
    },
  });

  if (recent) return; // Already notified recently

  await prisma.update.create({
    data: {
      type: "REEL_VIEWED",
      title,
      directorId: params.directorId,
      authorId: params.reelOwnerId,
    },
  });
}
