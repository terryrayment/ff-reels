import { prisma } from "@/lib/db";
import { DirectorGrid } from "@/components/directors/director-grid";
import { Users } from "lucide-react";

export default async function DirectorsPage() {
  const directors = await prisma.director.findMany({
    orderBy: { name: "asc" },
    include: {
      projects: {
        where: { muxPlaybackId: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
        },
      },
      _count: { select: { projects: true, reels: true } },
    },
  });

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          Directors
        </h1>
        <p className="text-[11px] uppercase tracking-wider text-[#999] mt-2">
          {directors.length} on roster
        </p>
      </div>

      {directors.length > 0 ? (
        <DirectorGrid directors={directors} />
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Users size={20} className="text-[#ccc] mb-4" />
          <h3 className="text-lg font-medium text-[#1A1A1A]">No directors yet</h3>
          <p className="text-[12px] text-[#999] mt-1">
            Add your first director to get started.
          </p>
        </div>
      )}
    </div>
  );
}
