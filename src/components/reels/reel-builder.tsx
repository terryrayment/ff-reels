"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Film, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select } from "@/components/ui/input";
import { formatDuration } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  brand: string | null;
  agency: string | null;
  year: number | null;
  category: string | null;
  muxPlaybackId: string | null;
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

export function ReelBuilder({ directors }: ReelBuilderProps) {
  const [selectedDirectorId, setSelectedDirectorId] = useState("");
  const [title, setTitle] = useState("");
  const [curatorialNote, setCuratorialNote] = useState("");
  const [reelType, setReelType] = useState("CUSTOM");
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
          reelType,
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

  return (
    <div className="grid grid-cols-[1fr_380px] gap-8">
      {/* Left — spot selection */}
      <div>
        {/* Director selector */}
        <Select
          id="director"
          label="Director"
          value={selectedDirectorId}
          onChange={(e) => {
            setSelectedDirectorId(e.target.value);
            setSelectedProjectIds([]);
          }}
          options={[
            { value: "", label: "Select a director..." },
            ...directors.map((d) => ({
              value: d.id,
              label: `${d.name} (${d.projects.length} spots)`,
            })),
          ]}
        />

        {/* Available spots grid */}
        {selectedDirector && (
          <div className="mt-6">
            <p className="text-sm text-white/50 mb-3">
              Click spots to add them to the reel:
            </p>
            {availableProjects.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableProjects.map((project) => {
                  const isSelected = selectedProjectIds.includes(project.id);
                  return (
                    <button
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className={`text-left rounded-lg overflow-hidden transition-all ${
                        isSelected
                          ? "ring-2 ring-white/40 bg-white/[0.06]"
                          : "bg-white/[0.02] hover:bg-white/[0.04] border border-white/5"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-white/5 relative">
                        {project.muxPlaybackId ? (
                          <img
                            src={`https://image.mux.com/${project.muxPlaybackId}/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop`}
                            alt={project.title}
                            className={`w-full h-full object-cover ${isSelected ? "opacity-100" : "opacity-70"}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film size={16} className="text-white/10" />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                            <span className="text-[10px] font-bold text-black">
                              {selectedProjectIds.indexOf(project.id) + 1}
                            </span>
                          </div>
                        )}
                        {project.duration && (
                          <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 px-1 py-0.5 rounded text-white/70">
                            {formatDuration(project.duration)}
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{project.title}</p>
                        <p className="text-[10px] text-white/30 truncate">
                          {project.brand || "—"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-white/30 py-8 text-center">
                No ready spots for this director. Upload some first.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right — reel configuration */}
      <div className="space-y-5 sticky top-8 self-start">
        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-xl space-y-4">
          <h3 className="text-sm font-medium">Reel Details</h3>

          <Input
            id="title"
            label="Reel Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. James Frost — Comedy Reel"
            required
          />

          <Select
            id="reelType"
            label="Type"
            value={reelType}
            onChange={(e) => setReelType(e.target.value)}
            options={[
              { value: "CUSTOM", label: "Custom" },
              { value: "PORTFOLIO", label: "Portfolio" },
              { value: "CATEGORY", label: "Category" },
            ]}
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

        {/* Selected spots order */}
        <div className="p-5 bg-white/[0.03] border border-white/5 rounded-xl">
          <h3 className="text-sm font-medium mb-3">
            Spot Order ({selectedProjects.length})
          </h3>

          {selectedProjects.length > 0 ? (
            <div className="space-y-1.5">
              {selectedProjects.map((project, i) => (
                <div
                  key={project.id}
                  className="flex items-center gap-2 p-2 rounded bg-white/[0.03] text-sm"
                >
                  <span className="text-xs text-white/20 w-4">{i + 1}</span>
                  <span className="flex-1 truncate text-white/70">{project.title}</span>
                  <button
                    onClick={() => removeProject(project.id)}
                    className="text-white/20 hover:text-white/50 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/25 py-4 text-center">
              Select spots from the left to add them here.
            </p>
          )}
        </div>

        {/* Save button */}
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
