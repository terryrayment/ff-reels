import { prisma } from "@/lib/db";
import { ReelBuilder } from "@/components/reels/reel-builder";

export default async function ReelBuildPage() {
  const [directors, spotViewCounts] = await Promise.all([
    prisma.director.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        rosterStatus: true,
        projects: {
          where: { isPublished: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            brand: true,
            agency: true,
            year: true,
            category: true,
            muxPlaybackId: true,
            thumbnailUrl: true,
            duration: true,
            createdAt: true,
          },
        },
      },
    }),
    // Count spot views per project for "Most Watched" sort
    prisma.spotView.groupBy({
      by: ["projectId"],
      _count: { id: true },
    }),
  ]);

  // Build a map of projectId → viewCount
  const viewCountMap = new Map(
    spotViewCounts.map((sv) => [sv.projectId, sv._count.id])
  );

  // Merge view counts into project data
  const directorsWithCounts = directors.map((d) => ({
    ...d,
    projects: d.projects.map((p) => ({
      ...p,
      viewCount: viewCountMap.get(p.id) || 0,
    })),
  }));

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          Build Reel
        </h1>
      </div>

      <ReelBuilder directors={directorsWithCounts} />
    </div>
  );
}
