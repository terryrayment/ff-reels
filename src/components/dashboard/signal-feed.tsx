"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface Update {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isPinned: boolean;
  createdAt: string;
  director: { id: string; name: string } | null;
  project: { id: string; title: string; brand: string | null } | null;
  author: { id: string; name: string | null; email: string } | null;
}

function timeAgoClient(date: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function SignalFeed({
  updates: initialUpdates,
  currentUserId,
  isAdmin,
  compact = false,
}: {
  updates: Update[];
  currentUserId: string;
  isAdmin: boolean;
  compact?: boolean;
}) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const editRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingId]);

  const canModify = (update: Update) => {
    return isAdmin || update.author?.id === currentUserId;
  };

  const handleEdit = (update: Update) => {
    setEditingId(update.id);
    setEditText(update.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editText.trim()) return;

    try {
      const res = await fetch(`/api/updates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editText.trim() }),
      });

      if (res.ok) {
        setUpdates((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, title: editText.trim() } : u
          )
        );
        setEditingId(null);
        router.refresh();
      }
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/updates/${id}`, { method: "DELETE" });

      if (res.ok) {
        setUpdates((prev) => prev.filter((u) => u.id !== id));
        router.refresh();
      }
    } catch {
      // silently fail
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  // Compact 3-column pill layout
  if (compact) {
    const displayUpdates = updates.slice(0, 9);

    return (
      <div>
        {displayUpdates.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {displayUpdates.map((update) => (
              <div
                key={update.id}
                className="group/item relative rounded-xl bg-[#F7F6F3]/50 px-4 py-3 hover:bg-[#F0F0EC]/50 transition-all duration-300"
              >
                {update.isPinned && (
                  <span className="text-[8px] uppercase tracking-[0.12em] text-amber-600 font-semibold">
                    Pinned
                  </span>
                )}

                {editingId === update.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      ref={editRef}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, update.id)}
                      className="flex-1 text-[12px] text-[#1A1A1A] bg-white rounded px-2 py-1 border border-[#E0E0E0] focus:outline-none focus:border-[#999]"
                    />
                    <button
                      onClick={() => handleSaveEdit(update.id)}
                      className="text-emerald-500 hover:text-emerald-700 transition-colors p-0.5"
                    >
                      <Check size={10} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-[#ccc] hover:text-[#999] transition-colors p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <p className="text-[12px] text-[#1A1A1A] leading-snug line-clamp-2">
                    {update.title}
                  </p>
                )}

                {(update.director || update.project) && (
                  <p className="text-[10px] text-[#999] mt-1 truncate">
                    {update.director?.name}
                    {update.director && update.project && " / "}
                    {update.project?.title}
                  </p>
                )}

                <p className="text-[9px] uppercase tracking-[0.12em] text-[#ccc] mt-1.5">
                  {update.author?.name || "System"} · {timeAgoClient(update.createdAt)}
                </p>

                {/* Edit/Delete — hover */}
                {canModify(update) && editingId !== update.id && (
                  <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(update)}
                      className="text-[#ccc] hover:text-[#999] transition-colors p-1 rounded hover:bg-white/60"
                    >
                      <Pencil size={9} />
                    </button>
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="text-[#ccc] hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50/60"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#999] py-4">
            No updates yet. Post the first one.
          </p>
        )}
      </div>
    );
  }

  // Original list layout
  return (
    <div className="mt-8 max-h-[600px] overflow-y-auto pr-1">
      {updates.length > 0 ? (
        <div>
          {updates.map((update, i) => (
            <div
              key={update.id}
              className={`group/item py-4 ${
                i < updates.length - 1 ? "border-b border-[#F0F0EC]" : ""
              }`}
            >
              {/* Pin badge */}
              {update.isPinned && (
                <div className="mb-1.5">
                  <span className="text-[10px] uppercase tracking-[0.12em] text-[#1A1A1A] font-medium">
                    Pinned
                  </span>
                </div>
              )}

              {/* Title — editable */}
              {editingId === update.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    ref={editRef}
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, update.id)}
                    className="flex-1 text-[13px] text-[#1A1A1A] bg-[#F5F5F0] rounded px-2 py-1 border border-[#E0E0E0] focus:outline-none focus:border-[#999]"
                  />
                  <button
                    onClick={() => handleSaveEdit(update.id)}
                    className="text-emerald-500 hover:text-emerald-700 transition-colors p-0.5"
                    title="Save"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-[#ccc] hover:text-[#999] transition-colors p-0.5"
                    title="Cancel"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] text-[#1A1A1A] leading-snug flex-1">
                    {update.title}
                  </p>

                  {/* Edit/Delete actions — show on hover */}
                  {canModify(update) && (
                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 -mt-0.5">
                      <button
                        onClick={() => handleEdit(update)}
                        className="text-[#ccc] hover:text-[#999] transition-colors p-1 rounded hover:bg-[#F5F5F0]"
                        title="Edit"
                      >
                        <Pencil size={10} />
                      </button>
                      <button
                        onClick={() => handleDelete(update.id)}
                        className="text-[#ccc] hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Body */}
              {update.body && (
                <p className="text-[12px] text-[#888] mt-1 leading-relaxed">
                  {update.body}
                </p>
              )}

              {/* Director / Project */}
              {(update.director || update.project) && (
                <p className="text-[11px] text-[#999] mt-2">
                  {update.director && <span>{update.director.name}</span>}
                  {update.director && update.project && (
                    <span className="text-[#ddd]"> / </span>
                  )}
                  {update.project && (
                    <span>
                      {update.project.title}
                      {update.project.brand && ` (${update.project.brand})`}
                    </span>
                  )}
                </p>
              )}

              {/* Author + time */}
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#ccc] mt-2">
                {update.author?.name || update.author?.email || "System"}
                <span className="mx-2 text-[#E8E8E3]">/</span>
                {timeAgoClient(update.createdAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[13px] text-[#999] py-6">
          No updates yet. Post the first one.
        </p>
      )}
    </div>
  );
}
