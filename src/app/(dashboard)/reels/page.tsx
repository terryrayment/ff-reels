import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, Send, Plus } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ReelsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isRep = session.user.role === "REP";

  const where = isRep ? { createdById: session.user.id } : {};

  const reels = await prisma.reel.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      director: { select: { id: true, name: true } },
      items: {
        include: {
          project: {
            select: { muxPlaybackId: true, title: true },
          },
        },
        orderBy: { sortOrder: "asc" },
        take: 5,
      },
      screeningLinks: {
        where: { isActive: true },
        select: { id: true },
      },
      _count: { select: { items: true, screeningLinks: true } },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Reels</h1>
          <p className="text-sm text-[#999] mt-1">
            {reels.length} reel{reels.length !== 1 ? "s" : ""}{isRep ? " by you" : " created"}
          </p>
        </div>
        <Link href="/reels/build">
          <Button size="sm">
            <Plus size={14} />
            Build Reel
          </Button>
        </Link>
      </div>

      {reels.length > 0 ? (
        <div className="space-y-3">
          {reels.map((reel) => {
            return (
              <Link
                key={reel.id}
                href={`/reels/${reel.id}`}
                className="flex items-start gap-5 p-4 rounded-sm bg-white border border-[#E8E8E3] hover:border-[#ccc] hover:shadow-sm transition-all group"
              >
                {/* Thumbnail strip */}
                <div className="flex gap-1 flex-shrink-0">
                  {reel.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="w-20 h-12 rounded-sm bg-[#F0F0EC] overflow-hidden"
                    >
                      {item.project.muxPlaybackId ? (
                        <img
                          src={`https://image.mux.com/${item.project.muxPlaybackId}/thumbnail.jpg?width=160&height=96&fit_mode=smartcrop`}
                          alt={item.project.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={12} className="text-[#ccc]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#1A1A1A] group-hover:text-black transition-colors truncate">
                      {reel.title}
                    </h3>
                    <Badge
                      variant={
                        reel.reelType === "PORTFOLIO"
                          ? "info"
                          : reel.reelType === "CATEGORY"
                            ? "warning"
                            : "default"
                      }
                    >
                      {reel.reelType.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#999] mt-0.5">
                    {reel.director.name} · {reel._count.items} spot
                    {reel._count.items !== 1 ? "s" : ""}
                  </p>
                  {reel.curatorialNote && (
                    <p className="text-xs text-[#ccc] mt-1 truncate italic">
                      &ldquo;{reel.curatorialNote}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right side stats */}
                <div className="flex items-center gap-4 flex-shrink-0 text-xs text-[#999]">
                  <span className="flex items-center gap-1">
                    <Send size={10} />
                    {reel._count.screeningLinks}
                  </span>
                  <span>{timeAgo(reel.updatedAt)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-sm bg-[#F0F0EC] flex items-center justify-center mb-5">
            <Film size={24} className="text-[#999]" />
          </div>
          <h3 className="text-sm font-bold text-[#1A1A1A]">No reels yet</h3>
          <p className="text-sm text-[#999] mt-1 max-w-sm">
            Build your first reel by selecting spots from a director&apos;s library.
          </p>
          <Link href="/reels/build" className="mt-5">
            <Button size="sm">
              <Plus size={14} />
              Build Your First Reel
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
