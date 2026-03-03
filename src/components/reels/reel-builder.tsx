"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Film, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatDuration } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  brand: string | null;
  agency: string | null;
  year: number | null;
  category: string | null;
  muxPlaybackId: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
}

interface Director {
  id: string;
  name: string;
  projects: Project[];
}

interface ReelBuilderProps {
  directors: Director[];
}

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
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[#E8E7E3]/80 text-left hover:border-[#ccc] transition-colors"
      >
        <span className={selected ? "text-[#1A1A1A] text-sm" : "text-[#999] text-sm"}>
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
        <div className="absolute z-50 mt-1.5 w-full rounded-xl bg-white border border-[#E8E7E3] shadow-lg max-h-[320px] overflow-y-auto">
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F7F6F3] transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  selectedId === director.id ? "bg-[#F7F6F3]" : ""
                }`}
              >
                {/* Mini thumbnail */}
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
                    {director.projects.length} spot{director.projects.length !== 1 ? "s" : ""}
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

export function ReelBuilder({ directors }: ReelBuilderProps) {
  const [selectedDirectorId, setSelectedDirectorId] = useState("");
  const [title, setTitle] = useState("");
  const [curatorialNote, setCuratorialNote] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const selectedDirector = directors.find((d) => d.id === selectedDirectorId);
  const availableProjects = selectedDirector?.projects || [];
  const selectedProjects = selectedProjectIds
    .map((id) => availableProjects.find((p) => p.id === id))
    .filter(Boolean) as Project[];

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const removeProject = (projectId: string) => {
    setSelectedProjectIds((prev) => prev.filter((id) => id !== projectId));
  };

  const handleSelectDirector = (id: string) => {
    setSelectedDirectorId(id);
    setSelectedProjectIds([]);
  };

  const handleSave = async () => {
    if (!selectedDirectorId || !title || selectedProjectIds.length === 0) return;
    setSaving(true);

    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directorId: selectedDirectorId,
          title,
          curatorialNote: curatorialNote || undefined,
          reelType: "CUSTOM",
          projectIds: selectedProjectIds,
        }),
      });

      if (res.ok) {
        const reel = await res.json();
        router.push(`/reels/${reel.id}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const totalDuration = selectedProjects.reduce(
    (sum, p) => sum + (p.duration || 0),
    0
  );

  return (
    <div className="grid grid-cols-[1fr_360px] gap-8">
      {/* Left — director select + spot grid */}
      <div>
        <DirectorDropdown
          directors={directors}
          selectedId={selectedDirectorId}
          onSelect={handleSelectDirector}
        />

        {selectedDirector && (
          <div className="mt-6">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#999] mb-4">
              Click to add to reel
            </p>
            {availableProjects.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {availableProjects.map((project) => {
                  const isSelected = selectedProjectIds.includes(project.id);
                  const thumbSrc = project.muxPlaybackId
                    ? `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop`
                    : project.thumbnailUrl || null;

                  return (
                    <button
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className={`text-left overflow-hidden rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "ring-2 ring-[#1A1A1A] shadow-sm"
                          : "border border-[#E8E7E3]/80 hover:border-[#ccc] hover:shadow-sm"
                      }`}
                    >
                      <div className="aspect-video bg-[#EEEDEA] relative rounded-t-[3px] overflow-hidden">
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={project.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film size={16} className="text-[#ccc]" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-sm bg-[#1A1A1A] flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              {selectedProjectIds.indexOf(project.id) + 1}
                            </span>
                          </div>
                        )}
                        {project.duration && (
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 px-1 py-0.5 rounded-sm text-white/90">
                            {formatDuration(project.duration)}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 bg-white">
                        <p className="text-xs font-medium text-[#1A1A1A] truncate">
                          {project.title}
                        </p>
                        <p className="text-[10px] text-[#999] truncate mt-0.5">
                          {project.brand || "\u2014"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center rounded-xl border border-dashed border-[#E8E7E3]">
                <Film size={20} className="text-[#ddd] mx-auto mb-2" />
                <p className="text-sm text-[#999]">
                  No published spots for this director.
                </p>
                <p className="text-[11px] text-[#ccc] mt-1">
                  Upload spots first, then come back to build a reel.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — reel details + spot order */}
      <div className="space-y-5 sticky top-8 self-start">
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
            Reel Details
          </h3>

          <Input
            id="title"
            label="Reel Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Terry Rayment — Comedy Reel"
            required
          />

          <Textarea
            id="note"
            label="Curatorial Note"
            value={curatorialNote}
            onChange={(e) => setCuratorialNote(e.target.value)}
            placeholder="Note for the recipient (e.g. 'Check the humor in spots 2 and 4')"
            rows={3}
          />
        </div>

        {/* Spot order */}
        <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E8E7E3]/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#999] font-medium">
              Spot Order
            </h3>
            {selectedProjects.length > 0 && (
              <span className="text-[10px] text-[#ccc]">
                {selectedProjects.length} spot{selectedProjects.length !== 1 ? "s" : ""}
                {totalDuration > 0 && ` · ${formatDuration(totalDuration)}`}
              </span>
            )}
          </div>

          {selectedProjects.length > 0 ? (
            <div className="space-y-1.5">
              {selectedProjects.map((project, i) => {
                const thumbSrc = project.muxPlaybackId
                  ? `https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=64&height=36&fit_mode=smartcrop`
                  : project.thumbnailUrl || null;

                return (
                  <div
                    key={project.id}
                    className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F7F6F3]/80 group"
                  >
                    <span className="text-[10px] text-[#ccc] w-3 text-right tabular-nums">
                      {i + 1}
                    </span>
                    {/* Mini thumbnail in order list */}
                    <div className="w-8 h-5 bg-[#EEEDEA] rounded-[2px] overflow-hidden flex-shrink-0">
                      {thumbSrc ? (
                        <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={8} className="text-[#ccc]" />
                        </div>
                      )}
                    </div>
                    <span className="flex-1 text-[12px] text-[#1A1A1A] truncate">
                      {project.title}
                    </span>
                    {project.duration && (
                      <span className="text-[10px] text-[#ccc] tabular-nums">
                        {formatDuration(project.duration)}
                      </span>
                    )}
                    <button
                      onClick={() => removeProject(project.id)}
                      className="text-[#ddd] hover:text-[#999] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[11px] text-[#ccc] py-6 text-center">
              Select spots from the left to build your reel.
            </p>
          )}
        </div>

        <Button
          onClick={handleSave}
          loading={saving}
          disabled={!selectedDirectorId || !title || selectedProjectIds.length === 0}
          className="w-full"
          size="lg"
        >
          Create Reel ({selectedProjects.length} spot{selectedProjects.length !== 1 ? "s" : ""})
        </Button>
      </div>
    </div>
  );
}
