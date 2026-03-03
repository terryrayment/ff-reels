import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Film, ExternalLink, Eye } from "lucide-react";
import { formatDuration, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
        className="inline-flex items-center gap-1.5 text-xs text-[#999] hover:text-[#1A1A1A] transition-colors mb-6"
      >
        <ArrowLeft size={12} />
        Reels
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">{reel.title}</h1>
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
          <p className="text-sm text-[#999] mt-1">
            <Link href={`/directors/${reel.director.id}`} className="hover:text-[#1A1A1A] transition-colors">
              {reel.director.name}
            </Link>{" "}
            · {reel.items.length} spot{reel.items.length !== 1 ? "s" : ""}
          </p>
          {reel.curatorialNote && (
            <p className="text-sm text-[#999] mt-3 italic max-w-xl">
              &ldquo;{reel.curatorialNote}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Spots in the reel */}
      <div className="mt-8">
        <h2 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider mb-4">
          Spots
        </h2>
        <div className="bg-white border border-[#E8E8E3] divide-y divide-[#E8E8E3]">
          {reel.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 px-4 py-3"
            >
              {/* Sequence number */}
              <span className="text-xs text-[#ccc] w-5 text-center">
                {index + 1}
              </span>

              {/* Thumbnail */}
              <div className="w-24 h-14 rounded-sm bg-[#F0F0EC] overflow-hidden flex-shrink-0">
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
                <p className="text-sm font-medium truncate text-[#1A1A1A]">{item.project.title}</p>
                <p className="text-xs text-[#999] truncate">
                  {[item.project.brand, item.project.agency, item.project.year]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {/* Duration */}
              <span className="text-xs text-[#ccc]">
                {formatDuration(item.project.duration)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Screening Links */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold text-[#999] uppercase tracking-wider">
            Screening Links ({reel.screeningLinks.length})
          </h2>
          <CreateScreeningLink reelId={reel.id} />
        </div>

        {reel.screeningLinks.length > 0 ? (
          <div className="bg-white border border-[#E8E8E3] divide-y divide-[#E8E8E3]">
            {reel.screeningLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm truncate text-[#1A1A1A]">
                      {link.recipientName || link.recipientEmail || "Untitled link"}
                    </p>
                    <p className="text-xs text-[#999] truncate">
                      {link.recipientCompany || "\u2014"} · {timeAgo(link.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs text-[#999]">
                    <Eye size={10} />
                    {link._count.views} view{link._count.views !== 1 ? "s" : ""}
                  </span>
                  {link.expiresAt && new Date(link.expiresAt) < new Date() ? (
                    <Badge variant="danger">Expired</Badge>
                  ) : !link.isActive ? (
                    <Badge variant="danger">Disabled</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
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
          <div className="py-8 text-center bg-white border border-[#E8E8E3]">
            <p className="text-sm text-[#999]">
              No screening links yet. Create one to share this reel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
