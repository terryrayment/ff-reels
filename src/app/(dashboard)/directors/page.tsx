import { prisma } from "@/lib/db";
import { DirectorGrid } from "@/components/directors/director-grid";
import { Users } from "lucide-react";

export default async function DirectorsPage() {
  const directors = await prisma.director.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      projects: {
        where: { muxPlaybackId: { not: null } },
        orderBy: { sortOrder: "asc" },
        take: 4,
        select: {
          id: true,
          title: true,
          brand: true,
          muxPlaybackId: true,
          thumbnailUrl: true,
          duration: true,
          category: true,
        },
      },
      _count: { select: { projects: true, reels: true } },
    },
  });

  return (
    <div>
      {/* Page header — minimal */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Directors</h1>
          <p className="text-sm text-white/40 mt-1">
            {directors.length} director{directors.length !== 1 ? "s" : ""} on roster
          </p>
        </div>
        <AddDirectorButton />
      </div>

      {/* Director grid — media-forward */}
      {directors.length > 0 ? (
        <DirectorGrid directors={directors} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-5">
            <Users size={24} className="text-white/20" />
          </div>
          <h3 className="text-sm font-medium text-white/60">No directors yet</h3>
          <p className="text-sm text-white/30 mt-1">Add your first director to get started.</p>
        </div>
      )}
    </div>
  );
}

// Client component for the add button — imported inline to keep page a server component
import { AddDirectorButton } from "@/components/directors/add-director-button";
