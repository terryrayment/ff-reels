import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Eye,
  Send,
  Film,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
} from "lucide-react";
import { timeAgo, formatDuration } from "@/lib/utils";

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const contact = await prisma.contact.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      screeningLinks: {
        include: {
          reel: {
            include: {
              director: { select: { id: true, name: true } },
              _count: { select: { items: true } },
            },
          },
          views: {
            orderBy: { startedAt: "desc" },
            include: {
              spotViews: { select: { percentWatched: true } },
            },
          },
          _count: { select: { views: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contact) return notFound();

  // Aggregate stats
  const totalViews = contact.screeningLinks.reduce(
    (sum, l) => sum + l._count.views,
    0
  );
  const allViews = contact.screeningLinks.flatMap((l) => l.views);
  const allCompletions = allViews.flatMap((v) =>
    v.spotViews.map((sv) => sv.percentWatched).filter((p): p is number => p != null)
  );
  const avgCompletion =
    allCompletions.length > 0
      ? Math.round(allCompletions.reduce((s, p) => s + p, 0) / allCompletions.length)
      : null;
  const uniqueReels = new Set(contact.screeningLinks.map((l) => l.reelId)).size;
  const lastActive = allViews.length > 0 ? allViews[0].startedAt : null;

  // Build timeline: mix of "sent" and "viewed" events
  type TimelineEvent = {
    type: "sent" | "viewed";
    date: Date;
    reelTitle: string;
    directorName: string;
    detail?: string;
    device?: string;
    city?: string;
  };

  const timeline: TimelineEvent[] = [];

  for (const link of contact.screeningLinks) {
    timeline.push({
      type: "sent",
      date: link.createdAt,
      reelTitle: link.reel.title,
      directorName: link.reel.director.name,
    });
    for (const view of link.views) {
      const spotCompletions = view.spotViews
        .filter((sv) => sv.percentWatched != null)
        .map((sv) => sv.percentWatched!);
      const avgPct = spotCompletions.length > 0
        ? Math.round(spotCompletions.reduce((s, p) => s + p, 0) / spotCompletions.length)
        : null;
      timeline.push({
        type: "viewed",
        date: view.startedAt,
        reelTitle: link.reel.title,
        directorName: link.reel.director.name,
        detail: [
          view.totalDuration ? `${formatDuration(view.totalDuration)}` : null,
          avgPct !== null ? `${avgPct}% avg` : null,
        ]
          .filter(Boolean)
          .join(" · "),
        device: view.device || "desktop",
        city: view.viewerCity || undefined,
      });
    }
  }

  timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div>
      {/* Back */}
      <Link
        href="/contacts"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#999] hover:text-[#1A1A1A] transition-colors mb-8 block"
      >
        <ArrowLeft size={11} />
        Contacts
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light tracking-tight-2 text-[#1A1A1A]">
          {contact.name}
        </h1>
        <div className="flex items-center gap-4 mt-2 text-[12px] text-[#999]">
          {contact.company && (
            <span className="flex items-center gap-1">
              <Building2 size={11} className="text-[#bbb]" />
              {contact.company.name}
            </span>
          )}
          {contact.role && (
            <span>{contact.role}</span>
          )}
          <span className="flex items-center gap-1">
            <Mail size={11} className="text-[#bbb]" />
            {contact.email}
          </span>
          {contact.phone && (
            <span className="flex items-center gap-1">
              <Phone size={11} className="text-[#bbb]" />
              {contact.phone}
            </span>
          )}
        </div>
        {contact.notes && (
          <p className="text-[12px] text-[#888] mt-3 max-w-2xl italic">
            {contact.notes}
          </p>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 mb-6">
        <div className="flex gap-14">
          <div>
            <p className="text-4xl font-light tracking-tight-3 text-[#1A1A1A] tabular-nums">
              {totalViews}
            </p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Total Views
            </p>
          </div>
          <div>
            <p className="text-4xl font-light tracking-tight-3 text-[#1A1A1A] tabular-nums">
              {avgCompletion !== null ? `${avgCompletion}%` : "\u2014"}
            </p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Avg. Completion
            </p>
          </div>
          <div>
            <p className="text-4xl font-light tracking-tight-3 text-[#1A1A1A] tabular-nums">
              {uniqueReels}
            </p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Reels Viewed
            </p>
          </div>
          <div>
            <p className="text-4xl font-light tracking-tight-3 text-[#1A1A1A]">
              {lastActive ? timeAgo(lastActive) : "\u2014"}
            </p>
            <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              Last Active
            </p>
          </div>
        </div>
      </div>

      {/* Reels Sent */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7 mb-6">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
          Reels Sent
        </h2>

        {contact.screeningLinks.length > 0 ? (
          <div className="divide-y divide-[#F0F0EC]">
            {contact.screeningLinks.map((link) => {
              const isExpired = link.expiresAt && new Date(link.expiresAt) < new Date();
              const status = isExpired ? "Expired" : !link.isActive ? "Disabled" : "Active";
              const statusColor = status === "Active" ? "text-emerald-500" : "text-red-400";

              return (
                <Link
                  key={link.id}
                  href={`/analytics/link/${link.id}`}
                  className="flex items-center justify-between py-3.5 hover:bg-white/30 transition-colors -mx-2 px-2 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Film size={13} className="text-[#ccc] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] text-[#1A1A1A] font-medium truncate">
                        {link.reel.title}
                      </p>
                      <p className="text-[10px] text-[#999]">
                        {link.reel.director.name} · {link.reel._count.items} spot{link.reel._count.items !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span className="flex items-center gap-1 text-[11px] text-[#999] tabular-nums">
                      <Eye size={10} />
                      {link._count.views}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider ${statusColor}`}>
                      {status}
                    </span>
                    <span className="text-[10px] text-[#ccc]">
                      {timeAgo(link.createdAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-[13px] text-[#999] py-4 text-center">
            No reels sent to this contact yet.
          </p>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
        <h2 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
          Activity Timeline
        </h2>

        {timeline.length > 0 ? (
          <div className="divide-y divide-[#F0F0EC]">
            {timeline.map((event, i) => (
              <div key={i} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {event.type === "sent" ? (
                      <Send size={11} className="text-[#bbb]" />
                    ) : event.device === "mobile" ? (
                      <Smartphone size={12} className="text-[#bbb]" />
                    ) : event.device === "tablet" ? (
                      <Tablet size={12} className="text-[#bbb]" />
                    ) : (
                      <Monitor size={12} className="text-[#bbb]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-[#1A1A1A]">
                        {event.type === "sent" ? "Sent" : "Viewed"}{" "}
                        <span className="font-medium">{event.reelTitle}</span>
                      </span>
                      {event.detail && (
                        <span className="text-[11px] text-[#999]">
                          {event.detail}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#bbb]">
                        {event.directorName}
                      </span>
                      {event.city && (
                        <span className="text-[10px] text-[#bbb] flex items-center gap-0.5">
                          <MapPin size={8} />
                          {event.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-[#ccc] flex-shrink-0 ml-6">
                  {timeAgo(event.date)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#999] py-8 text-center">
            No activity recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
