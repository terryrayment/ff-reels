"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Pin, Send, X } from "lucide-react";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

interface ComposeUpdateProps {
  directors?: { id: string; name: string }[];
  isAdmin?: boolean;
}

export function ComposeUpdate({ directors = [], isAdmin = false }: ComposeUpdateProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [directorId, setDirectorId] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const reset = () => {
    setTitle("");
    setBody("");
    setDirectorId("");
    setIsPinned(false);
    setFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadImage = async (imageFile: File) => {
    const res = await fetch("/api/updates/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: imageFile.name,
        contentType: imageFile.type,
        sizeBytes: imageFile.size,
      }),
    });

    const data = (await res.json()) as {
      uploadUrl?: string;
      imageUrl?: string;
      error?: string;
    };

    if (!res.ok || !data.uploadUrl || !data.imageUrl) {
      throw new Error(data.error || "Failed to prepare image upload");
    }

    const uploadRes = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": imageFile.type },
      body: imageFile,
    });

    if (!uploadRes.ok) {
      throw new Error("Image upload failed");
    }

    return data.imageUrl;
  };

  const handleFileChange = (selectedFile: File | null) => {
    setError(null);
    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.has(selectedFile.type)) {
      setError("Use JPG, PNG, WebP, or GIF.");
      return;
    }

    if (selectedFile.size > MAX_IMAGE_BYTES) {
      setError("Image must be 10MB or smaller.");
      return;
    }

    setFile(selectedFile);
    setExpanded(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !body.trim() && !file) return;

    setLoading(true);
    setError(null);

    try {
      const imageUrl = file ? await uploadImage(file) : undefined;
      const fallbackTitle = body.trim().split("\n")[0]?.slice(0, 120) || "Signal update";

      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || fallbackTitle,
          body: body.trim() || undefined,
          imageUrl,
          directorId: directorId || undefined,
          isPinned,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to post update");
      }

      reset();
      setExpanded(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post update");
    } finally {
      setLoading(false);
    }
  };

  const hasContent = title.trim().length > 0 || body.trim().length > 0 || !!file;

  if (!expanded) {
    return (
      <div className="flex w-full items-center justify-end gap-2 md:w-auto">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="min-w-0 flex-1 border-b border-[#D8D7D2] py-1.5 text-left text-[13px] text-[#888] transition-colors hover:border-[#1A1A1A] hover:text-[#555] md:w-56 md:flex-none"
        >
          Write something...
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E2E1DC] bg-white text-[#777] transition-colors hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
          aria-label="Attach image"
        >
          <ImagePlus size={15} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl rounded-xl border border-[#E3E1DA] bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Share a reel win, pitch note, link, or reference..."
            className="w-full bg-transparent text-[14px] font-medium text-[#1A1A1A] placeholder:text-[#A2A19B] focus:outline-none"
            autoFocus
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add context if it helps the team."
            rows={2}
            className="mt-2 w-full resize-none bg-transparent text-[12px] leading-relaxed text-[#555] placeholder:text-[#B8B7B0] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setExpanded(false);
          }}
          className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-[#F5F4EF] hover:text-[#1A1A1A]"
          aria-label="Close composer"
        >
          <X size={15} />
        </button>
      </div>

      {previewUrl && (
        <div className="mt-3 flex items-start gap-3 rounded-lg bg-[#F7F6F3] p-2">
          <img
            src={previewUrl}
            alt=""
            className="h-20 w-28 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-[#1A1A1A]">
              {file?.name}
            </p>
            <p className="mt-1 text-[11px] text-[#888]">Image or GIF attachment</p>
          </div>
          <button
            type="button"
            onClick={() => handleFileChange(null)}
            className="rounded-full p-1.5 text-[#999] transition-colors hover:bg-white hover:text-[#1A1A1A]"
            aria-label="Remove image"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}

      <div className="mt-3 flex flex-col gap-2 border-t border-[#F0F0EC] pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E1DC] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-[#777] transition-colors hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
          >
            <ImagePlus size={13} />
            Image/GIF
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          />

          {directors.length > 0 && (
            <select
              value={directorId}
              onChange={(e) => setDirectorId(e.target.value)}
              className="h-8 rounded-full border border-[#E2E1DC] bg-white px-3 text-[12px] text-[#666] focus:outline-none focus:border-[#1A1A1A]"
            >
              <option value="">No director tag</option>
              {directors.map((director) => (
                <option key={director.id} value={director.id}>
                  {director.name}
                </option>
              ))}
            </select>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsPinned((value) => !value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.1em] transition-colors ${
                isPinned
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-[#E2E1DC] text-[#777] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
              }`}
            >
              <Pin size={12} />
              Pin
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={!hasContent || loading}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-[#1A1A1A] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-[#D8D7D2]"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Post
        </button>
      </div>
    </form>
  );
}
