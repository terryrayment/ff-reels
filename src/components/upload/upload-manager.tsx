"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Film,
  Upload,
  ChevronDown,
  Camera,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────── */

interface Project {
  id: string;
  title: string;
  brand: string | null;
  agency: string | null;
  category: string | null;
  year: number | null;
  muxPlaybackId: string | null;
  muxStatus: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  isPublished: boolean;
  createdAt: string;
}

interface Director {
  id: string;
  name: string;
  slug: string;
  projects: Project[];
}

interface UploadManagerProps {
  directors: Director[];
}

/* ─── Director Dropdown ─────────────────────────── */

function DirectorDropdown({
  directors,
  selectedId,
  onSelect,
}: {
  directors: Director[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = directors.find((d) => d.id === selectedId);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/60 backdrop-blur-md border border-[#E8E7E3]/50 text-left hover:border-[#ccc] transition-colors ring-1 ring-inset ring-white/50"
      >
        <span
          className={
            selected ? "text-[#1A1A1A] text-sm" : "text-[#999] text-sm"
          }
        >
          {selected
            ? `${selected.name} — ${selected.projects.length} spot${selected.projects.length !== 1 ? "s" : ""}`
            : "Select a director…"}
        </span>
        <ChevronDown
          size={14}
          className={`text-[#999] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-white/90 backdrop-blur-lg border border-[#E8E7E3]/60 shadow-lg ring-1 ring-inset ring-white/60 max-h-[320px] overflow-y-auto">
          {directors.map((director) => {
            const hero = director.projects[0];
            const thumbSrc = hero?.muxPlaybackId
              ? `https://image.mux.com/${hero.muxPlaybackId}/thumbnail.jpg?width=80&height=45&fit_mode=smartcrop`
              : hero?.thumbnailUrl || null;

            return (
              <button
                key={director.id}
                type="button"
                onClick={() => {
                  onSelect(director.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F7F6F3]/80 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  selectedId === director.id ? "bg-[#F7F6F3]" : ""
                }`}
              >
                <div className="w-10 h-6 bg-[#EEEDEA] rounded-[2px] overflow-hidden flex-shrink-0">
                  {thumbSrc ? (
                    <img
                      src={thumbSrc}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={10} className="text-[#ccc]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] text-[#1A1A1A] font-medium truncate">
                    {director.name}
                  </p>
                  <p className="text-[10px] text-[#999]">
                    {director.projects.length} spot
                    {director.projects.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Spot Card with Thumbnail Edit ─────────────── */

function SpotCard({
  project,
  onThumbnailChange,
  onTogglePublished,
}: {
  project: Project;
  onThumbnailChange: (projectId: string, file: File) => void;
  onTogglePublished: (projectId: string, published: boolean) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const thumbSrc = project.muxPlaybackId
    ? project.thumbnailUrl ||
      `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=480&height=270&fit_mode=smartcrop`
    : project.thumbnailUrl || null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    await onThumbnailChange(project.id, file);
    setUploadingThumb(false);
    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="group">
      <div className="relative aspect-video bg-[#EEEDEA] overflow-hidden rounded-lg">
        {thumbSrc ? (
          <img
            src={thumbSrc}
            alt={project.title}
            className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film size={20} className="text-[#ccc]" />
          </div>
        )}

        {/* Status badges */}
        {project.muxStatus === "preparing" && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-amber-300">
            <Clock size={9} /> Processing
          </div>
        )}
        {project.muxStatus === "errored" && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-red-300">
            <AlertCircle size={9} /> Error
          </div>
        )}

        {/* Duration badge */}
        {project.duration && (
          <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-white/90">
            {formatDuration(project.duration)}
          </span>
        )}

        {/* Thumbnail change overlay */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
        >
          {uploadingThumb ? (
            <div className="flex items-center gap-1.5 text-white text-[11px]">
              <svg
                className="animate-spin h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Uploading...
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-white text-[11px] font-medium">
              <Camera size={14} />
              Change Thumbnail
            </div>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] text-[#1A1A1A] truncate font-medium">
            {project.title}
          </p>
          <p className="text-[11px] text-[#999] truncate">
            {[project.brand, project.agency, project.year]
              .filter(Boolean)
              .join(" · ") || "\u00A0"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onTogglePublished(project.id, !project.isPublished)}
          title={project.isPublished ? "Published — click to unpublish" : "Unpublished — click to publish"}
          className={`flex-shrink-0 mt-0.5 p-1 rounded transition-colors ${
            project.isPublished
              ? "text-[#1A1A1A] hover:text-[#666]"
              : "text-[#ccc] hover:text-[#999]"
          }`}
        >
          {project.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
    </div>
  );
}

/* ─── Upload Manager ─────────────────────────── */

export function UploadManager({ directors }: UploadManagerProps) {
  const [selectedDirectorId, setSelectedDirectorId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [agency, setAgency] = useState("");
  const [year, setYear] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();

  const selectedDirector = directors.find((d) => d.id === selectedDirectorId);
  const projects = useMemo(
    () =>
      selectedDirector
        ? [...selectedDirector.projects].sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        : [],
    [selectedDirector]
  );

  /* ─ File selection ─ */
  const handleFileSelect = (f: File) => {
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  /* ─ Upload flow ─ */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !selectedDirectorId) return;

    setUploading(true);
    setProgress(0);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directorId: selectedDirectorId,
          title: title || file.name,
          filename: file.name,
          contentType: file.type,
          fileSizeMb: Math.round((file.size / 1048576) * 100) / 100,
        }),
      });

      if (!res.ok) throw new Error("Failed to create upload");
      const { muxUploadUrl, r2UploadUrl } = await res.json();

      setProgress(10);

      // Upload to Mux
      const muxUpload = new XMLHttpRequest();
      muxUpload.open("PUT", muxUploadUrl);
      muxUpload.upload.addEventListener("progress", (ev) => {
        if (ev.lengthComputable) {
          setProgress(10 + Math.round((ev.loaded / ev.total) * 70));
        }
      });

      await new Promise<void>((resolve, reject) => {
        muxUpload.onload = () => resolve();
        muxUpload.onerror = () => reject(new Error("Mux upload failed"));
        muxUpload.send(file);
      });

      setProgress(85);

      // Archive to R2
      try {
        await fetch(r2UploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
      } catch {
        console.warn("R2 archival upload failed");
      }

      setProgress(100);

      setTimeout(() => {
        setFile(null);
        setTitle("");
        setBrand("");
        setAgency("");
        setYear("");
        setProgress(0);
        setUploading(false);
        router.refresh();
      }, 600);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setProgress(0);
    }
  };

  /* ─ Thumbnail change ─ */
  const handleThumbnailChange = async (projectId: string, imgFile: File) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/thumbnail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: imgFile.name,
          contentType: imgFile.type,
        }),
      });

      if (!res.ok) throw new Error("Failed to get thumbnail upload URL");
      const { uploadUrl } = await res.json();

      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": imgFile.type },
        body: imgFile,
      });

      router.refresh();
    } catch (err) {
      console.error("Thumbnail upload failed:", err);
    }
  };

  /* ─ Publish toggle ─ */
  const handleTogglePublished = async (
    projectId: string,
    published: boolean
  ) => {
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: published }),
      });
      router.refresh();
    } catch (err) {
      console.error("Toggle published failed:", err);
    }
  };

  /* ─ Drag & drop handlers ─ */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("video/")) handleFileSelect(f);
  };

  return (
    <div className="space-y-6">
      {/* Director selector */}
      <DirectorDropdown
        directors={directors}
        selectedId={selectedDirectorId}
        onSelect={(id) => {
          setSelectedDirectorId(id);
          setFile(null);
          setTitle("");
          setBrand("");
          setAgency("");
          setYear("");
        }}
      />

      {selectedDirector && (
        <>
          {/* Upload zone */}
          <div className="rounded-xl bg-white/60 backdrop-blur-md border border-[#E8E7E3]/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-white/50 p-5">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-4">
              Upload New Spot
            </h3>

            <form onSubmit={handleUpload}>
              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className="relative mb-4"
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploading}
                />
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragging
                      ? "border-[#1A1A1A]/30 bg-[#1A1A1A]/[0.02]"
                      : file
                        ? "border-[#1A1A1A]/20 bg-[#F7F6F3]/50"
                        : "border-[#E8E7E3] hover:border-[#ccc]"
                  }`}
                >
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <Film size={16} className="text-[#999]" />
                      <div className="text-left">
                        <p className="text-[13px] font-medium text-[#1A1A1A]">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-[#999]">
                          {(file.size / 1048576).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setTitle("");
                        }}
                        className="text-[#ccc] hover:text-[#999] transition-colors ml-2"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload size={18} className="mx-auto text-[#ccc] mb-2" />
                      <p className="text-[13px] text-[#666]">
                        Drop a video or click to browse
                      </p>
                      <p className="text-[10px] text-[#bbb] mt-1">
                        MP4, MOV, MKV — up to 5GB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata fields */}
              {file && (
                <div className="space-y-3 mb-4">
                  <Input
                    id="spot-title"
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Spot title"
                    required
                    disabled={uploading}
                  />
                  <div className="grid grid-cols-3 gap-2.5">
                    <Input
                      id="spot-brand"
                      label="Brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Nike"
                      disabled={uploading}
                    />
                    <Input
                      id="spot-agency"
                      label="Agency"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      placeholder="Wieden"
                      disabled={uploading}
                    />
                    <Input
                      id="spot-year"
                      label="Year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2026"
                      type="number"
                      disabled={uploading}
                    />
                  </div>
                </div>
              )}

              {/* Progress bar */}
              {uploading && (
                <div className="space-y-1.5 mb-4">
                  <div className="h-1.5 bg-[#F0F0EC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1A1A1A] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#999] text-center">
                    {progress < 80
                      ? "Uploading to Mux..."
                      : progress < 100
                        ? "Archiving original..."
                        : "Done!"}
                  </p>
                </div>
              )}

              {/* Upload button */}
              {file && (
                <Button
                  type="submit"
                  loading={uploading}
                  disabled={!file || !title}
                  className="w-full"
                >
                  {uploading
                    ? `Uploading ${progress}%`
                    : `Upload to ${selectedDirector.name}`}
                </Button>
              )}
            </form>
          </div>

          {/* Existing spots grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
                {selectedDirector.name}&apos;s Spots ({projects.length})
              </h3>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {projects.map((project) => (
                  <SpotCard
                    key={project.id}
                    project={project}
                    onThumbnailChange={handleThumbnailChange}
                    onTogglePublished={handleTogglePublished}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-[#E8E7E3]">
                <Upload size={18} className="text-[#ccc] mb-3" />
                <p className="text-[13px] text-[#666]">No spots yet</p>
                <p className="text-[11px] text-[#999] mt-1">
                  Upload a video above to get started.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
