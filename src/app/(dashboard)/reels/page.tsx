import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, Send, Plus } from "lucide-react";
import { timeAgo } from "@/lib/utils";

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
      <div className="flex items-center md:items-end justify-between mb-8 md:mb-12">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
            Reels
          </h1>
          <p className="text-[11px] uppercase tracking-wider text-[#999] mt-1.5 md:mt-2">
            {reels.length} reel{reels.length !== 1 ? "s" : ""}{isRep ? " by you" : " created"}
          </p>
        </div>
        <Link
          href="/reels/build"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 md:px-3 md:py-1.5 rounded-xl bg-[#1A1A1A] text-white text-[12px] font-medium active:bg-[#333] transition-colors"
        >
          <Plus size={12} />
          Build Reel
        </Link>
      </div>

      {reels.length > 0 ? (
        <div className="space-y-2.5 md:space-y-3">
          {reels.map((reel) => (
            <Link
              key={reel.id}
              href={`/reels/${reel.id}`}
              className="content-card flex items-center gap-3 md:gap-5 p-3 md:p-4 group"
            >
              {/* Thumbnail strip — 2 on mobile, 3 on desktop */}
              <div className="flex gap-0.5 md:gap-1 flex-shrink-0">
                {reel.items.slice(0, 3).map((item, i) => (
                  <div
                    key={item.id}
                    className={`w-14 h-9 md:w-20 md:h-12 bg-[#EEEDEA]/60 overflow-hidden rounded-lg ${
                      i >= 2 ? "hidden md:block" : ""
                    }`}
                  >
                    {item.project.muxPlaybackId ? (
                      <img
                        src={`https://image.mux.com/${item.project.muxPlaybackId}/thumbnail.jpg?width=160&height=96&fit_mode=smartcrop`}
                        alt={item.project.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={10} className="text-[#ccc]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 md:gap-3">
                  <h3 className="text-[14px] md:text-lg font-medium tracking-tight-2 text-[#1A1A1A] group-hover:text-black transition-colors truncate">
                    {reel.title}
                  </h3>
                  <span className="hidden md:inline text-[10px] text-[#bbb] uppercase tracking-wider flex-shrink-0">
                    {reel.reelType.toLowerCase()}
                  </span>
                </div>
                <p className="text-[11px] md:text-[12px] text-[#999] mt-0.5">
                  {reel.director.name} · {reel._count.items} spot
                  {reel._count.items !== 1 ? "s" : ""}
                  {/* Mobile: inline time */}
                  <span className="md:hidden"> · {timeAgo(reel.updatedAt)}</span>
                </p>
                {reel.curatorialNote && (
                  <p className="hidden md:block text-[12px] text-[#bbb] mt-1.5 truncate italic">
                    &ldquo;{reel.curatorialNote}&rdquo;
                  </p>
                )}
              </div>

              {/* Right side stats — desktop only */}
              <div className="hidden md:flex items-center gap-5 flex-shrink-0 text-[11px] text-[#bbb]">
                <span className="flex items-center gap-1">
                  <Send size={10} />
                  {reel._count.screeningLinks}
                </span>
                <span>{timeAgo(reel.updatedAt)}</span>
              </div>

              {/* Mobile: link count pill */}
              {reel._count.screeningLinks > 0 && (
                <div className="md:hidden flex items-center gap-1 text-[10px] text-[#bbb] flex-shrink-0">
                  <Send size={9} />
                  {reel._count.screeningLinks}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center">
          <Film size={20} className="text-[#ccc] mb-4" />
          <h3 className="text-lg font-medium text-[#1A1A1A]">No reels yet</h3>
          <p className="text-[12px] text-[#999] mt-1 max-w-sm">
            Build your first reel by selecting spots from a director&apos;s library.
          </p>
          <Link
            href="/reels/quick"
            className="mt-6 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-[13px] font-medium active:bg-[#333] transition-colors"
          >
            <Plus size={14} />
            Build Your First Reel
          </Link>
        </div>
      )}
    </div>
  );
}
