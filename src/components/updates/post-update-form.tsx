"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Megaphone, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostUpdateFormProps {
  directors: { id: string; name: string }[];
}

export function PostUpdateForm({ directors }: PostUpdateFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [directorId, setDirectorId] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim() || undefined,
          directorId: directorId || undefined,
          isPinned,
        }),
      });

      if (res.ok) {
        setTitle("");
        setBody("");
        setDirectorId("");
        setIsPinned(false);
        setExpanded(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full p-4 bg-white border border-[#E8E8E3] text-left hover:border-[#ccc] hover:shadow-sm transition-all flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-sm bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Megaphone size={16} className="text-blue-600" />
        </div>
        <span className="text-sm text-[#999]">Post an update for the team...</span>
      </button>
    );
  }

  return (
    <div className="p-5 bg-white border border-[#E8E8E3]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-sm bg-blue-50 flex items-center justify-center">
          <Megaphone size={14} className="text-blue-600" />
        </div>
        <h3 className="text-sm font-medium text-[#1A1A1A]">Post an Update</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline — e.g. 'New Caleb Slain work added' or 'Big pitch this week'"
          className="w-full px-4 py-2.5 bg-white border border-[#E8E8E3] rounded-sm text-sm text-[#1A1A1A] placeholder:text-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A]/20 transition-colors"
          required
          autoFocus
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add more detail (optional) — context for sales reps, what to pitch, etc."
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-[#E8E8E3] rounded-sm text-sm text-[#1A1A1A] placeholder:text-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A]/20 transition-colors resize-none"
        />

        <div className="flex items-center gap-3">
          <select
            value={directorId}
            onChange={(e) => setDirectorId(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-[#E8E8E3] rounded-sm text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/10"
          >
            <option value="">No director (general note)</option>
            {directors.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-medium transition-colors border ${
              isPinned
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-white border-[#E8E8E3] text-[#999] hover:text-[#666]"
            }`}
          >
            <Pin size={12} />
            {isPinned ? "Pinned" : "Pin"}
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setExpanded(false);
              setTitle("");
              setBody("");
              setDirectorId("");
              setIsPinned(false);
            }}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={loading} disabled={!title.trim()}>
            Post Update
          </Button>
        </div>
      </form>
    </div>
  );
}
