"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  Check,
  X,
  ChevronDown,
  Search,
  Copy,
  ExternalLink,
  FileText,
  UploadCloud,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DirectorOption {
  id: string;
  name: string;
}

interface AddTreatmentBarProps {
  directors: DirectorOption[];
}

type Source =
  | { kind: "none" }
  | { kind: "url"; url: string }
  | { kind: "pdf"; file: File };

const MAX_PDF_MB = 100;

export function AddTreatmentBar({ directors }: AddTreatmentBarProps) {
  const [source, setSource] = useState<Source>({ kind: "none" });
  const [url, setUrl] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [directorId, setDirectorId] = useState("");
  const [directorSearch, setDirectorSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [lastShareUrl, setLastShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (expanded) setTimeout(() => titleRef.current?.focus(), 50);
  }, [expanded]);

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
      setSource({ kind: "url", url: url.trim() });
      setExpanded(true);
    }
  }

  function acceptFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are accepted");
      return;
    }
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      setError(`PDF too large (max ${MAX_PDF_MB}MB)`);
      return;
    }
    setError("");
    setSource({ kind: "pdf", file });
    // Auto-fill title from filename if empty
    if (!title.trim()) {
      setTitle(file.name.replace(/\.pdf$/i, "").replace(/[_-]/g, " "));
    }
    setExpanded(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    e.target.value = ""; // reset
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  }

  function reset() {
    setSource({ kind: "none" });
    setUrl("");
    setTitle("");
    setBrand("");
    setDirectorId("");
    setDirectorSearch("");
    setExpanded(false);
    setError("");
    setUploadProgress(0);
  }

  async function uploadPdf(file: File): Promise<string> {
    // 1. Get presigned URL
    const res = await fetch("/api/treatments/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to get upload URL");
    }
    const { uploadUrl, r2Key } = (await res.json()) as {
      uploadUrl: string;
      r2Key: string;
    };

    // 2. PUT file directly to R2 with progress tracking
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Upload network error"));
      xhr.send(file);
    });

    return r2Key;
  }

  async function save() {
    if (!directorId || !title.trim() || source.kind === "none") {
      setError("Director, title, and a URL or PDF are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        directorId,
        title: title.trim(),
        brand: brand.trim() || undefined,
      };

      if (source.kind === "pdf") {
        const r2Key = await uploadPdf(source.file);
        body.pdfR2Key = r2Key;
      } else {
        body.previewUrl = source.url;
      }

      const res = await fetch("/api/treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
      setUploadProgress(0);
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
      {/* Success banner */}
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

      {/* Input area — paste URL OR drop PDF */}
      {!expanded && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative transition-all ${
            isDragging ? "ring-2 ring-[#1A1A1A] ring-offset-2" : ""
          }`}
        >
          <Link2
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bbb] pointer-events-none"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            placeholder="Paste InDesign URL (press Enter) — or drop a PDF here / click to browse"
            className="w-full pl-11 pr-28 py-3.5 rounded-xl bg-white border border-[#E8E7E3] text-[13px] text-[#1A1A1A] placeholder:text-[#bbb] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#ccc] transition-all"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F6F3] hover:bg-[#EEEDEA] text-[11px] text-[#666] font-medium transition-colors"
          >
            <UploadCloud size={12} />
            Upload PDF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1A1A1A]/5 rounded-xl pointer-events-none">
              <p className="text-[13px] font-medium text-[#1A1A1A]">Drop PDF to upload</p>
            </div>
          )}
        </div>
      )}

      {/* Expanded form */}
      {expanded && (
        <div className="mt-3 p-5 rounded-xl bg-white border border-[#E8E7E3] space-y-3.5">
          {/* Source preview */}
          {source.kind === "pdf" && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#F7F6F3] border border-[#E8E7E3]">
              <FileText size={14} className="text-[#666] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#1A1A1A] truncate font-medium">
                  {source.file.name}
                </p>
                <p className="text-[10px] text-[#999]">
                  {(source.file.size / 1024 / 1024).toFixed(1)} MB · PDF
                </p>
              </div>
            </div>
          )}
          {source.kind === "url" && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-[#F7F6F3] border border-[#E8E7E3]">
              <Link2 size={14} className="text-[#666] flex-shrink-0" />
              <p className="text-[12px] text-[#1A1A1A] truncate font-mono flex-1">
                {source.url}
              </p>
            </div>
          )}

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

          {/* Upload progress */}
          {saving && source.kind === "pdf" && uploadProgress > 0 && uploadProgress < 100 && (
            <div>
              <div className="h-1 bg-[#F7F6F3] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1A1A1A] transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-[#999] mt-1">Uploading {uploadProgress}%</p>
            </div>
          )}

          {error && <p className="text-[12px] text-red-500">{error}</p>}

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
