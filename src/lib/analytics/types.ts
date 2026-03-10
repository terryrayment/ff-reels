/* ─── Analytics Dashboard Types ─────────────────────── */

export interface HeroStat {
  label: string;
  value: string | number;
  previousValue?: string | number | null;
  trendPct?: number | null; // +18 or -5 etc.; null = no comparison
}

export interface DayPoint {
  date: string; // "2026-03-01"
  views: number;
}

export interface DeviceSlice {
  device: string; // "desktop" | "mobile" | "tablet"
  count: number;
}

export interface LocationRow {
  city: string;
  country: string;
  views: number;
}

export interface TopSpot {
  projectId: string;
  title: string;
  directorName: string;
  plays: number;
  avgCompletion: number; // 0-100
  rewatchCount: number;
  skipCount: number;
}

export interface EngagementData {
  avgCompletion: number;
  devices: DeviceSlice[];
  topLocations: LocationRow[];
}
