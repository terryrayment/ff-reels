import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { ScreeningLinksPanel } from "@/components/reels/screening-links-panel";
import { GalleryControls } from "@/components/reels/gallery-controls";

export default async function ReelDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const reel = await prisma.reel.findUnique({
    where: { id: params.id },
    include: {
      director: true,
      items: {
        include: { project: true },
        orderBy: { sortOrder: "asc" },
      },
      screeningLinks: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { views: true } },
        },
      },
    },
  });

  if (!reel) return notFound();

  const screeningDomain = process.env.NEXT_PUBLIC_SCREENING_URL || "https://reels.friendsandfamily.tv";

  return (
    <div>
      {/* Back */}
      <Link
        href="/reels"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#999] hover:text-[#1A1A1A] transition-colors mb-6 md:mb-8 block"
      >
        <ArrowLeft size={11} />
        Reels
      </Link>

      {/* Header */}
      <div>
        <div>
          <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
            <h1 className="text-2xl md:text-4xl font-light tracking-tight-2 text-[#1A1A1A]">
              {reel.title}
            </h1>
            <span className="text-[10px] text-[#bbb] uppercase tracking-wider">
              {reel.reelType.toLowerCase()}
            </span>
          </div>
          <p className="text-[12px] text-[#999] mt-2">
            <Link
              href={`/directors/${reel.director.id}`}
              className="hover:text-[#1A1A1A] transition-colors"
            >
              {reel.director.name}
            </Link>{" "}
            · {reel.items.length} spot{reel.items.length !== 1 ? "s" : ""}
          </p>
          {(reel.brand || reel.agencyName || reel.campaignName || reel.producer) && (
            <div className="flex items-center gap-4 mt-3 text-[11px] text-[#999]">
              {reel.brand && <span>{reel.brand}</span>}
              {reel.agencyName && <><span className="text-[#ddd]">·</span><span>{reel.agencyName}</span></>}
              {reel.campaignName && <><span className="text-[#ddd]">·</span><span>{reel.campaignName}</span></>}
              {reel.producer && <><span className="text-[#ddd]">·</span><span>Prod: {reel.producer}</span></>}
            </div>
          )}
          {reel.curatorialNote && (
            <p className="text-[13px] text-[#999] mt-4 italic max-w-xl leading-relaxed">
              &ldquo;{reel.curatorialNote}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Spots in the reel */}
      <div className="mt-8 md:mt-12">
        <h2 className="text-[10px] text-[#999] uppercase tracking-wider mb-4 md:mb-5">
          Spots
        </h2>
        <div className="divide-y divide-[#E8E8E3]/60">
          {reel.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 md:gap-5 py-3"
            >
              {/* Sequence number */}
              <span className="text-[11px] text-[#ccc] w-4 md:w-5 text-right tabular-nums flex-shrink-0">
                {index + 1}
              </span>

              {/* Thumbnail */}
              <div className="w-16 h-10 md:w-24 md:h-14 bg-[#EEEDEA] overflow-hidden flex-shrink-0 rounded-sm">
                {item.project.muxPlaybackId ? (
                  <img
                    src={`https://image.mux.com/${item.project.muxPlaybackId}/thumbnail.jpg?width=192&height=112&fit_mode=smartcrop`}
                    alt={item.project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film size={14} className="text-[#ccc]" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-[#1A1A1A] truncate">
                  {item.project.title}
                </p>
                <p className="text-[11px] text-[#999] truncate">
                  {[item.project.brand, item.project.agency, item.project.year]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {/* Duration */}
              <span className="text-[11px] text-[#ccc] tabular-nums">
                {formatDuration(item.project.duration)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div className="mt-10 md:mt-16">
        <GalleryControls reelId={reel.id} initialStatus={reel.galleryStatus} />
      </div>

      {/* Screening Links */}
      <ScreeningLinksPanel
        reelId={reel.id}
        links={reel.screeningLinks.map((l) => ({
          id: l.id,
          token: l.token,
          isActive: l.isActive,
          recipientName: l.recipientName,
          recipientEmail: l.recipientEmail,
          recipientCompany: l.recipientCompany,
          expiresAt: l.expiresAt ? l.expiresAt.toISOString() : null,
          createdAt: l.createdAt.toISOString(),
          _count: l._count,
        }))}
        screeningDomain={screeningDomain}
      />
    </div>
  );
}
