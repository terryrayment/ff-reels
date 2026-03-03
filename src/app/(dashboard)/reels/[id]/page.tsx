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
        className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors mb-6"
      >
        <ArrowLeft size={12} />
        Reels
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-light tracking-tight">{reel.title}</h1>
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
          <p className="text-sm text-white/40 mt-1">
            <Link href={`/directors/${reel.director.id}`} className="hover:text-white/60 transition-colors">
              {reel.director.name}
            </Link>{" "}
            · {reel.items.length} spot{reel.items.length !== 1 ? "s" : ""}
          </p>
          {reel.curatorialNote && (
            <p className="text-sm text-white/30 mt-3 italic max-w-xl">
              &ldquo;{reel.curatorialNote}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Spots in the reel */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
          Spots
        </h2>
        <div className="space-y-2">
          {reel.items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/5"
            >
              {/* Sequence number */}
              <span className="text-xs text-white/20 w-5 text-center">
                {index + 1}
              </span>

              {/* Thumbnail */}
              <div className="w-24 h-14 rounded bg-white/5 overflow-hidden flex-shrink-0">
                {item.project.muxPlaybackId ? (
                  <img
                    src={`https://image.mux.com/${item.project.muxPlaybackId}/thumbnail.jpg?width=192&height=112&fit_mode=smartcrop`}
                    alt={item.project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film size={14} className="text-white/10" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.project.title}</p>
                <p className="text-xs text-white/30 truncate">
                  {[item.project.brand, item.project.agency, item.project.year]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>

              {/* Duration */}
              <span className="text-xs text-white/20">
                {formatDuration(item.project.duration)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Screening Links */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
            Screening Links ({reel.screeningLinks.length})
          </h2>
          <CreateScreeningLink reelId={reel.id} />
        </div>

        {reel.screeningLinks.length > 0 ? (
          <div className="space-y-2">
            {reel.screeningLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm truncate">
                      {link.recipientName || link.recipientEmail || "Untitled link"}
                    </p>
                    <p className="text-xs text-white/25 truncate">
                      {link.recipientCompany || "—"} · {timeAgo(link.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="flex items-center gap-1 text-xs text-white/30">
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
                    className="text-white/20 hover:text-white/60 transition-colors"
                    title="Open screening link"
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-sm text-white/25">
              No screening links yet. Create one to share this reel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
