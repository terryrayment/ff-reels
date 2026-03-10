"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { EngagementData } from "@/lib/analytics/types";

const DEVICE_COLORS: Record<string, string> = {
  desktop: "#1A1A1A",
  mobile: "#999",
  tablet: "#D4D3CF",
  unknown: "#E8E7E3",
};

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor className="w-3.5 h-3.5" />,
  mobile: <Smartphone className="w-3.5 h-3.5" />,
  tablet: <Tablet className="w-3.5 h-3.5" />,
};

function DeviceTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { percent: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="data-card px-3 py-2 shadow-lg border border-[#E8E7E3]/60">
      <p className="text-[10px] uppercase tracking-wider text-[#999] capitalize">
        {item.name}
      </p>
      <p className="text-sm font-medium text-[#1A1A1A] tabular-nums">
        {item.value} ({Math.round(item.payload.percent * 100)}%)
      </p>
    </div>
  );
}

function completionColor(pct: number): string {
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 50) return "bg-amber-400";
  if (pct >= 25) return "bg-orange-400";
  return "bg-red-400";
}

export function EngagementOverview({ data }: { data: EngagementData }) {
  const total = data.devices.reduce((sum, d) => sum + d.count, 0);

  // Add percent for tooltip
  const pieData = data.devices.map((d) => ({
    ...d,
    name: d.device,
    value: d.count,
    percent: total > 0 ? d.count / total : 0,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Avg Completion */}
      <div className="data-card p-6 md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-4">
          Avg. Completion
        </h3>
        <div className="flex items-end gap-3">
          <p className="text-[48px] font-light tracking-tight-3 tabular-nums text-[#1A1A1A] leading-none">
            {data.avgCompletion}
            <span className="text-[24px] text-[#999]">%</span>
          </p>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[#F0F0EC] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${completionColor(data.avgCompletion)}`}
            style={{ width: `${Math.min(data.avgCompletion, 100)}%` }}
          />
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="data-card p-6 md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-4">
          Devices
        </h3>
        {total > 0 ? (
          <div className="flex items-center gap-6">
            <div className="w-[100px] h-[100px] flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={28}
                    outerRadius={46}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.device}
                        fill={DEVICE_COLORS[entry.device] || DEVICE_COLORS.unknown}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DeviceTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {data.devices.map((d) => (
                <div key={d.device} className="flex items-center gap-2 text-[12px] text-[#666]">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        DEVICE_COLORS[d.device] || DEVICE_COLORS.unknown,
                    }}
                  />
                  <span className="flex items-center gap-1.5 capitalize">
                    {DEVICE_ICONS[d.device]}
                    {d.device}
                  </span>
                  <span className="text-[#999] tabular-nums ml-auto">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-[#ccc]">No device data</p>
        )}
      </div>

      {/* Top Locations */}
      <div className="data-card p-6 md:p-8">
        <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-4">
          Top Locations
        </h3>
        {data.topLocations.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {data.topLocations.map((loc, i) => (
              <div
                key={`${loc.city}-${loc.country}`}
                className="flex items-center justify-between text-[12px]"
              >
                <span className="text-[#444] truncate mr-3">
                  <span className="text-[#999] tabular-nums mr-1.5">{i + 1}.</span>
                  {loc.city}
                  {loc.country ? `, ${loc.country}` : ""}
                </span>
                <span className="text-[#999] tabular-nums flex-shrink-0">
                  {loc.views}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#ccc]">No location data</p>
        )}
      </div>
    </div>
  );
}
