import { prisma } from "@/lib/db";
import { DirectorGrid } from "@/components/directors/director-grid";
import { Users } from "lucide-react";

export default async function DirectorsPage() {
  const allDirectors = await prisma.director.findMany({
    orderBy: { name: "asc" },
    include: {
      projects: {
        where: {
          isPublished: true,
          OR: [
            { muxPlaybackId: { not: null } },
            { thumbnailUrl: { not: null } },
          ],
        },
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

  const rosterDirectors = allDirectors.filter(
    (d) => d.rosterStatus !== "OFF_ROSTER"
  );
  const offRosterDirectors = allDirectors.filter(
    (d) => d.rosterStatus === "OFF_ROSTER"
  );

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          Directors
        </h1>
        <p className="text-[11px] uppercase tracking-wider text-[#999] mt-2">
          {rosterDirectors.length} on roster
          {offRosterDirectors.length > 0 &&
            ` · ${offRosterDirectors.length} off-roster`}
        </p>
      </div>

      {rosterDirectors.length > 0 ? (
        <DirectorGrid directors={rosterDirectors} />
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Users size={20} className="text-[#ccc] mb-4" />
          <h3 className="text-lg font-medium text-[#1A1A1A]">No directors yet</h3>
          <p className="text-[12px] text-[#999] mt-1">
            Add your first director to get started.
          </p>
        </div>
      )}

      {/* Off-Roster Directors */}
      {offRosterDirectors.length > 0 && (
        <div className="mt-16">
          <div className="mb-6">
            <h2 className="text-[11px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Off-Roster Talent
            </h2>
          </div>
          <DirectorGrid directors={offRosterDirectors} />
        </div>
      )}
    </div>
  );
}
