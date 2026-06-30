import Link from "next/link";

export type MetricDelta = { text: string; dir: "up" | "down" | "flat" };

/**
 * Dashboard metric tile — clickable, with an optional week-over-week delta,
 * a tiny trend sparkline, and a live-pulse treatment that turns red when a
 * real-time value (e.g. clients watching now) is non-zero.
 */
export function MetricTile({
  label,
  value,
  detail,
  href,
  delta,
  spark,
  live = false,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
  href: string;
  delta?: MetricDelta | null;
  spark?: number[];
  live?: boolean;
}) {
  const isLiveActive = live && typeof value === "number" && value > 0;

  return (
    <Link
      href={href}
      className={`metric-tile group block transition-colors hover:border-[#bbb] ${
        isLiveActive ? "ring-1 ring-red-300 bg-red-50/40" : ""
      }`}
    >
      <div className="flex items-center gap-1.5">
        {isLiveActive && (
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
        )}
        <p
          className={`text-[9px] uppercase tracking-[0.14em] font-semibold ${
            isLiveActive ? "text-red-600" : "text-[#777]"
          }`}
        >
          {label}
        </p>
      </div>

      <p
        className={`mt-2 text-[24px] md:text-[28px] font-semibold tracking-tight tabular-nums leading-none ${
          isLiveActive ? "text-red-600" : "text-[#111]"
        }`}
      >
        {value}
      </p>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {delta && (
            <span
              className={`text-[10px] font-semibold tabular-nums ${
                delta.dir === "up"
                  ? "text-emerald-600"
                  : delta.dir === "down"
                    ? "text-red-500"
                    : "text-[#999]"
              }`}
            >
              {delta.dir === "up" ? "↑" : delta.dir === "down" ? "↓" : ""}
              {delta.text}
            </span>
          )}
          {detail && <p className="truncate text-[11px] text-[#777]">{detail}</p>}
        </div>
        {spark && spark.some((n) => n > 0) && <Sparkline data={spark} />}
      </div>
    </Link>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const w = 52;
  const h = 16;
  const max = Math.max(...data, 1);
  const step = data.length > 1 ? w / (data.length - 1) : w;
  const points = data
    .map((d, i) => `${(i * step).toFixed(1)},${(h - (d / max) * h).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="flex-shrink-0"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-40 transition-opacity group-hover:opacity-70"
      />
    </svg>
  );
}
