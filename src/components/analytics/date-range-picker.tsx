"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Simple date range picker for analytics filtering.
 * Updates URL search params to trigger server-side re-render.
 */
export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/analytics?${params.toString()}`);
    },
    [router, searchParams]
  );

  const presets = [
    { label: "7d", days: 7 },
    { label: "30d", days: 30 },
    { label: "90d", days: 90 },
    { label: "All", days: 0 },
  ];

  const handlePreset = (days: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (days === 0) {
      params.delete("from");
      params.delete("to");
    } else {
      const fromDate = new Date(Date.now() - days * 86400000);
      params.set("from", fromDate.toISOString().split("T")[0]);
      params.delete("to");
    }
    router.push(`/analytics?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Preset pills */}
      <div className="flex items-center gap-1">
        {presets.map((p) => {
          const isActive =
            (p.days === 0 && !from && !to) ||
            (p.days > 0 &&
              from ===
                new Date(Date.now() - p.days * 86400000)
                  .toISOString()
                  .split("T")[0]);

          return (
            <button
              key={p.label}
              onClick={() => handlePreset(p.days)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider rounded-full transition-all duration-200 ${
                isActive
                  ? "bg-[#1A1A1A] text-white font-medium shadow-sm"
                  : "text-[#999] hover:text-[#1A1A1A] hover:bg-[#F0F0EC]"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <span className="w-px h-4 bg-[#E8E7E3]" />

      {/* Custom date inputs */}
      <input
        type="date"
        value={from}
        onChange={(e) => updateParams("from", e.target.value)}
        className="text-[11px] text-[#999] bg-[#F7F6F3] border border-[#E8E7E3]/60 rounded-lg py-1.5 px-2.5 focus:outline-none focus:border-[#999] focus:ring-1 focus:ring-[#1A1A1A]/5 transition-all"
      />
      <span className="text-[10px] text-[#ccc]">to</span>
      <input
        type="date"
        value={to}
        onChange={(e) => updateParams("to", e.target.value)}
        className="text-[11px] text-[#999] bg-[#F7F6F3] border border-[#E8E7E3]/60 rounded-lg py-1.5 px-2.5 focus:outline-none focus:border-[#999] focus:ring-1 focus:ring-[#1A1A1A]/5 transition-all"
      />
    </div>
  );
}
