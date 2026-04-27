"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ComposeUpdate() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: text.trim(),
        }),
      });

      if (res.ok) {
        setText("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const hasContent = text.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write something..."
        className="flex-1 bg-transparent border-b border-[#D8D7D2] text-[13px] text-[#1A1A1A] placeholder:text-[#888] py-1.5 focus:outline-none focus:border-[#1A1A1A] transition-colors"
        required
      />
      <button
        type="submit"
        disabled={!hasContent || loading}
        className={`text-[11px] uppercase tracking-[0.12em] font-medium transition-all duration-200 flex-shrink-0 ${
          hasContent
            ? "text-[#1A1A1A] hover:text-black"
            : "text-transparent pointer-events-none"
        } disabled:cursor-not-allowed`}
      >
        {loading ? "..." : "Post"}
      </button>
    </form>
  );
}
