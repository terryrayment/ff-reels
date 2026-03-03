import { prisma } from "@/lib/db";
import { DirectorGrid } from "@/components/directors/director-grid";
import { Users } from "lucide-react";
import { AddDirectorButton } from "@/components/directors/add-director-button";

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[#1A1A1A]">Directors</h1>
          <p className="text-[13px] text-[#999] mt-0.5">
            {directors.length} on roster
          </p>
        </div>
        <AddDirectorButton />
      </div>

      {directors.length > 0 ? (
        <DirectorGrid directors={directors} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-sm bg-[#F0F0EC] flex items-center justify-center mb-4">
            <Users size={20} className="text-[#999]" />
          </div>
          <h3 className="text-sm font-medium text-[#1A1A1A]">No directors yet</h3>
          <p className="text-[13px] text-[#999] mt-1">Add your first director to get started.</p>
        </div>
      )}
    </div>
  );
}
