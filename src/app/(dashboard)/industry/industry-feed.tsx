"use client";

import { useState } from "react";

interface SerializedCredit {
  id: string;
  brand: string;
  campaignName: string | null;
  agency: string | null;
  productionCompany: string | null;
  directorName: string | null;
  category: string | null;
  territory: string | null;
  sourceUrl: string | null;
  sourceName: string | null;
  thumbnailUrl: string | null;
  isVerified: boolean;
  isHidden: boolean;
  createdAt: string;
  scrapedAt: string;
  publishedAt: string | null;
}

interface IndustryFeedProps {
  initialCredits: SerializedCredit[];
  // isAdmin reserved for future admin-only features (hide/verify credits)
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function IndustryFeed({ initialCredits }: IndustryFeedProps) {
  const [credits, setCredits] = useState<SerializedCredit[]>(initialCredits);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "EAST" | "MIDWEST" | "WEST">("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [form, setForm] = useState({
    brand: "",
    campaignName: "",
    agency: "",
    productionCompany: "",
    directorName: "",
    category: "",
    territory: "" as "" | "EAST" | "MIDWEST" | "WEST",
    sourceUrl: "",
    sourceName: "",
  });

  const filteredCredits = credits.filter((c) => {
    if (filter !== "all" && c.territory !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.brand.toLowerCase().includes(q) ||
        c.campaignName?.toLowerCase().includes(q) ||
        c.agency?.toLowerCase().includes(q) ||
        c.productionCompany?.toLowerCase().includes(q) ||
        c.directorName?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q) ||
        false
      );
    }
    return true;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/industry-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          territory: form.territory || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add credit");
      }

      const newCredit = await res.json();
      // Add to top of list with serialized dates
      setCredits([
        {
          ...newCredit,
          createdAt: newCredit.createdAt || new Date().toISOString(),
          scrapedAt: newCredit.scrapedAt || new Date().toISOString(),
          publishedAt: newCredit.publishedAt || null,
        },
        ...credits,
      ]);

      // Reset form
      setForm({
        brand: "",
        campaignName: "",
        agency: "",
        productionCompany: "",
        directorName: "",
        category: "",
        territory: "",
        sourceUrl: "",
        sourceName: "",
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add credit");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Controls bar */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search */}
        <input
          type="text"
          placeholder="Search credits..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 text-[13px] rounded-xl border border-[#E8E7E3]/80 bg-white/60 backdrop-blur-sm text-[#1A1A1A] placeholder-[#bbb] focus:outline-none focus:border-[#ccc] transition-colors"
        />

        {/* Territory filter */}
        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm border border-[#E8E7E3]/80 rounded-xl px-1.5 py-1">
          {(["all", "EAST", "MIDWEST", "WEST"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] rounded-lg transition-all ${
                filter === t
                  ? "bg-[#1A1A1A] text-white font-medium"
                  : "text-[#999] hover:text-[#666] hover:bg-[#f5f5f5]"
              }`}
            >
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>

        {/* Add credit button */}
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-2.5 text-[11px] uppercase tracking-[0.12em] rounded-xl border transition-all font-medium ${
            showAddForm
              ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
              : "bg-white/60 border-[#E8E7E3]/80 text-[#666] hover:text-[#1A1A1A] hover:border-[#ccc]"
          }`}
        >
          {showAddForm ? "Cancel" : "+ Add Credit"}
        </button>
      </div>

      {/* Add credit form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-5">
            Add Industry Credit
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Brand *
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                required
                placeholder="Nike, Apple, Coca-Cola..."
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Campaign Name
              </label>
              <input
                type="text"
                value={form.campaignName}
                onChange={(e) => setForm({ ...form, campaignName: e.target.value })}
                placeholder="Just Do It, Think Different..."
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Director
              </label>
              <input
                type="text"
                value={form.directorName}
                onChange={(e) => setForm({ ...form, directorName: e.target.value })}
                placeholder="Director name"
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Production Company
              </label>
              <input
                type="text"
                value={form.productionCompany}
                onChange={(e) => setForm({ ...form, productionCompany: e.target.value })}
                placeholder="MJZ, Smuggler, Prettybird..."
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Agency
              </label>
              <input
                type="text"
                value={form.agency}
                onChange={(e) => setForm({ ...form, agency: e.target.value })}
                placeholder="Wieden+Kennedy, TBWA..."
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="automotive, tech, food..."
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Territory
              </label>
              <select
                value={form.territory}
                onChange={(e) => setForm({ ...form, territory: e.target.value as "" | "EAST" | "MIDWEST" | "WEST" })}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 text-[#1A1A1A] focus:outline-none focus:border-[#999] transition-colors"
              >
                <option value="">Select territory...</option>
                <option value="EAST">East</option>
                <option value="MIDWEST">Midwest</option>
                <option value="WEST">West</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
                Source
              </label>
              <input
                type="text"
                value={form.sourceName}
                onChange={(e) => setForm({ ...form, sourceName: e.target.value })}
                placeholder="SHOTS, SHOOT, Instagram..."
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[10px] text-[#999] uppercase tracking-[0.12em] mb-1.5">
              Source URL
            </label>
            <input
              type="url"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              placeholder="https://shots.net/work/..."
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-[#E8E7E3]/80 bg-white/60 text-[#1A1A1A] placeholder-[#ccc] focus:outline-none focus:border-[#999] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-500 mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving || !form.brand.trim()}
            className="px-6 py-2.5 text-[11px] uppercase tracking-[0.12em] rounded-xl bg-[#1A1A1A] text-white font-medium hover:bg-[#000] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Add Credit"}
          </button>
        </form>
      )}

      {/* Credits feed */}
      <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="px-7 pt-6 pb-3 flex items-center justify-between border-b border-[#F0F0EC]">
          <p className="text-[10px] text-[#bbb] uppercase tracking-[0.15em]">
            {filteredCredits.length} credit{filteredCredits.length !== 1 ? "s" : ""}
            {filter !== "all" && ` in ${filter}`}
            {search && ` matching "${search}"`}
          </p>
        </div>

        <div className="divide-y divide-[#F0F0EC]">
          {filteredCredits.map((credit) => (
            <div key={credit.id} className="px-7 py-4 group hover:bg-[#fafaf9] transition-colors">
              {/* Credit line */}
              <p className="text-[13px] text-[#1A1A1A] leading-relaxed">
                {[
                  credit.brand,
                  credit.campaignName,
                  credit.agency,
                  credit.productionCompany,
                  credit.directorName,
                ]
                  .filter(Boolean)
                  .join(" / ")}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-1.5">
                {credit.territory && (
                  <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded ${
                    credit.territory === "WEST" ? "text-blue-500/70 bg-blue-50" :
                    credit.territory === "EAST" ? "text-emerald-500/70 bg-emerald-50" :
                    "text-amber-500/70 bg-amber-50"
                  }`}>
                    {credit.territory}
                  </span>
                )}
                {credit.category && (
                  <span className="text-[10px] text-[#ccc] uppercase tracking-wider">
                    {credit.category}
                  </span>
                )}
                {credit.sourceName && (
                  <span className="text-[10px] text-[#ccc]">
                    via{" "}
                    {credit.sourceUrl ? (
                      <a
                        href={credit.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#666] transition-colors underline decoration-[#e0e0e0]"
                      >
                        {credit.sourceName}
                      </a>
                    ) : (
                      credit.sourceName
                    )}
                  </span>
                )}
                {credit.isVerified && (
                  <span className="text-[9px] text-green-400" title="Verified">
                    verified
                  </span>
                )}
                <span className="text-[10px] text-[#ccc] uppercase tracking-[0.1em] ml-auto flex-shrink-0">
                  {timeAgo(credit.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredCredits.length === 0 && (
          <div className="px-7 py-12 text-center">
            <p className="text-[13px] text-[#999]">
              {search ? `No credits matching "${search}"` : "No credits yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
