import { prisma } from "@/lib/db";
import { ReelBuilder } from "@/components/reels/reel-builder";

export default async function ReelBuildPage() {
  const directors = await prisma.director.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      projects: {
        where: { muxStatus: "ready" },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          brand: true,
          agency: true,
          year: true,
          category: true,
          muxPlaybackId: true,
          duration: true,
        },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-light tracking-tight mb-1">Build Reel</h1>
      <p className="text-sm text-white/40 mb-8">
        Select a director and add spots to create a custom reel.
      </p>

      <ReelBuilder directors={directors} />
    </div>
  );
}
