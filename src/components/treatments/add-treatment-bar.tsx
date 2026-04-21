"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Link2, Check, X, ChevronDown, Search, Copy, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DirectorOption {
  id: string;
  name: string;
}

interface AddTreatmentBarProps {
  directors: DirectorOption[];
}

export function AddTreatmentBar({ directors }: AddTreatmentBarProps) {
  const [url, setUrl] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [directorId, setDirectorId] = useState("");
  const [directorSearch, setDirectorSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lastShareUrl, setLastShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus title when form expands
  useEffect(() => {
    if (expanded) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [expanded]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedDirector = directors.find((d) => d.id === directorId);
  const filteredDirectors = directorSearch.trim()
    ? directors.filter((d) =>
        d.name.toLowerCase().includes(directorSearch.toLowerCase())
      )
    : directors;

  function handleUrlKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && url.trim()) {
      e.preventDefault();
      setExpanded(true);
    }
  }

  function reset() {
    setUrl("");
    setTitle("");
    setBrand("");
    setDirectorId("");
    setDirectorSearch("");
    setExpanded(false);
    setError("");
  }

  async function save() {
    if (!directorId || !title.trim() || !url.trim()) {
      setError("Director, title, and URL are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directorId,
          title: title.trim(),
          brand: brand.trim() || undefined,
          previewUrl: url.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to create treatment");
        return;
      }
      const data = await res.json();
      if (data.shareUrl) setLastShareUrl(data.shareUrl);
      reset();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function copyShareUrl() {
    if (!lastShareUrl) return;
    navigator.clipboard.writeText(lastShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-10">
      {/* Success banner — shows last created share URL */}
      {lastShareUrl && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center gap-3">
          <Check size={14} className="text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-emerald-700 font-medium">
              Treatment link created
            </p>
            <p className="text-[12px] text-emerald-900 font-mono truncate mt-0.5">
              {lastShareUrl.replace(/^https?:\/\//, "")}
            </p>
          </div>
          <button
            onClick={copyShareUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors flex-shrink-0"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy Link"}
          </button>
          <a
            href={lastShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 transition-colors flex-shrink-0"
          >
            <ExternalLink size={11} />
            Open
          </a>
          <button
            onClick={() => setLastShareUrl(null)}
            className="text-emerald-600/50 hover:text-emerald-800 transition-colors flex-shrink-0 p-1"
            title="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* URL bar */}
      <div className="relative">
        <Link2
          size={14}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bbb]"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleUrlKeyDown}
          placeholder="Paste InDesign published URL (https://indd.adobe.com/view/...) and press Enter"
          disabled={expanded}
          className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white border border-[#E8E7E3] text-[13px] text-[#1A1A1A] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#ccc] transition-all disabled:bg-[#F7F6F3]/60"
        />
      </div>

      {/* Expanded form */}
      {expanded && (
        <div className="mt-3 p-5 rounded-xl bg-white border border-[#E8E7E3] space-y-3.5">
          {/* Director picker */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-[11px] uppercase tracking-wider text-[#999] font-medium mb-1.5">
              Director
            </label>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white border border-[#E8E7E3] hover:border-[#ccc] text-left transition-colors"
            >
              <span className={selectedDirector ? "text-[13px] text-[#1A1A1A]" : "text-[13px] text-[#bbb]"}>
                {selectedDirector ? selectedDirector.name : "Select a director..."}
              </span>
              <ChevronDown
                size={14}
                className={`text-[#999] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-lg bg-white border border-[#E8E7E3] shadow-lg max-h-[280px] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-[#E8E7E3] px-3 py-2">
                  <div className="relative">
                    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#bbb]" />
                    <input
                      type="text"
                      value={directorSearch}
                      onChange={(e) => setDirectorSearch(e.target.value)}
                      placeholder="Search directors..."
                      autoFocus
                      className="w-full pl-7 pr-2 py-1 text-[12px] bg-[#F7F6F3] rounded border border-transparent focus:outline-none focus:border-[#ccc]"
                    />
                  </div>
                </div>
                {filteredDirectors.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      setDirectorId(d.id);
                      setDropdownOpen(false);
                      setDirectorSearch("");
                    }}
                    className={`w-full px-3 py-2 text-left text-[13px] hover:bg-[#F7F6F3] transition-colors ${
                      d.id === directorId ? "bg-[#F7F6F3] font-medium" : ""
                    }`}
                  >
                    {d.name}
                  </button>
                ))}
                {filteredDirectors.length === 0 && (
                  <p className="px-3 py-4 text-center text-[12px] text-[#999]">
                    No directors match
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Title + Brand */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              ref={titleRef}
              id="treatment-title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nike - Speed"
            />
            <Input
              id="treatment-brand"
              label="Brand (optional)"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Nike"
            />
          </div>

          {/* URL preview */}
          <div className="text-[11px] text-[#999] truncate">
            URL: <span className="text-[#1A1A1A]">{url}</span>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[12px] text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              disabled={saving}
            >
              <X size={13} />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={save}
              loading={saving}
              disabled={!directorId || !title.trim()}
            >
              <Check size={13} />
              Add Treatment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
