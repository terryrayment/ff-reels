"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Clapperboard,
  ExternalLink,
  Image as ImageIcon,
  Megaphone,
  Pencil,
  Pin,
  Send,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
});

interface ReactionSummary {
  emoji: string;
  count: number;
}

interface Update {
  id: string;
  type: string;
  title: string;
  body: string | null;
  imageUrl: string | null;
  isPinned: boolean;
  createdAt: string;
  director: { id: string; name: string } | null;
  project: {
    id: string;
    title: string;
    brand: string | null;
    muxPlaybackId?: string | null;
  } | null;
  author: { id: string; name: string | null; email: string } | null;
  reactions: ReactionSummary[];
  myReactions: string[];
}

const REACTION_OPTIONS = ["🔥", "👀", "✅", "👏"];

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

function getAuthorLabel(update: Update) {
  if (update.author?.name) return update.author.name;
  if (update.author?.email) return update.author.email;
  return "System";
}

function getUpdateLabel(update: Update) {
  switch (update.type) {
    case "REEL_CREATED":
      return "Reel";
    case "SPOT_ADDED":
      return "Spot";
    case "DIRECTOR_ADDED":
      return "Roster";
    default:
      return update.imageUrl ? "Post" : "Signal";
  }
}

function getUpdateIcon(update: Update) {
  switch (update.type) {
    case "REEL_CREATED":
      return Send;
    case "SPOT_ADDED":
      return Clapperboard;
    case "DIRECTOR_ADDED":
      return UserPlus;
    default:
      return update.imageUrl ? ImageIcon : Megaphone;
  }
}

function getMediaUrl(update: Update) {
  if (update.imageUrl) return update.imageUrl;
  if (update.project?.muxPlaybackId) {
    return `https://image.mux.com/${update.project.muxPlaybackId}/thumbnail.jpg?width=640&height=360&fit_mode=smartcrop`;
  }
  return null;
}

function getSpotPlaybackId(update: Update) {
  if (update.type !== "SPOT_ADDED") return null;
  return update.project?.muxPlaybackId || null;
}

function getSpotPosterUrl(playbackId: string) {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=960&height=540&fit_mode=smartcrop`;
}

function extractFirstUrl(text: string) {
  return text.match(/https?:\/\/[^\s]+/)?.[0]?.replace(/[.,!?;:)]+$/, "") || null;
}

function getLinkLabel(href: string) {
  try {
    const url = new URL(href);
    if (url.hostname.includes("treatments.")) return "Open treatment";
    if (url.hostname.includes("reels.")) return "Open reel";
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Open link";
  }
}

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (!part.match(/^https?:\/\//)) return part;

        const trailingMatch = part.match(/[.,!?;:)]+$/);
        const trailing = trailingMatch?.[0] ?? "";
        const href = trailing ? part.slice(0, -trailing.length) : part;

        return (
          <span key={`${part}-${index}`}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-[#111] underline decoration-[#B8B7B0] underline-offset-2 hover:decoration-[#111]"
            >
              {href}
            </a>
            {trailing}
          </span>
        );
      })}
    </>
  );
}

function SmartLinkCard({ update }: { update: Update }) {
  const href = extractFirstUrl(`${update.title} ${update.body || ""}`);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#DDDCD6] bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#333] transition-colors hover:border-[#1A1A1A]"
    >
      <ExternalLink size={11} />
      <span className="truncate">{getLinkLabel(href)}</span>
    </a>
  );
}

function SpotInlinePlayer({
  update,
  compact = false,
}: {
  update: Update;
  compact?: boolean;
}) {
  const playbackId = getSpotPlaybackId(update);
  if (!playbackId) return null;

  const title = update.project?.title || update.title;
  const poster = getSpotPosterUrl(playbackId);

  return (
    <div
      className={`overflow-hidden bg-[#111] ${
        compact ? "relative aspect-[16/7]" : "aspect-video max-h-64"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        poster={poster}
        metadata={{
          video_id: update.project?.id || update.id,
          video_title: title,
        }}
        primaryColor="#ffffff"
        secondaryColor="#111111"
        accentColor="#777777"
        style={{ width: "100%", height: "100%", aspectRatio: "16/9" }}
      />
    </div>
  );
}

function ReactionBar({
  update,
  onReact,
}: {
  update: Update;
  onReact: (id: string, emoji: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      {REACTION_OPTIONS.map((emoji) => {
        const reaction = update.reactions.find((item) => item.emoji === emoji);
        const selected = update.myReactions.includes(emoji);
        return (
          <button
            key={emoji}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReact(update.id, emoji);
            }}
            className={`inline-flex h-7 min-w-7 items-center justify-center gap-1 rounded-full border px-2 text-[11px] transition-colors ${
              selected
                ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                : reaction
                  ? "border-[#D8D7D2] bg-white text-[#333] hover:border-[#999]"
                  : "border-transparent bg-transparent text-[#999] hover:border-[#E2E1DC] hover:bg-white"
            }`}
            aria-label={`React ${emoji}`}
          >
            <span>{emoji}</span>
            {reaction && <span className="text-[10px]">{reaction.count}</span>}
          </button>
        );
      })}
    </div>
  );
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
    setUpdates(initialUpdates);
  }, [initialUpdates]);

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
      // Keep the card unchanged if the edit fails.
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
      // Keep the card visible if delete fails.
    }
  };

  const handleReaction = async (id: string, emoji: string) => {
    try {
      const res = await fetch(`/api/updates/${id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) return;
      const data = (await res.json()) as {
        reactions: ReactionSummary[];
        myReactions: string[];
      };

      setUpdates((prev) =>
        prev.map((update) =>
          update.id === id
            ? {
                ...update,
                reactions: data.reactions,
                myReactions: data.myReactions,
              }
            : update
        )
      );
    } catch {
      // Reaction counts will recover on refresh.
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const renderEditControls = (update: Update, compactCard = false) => {
    if (!canModify(update) || editingId === update.id) return null;

    return (
      <div
        className={`absolute right-2 top-2 flex items-center gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover/item:opacity-100 ${
          compactCard ? "" : "bg-white/80 backdrop-blur-sm rounded-full"
        }`}
      >
        <button
          onClick={() => handleEdit(update)}
          className="rounded-full p-2 text-[#888] transition-colors hover:bg-white hover:text-[#1A1A1A]"
          aria-label="Edit update"
        >
          <Pencil size={compactCard ? 13 : 14} />
        </button>
        <button
          onClick={() => handleDelete(update.id)}
          className="rounded-full p-2 text-[#888] transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Delete update"
        >
          <Trash2 size={compactCard ? 13 : 14} />
        </button>
      </div>
    );
  };

  const renderTitle = (update: Update, className: string) => {
    if (editingId === update.id) {
      return (
        <div className="flex items-center gap-1.5">
          <input
            ref={editRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, update.id)}
            className="min-w-0 flex-1 rounded border border-[#E0E0E0] bg-white px-2 py-1 text-[12px] text-[#1A1A1A] focus:outline-none focus:border-[#999]"
          />
          <button
            onClick={() => handleSaveEdit(update.id)}
            className="p-1 text-emerald-500 transition-colors hover:text-emerald-700"
            aria-label="Save"
          >
            <Check size={12} />
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="p-1 text-[#888] transition-colors hover:text-[#1A1A1A]"
            aria-label="Cancel"
          >
            <X size={12} />
          </button>
        </div>
      );
    }

    return (
      <p className={className}>
        <LinkifiedText text={update.title} />
      </p>
    );
  };

  if (compact) {
    const displayUpdates = updates.slice(0, 6);

    return (
      <div>
        {displayUpdates.length > 0 ? (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
            {displayUpdates.map((update) => {
              const Icon = getUpdateIcon(update);
              const mediaUrl = getMediaUrl(update);
              const spotPlaybackId = getSpotPlaybackId(update);

              return (
                <div
                  key={update.id}
                  className="group/item relative overflow-hidden rounded-xl border border-transparent bg-[#F7F6F3]/70 transition-all duration-300 hover:border-[#DDDCD6] hover:bg-[#F0F0EC]/70"
                >
                  {spotPlaybackId ? (
                    <SpotInlinePlayer update={update} compact />
                  ) : mediaUrl && (
                    <div className="relative aspect-[16/7] overflow-hidden bg-[#EAE9E3]">
                      <img
                        src={mediaUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-3">
                    <div className="mb-2 flex items-center gap-2 pr-14">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.11em] text-[#555]">
                        <Icon size={10} />
                        {getUpdateLabel(update)}
                      </span>
                      {update.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.11em] text-amber-600">
                          <Pin size={9} />
                          Pinned
                        </span>
                      )}
                    </div>

                    {renderTitle(
                      update,
                      "text-[13px] font-medium leading-snug text-[#1A1A1A] line-clamp-2 break-words",
                    )}

                    {update.body && (
                      <p className="mt-1 line-clamp-2 break-words text-[11px] leading-snug text-[#666]">
                        <LinkifiedText text={update.body} />
                      </p>
                    )}

                    <SmartLinkCard update={update} />

                    {(update.director || update.project) && (
                      <p className="mt-2 truncate text-[10px] text-[#555]">
                        {update.director?.name}
                        {update.director && update.project && " / "}
                        {update.project?.title}
                      </p>
                    )}

                    <ReactionBar update={update} onReact={handleReaction} />

                    <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-[#888]">
                      {getAuthorLabel(update)} · {timeAgoClient(update.createdAt)}
                    </p>
                  </div>

                  {renderEditControls(update, true)}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-4 text-[13px] text-[#777]">
            No updates yet. Post the first one.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 max-h-[600px] overflow-y-auto pr-1">
      {updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((update) => {
            const Icon = getUpdateIcon(update);
            const mediaUrl = getMediaUrl(update);
            const spotPlaybackId = getSpotPlaybackId(update);

            return (
              <div
                key={update.id}
                className="group/item relative overflow-hidden rounded-xl border border-[#ECEBE5] bg-white"
              >
                {spotPlaybackId ? (
                  <SpotInlinePlayer update={update} />
                ) : mediaUrl && (
                  <div className="aspect-video max-h-64 overflow-hidden bg-[#EAE9E3]">
                    <img
                      src={mediaUrl}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="mb-2 flex items-center gap-2 pr-16">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F6F3] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.11em] text-[#555]">
                      <Icon size={10} />
                      {getUpdateLabel(update)}
                    </span>
                    {update.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.11em] text-amber-600">
                        <Pin size={9} />
                        Pinned
                      </span>
                    )}
                  </div>

                  {renderTitle(
                    update,
                    "text-[14px] font-medium leading-snug text-[#1A1A1A] break-words",
                  )}

                  {update.body && (
                    <p className="mt-1 break-words text-[12px] leading-relaxed text-[#666]">
                      <LinkifiedText text={update.body} />
                    </p>
                  )}

                  <SmartLinkCard update={update} />

                  {(update.director || update.project) && (
                    <p className="mt-2 text-[11px] text-[#999]">
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

                  <ReactionBar update={update} onReact={handleReaction} />

                  <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#aaa]">
                    {getAuthorLabel(update)}
                    <span className="mx-2 text-[#E8E8E3]">/</span>
                    {timeAgoClient(update.createdAt)}
                  </p>
                </div>

                {renderEditControls(update)}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-6 text-[13px] text-[#999]">
          No updates yet. Post the first one.
        </p>
      )}
    </div>
  );
}
