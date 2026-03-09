import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DirectorHeader } from "@/components/directors/director-header";
import { DirectorSpots } from "@/components/directors/director-spots";
import { UploadButton } from "@/components/directors/upload-button";

export default async function DirectorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const director = await prisma.director.findUnique({
    where: { id: params.id },
    include: {
      projects: {
        orderBy: [{ brand: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          reelItems: { select: { id: true } },
          _count: { select: { reelItems: true } },
        },
      },
      reels: {
        include: { _count: { select: { items: true, screeningLinks: true } } },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { projects: true, reels: true } },
    },
  });

  if (!director) return notFound();

  // Compute spot view counts from screening data
  const spotViewCounts = await prisma.spotView.groupBy({
    by: ["projectId"],
    where: {
      projectId: { in: director.projects.map((p) => p.id) },
    },
    _count: { id: true },
  });

  const viewCountMap = Object.fromEntries(
    spotViewCounts.map((sv) => [sv.projectId, sv._count.id])
  );

  // Serialize projects with usage stats
  const projectsWithStats = director.projects.map((p) => ({
    id: p.id,
    title: p.title,
    brand: p.brand,
    agency: p.agency,
    category: p.category,
    year: p.year,
    muxPlaybackId: p.muxPlaybackId,
    muxStatus: p.muxStatus,
    thumbnailUrl: p.thumbnailUrl,
    duration: p.duration,
    aspectRatio: p.aspectRatio,
    isPublished: p.isPublished,
    reelUsageCount: p._count.reelItems,
    viewCount: viewCountMap[p.id] || 0,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <DirectorHeader director={director} />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold text-[#666] uppercase tracking-wider">
            Spots ({director.projects.length})
          </h2>
          <UploadButton directorId={director.id} directorName={director.name} />
        </div>

        <DirectorSpots
          projects={projectsWithStats}
          directorId={director.id}
          heroProjectId={director.heroProjectId}
        />
      </div>

      {director.reels.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[11px] font-semibold text-[#666] uppercase tracking-wider mb-3">
            Reels ({director.reels.length})
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {director.reels.map((reel) => (
              <a
                key={reel.id}
                href={`/reels/${reel.id}`}
                className="p-3.5 bg-white border border-[#E8E8E3] hover:border-[#ccc] hover:shadow-sm transition-all"
              >
                <p className="text-[13px] font-semibold text-[#1A1A1A]">{reel.title}</p>
                <p className="text-[12px] text-[#999] mt-0.5">
                  {reel._count.items} spot{reel._count.items !== 1 ? "s" : ""} · {reel._count.screeningLinks} link{reel._count.screeningLinks !== 1 ? "s" : ""}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
