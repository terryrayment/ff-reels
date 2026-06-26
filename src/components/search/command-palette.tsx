"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Film, Users, Clapperboard, AtSign, EyeOff } from "lucide-react";

type SearchResults = {
  spots: {
    id: string;
    title: string;
    brand: string | null;
    agency: string | null;
    year: number | null;
    muxPlaybackId: string | null;
    thumbnailUrl: string | null;
    isPublished: boolean;
    director: { id: string; name: string };
  }[];
  directors: {
    id: string;
    name: string;
    headshotUrl: string | null;
    rosterStatus: string;
    _count: { projects: number };
  }[];
  reels: {
    id: string;
    title: string;
    brand: string | null;
    director: { name: string };
    _count: { items: number };
  }[];
  contacts: {
    id: string;
    name: string;
    email: string;
    company: { name: string } | null;
  }[];
};

const EMPTY: SearchResults = { spots: [], directors: [], reels: [], contacts: [] };

type FlatItem =
  | { type: "spot"; data: SearchResults["spots"][number] }
  | { type: "director"; data: SearchResults["directors"][number] }
  | { type: "reel"; data: SearchResults["reels"][number] }
  | { type: "contact"; data: SearchResults["contacts"][number] };

/**
 * Global search palette — opens with Cmd+K / Ctrl+K (or the sidebar
 * Search button via the "open-command-palette" window event) and searches
 * spots, directors, reels, and contacts across the whole library.
 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Open via keyboard shortcut or sidebar button
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const handleOpen = () => setOpen(true);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("open-command-palette", handleOpen);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("open-command-palette", handleOpen);
    };
  }, []);

  // Focus input + reset state when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(EMPTY);
      setActiveIndex(0);
      // Wait for render before focusing
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          setResults(await res.json());
          setActiveIndex(0);
        }
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  // Flatten grouped results for keyboard navigation
  const flat = useMemo<FlatItem[]>(
    () => [
      ...results.spots.map((data) => ({ type: "spot" as const, data })),
      ...results.directors.map((data) => ({ type: "director" as const, data })),
      ...results.reels.map((data) => ({ type: "reel" as const, data })),
      ...results.contacts.map((data) => ({ type: "contact" as const, data })),
    ],
    [results]
  );

  const navigate = useCallback(
    (item: FlatItem) => {
      setOpen(false);
      switch (item.type) {
        case "spot":
          router.push(`/directors/${item.data.director.id}`);
          break;
        case "director":
          router.push(`/directors/${item.data.id}`);
          break;
        case "reel":
          router.push(`/reels/${item.data.id}`);
          break;
        case "contact":
          router.push(`/contacts/${item.data.id}`);
          break;
      }
    },
    [router]
  );

  const handleInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && flat[activeIndex]) {
      e.preventDefault();
      navigate(flat[activeIndex]);
    }
  };

  // Keep the active row in view while arrowing
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const hasResults = flat.length > 0;
  const showEmpty = query.trim().length >= 2 && !loading && !hasResults;

  // Running index across groups so arrow keys move through all sections
  let idx = -1;

  const rowClass = (i: number) =>
    `flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
      i === activeIndex ? "bg-[#F2F1EC]" : "hover:bg-[#FAFAF7]"
    }`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/30 backdrop-blur-sm px-4 pt-[12vh]"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl border border-[#DEDDD7] overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-[#EEEDEA]">
          <Search size={15} className="text-[#999] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKey}
            placeholder="Search spots, directors, reels, contacts…"
            // Stop password managers (1Password / LastPass / Dashlane) from
            // attaching their overlay UI to this search field.
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            className="w-full py-3.5 text-[14px] text-[#111] placeholder:text-[#AAA9A2] outline-none bg-transparent border-0"
          />
          {loading && (
            <span className="w-3.5 h-3.5 border-2 border-[#ccc] border-t-[#666] rounded-full animate-spin flex-shrink-0" />
          )}
          <kbd className="hidden md:block flex-shrink-0 text-[10px] text-[#bbb] border border-[#E5E4DF] rounded px-1.5 py-0.5">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto">
          {showEmpty && (
            <p className="px-4 py-8 text-center text-[13px] text-[#999]">
              No matches for &ldquo;{query}&rdquo;
            </p>
          )}

          {query.trim().length < 2 && (
            <div className="px-3 py-3">
              <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.12em] text-[#bbb]">
                Search across
              </p>
              {[
                { Icon: Film, label: "Spots", hint: "title, brand, agency" },
                { Icon: Users, label: "Directors", hint: "name" },
                { Icon: Clapperboard, label: "Reels", hint: "title or client" },
                { Icon: AtSign, label: "Contacts", hint: "name, email, company" },
              ].map(({ Icon, label, hint }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 px-3 py-2 text-[13px]"
                >
                  <Icon size={14} className="text-[#bbb] flex-shrink-0" />
                  <span className="text-[#444] font-medium">{label}</span>
                  <span className="text-[#aaa]">— {hint}</span>
                </div>
              ))}
            </div>
          )}

          {results.spots.length > 0 && (
            <div className="py-1">
              <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                Spots
              </p>
              {results.spots.map((spot) => {
                idx++;
                const i = idx;
                return (
                  <button
                    key={spot.id}
                    data-index={i}
                    onClick={() => navigate({ type: "spot", data: spot })}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={rowClass(i)}
                  >
                    <div className="w-12 h-7 rounded bg-[#EEEDEA] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {spot.muxPlaybackId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://image.mux.com/${spot.muxPlaybackId}/thumbnail.jpg?width=96&height=56&fit_mode=smartcrop`}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Film size={11} className="text-[#ccc]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[#111] truncate">
                        {spot.brand ? `${spot.brand} — ` : ""}
                        {spot.title}
                      </p>
                      <p className="text-[11px] text-[#999] truncate">
                        {spot.director.name}
                        {spot.year ? ` · ${spot.year}` : ""}
                      </p>
                    </div>
                    {!spot.isPublished && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 flex-shrink-0">
                        <EyeOff size={10} /> Hidden
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {results.directors.length > 0 && (
            <div className="py-1 border-t border-[#F2F1EC]">
              <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                Directors
              </p>
              {results.directors.map((d) => {
                idx++;
                const i = idx;
                return (
                  <button
                    key={d.id}
                    data-index={i}
                    onClick={() => navigate({ type: "director", data: d })}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={rowClass(i)}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#EEEDEA] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {d.headshotUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.headshotUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <Users size={11} className="text-[#ccc]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[#111] truncate">{d.name}</p>
                      <p className="text-[11px] text-[#999]">
                        {d._count.projects} spot{d._count.projects !== 1 ? "s" : ""}
                        {d.rosterStatus !== "ROSTER" ? " · off-roster" : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {results.reels.length > 0 && (
            <div className="py-1 border-t border-[#F2F1EC]">
              <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                Reels
              </p>
              {results.reels.map((r) => {
                idx++;
                const i = idx;
                return (
                  <button
                    key={r.id}
                    data-index={i}
                    onClick={() => navigate({ type: "reel", data: r })}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={rowClass(i)}
                  >
                    <Clapperboard size={14} className="text-[#999] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[#111] truncate">{r.title}</p>
                      <p className="text-[11px] text-[#999] truncate">
                        {r.director.name} · {r._count.items} spot{r._count.items !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {results.contacts.length > 0 && (
            <div className="py-1 border-t border-[#F2F1EC]">
              <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                Contacts
              </p>
              {results.contacts.map((c) => {
                idx++;
                const i = idx;
                return (
                  <button
                    key={c.id}
                    data-index={i}
                    onClick={() => navigate({ type: "contact", data: c })}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={rowClass(i)}
                  >
                    <AtSign size={14} className="text-[#999] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-[#111] truncate">{c.name}</p>
                      <p className="text-[11px] text-[#999] truncate">
                        {c.email}
                        {c.company ? ` · ${c.company.name}` : ""}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
