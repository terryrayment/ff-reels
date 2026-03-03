import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DirectorHeader } from "@/components/directors/director-header";
import { ProjectGrid } from "@/components/directors/project-grid";
import { UploadButton } from "@/components/directors/upload-button";
import { Film } from "lucide-react";

export default async function DirectorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const director = await prisma.director.findUnique({
    where: { id: params.id },
    include: {
      projects: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
      reels: {
        include: { _count: { select: { items: true, screeningLinks: true } } },
        orderBy: { updatedAt: "desc" },
      },
      _count: { select: { projects: true, reels: true } },
    },
  });

  if (!director) return notFound();

  return (
    <div>
      <DirectorHeader director={director} />

      {/* Projects / Spots — media-forward grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
            Spots ({director.projects.length})
          </h2>
          <UploadButton directorId={director.id} directorName={director.name} />
        </div>

        {director.projects.length > 0 ? (
          <ProjectGrid projects={director.projects} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.02] rounded-xl border border-dashed border-white/5">
            <Film size={28} className="text-white/15 mb-3" />
            <p className="text-sm text-white/40">No spots uploaded yet</p>
            <p className="text-xs text-white/25 mt-1">
              Upload video files to start building this director&apos;s library.
            </p>
            <div className="mt-5">
              <UploadButton directorId={director.id} directorName={director.name} />
            </div>
          </div>
        )}
      </div>

      {/* Reels section */}
      {director.reels.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
            Reels ({director.reels.length})
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {director.reels.map((reel) => (
              <a
                key={reel.id}
                href={`/reels/${reel.id}`}
                className="p-4 bg-white/[0.03] rounded-lg border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all"
              >
                <p className="text-sm font-medium">{reel.title}</p>
                <p className="text-xs text-white/30 mt-1">
                  {reel._count.items} spot{reel._count.items !== 1 ? "s" : ""} ·{" "}
                  {reel._count.screeningLinks} link{reel._count.screeningLinks !== 1 ? "s" : ""}
                </p>
                <span className="inline-block mt-2 text-[10px] text-white/25 uppercase tracking-wider">
                  {reel.reelType}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
