import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDuration } from "@/lib/utils";
import { ScreeningTracker } from "@/components/video/screening-tracker";
import { ScreeningPlayer } from "@/components/video/screening-player";

export default async function ScreeningPage({
  params,
}: {
  params: { token: string };
}) {
  const link = await prisma.screeningLink.findUnique({
    where: { token: params.token, isActive: true },
    include: {
      reel: {
        include: {
          director: true,
          items: {
            include: { project: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!link) return notFound();

  if (link.expiresAt && link.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-white/40">This link has expired.</p>
          <p className="text-xs text-white/20 mt-2">
            Contact the sender for a new link.
          </p>
        </div>
      </div>
    );
  }

  const { reel } = link;
  const { director } = reel;

  const totalDuration = reel.items.reduce(
    (sum, item) => sum + (item.project.duration || 0),
    0
  );

  return (
    <ScreeningTracker screeningLinkId={link.id}>
      <div className="min-h-screen bg-[#0e0e0e] text-white">
        <header className="max-w-4xl mx-auto px-8 pt-12 pb-8">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] mb-6">
            Friends & Family
          </p>
          {reel.brand ? (
            <>
              <h1 className="text-4xl font-light tracking-tight">{reel.title}</h1>
              <p className="text-sm text-white/40 mt-2">
                {[reel.agencyName, reel.campaignName].filter(Boolean).join(" · ") || `Directed by ${director.name}`}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-light tracking-tight">{director.name}</h1>
              <p className="text-sm text-white/40 mt-2">{reel.title}</p>
            </>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-white/20">
            <span>{reel.items.length} spot{reel.items.length !== 1 ? "s" : ""}</span>
            {totalDuration > 0 && (
              <>
                <span className="text-white/10">·</span>
                <span>{formatDuration(totalDuration)} total</span>
              </>
            )}
          </div>
        </header>

        {reel.curatorialNote && (
          <div className="max-w-4xl mx-auto px-8 pb-8">
            <div className="px-5 py-4 bg-white/[0.03] rounded-sm border border-white/5">
              <p className="text-sm text-white/50 italic leading-relaxed">
                {reel.curatorialNote}
              </p>
            </div>
          </div>
        )}

        <main className="max-w-4xl mx-auto px-8 pb-16">
          <div className="space-y-16">
            {reel.items.map((item) => (
              <div key={item.id}>
                {item.project.muxPlaybackId ? (
                  <ScreeningPlayer
                    playbackId={item.project.muxPlaybackId}
                    projectId={item.project.id}
                    title={item.project.title}
                    duration={item.project.duration}
                  />
                ) : (
                  <div className="aspect-video bg-white/[0.03] rounded-sm overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-xs text-white/15">Processing...</p>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-white/80">
                      {item.project.title}
                    </h3>
                    <p className="text-xs text-white/30 mt-0.5">
                      {[item.project.brand, item.project.agency, item.project.year]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  {item.project.duration && (
                    <span className="text-xs text-white/20">
                      {formatDuration(item.project.duration)}
                    </span>
                  )}
                </div>

                {item.project.contextNote && (
                  <p className="text-xs text-white/25 mt-2 italic">
                    {item.project.contextNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        </main>

        <footer className="border-t border-white/5 py-8 text-center">
          <p className="text-[10px] text-white/15 uppercase tracking-[0.3em]">
            Friends & Family
          </p>
        </footer>
      </div>
    </ScreeningTracker>
  );
}
