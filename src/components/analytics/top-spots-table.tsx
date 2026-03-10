"use client";

import { RotateCcw, SkipForward } from "lucide-react";
import type { TopSpot } from "@/lib/analytics/types";

function completionColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-400";
  if (pct >= 25) return "bg-orange-400";
  return "bg-red-400";
}

function completionTextColor(pct: number): string {
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 50) return "text-amber-600";
  if (pct >= 25) return "text-orange-500";
  return "text-red-400";
}

export function TopSpotsTable({ spots }: { spots: TopSpot[] }) {
  if (spots.length === 0) {
    return null;
  }

  return (
    <div className="data-card p-6 md:p-8 mb-8">
      <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-6">
        Top Performing Spots
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E7E3]">
              <th className="text-left text-[10px] uppercase tracking-wider text-[#999] font-normal pb-3 pr-4">
                Spot
              </th>
              <th className="text-left text-[10px] uppercase tracking-wider text-[#999] font-normal pb-3 pr-4 hidden md:table-cell">
                Director
              </th>
              <th className="text-right text-[10px] uppercase tracking-wider text-[#999] font-normal pb-3 pr-4 w-[70px]">
                Plays
              </th>
              <th className="text-left text-[10px] uppercase tracking-wider text-[#999] font-normal pb-3 pr-4 w-[180px]">
                Completion
              </th>
              <th className="text-right text-[10px] uppercase tracking-wider text-[#999] font-normal pb-3 w-[90px]">
                Signals
              </th>
            </tr>
          </thead>
          <tbody>
            {spots.map((spot, i) => (
              <tr
                key={spot.projectId}
                className="border-b border-[#E8E7E3]/50 last:border-0"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] text-[#ccc] tabular-nums w-4 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-[13px] text-[#1A1A1A] font-medium truncate max-w-[200px]">
                      {spot.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell">
                  <span className="text-[12px] text-[#666]">
                    {spot.directorName}
                  </span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="text-[13px] text-[#1A1A1A] tabular-nums font-medium">
                    {spot.plays}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 h-1.5 rounded-full bg-[#F0F0EC] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${completionColor(spot.avgCompletion)}`}
                        style={{
                          width: `${Math.min(spot.avgCompletion, 100)}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-[11px] tabular-nums font-medium w-[36px] text-right ${completionTextColor(spot.avgCompletion)}`}
                    >
                      {spot.avgCompletion}%
                    </span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {spot.rewatchCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-600" title="Rewatches">
                        <RotateCcw className="w-3 h-3" />
                        {spot.rewatchCount}
                      </span>
                    )}
                    {spot.skipCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-red-400" title="Skips">
                        <SkipForward className="w-3 h-3" />
                        {spot.skipCount}
                      </span>
                    )}
                    {spot.rewatchCount === 0 && spot.skipCount === 0 && (
                      <span className="text-[11px] text-[#ddd]">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
