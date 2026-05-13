import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { ArrowLeft, BarChart3, Clock, Eye, Flame, Send, Users } from "lucide-react";
import { authOptions } from "@/lib/auth/options";
import { prisma } from "@/lib/db";
import { formatDuration } from "@/lib/utils";
import {
  ReelSpotAnalyticsTable,
  type ReelSpotAnalyticsRow,
} from "@/components/analytics/reel-spot-analytics-table";

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatPercent(value: number | null): string {
  if (value === null) return "\u2014";
  return `${Math.round(value)}%`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#E8E7E3]/70 bg-white/70 px-4 py-3">
      <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-lg bg-[#F2F1EC] text-[#8A8A84]">
        {icon}
      </div>
      <p className="text-[24px] font-light leading-none tracking-tight text-[#1A1A1A]">
        {value}
      </p>
      <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.16em] text-[#aaa]">
        {label}
      </p>
    </div>
  );
}

export default async function ReelAnalyticsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";
  const canSeeOwnReels = ["ADMIN", "REP", "PRODUCER"].includes(session.user.role);

  if (!canSeeOwnReels) return notFound();

  const reel = await prisma.reel.findFirst({
    where: {
      id: params.id,
      ...(isAdmin ? {} : { createdById: session.user.id }),
    },
    include: {
      director: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              brand: true,
              originalFilename: true,
              thumbnailUrl: true,
              muxPlaybackId: true,
            },
          },
        },
      },
      screeningLinks: {
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true,
              company: { select: { name: true } },
            },
          },
          views: {
            orderBy: { startedAt: "desc" },
            include: { spotViews: true },
          },
        },
      },
    },
  });

  if (!reel) return notFound();

  const allViews = reel.screeningLinks.flatMap((link) =>
    link.views.map((view) => ({ link, view })),
  );
  const allSpotViews = allViews.flatMap(({ link, view }) =>
    view.spotViews.map((spotView) => ({ link, view, spotView })),
  );

  const watchedPercents = allSpotViews
    .map(({ spotView }) => spotView.percentWatched)
    .filter((value): value is number => value !== null);
  const watchDurations = allSpotViews
    .map(({ spotView }) => spotView.watchDuration)
    .filter((value): value is number => value !== null && value > 0);
  const lastWatchedDate =
    allViews.length > 0
      ? new Date(
          Math.max(...allViews.map(({ view }) => view.startedAt.getTime())),
        ).toISOString()
      : null;

  const spotRows: ReelSpotAnalyticsRow[] = reel.items.map((item, index) => {
    const projectViews = allSpotViews
      .filter(({ spotView }) => spotView.projectId === item.project.id)
      .sort(
        (a, b) =>
          b.spotView.startedAt.getTime() - a.spotView.startedAt.getTime(),
      );
    const percents = projectViews
      .map(({ spotView }) => spotView.percentWatched)
      .filter((value): value is number => value !== null);
    const durations = projectViews
      .map(({ spotView }) => spotView.watchDuration)
      .filter((value): value is number => value !== null && value > 0);
    const lastWatched =
      projectViews.length > 0 ? projectViews[0].spotView.startedAt.toISOString() : null;
    const avgPercent = avg(percents);
    const avgWatchDuration = avg(durations);

    return {
      projectId: item.project.id,
      rank: index + 1,
      title: item.project.title,
      brand: item.project.brand,
      filename: item.project.originalFilename,
      thumbnailUrl: item.project.thumbnailUrl,
      muxPlaybackId: item.project.muxPlaybackId,
      views: projectViews.length,
      avgPercentViewed:
        avgPercent === null ? null : Math.round(Math.min(avgPercent, 100)),
      avgWatchDuration:
        avgWatchDuration === null ? null : Math.round(avgWatchDuration),
      rewatchCount: projectViews.filter(({ spotView }) => spotView.rewatched).length,
      skipCount: projectViews.filter(({ spotView }) => spotView.skipped).length,
      lastWatched,
      viewerDetails: projectViews.map(({ link, view, spotView }) => ({
        id: spotView.id,
        viewerName:
          view.viewerName ||
          link.recipientName ||
          link.contact?.name ||
          "Anonymous",
        viewerEmail: view.viewerEmail || link.recipientEmail || link.contact?.email || null,
        company: link.recipientCompany || link.contact?.company?.name || null,
        contactId: link.contactId || null,
        city: view.viewerCity || null,
        country: view.viewerCountry || null,
        device: view.device || "desktop",
        startedAt: spotView.startedAt.toISOString(),
        watchDuration: spotView.watchDuration || null,
        percentWatched: spotView.percentWatched,
        rewatched: spotView.rewatched,
        skipped: spotView.skipped,
      })),
    };
  });

  const strongestSpot = [...spotRows]
    .filter((row) => row.avgPercentViewed !== null)
    .sort((a, b) => (b.avgPercentViewed ?? 0) - (a.avgPercentViewed ?? 0))[0];
  const weakestSpot = [...spotRows]
    .filter((row) => row.views > 0 && row.avgPercentViewed !== null)
    .sort((a, b) => (a.avgPercentViewed ?? 0) - (b.avgPercentViewed ?? 0))[0];

  const distinctViewerKeys = new Set(
    allViews.map(({ link, view }) =>
      [
        view.viewerEmail || link.recipientEmail || "",
        view.viewerName || link.recipientName || "",
        view.viewerCity || "",
        view.device || "",
      ].join("|"),
    ),
  );

  return (
    <div>
      <Link
        href="/analytics"
        className="mb-8 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#999] transition-colors hover:text-[#1A1A1A]"
      >
        <ArrowLeft size={11} />
        Analytics
      </Link>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[34px] font-extralight leading-[1.05] tracking-tight text-[#1A1A1A] md:text-[52px]">
            {reel.title}
          </h1>
          <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-[#aaa]">
            {reel.director.name}
            <span className="mx-2 text-[#ddd]">/</span>
            {reel.reelType.toLowerCase()}
            <span className="mx-2 text-[#ddd]">/</span>
            Sent by {reel.createdBy?.name || "Unknown"}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#aaa]">
            Last watched
          </p>
          <p className="mt-1 text-[13px] text-[#1A1A1A]">
            {formatDate(lastWatchedDate)}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Reel Views" value={allViews.length} icon={<Eye size={14} />} />
        <Stat
          label="People"
          value={distinctViewerKeys.size}
          icon={<Users size={14} />}
        />
        <Stat
          label="Avg Viewed"
          value={formatPercent(avg(watchedPercents))}
          icon={<BarChart3 size={14} />}
        />
        <Stat
          label="Avg Watch"
          value={formatDuration(avg(watchDurations))}
          icon={<Clock size={14} />}
        />
        <Stat
          label="Links Sent"
          value={reel.screeningLinks.length}
          icon={<Send size={14} />}
        />
      </div>

      {(strongestSpot || weakestSpot) && (
        <div className="mb-6 grid gap-3 md:grid-cols-2">
          {strongestSpot && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
              <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-600">
                <Flame size={11} />
                Strongest spot
              </p>
              <p className="text-[13px] font-medium text-[#1A1A1A]">
                {strongestSpot.title}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-700/75">
                {strongestSpot.avgPercentViewed}% average viewed across{" "}
                {strongestSpot.views} play{strongestSpot.views !== 1 ? "s" : ""}
              </p>
            </div>
          )}
          {weakestSpot && weakestSpot.projectId !== strongestSpot?.projectId && (
            <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-amber-600">
                Biggest drop-off
              </p>
              <p className="text-[13px] font-medium text-[#1A1A1A]">
                {weakestSpot.title}
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700/75">
                {weakestSpot.avgPercentViewed}% average viewed across{" "}
                {weakestSpot.views} play{weakestSpot.views !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}

      <ReelSpotAnalyticsTable reelTitle={reel.title} rows={spotRows} />
    </div>
  );
}
