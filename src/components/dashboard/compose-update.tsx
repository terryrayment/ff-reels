"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ComposeUpdate() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showBody, setShowBody] = useState(false);
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
        }),
      });

      if (res.ok) {
        setTitle("");
        setBody("");
        setShowBody(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E8E8E3]">
      <div className="p-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post a note to the team..."
          className="w-full px-3 py-2 bg-[#F7F6F3] border border-[#E8E8E3] text-[13px] text-[#1A1A1A] placeholder:text-[#999] focus:outline-none focus:border-[#ccc] transition-colors rounded-sm"
          required
        />

        {showBody && (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add detail (optional)"
            rows={3}
            className="w-full mt-2 px-3 py-2 bg-[#F7F6F3] border border-[#E8E8E3] text-[13px] text-[#1A1A1A] placeholder:text-[#999] focus:outline-none focus:border-[#ccc] transition-colors resize-none rounded-sm"
          />
        )}

        <div className="flex items-center justify-between mt-2">
          {!showBody ? (
            <button
              type="button"
              onClick={() => setShowBody(true)}
              className="text-[11px] text-[#999] hover:text-[#666] uppercase tracking-wider font-medium transition-colors"
            >
              + Add Detail
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowBody(false);
                setBody("");
              }}
              className="text-[11px] text-[#999] hover:text-[#666] uppercase tracking-wider font-medium transition-colors"
            >
              Remove Detail
            </button>
          )}

          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="px-4 py-1.5 bg-[#1A1A1A] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-sm"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </form>
  );
}
