import { prisma } from "@/lib/db";
import { ReelBuilder } from "@/components/reels/reel-builder";

export default async function ReelBuildPage() {
  const directors = await prisma.director.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
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
        },
      },
    },
  });

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          Build Reel
        </h1>
        <p className="mt-1.5 text-[11px] uppercase tracking-[0.15em] text-[#999]">
          Select a director and add spots to create a custom reel
        </p>
      </div>

      <ReelBuilder directors={directors} />
    </div>
  );
}
