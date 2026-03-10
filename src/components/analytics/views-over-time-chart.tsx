"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { DayPoint } from "@/lib/analytics/types";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const date = new Date(label + "T12:00:00");
  const formatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="data-card px-3 py-2 shadow-lg border border-[#E8E7E3]/60">
      <p className="text-[10px] uppercase tracking-wider text-[#999]">
        {formatted}
      </p>
      <p className="text-sm font-medium text-[#1A1A1A] tabular-nums">
        {payload[0].value} view{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

function formatXTick(value: string) {
  const d = new Date(value + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ViewsOverTimeChart({ data }: { data: DayPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="data-card p-6 md:p-8 mb-8">
        <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-6">
          Views Over Time
        </h3>
        <div className="h-[180px] flex items-center justify-center text-[13px] text-[#ccc]">
          No view data for this period
        </div>
      </div>
    );
  }

  // Compute tick interval so we show ~6-8 ticks max
  const tickInterval = Math.max(1, Math.floor(data.length / 7));

  return (
    <div className="data-card p-6 md:p-8 mb-8">
      <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] mb-6">
        Views Over Time
      </h3>
      <div className="h-[220px] md:h-[220px] h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A1A1A" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#1A1A1A" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E8E7E3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXTick}
              interval={tickInterval}
              tick={{ fontSize: 10, fill: "#999" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "#999" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#1A1A1A"
              strokeWidth={1.5}
              fill="url(#viewsFill)"
              dot={false}
              activeDot={{
                r: 4,
                fill: "#1A1A1A",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
