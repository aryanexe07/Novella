"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Users, MapPin, Notebook } from "lucide-react";
import { globalSearch } from "@/lib/actions/searchActions";

interface BookSummary {
  id: string;
  title: string;
}

interface SearchBoxProps {
  isOpen: boolean;
  onClose: () => void;
  books: BookSummary[];
}

interface SearchResults {
  chapters: { id: string; title: string }[];
  characters: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  notes: { id: string; title: string }[];
}

export function SearchBox({ isOpen, onClose, books }: SearchBoxProps) {
  const router = useRouter();
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    chapters: [],
    characters: [],
    locations: [],
    notes: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Set default book selection to first book if available
  useEffect(() => {
    if (books.length > 0 && !selectedBookId) {
      setSelectedBookId(books[0].id);
    }
  }, [books, selectedBookId]);

  // Handle Ctrl+K shortcut to toggle open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setResults({ chapters: [], characters: [], locations: [], notes: [] });
    }
  }, [isOpen]);

  // Click outside listener to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Search logic (debounced)
  useEffect(() => {
    if (!selectedBookId || !query.trim()) {
      setResults({ chapters: [], characters: [], locations: [], notes: [] });
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await globalSearch(selectedBookId, query);
        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, selectedBookId]);

  if (!isOpen) return null;

  const handleNavigate = (tab: string, itemId?: string) => {
    onClose();
    if (itemId) {
      router.push(`/dashboard/books/${selectedBookId}?tab=${tab}&selectId=${itemId}`);
    } else {
      router.push(`/dashboard/books/${selectedBookId}?tab=${tab}`);
    }
  };

  const hasResults =
    results.chapters.length > 0 ||
    results.characters.length > 0 ||
    results.locations.length > 0 ||
    results.notes.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl bg-white border-4 border-black nb-shadow-lg flex flex-col rounded-none max-h-[85vh]"
      >
        {/* Top Header */}
        <div className="px-4 py-3 border-b-4 border-black flex items-center gap-3 bg-[var(--color-nb-yellow)]">
          <Search className="w-5 h-5 text-black shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search characters, chapters, locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none font-bold text-base text-black placeholder-neutral-600"
          />
          <button 
            onClick={onClose}
            className="p-1 border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-xs active:translate-y-0.5"
          >
            <X className="w-3.5 h-3.5 text-black" />
          </button>
        </div>

        {/* Filter and Book Selector */}
        <div className="px-3 py-2.5 border-b-2 border-black flex flex-wrap items-center justify-between gap-2 bg-neutral-50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-neutral-500">Search in:</span>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="border-2 border-black px-2 py-1 font-bold text-[10px] bg-white focus:bg-yellow-50 outline-none h-7"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[10px] font-bold text-neutral-400">Ctrl+K to toggle</span>
        </div>

        {/* Search Results list */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 max-h-[50vh]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="font-display font-black text-sm animate-pulse">Searching...</div>
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="text-center py-8">
              <p className="font-bold text-neutral-600 text-sm">Start typing to search this book...</p>
              <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
                <button onClick={() => handleNavigate("chapters")} className="nb-btn-xs bg-[var(--color-nb-pink)]">Chapters</button>
                <button onClick={() => handleNavigate("characters")} className="nb-btn-xs bg-[var(--color-nb-cyan)]">Characters</button>
                <button onClick={() => handleNavigate("locations")} className="nb-btn-xs bg-[var(--color-nb-green)]">Locations</button>
                <button onClick={() => handleNavigate("notes")} className="nb-btn-xs bg-[var(--color-nb-orange)]">Notes</button>
              </div>
            </div>
          )}

          {!loading && query.trim() && !hasResults && (
            <div className="text-center py-8">
              <p className="font-bold text-neutral-500">No matches found for &quot;{query}&quot;</p>
            </div>
          )}

          {!loading && query.trim() && hasResults && (
            <div className="flex flex-col gap-3">
              {/* Chapters */}
              {results.chapters.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1">
                    <FileText className="w-3 h-3 text-[var(--color-nb-pink)]" /> Chapters
                  </p>
                  <div className="flex flex-col gap-1">
                    {results.chapters.map((ch) => (
                      <button
                        key={ch.id}
                        onClick={() => handleNavigate("chapters", ch.id)}
                        className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-neutral-50 text-left font-bold text-xs w-full nb-shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <span>{ch.title}</span>
                        <span className="text-[9px] font-black text-neutral-400">Open in Editor</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Characters */}
              {results.characters.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3 text-[var(--color-nb-cyan)]" /> Characters
                  </p>
                  <div className="flex flex-col gap-1">
                    {results.characters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => handleNavigate("characters", char.id)}
                        className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-neutral-50 text-left font-bold text-xs w-full nb-shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <span>{char.name}</span>
                        <span className="text-[9px] font-black text-neutral-400">View Profile</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Locations */}
              {results.locations.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[var(--color-nb-green)]" /> Locations
                  </p>
                  <div className="flex flex-col gap-1">
                    {results.locations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => handleNavigate("locations", loc.id)}
                        className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-neutral-50 text-left font-bold text-xs w-full nb-shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <span>{loc.name}</span>
                        <span className="text-[9px] font-black text-neutral-400">View Details</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {results.notes.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1">
                    <Notebook className="w-3 h-3 text-[var(--color-nb-orange)]" /> Notes
                  </p>
                  <div className="flex flex-col gap-1">
                    {results.notes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => handleNavigate("notes", note.id)}
                        className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-neutral-50 text-left font-bold text-xs w-full nb-shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <span>{note.title}</span>
                        <span className="text-[9px] font-black text-neutral-400">View Note</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}