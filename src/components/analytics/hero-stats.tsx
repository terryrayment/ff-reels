"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import type { HeroStat } from "@/lib/analytics/types";

export function HeroStats({ stats }: { stats: HeroStat[] }) {
  return (
    <div className="data-card p-6 md:p-8 mb-8">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-14">
        {stats.map((stat, i) => (
          <div key={stat.label} className={i === 4 ? "hidden md:block" : ""}>
            <div className="flex items-baseline gap-2">
              <p className="text-[32px] md:text-5xl font-light tracking-tight-3 tabular-nums text-[#1A1A1A]">
                {stat.value}
              </p>
              {stat.trendPct != null && stat.trendPct !== 0 && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
                    stat.trendPct > 0
                      ? "text-emerald-600"
                      : "text-red-400"
                  }`}
                >
                  {stat.trendPct > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stat.trendPct)}%
                </span>
              )}
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#999]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
