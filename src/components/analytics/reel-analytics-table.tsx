"use client";

import { useState, useMemo, Fragment } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Flame,
} from "lucide-react";

export interface ViewDetail {
  id: string;
  viewerName: string;
  viewerEmail: string | null;
  company: string | null;
  city: string | null;
  country: string | null;
  device: string;
  startedAt: string;
  duration: number | null;
  avgCompletion: number | null;
}

export interface ReelRow {
  id: string;
  title: string;
  directorName: string;
  reelType: string;
  sentByName: string;
  totalViews: number;
  totalSent: number;
  activeLinks: number;
  lastSent: string | null;
  lastViewed: string | null;
  views: ViewDetail[];
  recipient: string | null;
  recipientCount: number;
  avgCompletionPct: number | null;
  isHotLead: boolean;
}

type SortKey =
  | "title"
  | "totalViews"
  | "totalSent"
  | "activeLinks"
  | "lastSent"
  | "sentByName"
  | "lastViewed"
  | "avgCompletionPct"
  | "recipient";

interface Props {
  rows: ReelRow[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "\u2014";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDurationShort(seconds: number | null): string {
  if (!seconds) return "\u2014";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeAgo(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "mobile") return <Smartphone size={11} />;
  if (device === "tablet") return <Tablet size={11} />;
  return <Monitor size={11} />;
}

export function ReelAnalyticsTable({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastViewed");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(
        key === "title" || key === "sentByName" || key === "recipient"
          ? "asc"
          : "desc"
      );
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.directorName.toLowerCase().includes(q) ||
        r.sentByName.toLowerCase().includes(q) ||
        (r.recipient && r.recipient.toLowerCase().includes(q))
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "totalViews":
          cmp = a.totalViews - b.totalViews;
          break;
        case "totalSent":
          cmp = a.totalSent - b.totalSent;
          break;
        case "activeLinks":
          cmp = a.activeLinks - b.activeLinks;
          break;
        case "sentByName":
          cmp = a.sentByName.localeCompare(b.sentByName);
          break;
        case "recipient":
          cmp = (a.recipient || "").localeCompare(b.recipient || "");
          break;
        case "avgCompletionPct":
          cmp = (a.avgCompletionPct || 0) - (b.avgCompletionPct || 0);
          break;
        case "lastSent": {
          const aTime = a.lastSent ? new Date(a.lastSent).getTime() : 0;
          const bTime = b.lastSent ? new Date(b.lastSent).getTime() : 0;
          cmp = aTime - bTime;
          break;
        }
        case "lastViewed": {
          const aTime = a.lastViewed ? new Date(a.lastViewed).getTime() : 0;
          const bTime = b.lastViewed ? new Date(b.lastViewed).getTime() : 0;
          cmp = aTime - bTime;
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="w-3" />;
    return sortDir === "asc" ? (
      <ChevronUp size={12} className="text-[#1A1A1A]" />
    ) : (
      <ChevronDown size={12} className="text-[#1A1A1A]" />
    );
  };

  const headerClass =
    "text-[10px] uppercase tracking-[0.12em] text-[#999] font-medium py-3 px-3 cursor-pointer select-none hover:text-[#1A1A1A] transition-colors whitespace-nowrap";

  return (
    <div>
      {/* Search bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bbb]"
          />
          <input
            type="text"
            placeholder="Search reels, directors, or recipients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white/50 border border-[#E0DDD8]/60 rounded-xl placeholder:text-[#ccc] text-[#1A1A1A] focus:outline-none focus:border-[#999] focus:ring-1 focus:ring-[#1A1A1A]/5 transition-all"
          />
        </div>
        <span className="text-[11px] text-[#bbb]">
          {sorted.length} reel{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {sorted.length > 0 ? (
        <div className="data-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E7E3]/50">
                  {/* Expand chevron column */}
                  <th className="w-8" />
                  <th
                    className={`${headerClass} text-left min-w-[220px]`}
                    onClick={() => handleSort("title")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Reel <SortIcon col="title" />
                    </span>
                  </th>
                  <th
                    className={`${headerClass} text-left min-w-[120px]`}
                    onClick={() => handleSort("recipient")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Recipient <SortIcon col="recipient" />
                    </span>
                  </th>
                  <th
                    className={`${headerClass} text-right`}
                    onClick={() => handleSort("totalViews")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Views <SortIcon col="totalViews" />
                    </span>
                  </th>
                  <th
                    className={`${headerClass} text-right`}
                    onClick={() => handleSort("avgCompletionPct")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Avg % <SortIcon col="avgCompletionPct" />
                    </span>
                  </th>
                  <th
                    className={`${headerClass} text-right`}
                    onClick={() => handleSort("totalSent")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Sent <SortIcon col="totalSent" />
                    </span>
                  </th>
                  <th
                    className={`${headerClass} text-right`}
                    onClick={() => handleSort("activeLinks")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Active <SortIcon col="activeLinks" />
                    </span>
                  </th>
                  <th
                    className={`${headerClass} text-right`}
                    onClick={() => handleSort("lastSent")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Last Sent <SortIcon col="lastSent" />
                    </span>
                  </th>
                  <th
                    className={`${headerClass} text-left`}
                    onClick={() => handleSort("sentByName")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Sent By <SortIcon col="sentByName" />
                    </span>
                  </th>
                  <th
                    className={`${headerClass} text-right pr-5`}
                    onClick={() => handleSort("lastViewed")}
                  >
                    <span className="inline-flex items-center gap-1 justify-end">
                      Last Viewed <SortIcon col="lastViewed" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const isExpanded = expandedIds.has(row.id);
                  const hasViews = row.views.length > 0;
                  const colCount = 10;

                  return (
                    <Fragment key={row.id}>
                      {/* Main reel row */}
                      <tr
                        onClick={() => hasViews && toggleExpand(row.id)}
                        className={`border-b border-[#F0F0EC]/50 transition-colors group ${
                          hasViews
                            ? "cursor-pointer hover:bg-white/60"
                            : "opacity-70"
                        } ${isExpanded ? "bg-white/40" : ""}`}
                      >
                        {/* Expand chevron */}
                        <td className="py-3.5 pl-4 pr-0 w-8">
                          {hasViews && (
                            <ChevronRight
                              size={14}
                              className={`text-[#bbb] transition-transform duration-200 ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          )}
                        </td>
                        {/* Reel title + director + hot lead */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5">
                            {row.isHotLead && (
                              <span title="Hot lead — high engagement">
                                <Flame
                                  size={13}
                                  className="text-amber-500 flex-shrink-0"
                                />
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-[#1A1A1A] group-hover:text-black transition-colors truncate max-w-[280px]">
                                {row.title}
                              </p>
                              <p className="text-[11px] text-[#999] mt-0.5">
                                {row.directorName}
                                <span className="text-[#ccc]">
                                  {" "}
                                  &middot; {row.reelType.toLowerCase()}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Recipient */}
                        <td className="py-3.5 px-3 text-[12px] text-[#999]">
                          {row.recipient ? (
                            <div className="min-w-0">
                              <p className="truncate max-w-[150px]">{row.recipient}</p>
                              {row.recipientCount > 1 && (
                                <p className="text-[10px] text-[#ccc] mt-0.5">
                                  +{row.recipientCount - 1} more
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#ccc]">{"\u2014"}</span>
                          )}
                        </td>
                        {/* Views */}
                        <td className="py-3.5 px-3 text-right tabular-nums text-[13px] text-[#1A1A1A]">
                          {row.totalViews}
                        </td>
                        {/* Avg Completion % */}
                        <td className="py-3.5 px-3 text-right tabular-nums text-[13px]">
                          {row.avgCompletionPct !== null ? (
                            <span
                              className={
                                row.avgCompletionPct >= 70
                                  ? "text-emerald-600"
                                  : row.avgCompletionPct >= 40
                                    ? "text-[#1A1A1A]"
                                    : "text-[#999]"
                              }
                            >
                              {row.avgCompletionPct}%
                            </span>
                          ) : (
                            <span className="text-[#ccc]">{"\u2014"}</span>
                          )}
                        </td>
                        {/* Sent */}
                        <td className="py-3.5 px-3 text-right tabular-nums text-[13px] text-[#1A1A1A]">
                          {row.totalSent}
                        </td>
                        {/* Active */}
                        <td className="py-3.5 px-3 text-right tabular-nums text-[13px] text-[#1A1A1A]">
                          {row.activeLinks}
                        </td>
                        {/* Last Sent */}
                        <td className="py-3.5 px-3 text-right text-[12px] text-[#999] whitespace-nowrap">
                          {formatDate(row.lastSent)}
                        </td>
                        {/* Sent By */}
                        <td className="py-3.5 px-3 text-[12px] text-[#999] truncate max-w-[130px]">
                          {row.sentByName || "\u2014"}
                        </td>
                        {/* Last Viewed */}
                        <td className="py-3.5 px-3 pr-5 text-right text-[12px] text-[#999] whitespace-nowrap">
                          {formatDate(row.lastViewed)}
                        </td>
                      </tr>

                      {/* Expanded view details */}
                      {isExpanded && row.views.length > 0 && (
                        <tr>
                          <td colSpan={colCount} className="p-0">
                            <div className="bg-[#F9F8F5] border-b border-[#E8E7E3]/30">
                              {/* View feed header */}
                              <div className="px-6 pt-4 pb-2">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-[#bbb] font-medium">
                                  {row.views.length} view
                                  {row.views.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                              {/* Individual views */}
                              <div className="divide-y divide-[#E8E7E3]/30">
                                {row.views.map((view) => (
                                  <div
                                    key={view.id}
                                    className="flex items-center justify-between px-6 py-3 hover:bg-white/40 transition-colors"
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      {/* Device icon */}
                                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-[#ccc]">
                                        <DeviceIcon device={view.device} />
                                      </div>
                                      {/* Viewer info */}
                                      <div className="min-w-0">
                                        <p className="text-[12px] text-[#1A1A1A] truncate">
                                          <span className="font-medium">
                                            {view.viewerName}
                                          </span>
                                          {view.company && (
                                            <span className="text-[#999]">
                                              {" "}
                                              ({view.company})
                                            </span>
                                          )}
                                        </p>
                                        <div className="flex items-center gap-2.5 mt-0.5">
                                          {view.duration != null &&
                                            view.duration > 0 && (
                                              <span className="text-[10px] text-[#bbb]">
                                                Watched{" "}
                                                {formatDurationShort(
                                                  view.duration
                                                )}
                                              </span>
                                            )}
                                          {view.avgCompletion !== null && (
                                            <span
                                              className={`text-[10px] ${
                                                view.avgCompletion >= 70
                                                  ? "text-emerald-600"
                                                  : "text-[#bbb]"
                                              }`}
                                            >
                                              {view.avgCompletion}% completion
                                            </span>
                                          )}
                                          {view.city && (
                                            <span className="text-[10px] text-[#bbb] flex items-center gap-0.5">
                                              <MapPin size={8} />
                                              {view.city}
                                              {view.country
                                                ? `, ${view.country}`
                                                : ""}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    {/* Time ago */}
                                    <span className="text-[11px] text-[#ccc] flex-shrink-0 ml-4">
                                      {timeAgo(view.startedAt)}
                                    </span>
                                  </div>
                                ))}
                              </div>
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
      ) : (
        <div className="data-card flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 size={20} className="text-[#ccc] mb-4" />
          <h3 className="text-lg font-medium text-[#1A1A1A]">
            {search ? "No matching reels" : "No reels yet"}
          </h3>
          <p className="text-[12px] text-[#999] mt-1 max-w-sm">
            {search
              ? "Try a different search term."
              : "Create a reel and send a screening link to start tracking analytics."}
          </p>
        </div>
      )}
    </div>
  );
}
