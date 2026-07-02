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

/** One file in the upload queue (Wiredrive-style: each file is a row with its own progress) */
interface QueueItem {
  id: string;
  file: File;
  directorId: string;
  title: string;
  status: "queued" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
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

  const muxThumb = project.muxPlaybackId
    ? `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=480&height=270&fit_mode=smartcrop`
    : null;
  // Prefer a custom uploaded thumbnail; fall back to the Mux frame. If the
  // custom one fails to load (e.g. deleted from storage), onError swaps to Mux.
  const thumbSrc = project.thumbnailUrl || muxThumb;

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
            onError={(e) => {
              const img = e.currentTarget;
              if (muxThumb && img.src !== muxThumb) img.src = muxThumb;
            }}
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
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [brand, setBrand] = useState("");
  const [agency, setAgency] = useState("");
  const [year, setYear] = useState("");
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const queueRef = useRef<QueueItem[]>([]);
  const processingRef = useRef(false);
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

  /* ─ Queue management ─ */

  const setQueueSynced = (
    updater: (prev: QueueItem[]) => QueueItem[]
  ) => {
    setQueue((prev) => {
      const next = updater(prev);
      queueRef.current = next;
      return next;
    });
  };

  const updateItem = (id: string, patch: Partial<QueueItem>) => {
    setQueueSynced((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const addFiles = (files: FileList | File[]) => {
    if (!selectedDirectorId) return;
    const videos = Array.from(files).filter((f) => f.type.startsWith("video/"));
    if (videos.length === 0) return;
    const items: QueueItem[] = videos.map((file) => ({
      id: crypto.randomUUID(),
      file,
      directorId: selectedDirectorId,
      title: file.name.replace(/\.[^/.]+$/, ""),
      status: "queued",
      progress: 0,
    }));
    setQueueSynced((prev) => [...prev, ...items]);
  };

  const removeItem = (id: string) => {
    setQueueSynced((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setQueueSynced((prev) => prev.filter((item) => item.status !== "done"));
  };

  /* ─ Upload flow — files process one at a time, top to bottom ─ */

  const uploadOne = async (item: QueueItem) => {
    updateItem(item.id, { status: "uploading", progress: 3, error: undefined });
    const { file } = item;

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directorId: item.directorId,
          title: item.title.trim() || file.name,
          filename: file.name,
          contentType: file.type,
          fileSizeMb: Math.round((file.size / 1048576) * 100) / 100,
          brand: brand.trim() || undefined,
          agency: agency.trim() || undefined,
          year: year.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to create upload");
      const { muxUploadUrl, r2UploadUrl } = await res.json();

      updateItem(item.id, { progress: 10 });

      // Upload to Mux
      const muxUpload = new XMLHttpRequest();
      muxUpload.open("PUT", muxUploadUrl);
      muxUpload.upload.addEventListener("progress", (ev) => {
        if (ev.lengthComputable) {
          updateItem(item.id, {
            progress: 10 + Math.round((ev.loaded / ev.total) * 70),
          });
        }
      });

      await new Promise<void>((resolve, reject) => {
        muxUpload.onload = () => resolve();
        muxUpload.onerror = () => reject(new Error("Mux upload failed"));
        muxUpload.send(file);
      });

      updateItem(item.id, { progress: 85 });

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

      updateItem(item.id, { status: "done", progress: 100 });
    } catch (err) {
      console.error(err);
      updateItem(item.id, {
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Upload failed",
      });
    }
  };

  const processQueue = async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    try {
      // Re-read the ref each pass so files added mid-batch also upload
      for (;;) {
        const next = queueRef.current.find((i) => i.status === "queued");
        if (!next) break;
        await uploadOne(next);
      }
    } finally {
      processingRef.current = false;
      setProcessing(false);
      router.refresh();
    }
  };

  const retryItem = (id: string) => {
    updateItem(id, { status: "queued", progress: 0, error: undefined });
    processQueue();
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
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      {/* Director selector */}
      <DirectorDropdown
        directors={directors}
        selectedId={selectedDirectorId}
        onSelect={(id) => {
          setSelectedDirectorId(id);
          // Queued rows remember their director, so switching is safe mid-batch.
          // Only reset the batch defaults when nothing is in flight.
          if (!processingRef.current && queueRef.current.length === 0) {
            setBrand("");
            setAgency("");
            setYear("");
          }
        }}
      />

      {selectedDirector && (
        <>
          {/* Upload zone */}
          <div className="rounded-xl bg-white/60 backdrop-blur-md border border-[#E8E7E3]/50 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-white/50 p-5">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium mb-4">
              Upload Spots
            </h3>

            {/* Drop zone — accepts multiple files */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="relative mb-4"
            >
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragging
                    ? "border-[#1A1A1A]/30 bg-[#1A1A1A]/[0.02]"
                    : "border-[#E8E7E3] hover:border-[#ccc]"
                }`}
              >
                <Upload size={18} className="mx-auto text-[#ccc] mb-2" />
                <p className="text-[13px] text-[#666]">
                  Drop videos or click to browse — add as many as you like
                </p>
                <p className="text-[10px] text-[#bbb] mt-1">
                  MP4, MOV, MKV — up to 5GB each
                </p>
              </div>
            </div>

            {queue.length > 0 && (
              <>
                {/* Batch defaults — apply to every file in this batch */}
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#bbb] mb-2">
                    Applies to all files in this batch
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <Input
                      id="spot-brand"
                      label="Brand"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Nike"
                    />
                    <Input
                      id="spot-agency"
                      label="Agency"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      placeholder="Wieden"
                    />
                    <Input
                      id="spot-year"
                      label="Year"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2026"
                      type="number"
                    />
                  </div>
                </div>

                {/* Queue rows */}
                <p className="text-[10px] uppercase tracking-[0.12em] text-[#bbb] mb-2">
                  Spot titles — default to the filename, click to edit
                </p>
                <div className="mb-4 rounded-lg border border-[#E8E7E3] divide-y divide-[#F0F0EC] overflow-hidden">
                  {queue.map((item) => (
                    <div key={item.id} className="px-3 py-2.5 bg-white/50">
                      <div className="flex items-center gap-3">
                        <Film size={14} className="text-[#bbb] flex-shrink-0" />

                        {/* Title — editable until the row starts uploading.
                            Given a visible box so it reads as an editable field
                            (defaults to the filename). */}
                        {item.status === "queued" ? (
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              updateItem(item.id, { title: e.target.value })
                            }
                            placeholder="Spot title"
                            aria-label="Spot title"
                            className="flex-1 min-w-0 text-[13px] text-[#1A1A1A] bg-white border border-[#E8E7E3] rounded px-2 py-1 hover:border-[#ccc] focus:border-[#999] focus:ring-2 focus:ring-[#999]/15 outline-none transition-colors"
                          />
                        ) : (
                          <p className="flex-1 min-w-0 text-[13px] text-[#1A1A1A] truncate">
                            {item.title}
                          </p>
                        )}

                        <span className="text-[11px] text-[#bbb] tabular-nums flex-shrink-0">
                          {(item.file.size / 1048576).toFixed(0)} MB
                        </span>

                        {/* Status */}
                        <span className="w-[88px] text-right flex-shrink-0">
                          {item.status === "queued" && (
                            <span className="text-[11px] text-[#999]">Queued</span>
                          )}
                          {item.status === "uploading" && (
                            <span className="text-[11px] font-medium text-[#1A1A1A] tabular-nums">
                              {item.progress < 85 ? `${item.progress}%` : "Archiving…"}
                            </span>
                          )}
                          {item.status === "done" && (
                            <span className="text-[11px] text-emerald-600">Uploaded ✓</span>
                          )}
                          {item.status === "error" && (
                            <button
                              onClick={() => retryItem(item.id)}
                              className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
                              title={item.error}
                            >
                              Failed — retry
                            </button>
                          )}
                        </span>

                        {item.status === "queued" ? (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 text-[#ccc] hover:text-[#999] transition-colors flex-shrink-0"
                            aria-label={`Remove ${item.title}`}
                          >
                            <X size={13} />
                          </button>
                        ) : (
                          <span className="w-[21px] flex-shrink-0" />
                        )}
                      </div>

                      {/* Per-row progress bar */}
                      {item.status === "uploading" && (
                        <div className="mt-2 h-1 bg-[#F0F0EC] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1A1A1A] rounded-full transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Queue actions */}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    onClick={processQueue}
                    loading={processing}
                    disabled={!queue.some((i) => i.status === "queued")}
                    className="flex-1"
                  >
                    {processing
                      ? `Uploading ${queue.filter((i) => i.status === "done").length}/${queue.length}…`
                      : `Upload ${queue.filter((i) => i.status === "queued").length} spot${
                          queue.filter((i) => i.status === "queued").length !== 1 ? "s" : ""
                        } to ${selectedDirector.name}`}
                  </Button>
                  {queue.some((i) => i.status === "done") && !processing && (
                    <button
                      onClick={clearCompleted}
                      className="text-[11px] text-[#999] hover:text-[#666] transition-colors flex-shrink-0"
                    >
                      Clear completed
                    </button>
                  )}
                </div>
              </>
            )}
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
