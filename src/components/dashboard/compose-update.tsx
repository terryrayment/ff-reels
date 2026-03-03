"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function ComposeUpdate() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (expanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [expanded]);

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
        setExpanded(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const hasContent = title.trim().length > 0;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (e.target.value.trim() && !expanded) {
            setExpanded(true);
          }
        }}
        placeholder="Write something..."
        className="w-full bg-transparent border-b border-[#E0E0E0] text-[13px] text-[#1A1A1A] placeholder:text-[#ccc] py-2 focus:outline-none focus:border-[#999] transition-colors"
        required
      />

      <div
        className={`overflow-hidden transition-all duration-200 ${
          expanded ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add detail..."
          rows={2}
          className="w-full bg-transparent border-b border-[#F0F0EC] text-[12px] text-[#666] placeholder:text-[#ddd] py-1.5 focus:outline-none focus:border-[#ccc] transition-colors resize-none"
        />
      </div>

      <div
        className={`flex items-center justify-end overflow-hidden transition-all duration-200 ${
          hasContent ? "max-h-10 opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        {expanded && body.length === 0 && (
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setBody("");
            }}
            className="text-[10px] uppercase tracking-[0.12em] text-[#ccc] hover:text-[#999] transition-colors mr-auto"
          >
            Collapse
          </button>
        )}
        <button
          type="submit"
          disabled={!hasContent || loading}
          className="text-[11px] uppercase tracking-[0.12em] text-[#999] hover:text-[#1A1A1A] disabled:text-[#ddd] disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
