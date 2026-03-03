"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

interface UploadButtonProps {
  directorId: string;
  directorName: string;
}

export function UploadButton({ directorId, directorName }: UploadButtonProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [agency, setAgency] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    setProgress(0);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directorId,
          title: title || file.name,
          filename: file.name,
          contentType: file.type,
          fileSizeMb: Math.round((file.size / 1048576) * 100) / 100,
        }),
      });

      if (!res.ok) throw new Error("Failed to create upload");

      const { muxUploadUrl, r2UploadUrl } = await res.json();

      setProgress(10);
      const muxUpload = new XMLHttpRequest();
      muxUpload.open("PUT", muxUploadUrl);

      muxUpload.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(10 + Math.round((e.loaded / e.total) * 70));
        }
      });

      await new Promise<void>((resolve, reject) => {
        muxUpload.onload = () => resolve();
        muxUpload.onerror = () => reject(new Error("Mux upload failed"));
        muxUpload.send(file);
      });

      setProgress(85);
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
        setOpen(false);
        setTitle("");
        setBrand("");
        setAgency("");
        setYear("");
        setFile(null);
        setProgress(0);
        setUploading(false);
        router.refresh();
      }, 500);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="secondary">
        <Upload size={14} />
        Upload
      </Button>

      <Modal
        open={open}
        onClose={() => !uploading && setOpen(false)}
        title="Upload Spot"
        description={`Add a new spot for ${directorName}`}
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {/* File drop zone */}
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setFile(f);
                  if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            <div className="border-2 border-dashed border-[#E8E8E3] rounded-lg p-8 text-center hover:border-[#ccc] transition-colors">
              {file ? (
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">{file.name}</p>
                  <p className="text-xs text-[#999] mt-1">
                    {(file.size / 1048576).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={20} className="mx-auto text-[#ccc] mb-2" />
                  <p className="text-sm text-[#666]">
                    Drop a video file or click to browse
                  </p>
                  <p className="text-xs text-[#999] mt-1">
                    .MP4, .MOV, .MKV up to 5GB
                  </p>
                </div>
              )}
            </div>
          </div>

          <Input
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Spot title"
            required
            disabled={uploading}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              id="brand"
              label="Brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Nike"
              disabled={uploading}
            />
            <Input
              id="agency"
              label="Agency"
              value={agency}
              onChange={(e) => setAgency(e.target.value)}
              placeholder="Wieden"
              disabled={uploading}
            />
            <Input
              id="year"
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2024"
              type="number"
              disabled={uploading}
            />
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="h-1.5 bg-[#F0F0EC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1A1A1A] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[#999] text-center">
                {progress < 80
                  ? "Uploading to Mux..."
                  : progress < 100
                    ? "Archiving original..."
                    : "Done!"}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" loading={uploading} disabled={!file || !title}>
              {uploading ? `Uploading ${progress}%` : "Upload"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
