"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, Flame, Mail, Building2, Users } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export interface ContactRow {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: string | null;
  totalViews: number;
  reelsSent: number;
  avgCompletionPct: number | null;
  lastActive: string | null;
  uniqueDirectors: number;
  isHot: boolean;
}

type SortKey = "name" | "company" | "totalViews" | "reelsSent" | "avgCompletionPct" | "lastActive";

interface Props {
  rows: ContactRow[];
}

export function ContactsTable({ rows }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastActive");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.company || "").toLowerCase().includes(q) ||
        (r.role || "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "company":
          return dir * (a.company || "").localeCompare(b.company || "");
        case "totalViews":
          return dir * (a.totalViews - b.totalViews);
        case "reelsSent":
          return dir * (a.reelsSent - b.reelsSent);
        case "avgCompletionPct":
          return dir * ((a.avgCompletionPct || 0) - (b.avgCompletionPct || 0));
        case "lastActive":
          return (
            dir *
            (new Date(a.lastActive || 0).getTime() -
              new Date(b.lastActive || 0).getTime())
          );
        default:
          return 0;
      }
    });
  }, [filtered, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" || key === "company" ? "asc" : "desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={10} className="ml-0.5" />
    ) : (
      <ChevronDown size={10} className="ml-0.5" />
    );
  };

  const headerClass = (col: SortKey) =>
    `cursor-pointer select-none hover:text-[#666] transition-colors inline-flex items-center ${
      sortKey === col ? "text-[#1A1A1A]" : ""
    }`;

  if (rows.length === 0) {
    return (
      <div className="data-card p-12 text-center">
        <Users size={20} className="text-[#ccc] mx-auto mb-4" />
        <h3 className="text-lg font-medium text-[#1A1A1A]">No contacts yet</h3>
        <p className="text-[12px] text-[#999] mt-1">
          Contacts are created automatically when you send screening links with an email address.
        </p>
      </div>
    );
  }

  return (
    <div className="data-card p-5 md:p-7">
      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc]"
          />
          <input
            type="text"
            placeholder="Search contacts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2.5 text-[13px] bg-white/50 border border-[#E0DDD8]/60 rounded-xl text-[#1A1A1A] placeholder:text-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/8 transition-shadow"
          />
        </div>
        <span className="text-[11px] text-[#bbb] tabular-nums whitespace-nowrap">
          {sorted.length} contact{sorted.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.12em] text-[#999] border-b border-[#E8E7E3]/50">
              <th className="text-left py-3 px-2 font-medium">
                <span
                  className={headerClass("name")}
                  onClick={() => toggleSort("name")}
                >
                  Contact <SortIcon col="name" />
                </span>
              </th>
              <th className="text-left py-3 px-2 font-medium hidden md:table-cell">
                <span
                  className={headerClass("company")}
                  onClick={() => toggleSort("company")}
                >
                  Company <SortIcon col="company" />
                </span>
              </th>
              <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">
                Role
              </th>
              <th className="text-right py-3 px-2 font-medium">
                <span
                  className={headerClass("totalViews")}
                  onClick={() => toggleSort("totalViews")}
                >
                  Views <SortIcon col="totalViews" />
                </span>
              </th>
              <th className="text-right py-3 px-2 font-medium hidden md:table-cell">
                <span
                  className={headerClass("reelsSent")}
                  onClick={() => toggleSort("reelsSent")}
                >
                  Sent <SortIcon col="reelsSent" />
                </span>
              </th>
              <th className="text-right py-3 px-2 font-medium hidden lg:table-cell">
                <span
                  className={headerClass("avgCompletionPct")}
                  onClick={() => toggleSort("avgCompletionPct")}
                >
                  Avg % <SortIcon col="avgCompletionPct" />
                </span>
              </th>
              <th className="text-right py-3 px-2 font-medium">
                <span
                  className={headerClass("lastActive")}
                  onClick={() => toggleSort("lastActive")}
                >
                  Last Active <SortIcon col="lastActive" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F0EC]/60">
            {sorted.map((row) => (
              <tr key={row.id} className="group hover:bg-white/40 transition-colors">
                <td className="py-3.5 px-2">
                  <Link
                    href={`/contacts/${row.id}`}
                    className="block min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      {row.isHot && (
                        <Flame
                          size={11}
                          className="text-orange-400 flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-[13px] text-[#1A1A1A] font-medium truncate group-hover:text-black">
                          {row.name}
                        </p>
                        <p className="text-[10px] text-[#bbb] truncate flex items-center gap-1 mt-0.5">
                          <Mail size={8} />
                          {row.email}
                        </p>
                      </div>
                    </div>
                  </Link>
                </td>
                <td className="py-3.5 px-2 hidden md:table-cell">
                  {row.company ? (
                    <span className="text-[12px] text-[#666] flex items-center gap-1">
                      <Building2 size={10} className="text-[#ccc]" />
                      {row.company}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#ddd]">—</span>
                  )}
                </td>
                <td className="py-3.5 px-2 hidden lg:table-cell">
                  {row.role ? (
                    <span className="text-[11px] text-[#999]">{row.role}</span>
                  ) : (
                    <span className="text-[11px] text-[#ddd]">—</span>
                  )}
                </td>
                <td className="py-3.5 px-2 text-right tabular-nums text-[12px] text-[#1A1A1A]">
                  {row.totalViews}
                </td>
                <td className="py-3.5 px-2 text-right tabular-nums text-[12px] text-[#999] hidden md:table-cell">
                  {row.reelsSent}
                </td>
                <td className="py-3.5 px-2 text-right tabular-nums hidden lg:table-cell">
                  {row.avgCompletionPct !== null ? (
                    <span
                      className={`text-[11px] font-medium ${
                        row.avgCompletionPct >= 70
                          ? "text-emerald-600"
                          : row.avgCompletionPct >= 40
                          ? "text-amber-600"
                          : "text-[#999]"
                      }`}
                    >
                      {row.avgCompletionPct}%
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#ddd]">—</span>
                  )}
                </td>
                <td className="py-3.5 px-2 text-right text-[11px] text-[#bbb]">
                  {row.lastActive ? timeAgo(new Date(row.lastActive)) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && query && (
        <p className="text-center text-[13px] text-[#999] py-8">
          No contacts matching &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
