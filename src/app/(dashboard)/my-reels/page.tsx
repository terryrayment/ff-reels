import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, Play, Eye, ArrowLeft } from "lucide-react";

export default async function MyReelsPage({
  searchParams,
}: {
  searchParams: { preview?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const isPreview = session.user.role === "ADMIN" && searchParams.preview;
  const directorId = isPreview ? searchParams.preview! : session.user.directorId;

  if (!isPreview && session.user.role !== "DIRECTOR") redirect("/dashboard");

  if (!directorId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[13px] text-[#666]">Your account isn&apos;t linked to a director profile yet.</p>
        <p className="text-[12px] text-[#999] mt-1">Contact your rep to get set up.</p>
      </div>
    );
  }

  const directorName = isPreview
    ? (await prisma.director.findUnique({ where: { id: directorId }, select: { name: true } }))?.name
    : null;

  const reels = await prisma.reel.findMany({
    where: { directorId },
    include: {
      items: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              brand: true,
              muxPlaybackId: true,
              thumbnailUrl: true,
              duration: true,
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { items: true, screeningLinks: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const previewParam = isPreview ? `?preview=${directorId}` : "";

  const previewBanner = isPreview && directorName ? (
    <div className="mb-6 flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200/60 rounded-[3px]">
      <Eye size={13} className="text-amber-500 flex-shrink-0" />
      <p className="text-[12px] text-amber-700 flex-1">
        Viewing as <span className="font-medium">{directorName}</span>
      </p>
      <Link
        href={`/directors/${directorId}`}
        className="flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-800 transition-colors font-medium"
      >
        <ArrowLeft size={11} />
        Back to Admin
      </Link>
    </div>
  ) : null;

  const previewNav = isPreview ? (
    <div className="mt-5 flex items-center gap-4">
      <Link href={`/portfolio${previewParam}`} className="text-[11px] text-[#999] hover:text-[#666] transition-colors">
        Portfolio
      </Link>
      <span className="text-[11px] font-medium text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5">My Reels</span>
      <Link href={`/my-stats${previewParam}`} className="text-[11px] text-[#999] hover:text-[#666] transition-colors">
        My Stats
      </Link>
    </div>
  ) : null;

  if (reels.length === 0) {
    return (
      <div>
        {previewBanner}
        <div className="mb-8 md:mb-14">
          <h1 className="text-[42px] md:text-[56px] font-extralight tracking-tight text-[#1A1A1A] leading-[1.05]">
            My Reels
          </h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#aaa]">Your curated playlists</p>
          {previewNav}
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Film size={20} className="text-[#ccc] mb-4" />
          <p className="text-[13px] text-[#666]">No reels yet</p>
          <p className="text-[12px] text-[#999] mt-1">Your rep will build reels featuring your work.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {previewBanner}
      <div className="mb-8 md:mb-14">
        <h1 className="text-[42px] md:text-[56px] font-extralight tracking-tight text-[#1A1A1A] leading-[1.05]">
          My Reels
        </h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#aaa]">
          {reels.length} reel{reels.length !== 1 ? "s" : ""}
        </p>
        {previewNav}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reels.map((reel) => {
          // Get first spot with a thumbnail for the card hero
          const heroSpot = reel.items.find(
            (item) => item.project.muxPlaybackId || item.project.thumbnailUrl
          );
          const heroThumb = heroSpot?.project.muxPlaybackId
            ? `https://image.mux.com/${heroSpot.project.muxPlaybackId}/thumbnail.jpg?width=480&height=270&fit_mode=smartcrop`
            : heroSpot?.project.thumbnailUrl;

          return (
            <Link
              key={reel.id}
              href={`/my-reels/${reel.id}${previewParam}`}
              className="group bg-white border border-[#E8E8E3] hover:border-[#ccc] hover:shadow-sm transition-all rounded-[3px] overflow-hidden"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-[#EEEDEA] overflow-hidden">
                {heroThumb ? (
                  <img
                    src={heroThumb}
                    alt={reel.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film size={24} className="text-[#ccc]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play size={16} className="text-[#1A1A1A] ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-[13px] font-semibold text-[#1A1A1A] truncate">{reel.title}</p>
                <p className="text-[12px] text-[#999] mt-0.5">
                  {reel._count.items} spot{reel._count.items !== 1 ? "s" : ""}
                </p>
                {/* Spot thumbnails strip */}
                {reel.items.length > 0 && (
                  <div className="flex gap-1 mt-3">
                    {reel.items.slice(0, 5).map((item) => {
                      const thumb = item.project.muxPlaybackId
                        ? `https://image.mux.com/${item.project.muxPlaybackId}/thumbnail.jpg?width=80&height=45&fit_mode=smartcrop`
                        : item.project.thumbnailUrl;
                      return (
                        <div
                          key={item.id}
                          className="w-10 h-6 bg-[#EEEDEA] rounded-[2px] overflow-hidden flex-shrink-0"
                        >
                          {thumb && (
                            <img
                              src={thumb}
                              alt={item.project.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </div>
                      );
                    })}
                    {reel.items.length > 5 && (
                      <div className="w-10 h-6 bg-[#EEEDEA] rounded-[2px] flex items-center justify-center text-[9px] text-[#999] flex-shrink-0">
                        +{reel.items.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
