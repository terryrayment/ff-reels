import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

/**
 * Public screening page — reels.friendsandfamily.tv/s/{token}
 * This is what agency producers and creatives see when they click a reel link.
 * No login required. All viewing activity is tracked.
 */
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

  // Check expiry
  if (link.expiresAt && link.expiresAt < new Date()) {
    return notFound();
  }

  const { reel } = link;
  const { director } = reel;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-8 py-6 border-b border-white/10">
        <p className="text-sm text-white/40 tracking-widest uppercase">
          Friends & Family
        </p>
        <h1 className="text-2xl font-light mt-1">{director.name}</h1>
        <p className="text-white/60 mt-1">{reel.title}</p>
      </header>

      {/* Curatorial note */}
      {reel.curatorialNote && (
        <div className="px-8 py-4 bg-white/5 border-b border-white/10">
          <p className="text-sm text-white/70 italic">
            {reel.curatorialNote}
          </p>
        </div>
      )}

      {/* Spots playlist */}
      <main className="px-8 py-8">
        <div className="space-y-12">
          {reel.items.map((item, index) => (
            <div key={item.id} className="group">
              {/* Video player placeholder — will use @mux/mux-player-react */}
              <div className="aspect-video bg-white/5 rounded-lg flex items-center justify-center">
                <p className="text-white/30">
                  Player: {item.project.title}
                  {item.project.muxPlaybackId
                    ? ` (${item.project.muxPlaybackId})`
                    : " (processing...)"}
                </p>
              </div>

              {/* Spot info */}
              <div className="mt-3 flex items-start justify-between">
                <div>
                  <h3 className="font-medium">
                    {index + 1}. {item.project.title}
                  </h3>
                  <p className="text-sm text-white/50">
                    {[item.project.brand, item.project.agency, item.project.year]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {item.project.contextNote && (
                  <p className="text-xs text-white/40 max-w-xs text-right">
                    {item.project.contextNote}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-white/10 text-center">
        <p className="text-xs text-white/30">
          © {new Date().getFullYear()} Friends & Family
        </p>
      </footer>
    </div>
  );
}
