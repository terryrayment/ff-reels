"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, User, Building2, X } from "lucide-react";

interface ContactResult {
  id: string;
  name: string;
  email: string;
  role: string | null;
  company: { id: string; name: string } | null;
}

interface ContactAutocompleteProps {
  onSelect: (contact: ContactResult) => void;
  onClear: () => void;
  selectedContact: ContactResult | null;
  /** Prefill query text when opening in resend mode */
  initialQuery?: string;
}

export function ContactAutocomplete({
  onSelect,
  onClear,
  selectedContact,
  initialQuery = "",
}: ContactAutocompleteProps) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ContactResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Search contacts API
  const searchContacts = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/search?q=${encodeURIComponent(q.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setIsOpen(data.length > 0);
        setHighlightIdx(-1);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchContacts(value), 200);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIdx]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (contact: ContactResult) => {
    onSelect(contact);
    setQuery("");
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    onClear();
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // If a contact is selected, show the badge
  if (selectedContact) {
    return (
      <div className="space-y-1.5">
        <label className="block text-[12px] text-[#888] font-medium">
          Recipient
        </label>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white/80 border border-[#E8E7E3]/80 rounded-lg">
          <User size={12} className="text-[#bbb] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[13px] text-[#1A1A1A] font-medium">
              {selectedContact.name}
            </span>
            {selectedContact.company && (
              <span className="text-[11px] text-[#999] ml-1.5">
                {selectedContact.company.name}
              </span>
            )}
            <span className="text-[11px] text-[#bbb] ml-1.5">
              {selectedContact.email}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-0.5 text-[#ccc] hover:text-[#666] transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 relative">
      <label className="block text-[12px] text-[#888] font-medium">
        Recipient Name
      </label>
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ccc] pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search contacts or type a new name..."
          className="w-full pl-9 pr-3.5 py-2.5 bg-white/80 border border-[#E8E7E3]/80 rounded-lg text-[13px] text-[#1A1A1A] placeholder:text-[#ccc] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/8 focus:border-[#1A1A1A]/15 transition-all duration-200"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-[#ddd] border-t-[#999] rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-[#E8E7E3] shadow-lg overflow-hidden"
        >
          {results.map((contact, i) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => handleSelect(contact)}
              className={`w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-colors ${
                i === highlightIdx
                  ? "bg-[#F7F6F3]"
                  : "hover:bg-[#FAFAF8]"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-[#F0F0EC] flex items-center justify-center flex-shrink-0">
                <User size={12} className="text-[#999]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] text-[#1A1A1A] font-medium truncate">
                  {contact.name}
                </p>
                <p className="text-[10px] text-[#999] truncate">
                  {contact.email}
                  {contact.company && (
                    <span className="ml-1">
                      <Building2 size={8} className="inline mr-0.5 -mt-px" />
                      {contact.company.name}
                    </span>
                  )}
                </p>
              </div>
            </button>
          ))}
          <div className="px-3.5 py-2 bg-[#FAFAF8] border-t border-[#F0F0EC]">
            <p className="text-[10px] text-[#bbb]">
              Or continue typing to create a new contact
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
