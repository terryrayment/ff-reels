"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, Check, X } from "lucide-react";

interface EditableReelTitleProps {
  reelId: string;
  initialTitle: string;
}

export function EditableReelTitle({ reelId, initialTitle }: EditableReelTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [draft, setDraft] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const save = useCallback(async () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === title) {
      setDraft(title);
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/reels/${reelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });

      if (res.ok) {
        setTitle(trimmed);
        setDraft(trimmed);
      } else {
        setDraft(title);
      }
    } catch {
      setDraft(title);
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  }, [draft, title, reelId]);

  const cancel = () => {
    setDraft(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    } else if (e.key === "Escape") {
      cancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={save}
          disabled={saving}
          className="text-2xl md:text-4xl font-light tracking-tight text-[#1A1A1A] bg-transparent border-b-2 border-[#1A1A1A]/20 focus:border-[#1A1A1A]/50 outline-none w-full py-0.5 transition-colors"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={save}
          disabled={saving}
          className="text-[#999] hover:text-emerald-600 transition-colors flex-shrink-0 p-1"
          title="Save"
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={cancel}
          className="text-[#999] hover:text-red-500 transition-colors flex-shrink-0 p-1"
          title="Cancel"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="group flex items-center gap-2 text-left"
      title="Click to edit title"
    >
      <h1 className="text-2xl md:text-4xl font-light tracking-tight-2 text-[#1A1A1A]">
        {title}
      </h1>
      <Pencil
        size={14}
        className="text-[#ccc] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1"
      />
    </button>
  );
}
