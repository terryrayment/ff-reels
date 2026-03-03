import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Film, ExternalLink, Eye } from "lucide-react";
import { formatDuration, timeAgo } from "@/lib/utils";
import { CreateScreeningLink } from "@/components/reels/create-screening-link";

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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div>
      {/* Back */}
      <Link
        href="/reels"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#999] hover:text-[#1A1A1A] transition-colors mb-8 block"
      >
        <ArrowLeft size={11} />
        Reels
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl font-light tracking-tight-2 text-[#1A1A1A]">
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
      <div className="mt-12">
        <h2 className="text-[10px] text-[#999] uppercase tracking-wider mb-5">
          Spots
        </h2>
        <div className="divide-y divide-[#E8E8E3]/60">
          {reel.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-5 py-3.5"
            >
              {/* Sequence number */}
              <span className="text-[11px] text-[#ccc] w-5 text-right tabular-nums">
                {index + 1}
              </span>

              {/* Thumbnail */}
              <div className="w-24 h-14 bg-[#EEEDEA] overflow-hidden flex-shrink-0">
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

      {/* Screening Links */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[10px] text-[#999] uppercase tracking-wider">
            Screening Links ({reel.screeningLinks.length})
          </h2>
          <CreateScreeningLink reelId={reel.id} />
        </div>

        {reel.screeningLinks.length > 0 ? (
          <div className="divide-y divide-[#E8E8E3]/60">
            {reel.screeningLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between py-3.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[13px] text-[#1A1A1A] truncate">
                      {link.recipientName || link.recipientEmail || "Untitled link"}
                    </p>
                    <p className="text-[11px] text-[#999] truncate">
                      {link.recipientCompany || "\u2014"} · {timeAgo(link.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  <span className="flex items-center gap-1 text-[11px] text-[#bbb]">
                    <Eye size={10} />
                    {link._count.views} view{link._count.views !== 1 ? "s" : ""}
                  </span>
                  {link.expiresAt && new Date(link.expiresAt) < new Date() ? (
                    <span className="text-[10px] text-red-400 uppercase tracking-wider">Expired</span>
                  ) : !link.isActive ? (
                    <span className="text-[10px] text-red-400 uppercase tracking-wider">Disabled</span>
                  ) : (
                    <span className="text-[10px] text-emerald-500 uppercase tracking-wider">Active</span>
                  )}
                  <a
                    href={`${appUrl}/s/${link.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ccc] hover:text-[#666] transition-colors"
                    title="Open screening link"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-[13px] text-[#999]">
              No screening links yet. Create one to share this reel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
