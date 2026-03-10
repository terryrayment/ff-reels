import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DirectorSpots } from "@/components/directors/director-spots";

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "DIRECTOR") redirect("/dashboard");

  const directorId = session.user.directorId;
  if (!directorId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[13px] text-[#666]">Your account isn&apos;t linked to a director profile yet.</p>
        <p className="text-[12px] text-[#999] mt-1">Contact your rep to get set up.</p>
      </div>
    );
  }

  const director = await prisma.director.findUnique({
    where: { id: directorId },
    include: {
      projects: {
        orderBy: [{ brand: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          _count: { select: { reelItems: true } },
        },
      },
      reels: {
        include: { _count: { select: { items: true } } },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { projects: true, reels: true } },
    },
  });

  if (!director) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[13px] text-[#666]">Director profile not found.</p>
      </div>
    );
  }

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
      {/* Header */}
      <div className="mb-8 md:mb-14">
        <h1 className="text-[42px] md:text-[56px] font-extralight tracking-tight text-[#1A1A1A] leading-[1.05]">
          {director.name}
        </h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#aaa]">
          Portfolio
          <span className="mx-2 text-[#ddd]">/</span>
          {director.projects.length} spot{director.projects.length !== 1 ? "s" : ""}
        </p>
        {director.bio && (
          <p className="mt-4 text-[13px] text-[#777] max-w-2xl leading-relaxed">
            {director.bio}
          </p>
        )}
      </div>

      {/* Spots grid — directors can rename their spots */}
      <div className="mt-8">
        <h2 className="text-[11px] font-semibold text-[#666] uppercase tracking-wider mb-4">
          Spots ({director.projects.length})
        </h2>
        <DirectorSpots projects={projectsWithStats} readOnly canEditNames />
      </div>

      {/* Reels section */}
      {director.reels.length > 0 && (
        <div className="mt-10">
          <h2 className="text-[11px] font-semibold text-[#666] uppercase tracking-wider mb-3">
            Reels ({director.reels.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {director.reels.map((reel) => (
              <a
                key={reel.id}
                href={`/my-reels/${reel.id}`}
                className="p-3.5 bg-white border border-[#E8E8E3] hover:border-[#ccc] hover:shadow-sm transition-all rounded-[3px]"
              >
                <p className="text-[13px] font-semibold text-[#1A1A1A]">{reel.title}</p>
                <p className="text-[12px] text-[#999] mt-0.5">
                  {reel._count.items} spot{reel._count.items !== 1 ? "s" : ""}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
