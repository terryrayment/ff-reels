import { prisma } from "@/lib/db";
import type { CommitteeInfo } from "./types";

/**
 * Committee Detection (Feature 4)
 *
 * Identifies screening links viewed by multiple distinct IPs,
 * indicating team/committee review. Returns a map of
 * screeningLinkId → { distinctViewerCount, company }.
 */
export async function getCommitteeLinks(
  screeningLinkIds: string[]
): Promise<Map<string, CommitteeInfo>> {
  if (screeningLinkIds.length === 0) return new Map();

  // Group views by screeningLink, count distinct IPs
  const results = await prisma.$queryRaw<
    Array<{
      screeningLinkId: string;
      company: string | null;
      distinctIpCount: bigint;
    }>
  >`
    SELECT
      sl.id AS "screeningLinkId",
      sl."recipientCompany" AS company,
      COUNT(DISTINCT rv."viewerIp")
        FILTER (WHERE rv."viewerIp" IS NOT NULL) AS "distinctIpCount"
    FROM "ScreeningLink" sl
    JOIN "ReelView" rv ON rv."screeningLinkId" = sl.id
    WHERE sl.id = ANY(${screeningLinkIds}::text[])
    GROUP BY sl.id, sl."recipientCompany"
    HAVING COUNT(DISTINCT rv."viewerIp")
      FILTER (WHERE rv."viewerIp" IS NOT NULL) >= 2
  `;

  const map = new Map<string, CommitteeInfo>();
  for (const row of results) {
    map.set(row.screeningLinkId, {
      distinctViewerCount: Number(row.distinctIpCount),
      company: row.company,
    });
  }
  return map;
}
