"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  MapPin,
  Monitor,
  RotateCcw,
  Search,
  Smartphone,
  SkipForward,
  Tablet,
} from "lucide-react";

export interface ReelSpotViewDetail {
  id: string;
  viewerName: string;
  viewerEmail: string | null;
  company: string | null;
  contactId: string | null;
  city: string | null;
  country: string | null;
  device: string;
  startedAt: string;
  watchDuration: number | null;
  percentWatched: number | null;
  rewatched: boolean;
  skipped: boolean;
}

export interface ReelSpotAnalyticsRow {
  projectId: string;
  rank: number;
  title: string;
  brand: string | null;
  filename: string | null;
  thumbnailUrl: string | null;
  muxPlaybackId: string | null;
  views: number;
  avgPercentViewed: number | null;
  avgWatchDuration: number | null;
  rewatchCount: number;
  skipCount: number;
  lastWatched: string | null;
  viewerDetails: ReelSpotViewDetail[];
}

type SortKey =
  | "rank"
  | "title"
  | "filename"
  | "views"
  | "avgPercentViewed"
  | "lastWatched";

interface Props {
  reelTitle: string;
  rows: ReelSpotAnalyticsRow[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "\u2014";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDateTime(iso: string | null): string {
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

function completionColor(pct: number | null): string {
  if (pct === null) return "bg-[#E8E7E3]";
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 50) return "bg-blue-500";
  if (pct >= 25) return "bg-amber-400";
  return "bg-red-400";
}

function insightLabel(row: ReelSpotAnalyticsRow): {
  label: string;
  className: string;
} {
  const pct = row.avgPercentViewed;
  if (row.views === 0 || pct === null) {
    return { label: "No plays", className: "bg-[#F1F0EA] text-[#aaa]" };
  }
  if (row.rewatchCount > 0 || pct >= 85) {
    return { label: "Strong", className: "bg-emerald-50 text-emerald-600" };
  }
  if (row.skipCount > 0 || pct < 35) {
    return { label: "Drop-off", className: "bg-red-50 text-red-500" };
  }
  if (pct >= 60) {
    return { label: "Solid", className: "bg-blue-50 text-blue-600" };
  }
  return { label: "Partial", className: "bg-amber-50 text-amber-600" };
}

function thumbnailSrc(row: ReelSpotAnalyticsRow): string | null {
  if (row.thumbnailUrl) return row.thumbnailUrl;
  if (row.muxPlaybackId) {
    return `https://image.mux.com/${row.muxPlaybackId}/thumbnail.jpg?width=240&height=135&fit_mode=smartcrop`;
  }
  return null;
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "mobile") return <Smartphone size={11} />;
  if (device === "tablet") return <Tablet size={11} />;
  return <Monitor size={11} />;
}

function csvEscape(value: string | number | null): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function ReelSpotAnalyticsTable({ reelTitle, rows }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.title.toLowerCase().includes(q) ||
        (row.brand && row.brand.toLowerCase().includes(q)) ||
        (row.filename && row.filename.toLowerCase().includes(q)),
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    const next = [...filtered];
    next.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "rank":
          cmp = a.rank - b.rank;
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "filename":
          cmp = (a.filename || "").localeCompare(b.filename || "");
          break;
        case "views":
          cmp = a.views - b.views;
          break;
        case "avgPercentViewed":
          cmp = (a.avgPercentViewed ?? -1) - (b.avgPercentViewed ?? -1);
          break;
        case "lastWatched":
          cmp =
            (a.lastWatched ? new Date(a.lastWatched).getTime() : 0) -
            (b.lastWatched ? new Date(b.lastWatched).getTime() : 0);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return next;
  }, [filtered, sortDir, sortKey]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "rank" || key === "title" || key === "filename" ? "asc" : "desc");
  }

  function toggleExpanded(projectId: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  function exportCsv() {
    const lines = [
      [
        "Rank",
        "Title",
        "Brand",
        "Filename",
        "Views",
        "% Viewed",
        "Avg Watch Time",
        "Rewatches",
        "Skips",
        "Last Watched",
      ].map(csvEscape).join(","),
      ...sorted.map((row) =>
        [
          row.rank,
          row.title,
          row.brand,
          row.filename,
          row.views,
          row.avgPercentViewed,
          row.avgWatchDuration ? formatDuration(row.avgWatchDuration) : null,
          row.rewatchCount,
          row.skipCount,
          row.lastWatched ? formatDateTime(row.lastWatched) : null,
        ].map(csvEscape).join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reelTitle.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "reel"}-spot-analytics.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="w-3" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-[#1A1A1A]" />
    ) : (
      <ChevronDown size={12} className="text-[#1A1A1A]" />
    );
  };

  const headerClass =
    "text-[10px] uppercase tracking-[0.12em] text-[#8D8D87] font-medium py-3 px-4 cursor-pointer select-none hover:text-[#1A1A1A] transition-colors whitespace-nowrap";

  return (
    <div className="data-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-[#E8E7E3]/70 px-4 py-3">
        <div className="relative w-full max-w-md">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, brand, or filename"
            className="w-full rounded-lg border border-[#E0DDD8]/70 bg-white px-9 py-2 text-[13px] text-[#1A1A1A] placeholder:text-[#bbb] focus:border-[#999] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]/5"
          />
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDDAD3] bg-white px-3 py-2 text-[12px] text-[#555] transition-colors hover:border-[#BBB8B0] hover:text-[#1A1A1A]"
        >
          <Download size={13} />
          Export
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px]">
          <thead>
            <tr className="border-b border-[#E8E7E3]/70 bg-[#F7F6F3]">
              <th className="w-7" />
              <th
                className={`${headerClass} w-[76px] text-left`}
                onClick={() => handleSort("rank")}
              >
                <span className="inline-flex items-center gap-1">
                  Rank <SortIcon col="rank" />
                </span>
              </th>
              <th className="w-[92px] px-4 py-3" />
              <th
                className={`${headerClass} text-left min-w-[220px]`}
                onClick={() => handleSort("title")}
              >
                <span className="inline-flex items-center gap-1">
                  Title <SortIcon col="title" />
                </span>
              </th>
              <th
                className={`${headerClass} text-left min-w-[300px]`}
                onClick={() => handleSort("filename")}
              >
                <span className="inline-flex items-center gap-1">
                  Filename <SortIcon col="filename" />
                </span>
              </th>
              <th
                className={`${headerClass} text-right w-[90px]`}
                onClick={() => handleSort("views")}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Views <SortIcon col="views" />
                </span>
              </th>
              <th
                className={`${headerClass} text-left w-[220px]`}
                onClick={() => handleSort("avgPercentViewed")}
              >
                <span className="inline-flex items-center gap-1">
                  % Viewed <SortIcon col="avgPercentViewed" />
                </span>
              </th>
              <th className={`${headerClass} text-right w-[110px] cursor-default hover:text-[#8D8D87]`}>
                Avg Time
              </th>
              <th
                className={`${headerClass} text-right w-[150px]`}
                onClick={() => handleSort("lastWatched")}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Last Watched <SortIcon col="lastWatched" />
                </span>
              </th>
              <th className="w-[100px] px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              const isExpanded = expandedIds.has(row.projectId);
              const label = insightLabel(row);
              const thumb = thumbnailSrc(row);

              return (
                <Fragment key={row.projectId}>
                  <tr
                    key={row.projectId}
                    onClick={() => row.viewerDetails.length > 0 && toggleExpanded(row.projectId)}
                    className={`border-b border-[#E8E7E3]/60 transition-colors ${
                      row.viewerDetails.length > 0
                        ? "cursor-pointer hover:bg-[#FBFAF7]"
                        : "hover:bg-[#FBFAF7]"
                    }`}
                  >
                    <td className="pl-4">
                      {row.viewerDetails.length > 0 && (
                        <ChevronRight
                          size={13}
                          className={`text-[#bbb] transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </td>
                    <td className="px-4 py-4 text-[12px] text-[#777] tabular-nums">
                      {row.rank}
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-[54px] w-[96px] overflow-hidden rounded bg-[#ECEBE5]">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-[#bbb]">
                            No image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[13px] font-medium text-[#1A1A1A]">
                        {row.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#999]">
                        {row.brand || "\u2014"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-[360px] truncate text-[12px] text-[#555]">
                        {row.filename || "\u2014"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right text-[13px] text-[#1A1A1A] tabular-nums">
                      {row.views}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E7E6E0]">
                          <div
                            className={`h-full rounded-full ${completionColor(row.avgPercentViewed)}`}
                            style={{
                              width: `${Math.min(row.avgPercentViewed ?? 0, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="w-10 text-right text-[12px] font-medium tabular-nums text-[#555]">
                          {row.avgPercentViewed !== null
                            ? `${row.avgPercentViewed}%`
                            : "\u2014"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-[12px] text-[#777] tabular-nums">
                      {formatDuration(row.avgWatchDuration)}
                    </td>
                    <td className="px-4 py-4 text-right text-[11px] text-[#777] whitespace-nowrap">
                      {formatDateTime(row.lastWatched)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {row.rewatchCount > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600"
                            title="Rewatches"
                          >
                            <RotateCcw size={10} />
                            {row.rewatchCount}
                          </span>
                        )}
                        {row.skipCount > 0 && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] text-red-500"
                            title="Skips"
                          >
                            <SkipForward size={10} />
                            {row.skipCount}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${label.className}`}
                        >
                          {label.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && row.viewerDetails.length > 0 && (
                    <tr key={`${row.projectId}-details`}>
                      <td colSpan={10} className="border-b border-[#E8E7E3]/60 bg-[#F9F8F5] px-6 py-3">
                        <div className="mb-2 text-[9px] font-medium uppercase tracking-[0.18em] text-[#aaa]">
                          Viewer Sessions
                        </div>
                        <div className="divide-y divide-[#E8E7E3]/50">
                          {row.viewerDetails.map((view) => (
                            <div
                              key={view.id}
                              className="flex items-center justify-between gap-4 py-2.5"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-[#bbb]">
                                  <DeviceIcon device={view.device} />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-[12px] text-[#1A1A1A]">
                                    {view.contactId ? (
                                      <Link
                                        href={`/contacts/${view.contactId}`}
                                        className="font-medium hover:underline"
                                      >
                                        {view.viewerName}
                                      </Link>
                                    ) : (
                                      <span className="font-medium">
                                        {view.viewerName}
                                      </span>
                                    )}
                                    {view.company && (
                                      <span className="text-[#999]">
                                        {" "}
                                        ({view.company})
                                      </span>
                                    )}
                                  </p>
                                  <div className="mt-0.5 flex flex-wrap items-center gap-2.5">
                                    <span className="text-[10px] text-[#999]">
                                      Watched {formatDuration(view.watchDuration)}
                                    </span>
                                    {view.percentWatched !== null && (
                                      <span
                                        className={`text-[10px] ${
                                          view.percentWatched >= 75
                                            ? "text-emerald-600"
                                            : "text-[#999]"
                                        }`}
                                      >
                                        {Math.round(view.percentWatched)}% viewed
                                      </span>
                                    )}
                                    {(view.city || view.country) && (
                                      <span className="flex items-center gap-0.5 text-[10px] text-[#aaa]">
                                        <MapPin size={8} />
                                        {view.city
                                          ? `${view.city}${view.country ? `, ${view.country}` : ""}`
                                          : view.country}
                                      </span>
                                    )}
                                    {view.rewatched && (
                                      <span className="text-[10px] text-emerald-600">
                                        Rewatched
                                      </span>
                                    )}
                                    {view.skipped && (
                                      <span className="text-[10px] text-red-500">
                                        Skipped
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <p className="flex-shrink-0 text-right text-[11px] text-[#777] whitespace-nowrap">
                                {formatDateTime(view.startedAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
