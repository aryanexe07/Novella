"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  FileText, 
  Users, 
  MapPin, 
  Notebook, 
  Calendar, 
  GitFork,
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Link as LinkIcon, 
  X,
  UserPlus
} from "lucide-react";
import { Editor } from "@/components/Editor";

// Server action imports
import { createChapter, deleteChapter, reorderChapters } from "@/lib/actions/chapterActions";
import { createCharacter, updateCharacter, deleteCharacter, createRelationship, deleteRelationship, getCharacterWithDetails } from "@/lib/actions/characterActions";
import { createLocation, updateLocation, deleteLocation, getLocationWithDetails } from "@/lib/actions/locationActions";
import { createNote, updateNote, deleteNote } from "@/lib/actions/noteActions";
import { createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from "@/lib/actions/timelineActions";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
  updatedAt: Date;
}

interface MentionWithChapter {
  id: string;
  chapter: {
    id: string;
    title: string;
  };
}

interface Character {
  id: string;
  name: string;
  description: string | null;
  aliases: string | null;
  age: string | null;
  notes: string | null;
}

interface Location {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
}

interface Relationship {
  id: string;
  characterAId: string;
  characterBId: string;
  relationshipType: string;
  characterA: { id: string; name: string };
  characterB: { id: string; name: string };
}

interface BookDetails {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: string;
  chapters: Chapter[];
  characters: Character[];
  locations: Location[];
  notes: Note[];
  events: TimelineEvent[];
  relationships: Relationship[];
}

interface BookWorkspaceProps {
  book: BookDetails;
}

export function BookWorkspace({ book: initialBook }: BookWorkspaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [book, setBook] = useState<BookDetails>(initialBook);
  const [activeTab, setActiveTab] = useState("chapters");
  
  // Chapter State
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [isChapterCreateOpen, setIsChapterCreateOpen] = useState(false);

  // Character State
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isCharCreateOpen, setIsCharCreateOpen] = useState(false);
  const [isCharDetailsOpen, setIsCharDetailsOpen] = useState(false);
  const [charForm, setCharForm] = useState({ name: "", description: "", aliases: "", age: "", notes: "" });
  const [charMentions, setCharMentions] = useState<MentionWithChapter[]>([]);

  // Relationship Form State
  const [relationForm, setRelationForm] = useState({ targetCharId: "", type: "" });

  // Location State
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLocCreateOpen, setIsLocCreateOpen] = useState(false);
  const [isLocDetailsOpen, setIsLocDetailsOpen] = useState(false);
  const [locForm, setLocForm] = useState({ name: "", description: "", notes: "" });
  const [locMentions, setLocMentions] = useState<MentionWithChapter[]>([]);

  // Note State
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNoteCreateOpen, setIsNoteCreateOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });

  // Timeline State
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isEventCreateOpen, setIsEventCreateOpen] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", description: "", eventDate: "" });

  // Loading States
  const [loading, setLoading] = useState(false);

  // Sync initialBook prop changes
  useEffect(() => {
    setBook(initialBook);
  }, [initialBook]);

  // Read URL search params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const selectIdParam = searchParams.get("selectId");

    if (tabParam) {
      setActiveTab(tabParam);
    }

    if (selectIdParam) {
      if (tabParam === "chapters") {
        setSelectedChapterId(selectIdParam);
      } else if (tabParam === "characters") {
        const char = book.characters.find(c => c.id === selectIdParam);
        if (char) {
          handleOpenCharacterDetails(char);
        }
      } else if (tabParam === "locations") {
        const loc = book.locations.find(l => l.id === selectIdParam);
        if (loc) {
          handleOpenLocationDetails(loc);
        }
      } else if (tabParam === "notes") {
        const note = book.notes.find(n => n.id === selectIdParam);
        if (note) {
          setSelectedNote(note);
          setNoteForm({ title: note.title, content: note.content });
          setIsNoteCreateOpen(true);
        }
      }
    } else {
      // Default to first chapter if on chapters tab and none selected
      if (tabParam === "chapters" || !tabParam) {
        if (book.chapters.length > 0 && !selectedChapterId) {
          setSelectedChapterId(book.chapters[0].id);
        }
      }
    }
  }, [searchParams, book, selectedChapterId]);

  // Set default selected chapter
  useEffect(() => {
    if (activeTab === "chapters" && book.chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(book.chapters[0].id);
    }
  }, [activeTab, book, selectedChapterId]);

  const activeChapter = useMemo(
    () => book.chapters.find(c => c.id === selectedChapterId),
    [book.chapters, selectedChapterId]
  );

  // ----------------------------------------------------
  // CHAPTER HANDLERS
  // ----------------------------------------------------
  const handleChapterCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle.trim()) return;
    setLoading(true);
    try {
      const ch = await createChapter(book.id, chapterTitle);
      setBook(prev => ({
        ...prev,
        chapters: [...prev.chapters, ch].sort((a, b) => a.order - b.order)
      }));
      setSelectedChapterId(ch.id);
      setIsChapterCreateOpen(false);
      setChapterTitle("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChapterDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    try {
      await deleteChapter(id);
      setBook(prev => ({
        ...prev,
        chapters: prev.chapters.filter(c => c.id !== id)
      }));
      if (selectedChapterId === id) {
        setSelectedChapterId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveChapter = async (index: number, direction: "up" | "down") => {
    const chaptersCopy = [...book.chapters];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chaptersCopy.length) return;

    // Swap
    const temp = chaptersCopy[index];
    chaptersCopy[index] = chaptersCopy[targetIndex];
    chaptersCopy[targetIndex] = temp;

    setBook(prev => ({
      ...prev,
      chapters: chaptersCopy
    }));

    try {
      await reorderChapters(book.id, chaptersCopy.map(c => c.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditorSaveSuccess = (wordCount: number) => {
    if (selectedChapterId) {
      setBook(prev => ({
        ...prev,
        chapters: prev.chapters.map(c => c.id === selectedChapterId ? { ...c, wordCount } : c)
      }));
    }
  };

  // ----------------------------------------------------
  // CHARACTER HANDLERS
  // ----------------------------------------------------
  const handleCharSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charForm.name.trim()) return;
    setLoading(true);

    try {
      if (selectedCharacter) {
        // Update
        const updated = await updateCharacter(selectedCharacter.id, charForm);
        setBook(prev => ({
          ...prev,
          characters: prev.characters.map(c => c.id === selectedCharacter.id ? updated : c)
        }));
        setSelectedCharacter(null);
      } else {
        // Create
        const created = await createCharacter({
          bookId: book.id,
          ...charForm
        });
        setBook(prev => ({
          ...prev,
          characters: [...prev.characters, created]
        }));
      }
      setIsCharCreateOpen(false);
      setCharForm({ name: "", description: "", aliases: "", age: "", notes: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCharDelete = async (id: string) => {
    if (!confirm("Delete this character? This will delete relationships too.")) return;
    try {
      await deleteCharacter(id);
      setBook(prev => ({
        ...prev,
        characters: prev.characters.filter(c => c.id !== id),
        relationships: prev.relationships.filter(r => r.characterAId !== id && r.characterBId !== id)
      }));
      setIsCharDetailsOpen(false);
      setSelectedCharacter(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCharacterDetails = async (char: Character) => {
    setSelectedCharacter(char);
    setIsCharDetailsOpen(true);
    setCharMentions([]);

    try {
      const data = await getCharacterWithDetails(char.id);
      if (data) {
        setCharMentions(data.mentions || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateRelationship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCharacter || !relationForm.targetCharId || !relationForm.type.trim()) return;

    try {
      const rel = await createRelationship({
        bookId: book.id,
        characterAId: selectedCharacter.id,
        characterBId: relationForm.targetCharId,
        relationshipType: relationForm.type
      });

      // Fetch character details again to update lists
      handleOpenCharacterDetails(selectedCharacter);
      
      // Update local workspace list
      const charB = book.characters.find(c => c.id === relationForm.targetCharId);
      setBook(prev => ({
        ...prev,
        relationships: [...prev.relationships, {
          ...rel,
          characterA: { id: selectedCharacter.id, name: selectedCharacter.name },
          characterB: { id: charB?.id || "", name: charB?.name || "" }
        }]
      }));

      setRelationForm({ targetCharId: "", type: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRelationDelete = async (relId: string) => {
    if (!confirm("Delete this relationship?")) return;
    try {
      await deleteRelationship(relId, book.id);
      if (selectedCharacter) {
        handleOpenCharacterDetails(selectedCharacter);
      }
      setBook(prev => ({
        ...prev,
        relationships: prev.relationships.filter(r => r.id !== relId)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // LOCATION HANDLERS
  // ----------------------------------------------------
  const handleLocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locForm.name.trim()) return;
    setLoading(true);

    try {
      if (selectedLocation) {
        // Update
        const updated = await updateLocation(selectedLocation.id, locForm);
        setBook(prev => ({
          ...prev,
          locations: prev.locations.map(l => l.id === selectedLocation.id ? updated : l)
        }));
        setSelectedLocation(null);
      } else {
        // Create
        const created = await createLocation({
          bookId: book.id,
          ...locForm
        });
        setBook(prev => ({
          ...prev,
          locations: [...prev.locations, created]
        }));
      }
      setIsLocCreateOpen(false);
      setLocForm({ name: "", description: "", notes: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    try {
      await deleteLocation(id);
      setBook(prev => ({
        ...prev,
        locations: prev.locations.filter(l => l.id !== id)
      }));
      setIsLocDetailsOpen(false);
      setSelectedLocation(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenLocationDetails = async (loc: Location) => {
    setSelectedLocation(loc);
    setIsLocDetailsOpen(true);
    setLocMentions([]);

    try {
      const data = await getLocationWithDetails(loc.id);
      if (data) {
        setLocMentions(data.mentions || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ----------------------------------------------------
  // NOTE HANDLERS
  // ----------------------------------------------------
  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title.trim()) return;
    setLoading(true);

    try {
      if (selectedNote) {
        const updated = await updateNote(selectedNote.id, noteForm);
        setBook(prev => ({
          ...prev,
          notes: prev.notes.map(n => n.id === selectedNote.id ? updated : n)
        }));
      } else {
        const created = await createNote({
          bookId: book.id,
          ...noteForm
        });
        setBook(prev => ({
          ...prev,
          notes: [created, ...prev.notes]
        }));
      }
      setIsNoteCreateOpen(false);
      setNoteForm({ title: "", content: "" });
      setSelectedNote(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteDelete = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      setBook(prev => ({
        ...prev,
        notes: prev.notes.filter(n => n.id !== id)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ----------------------------------------------------
  // TIMELINE EVENT HANDLERS
  // ----------------------------------------------------
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.eventDate.trim()) return;
    setLoading(true);

    try {
      if (selectedEvent) {
        const updated = await updateTimelineEvent(selectedEvent.id, eventForm);
        setBook(prev => ({
          ...prev,
          events: prev.events.map(ev => ev.id === selectedEvent.id ? updated : ev)
        }));
      } else {
        const created = await createTimelineEvent({
          bookId: book.id,
          ...eventForm
        });
        setBook(prev => ({
          ...prev,
          events: [...prev.events, created]
        }));
      }
      setIsEventCreateOpen(false);
      setEventForm({ title: "", description: "", eventDate: "" });
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventDelete = async (id: string) => {
    if (!confirm("Delete this timeline event?")) return;
    try {
      await deleteTimelineEvent(id);
      setBook(prev => ({
        ...prev,
        events: prev.events.filter(ev => ev.id !== id)
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Tabs layout map
  const tabs = [
    { id: "chapters", name: "Chapters", icon: FileText, color: "bg-nb-pink" },
    { id: "characters", name: "Characters", icon: Users, color: "bg-nb-cyan" },
    { id: "locations", name: "Locations", icon: MapPin, color: "bg-nb-green" },
    { id: "notes", name: "Notes", icon: Notebook, color: "bg-nb-orange" },
    { id: "timeline", name: "Timeline", icon: Calendar, color: "bg-nb-yellow" },
    { id: "relationships", name: "Relationships", icon: GitFork, color: "bg-nb-purple" },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Title & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-black pb-3 gap-3">
        <div>
          <span className="text-[10px] font-black uppercase bg-white border-2 border-black px-2 py-0.5 nb-shadow-xs">
            Manuscript
          </span>
          <h2 className="text-2xl font-black font-display tracking-tight uppercase mt-2">{book.title}</h2>
          {book.description && (
            <p className="text-xs font-bold text-neutral-500 mt-1 line-clamp-1">{book.description}</p>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="w-full flex flex-wrap gap-2 border-b-2 border-black pb-2 select-none">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                if (t.id !== "chapters") setSelectedChapterId(null);
              }}
              className={`
                flex min-w-0 basis-0 flex-1 items-center justify-center gap-2 px-3 py-1.5 font-display font-black text-xs border-2 border-black transition-all rounded-none h-8
                ${isActive 
                  ? `${t.color} text-black translate-x-0.5 translate-y-0.5 nb-shadow-xs` 
                  : "bg-white hover:bg-neutral-50 nb-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:nb-shadow-xs"
                }
              `}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate block min-w-0">{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Workspace Panel */}
      <div className="flex-1 min-h-[500px]">
        
        {/* ==================================================== */}
        {/* CHAPTERS TAB */}
        {/* ==================================================== */}
        {activeTab === "chapters" && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-full items-stretch">
            {/* Chapters Navigator */}
            <div className="flex flex-col gap-3">
              <div className="nb-card bg-neutral-50 flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <h3 className="font-display font-black text-sm uppercase tracking-tight">Chapters</h3>
                  <button 
                    onClick={() => setIsChapterCreateOpen(true)}
                    className="p-1 border-2 border-black bg-[var(--color-nb-green)] hover:bg-green-400 active:translate-y-0.5 transition-all nb-shadow-xs"
                    title="Create Chapter"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[400px]">
                  {book.chapters.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-bold text-center py-8">No chapters created yet.</p>
                  ) : (
                    book.chapters.map((ch, idx) => {
                      const isSelected = ch.id === selectedChapterId;
                      return (
                        <div 
                          key={ch.id}
                          className={`
                            flex items-start gap-1.5 p-2 border-2 border-black transition-all
                            ${isSelected 
                              ? "bg-[var(--color-nb-pink)] text-black nb-shadow-xs" 
                              : "bg-white hover:bg-neutral-50"
                            }
                          `}
                        >
                          <button
                            onClick={() => setSelectedChapterId(ch.id)}
                            className="flex-1 text-left truncate font-display font-bold text-xs outline-none min-w-0"
                          >
                            <span className="text-[9px] font-black bg-black text-white px-1 py-0.5 mr-1.5 font-mono leading-none align-middle">
                              Ch{idx + 1}
                            </span>
                            <span className="align-middle">{ch.title}</span>
                            <span className="block text-[10px] text-neutral-500 mt-0.5 font-sans font-medium">
                              {ch.wordCount.toLocaleString()} words
                            </span>
                          </button>

                          <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                            <button 
                              onClick={() => handleMoveChapter(idx, "up")}
                              disabled={idx === 0}
                              className="p-0.5 border border-black bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white"
                            >
                              <ArrowUp className="w-2.5 h-2.5" />
                            </button>
                            <button 
                              onClick={() => handleMoveChapter(idx, "down")}
                              disabled={idx === book.chapters.length - 1}
                              className="p-0.5 border border-black bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white"
                            >
                              <ArrowDown className="w-2.5 h-2.5" />
                            </button>
                            <button 
                              onClick={() => handleChapterDelete(ch.id)}
                              className="p-0.5 border border-black bg-red-50 hover:bg-red-200"
                            >
                              <Trash2 className="w-2.5 h-2.5 text-red-600" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Chapter Editor Space */}
            <div className="min-w-0">
              {activeChapter ? (
                <Editor 
                  key={activeChapter.id}
                  chapterId={activeChapter.id}
                  initialTitle={activeChapter.title}
                  initialContent={activeChapter.content}
                  onSaveSuccess={handleEditorSaveSuccess}
                />
              ) : (
                <div className="nb-card bg-white py-16 text-center flex flex-col items-center justify-center gap-3">
                  <FileText className="w-10 h-10 text-neutral-400 stroke-1" />
                  <div>
                    <h3 className="font-display font-black text-lg uppercase">No chapter selected</h3>
                    <p className="text-sm text-neutral-500 mt-1">Select or create a chapter to begin drafting.</p>
                  </div>
                  <button 
                    onClick={() => setIsChapterCreateOpen(true)}
                    className="nb-btn-primary text-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Chapter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* CHARACTERS TAB */}
        {/* ==================================================== */}
        {activeTab === "characters" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg uppercase">Characters</h3>
              <button 
                onClick={() => {
                  setCharForm({ name: "", description: "", aliases: "", age: "", notes: "" });
                  setSelectedCharacter(null);
                  setIsCharCreateOpen(true);
                }}
                className="nb-btn-sm nb-btn-primary"
              >
                <Plus className="w-3.5 h-3.5" /> Add Character
              </button>
            </div>

            {book.characters.length === 0 ? (
              <div className="nb-card bg-white py-10 text-center flex flex-col items-center justify-center gap-3">
                <Users className="w-8 h-8 text-neutral-400" />
                <p className="font-bold text-neutral-600 text-sm">No characters registered yet.</p>
                <button onClick={() => setIsCharCreateOpen(true)} className="nb-btn-sm bg-[var(--color-nb-cyan)]">+ Register Character</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {book.characters.map((char) => (
                  <div key={char.id} className="nb-card bg-white flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all p-4">
                    <div>
                      <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-2">
                        <h4 className="font-display font-black text-base truncate uppercase">{char.name}</h4>
                        {char.age && (
                          <span className="text-[9px] font-black bg-neutral-100 border border-black px-1.5 py-0.5 shrink-0 ml-2">
                            {char.age}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 font-medium line-clamp-3 min-h-[2.5rem]">
                        {char.description || ""}
                      </p>
                      {char.aliases && (
                        <div className="mt-2 flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] font-black uppercase text-neutral-400 mr-0.5">aka:</span>
                          {char.aliases.split(",").map((al, i) => (
                            <span key={i} className="text-[9px] bg-neutral-100 text-neutral-700 px-1 py-0.5 border border-black font-bold">
                              {al.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-black">
                      <button 
                        onClick={() => handleOpenCharacterDetails(char)}
                        className="nb-btn-sm nb-btn-info flex-1"
                      >
                        Profile
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedCharacter(char);
                          setCharForm({
                            name: char.name,
                            description: char.description || "",
                            aliases: char.aliases || "",
                            age: char.age || "",
                            notes: char.notes || ""
                          });
                          setIsCharCreateOpen(true);
                        }}
                        className="p-1.5 border-2 border-black bg-white hover:bg-neutral-50 active:translate-y-0.5 nb-shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-black" />
                      </button>
                      <button 
                        onClick={() => handleCharDelete(char.id)}
                        className="p-1.5 border-2 border-black bg-red-50 hover:bg-red-200 active:translate-y-0.5 nb-shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* LOCATIONS TAB */}
        {/* ==================================================== */}
        {activeTab === "locations" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg uppercase">Locations</h3>
              <button 
                onClick={() => {
                  setLocForm({ name: "", description: "", notes: "" });
                  setSelectedLocation(null);
                  setIsLocCreateOpen(true);
                }}
                className="nb-btn-sm nb-btn-primary"
              >
                <Plus className="w-3.5 h-3.5" /> Add Location
              </button>
            </div>

            {book.locations.length === 0 ? (
              <div className="nb-card bg-white py-10 text-center flex flex-col items-center justify-center gap-3">
                <MapPin className="w-8 h-8 text-neutral-400" />
                <p className="font-bold text-neutral-600 text-sm">No locations registered yet.</p>
                <button onClick={() => setIsLocCreateOpen(true)} className="nb-btn-sm bg-[var(--color-nb-green)]">+ Register Location</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {book.locations.map((loc) => (
                  <div key={loc.id} className="nb-card bg-white flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all p-4">
                    <div>
                      <h4 className="font-display font-black text-base border-b-2 border-black pb-2 mb-2 uppercase truncate">{loc.name}</h4>
                      <p className="text-xs text-neutral-600 font-medium line-clamp-3 min-h-[2.5rem]">
                        {loc.description || ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-black">
                      <button 
                        onClick={() => handleOpenLocationDetails(loc)}
                        className="nb-btn-sm nb-btn-info flex-1"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedLocation(loc);
                          setLocForm({
                            name: loc.name,
                            description: loc.description || "",
                            notes: loc.notes || ""
                          });
                          setIsLocCreateOpen(true);
                        }}
                        className="p-1.5 border-2 border-black bg-white hover:bg-neutral-50 active:translate-y-0.5 nb-shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-black" />
                      </button>
                      <button 
                        onClick={() => handleLocDelete(loc.id)}
                        className="p-1.5 border-2 border-black bg-red-50 hover:bg-red-200 active:translate-y-0.5 nb-shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* NOTES TAB */}
        {/* ==================================================== */}
        {activeTab === "notes" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg uppercase">Planning Notes</h3>
              <button 
                onClick={() => {
                  setNoteForm({ title: "", content: "" });
                  setSelectedNote(null);
                  setIsNoteCreateOpen(true);
                }}
                className="nb-btn-sm nb-btn-primary"
              >
                <Plus className="w-3.5 h-3.5" /> Add Note
              </button>
            </div>

            {book.notes.length === 0 ? (
              <div className="nb-card bg-white py-10 text-center flex flex-col items-center justify-center gap-3">
                <Notebook className="w-8 h-8 text-neutral-400" />
                <p className="font-bold text-neutral-600 text-sm">No planning notes created yet.</p>
                <button onClick={() => setIsNoteCreateOpen(true)} className="nb-btn-sm bg-[var(--color-nb-orange)]">+ Create Note</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {book.notes.map((note) => (
                  <div key={note.id} className="nb-card bg-white flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all border-t-[6px] border-t-[var(--color-nb-orange)] p-4">
                    <div>
                      <h4 className="font-display font-black text-base border-b-2 border-black pb-2 mb-2 uppercase truncate">{note.title}</h4>
                      <p className="text-xs text-neutral-700 whitespace-pre-wrap line-clamp-5 min-h-[4rem]">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t-2 border-black">
                      <button 
                        onClick={() => {
                          setSelectedNote(note);
                          setNoteForm({ title: note.title, content: note.content });
                          setIsNoteCreateOpen(true);
                        }}
                        className="nb-btn-sm nb-btn-info flex-1"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleNoteDelete(note.id)}
                        className="p-1.5 border-2 border-black bg-red-50 hover:bg-red-200 active:translate-y-0.5 nb-shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TIMELINE TAB */}
        {/* ==================================================== */}
        {activeTab === "timeline" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg uppercase">Story Timeline</h3>
              <button 
                onClick={() => {
                  setEventForm({ title: "", description: "", eventDate: "" });
                  setSelectedEvent(null);
                  setIsEventCreateOpen(true);
                }}
                className="nb-btn-sm nb-btn-primary"
              >
                <Plus className="w-3.5 h-3.5" /> Add Event
              </button>
            </div>

            {book.events.length === 0 ? (
              <div className="nb-card bg-white py-10 text-center flex flex-col items-center justify-center gap-3">
                <Calendar className="w-8 h-8 text-neutral-400" />
                <p className="font-bold text-neutral-600 text-sm">No events defined in the timeline yet.</p>
                <button onClick={() => setIsEventCreateOpen(true)} className="nb-btn-sm bg-[var(--color-nb-yellow)]">+ Add Event</button>
              </div>
            ) : (
              <div className="relative border-l-4 border-black ml-3 md:ml-6 flex flex-col gap-6 py-3">
                {book.events.map((ev) => (
                  <div key={ev.id} className="relative pl-6 md:pl-8">
                    {/* Timeline Node */}
                    <div className="absolute -left-[14px] top-1 w-5 h-5 bg-[var(--color-nb-yellow)] border-4 border-black nb-shadow-xs" />

                    {/* Timeline Event Card */}
                    <div className="nb-card bg-white max-w-2xl hover:-translate-y-0.5 hover:shadow-lg transition-all p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-black uppercase bg-black text-white px-1.5 py-0.5 leading-none inline-block">
                            {ev.eventDate}
                          </span>
                          <h4 className="font-display font-black text-base uppercase mt-1">{ev.title}</h4>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            onClick={() => {
                              setSelectedEvent(ev);
                              setEventForm({
                                title: ev.title,
                                description: ev.description || "",
                                eventDate: ev.eventDate
                              });
                              setIsEventCreateOpen(true);
                            }}
                            className="p-1 border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-xs active:translate-y-0.5"
                          >
                            <Edit3 className="w-3 h-3 text-black" />
                          </button>
                          <button 
                            onClick={() => handleEventDelete(ev.id)}
                            className="p-1 border-2 border-black bg-red-50 hover:bg-red-200 nb-shadow-xs active:translate-y-0.5"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                      {ev.description && (
                        <p className="text-xs text-neutral-700 whitespace-pre-wrap font-medium mt-2">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* RELATIONSHIPS TAB */}
        {/* ==================================================== */}
        {activeTab === "relationships" && (
          <div className="flex flex-col gap-4">
            <div className="border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-lg uppercase">Character Connections</h3>
              <p className="text-[11px] text-neutral-500 font-bold mt-0.5">
                Relationships between characters in the story.
              </p>
            </div>

            {book.relationships.length === 0 ? (
              <div className="nb-card bg-white py-10 text-center flex flex-col items-center justify-center gap-2">
                <GitFork className="w-8 h-8 text-neutral-400" />
                <p className="font-bold text-neutral-500 text-sm">No relationships mapped yet.</p>
                <p className="text-xs text-neutral-400">Open a Character profile to define a connection!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {book.relationships.map((rel) => (
                  <div key={rel.id} className="nb-card bg-white flex items-center justify-between p-4 border-t-[6px] border-t-[var(--color-nb-purple)] hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2 font-display font-black text-sm uppercase truncate">
                        <span className="truncate">{rel.characterA.name}</span>
                        <span className="text-neutral-400 text-xs shrink-0">↔</span>
                        <span className="truncate">{rel.characterB.name}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase text-[var(--color-nb-purple)] border border-black/30 px-1.5 py-0.5 mt-1.5 inline-block">
                        {rel.relationshipType}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleRelationDelete(rel.id)}
                      className="p-1.5 border-2 border-black bg-red-50 hover:bg-red-200 active:translate-y-0.5 shrink-0 nb-shadow-xs"
                      title="Delete Relationship"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==================================================== */}
      {/* DIALOG MODALS */}
      {/* ==================================================== */}

      {/* Create Chapter Modal */}
      {isChapterCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border-4 border-black nb-shadow-lg p-5 relative rounded-none">
            <button 
              onClick={() => setIsChapterCreateOpen(false)}
              className="absolute top-3 right-3 p-1 border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-xs active:translate-y-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <h3 className="font-display font-black text-lg uppercase border-b-2 border-black pb-2 mb-3">Create Chapter</h3>
            <form onSubmit={handleChapterCreate} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Chapter Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: The Encounter"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="nb-input-sm text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button type="button" onClick={() => setIsChapterCreateOpen(false)} className="nb-btn-sm bg-white">Cancel</button>
                <button type="submit" disabled={loading} className="nb-btn-sm nb-btn-success">{loading ? "Creating..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Character Modal */}
      {isCharCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg p-5 relative rounded-none max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsCharCreateOpen(false)}
              className="absolute top-3 right-3 p-1 border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-xs active:translate-y-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <h3 className="font-display font-black text-lg uppercase border-b-2 border-black pb-2 mb-3">
              {selectedCharacter ? "Edit Character" : "Add Character"}
            </h3>
            <form onSubmit={handleCharSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={charForm.name}
                  onChange={(e) => setCharForm({ ...charForm, name: e.target.value })}
                  className="nb-input-sm text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-neutral-500">Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 24"
                    value={charForm.age}
                    onChange={(e) => setCharForm({ ...charForm, age: e.target.value })}
                    className="nb-input-sm text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-neutral-500">Aliases</label>
                  <input
                    type="text"
                    placeholder="e.g. The Falcon, Elena"
                    value={charForm.aliases}
                    onChange={(e) => setCharForm({ ...charForm, aliases: e.target.value })}
                    className="nb-input-sm text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Description</label>
                <textarea
                  placeholder="Short summary of this character's description..."
                  value={charForm.description}
                  onChange={(e) => setCharForm({ ...charForm, description: e.target.value })}
                  rows={2}
                  className="nb-input-sm text-sm resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Private Notes</label>
                <textarea
                  placeholder="Secret character development details, backstories..."
                  value={charForm.notes}
                  onChange={(e) => setCharForm({ ...charForm, notes: e.target.value })}
                  rows={3}
                  className="nb-input-sm text-sm resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button type="button" onClick={() => setIsCharCreateOpen(false)} className="nb-btn-sm bg-white">Cancel</button>
                <button type="submit" disabled={loading} className="nb-btn-sm nb-btn-success">
                  {loading ? "Saving..." : selectedCharacter ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Character Profile details drawer */}
      {isCharDetailsOpen && selectedCharacter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="w-full max-w-lg bg-white border-l-4 border-black h-full flex flex-col overflow-y-auto rounded-none relative">
            <div className="flex-1 flex flex-col gap-4 p-5">
              <button 
                onClick={() => setIsCharDetailsOpen(false)}
                className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-xs active:translate-y-0.5 z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Profile Title Banner */}
              <div className="border-b-4 border-black pb-3 pr-10">
                <span className="text-[9px] font-black uppercase bg-[var(--color-nb-cyan)] border border-black px-1.5 py-0.5 leading-none inline-block">
                  Character Profile
                </span>
                <h3 className="font-display font-black text-xl uppercase mt-2">{selectedCharacter.name}</h3>
                {selectedCharacter.age && (
                  <p className="text-[10px] font-black text-neutral-500 mt-0.5">Age: {selectedCharacter.age}</p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase text-neutral-400">Description</p>
                <p className="text-sm font-bold text-neutral-800 bg-neutral-50 border-2 border-black p-3 whitespace-pre-wrap">
                  {selectedCharacter.description || "No description written yet."}
                </p>
              </div>

              {/* Private Notes */}
              {selectedCharacter.notes && (
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black uppercase text-neutral-400">Notes & Backstory</p>
                  <p className="text-xs font-medium text-neutral-700 bg-neutral-100 border-2 border-black p-3 whitespace-pre-wrap">
                    {selectedCharacter.notes}
                  </p>
                </div>
              )}

              {/* Mention backlinks */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> Mention Backlinks
                </p>
                <div className="flex flex-col gap-1.5">
                  {charMentions.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-bold border-2 border-dashed border-neutral-300 p-3 text-center">
                      Not mentioned in any chapters yet.
                    </p>
                  ) : (
                    charMentions.map((men: MentionWithChapter) => (
                      <button
                        key={men.id}
                        onClick={() => {
                          setIsCharDetailsOpen(false);
                          setActiveTab("chapters");
                          setSelectedChapterId(men.chapter.id);
                        }}
                        className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-neutral-50 text-left font-bold text-xs nb-shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-y-0.5"
                      >
                        <span className="truncate">{men.chapter.title}</span>
                        <span className="text-[9px] bg-[var(--color-nb-pink)] border border-black px-1.5 py-0.5 shrink-0">Open Editor</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Relationships Builder inside Drawer */}
              <div className="flex flex-col gap-2 border-t-2 border-black pt-3">
                <p className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                  <GitFork className="w-3 h-3" /> Character Relationships
                </p>
                
                {/* Form to add */}
                <form onSubmit={handleCreateRelationship} className="flex gap-1.5 items-center">
                  <select
                    value={relationForm.targetCharId}
                    onChange={(e) => setRelationForm({ ...relationForm, targetCharId: e.target.value })}
                    className="border-2 border-black px-2 py-1 text-xs font-bold bg-white focus:bg-yellow-50 outline-none flex-1 h-8"
                    required
                  >
                    <option value="">Select Character...</option>
                    {book.characters
                      .filter(c => c.id !== selectedCharacter.id)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    }
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. Friend, Rival"
                    value={relationForm.type}
                    onChange={(e) => setRelationForm({ ...relationForm, type: e.target.value })}
                    className="border-2 border-black px-2 py-1 bg-white focus:bg-yellow-50 outline-none text-xs font-bold w-24 h-8"
                    required
                  />
                  <button type="submit" className="p-1 border-2 border-black bg-[var(--color-nb-green)] shrink-0 nb-shadow-xs active:translate-y-0.5 h-8 w-8 flex items-center justify-center">
                    <UserPlus className="w-3.5 h-3.5 text-black" />
                  </button>
                </form>

                {/* List of relationships for this character */}
                <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
                  {book.relationships
                    .filter(r => r.characterAId === selectedCharacter.id || r.characterBId === selectedCharacter.id)
                    .map(r => {
                      const isCharA = r.characterAId === selectedCharacter.id;
                      const partnerName = isCharA ? r.characterB.name : r.characterA.name;
                      return (
                        <div key={r.id} className="flex items-center justify-between p-1.5 border-2 border-black bg-neutral-50 text-[10px] font-bold">
                          <span>{partnerName} — <span className="text-[var(--color-nb-pink)]">{r.relationshipType}</span></span>
                          <button onClick={() => handleRelationDelete(r.id)} className="p-0.5 border border-black bg-white hover:bg-red-50">
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t-4 border-black px-5 py-3 bg-white sticky bottom-0">
              <button 
                onClick={() => {
                  setCharForm({
                    name: selectedCharacter.name,
                    description: selectedCharacter.description || "",
                    aliases: selectedCharacter.aliases || "",
                    age: selectedCharacter.age || "",
                    notes: selectedCharacter.notes || ""
                  });
                  setIsCharDetailsOpen(false);
                  setIsCharCreateOpen(true);
                }}
                className="nb-btn-sm nb-btn-info"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => handleCharDelete(selectedCharacter.id)}
                className="nb-btn-sm nb-btn-danger"
              >
                Delete Character
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Location Modal */}
      {isLocCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg p-5 relative rounded-none max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsLocCreateOpen(false)}
              className="absolute top-3 right-3 p-1 border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-xs active:translate-y-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <h3 className="font-display font-black text-lg uppercase border-b-2 border-black pb-2 mb-3">
              {selectedLocation ? "Edit Location" : "Add Location"}
            </h3>
            <form onSubmit={handleLocSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Northern Keep"
                  value={locForm.name}
                  onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                  className="nb-input-sm text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Description</label>
                <textarea
                  placeholder="Describe what this location looks and feels like..."
                  value={locForm.description}
                  onChange={(e) => setLocForm({ ...locForm, description: e.target.value })}
                  rows={2}
                  className="nb-input-sm text-sm resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Worldbuilding Notes</label>
                <textarea
                  placeholder="History, features, secrets of this location..."
                  value={locForm.notes}
                  onChange={(e) => setLocForm({ ...locForm, notes: e.target.value })}
                  rows={2}
                  className="nb-input-sm text-sm resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button type="button" onClick={() => setIsLocCreateOpen(false)} className="nb-btn-sm bg-white">Cancel</button>
                <button type="submit" disabled={loading} className="nb-btn-sm nb-btn-success">
                  {loading ? "Saving..." : selectedLocation ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Details drawer */}
      {isLocDetailsOpen && selectedLocation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="w-full max-w-lg bg-white border-l-4 border-black h-full flex flex-col overflow-y-auto rounded-none relative">
            <div className="flex-1 flex flex-col gap-4 p-5">
              <button 
                onClick={() => setIsLocDetailsOpen(false)}
                className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-xs active:translate-y-0.5 z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Profile Title Banner */}
              <div className="border-b-4 border-black pb-3 pr-10">
                <span className="text-[9px] font-black uppercase bg-[var(--color-nb-green)] border border-black px-1.5 py-0.5 leading-none inline-block">
                  Location File
                </span>
                <h3 className="font-display font-black text-xl uppercase mt-2">{selectedLocation.name}</h3>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase text-neutral-400">Description</p>
                <p className="text-sm font-bold text-neutral-800 bg-neutral-50 border-2 border-black p-3 whitespace-pre-wrap">
                  {selectedLocation.description || "No description written yet."}
                </p>
              </div>

              {/* Notes */}
              {selectedLocation.notes && (
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black uppercase text-neutral-400">Worldbuilding Notes</p>
                  <p className="text-xs font-medium text-neutral-700 bg-neutral-100 border-2 border-black p-3 whitespace-pre-wrap">
                    {selectedLocation.notes}
                  </p>
                </div>
              )}

              {/* Mention backlinks */}
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" /> Mention Backlinks
                </p>
                <div className="flex flex-col gap-1.5">
                  {locMentions.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-bold border-2 border-dashed border-neutral-300 p-3 text-center">
                      Not mentioned in any chapters yet.
                    </p>
                  ) : (
                    locMentions.map((men: MentionWithChapter) => (
                      <button
                        key={men.id}
                        onClick={() => {
                          setIsLocDetailsOpen(false);
                          setActiveTab("chapters");
                          setSelectedChapterId(men.chapter.id);
                        }}
                        className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-neutral-50 text-left font-bold text-xs nb-shadow-xs hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-y-0.5"
                      >
                        <span className="truncate">{men.chapter.title}</span>
                        <span className="text-[9px] bg-[var(--color-nb-pink)] border border-black px-1.5 py-0.5 shrink-0">Open Editor</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t-4 border-black px-5 py-3 bg-white sticky bottom-0">
              <button 
                onClick={() => {
                  setLocForm({
                    name: selectedLocation.name,
                    description: selectedLocation.description || "",
                    notes: selectedLocation.notes || ""
                  });
                  setIsLocDetailsOpen(false);
                  setIsLocCreateOpen(true);
                }}
                className="nb-btn-sm nb-btn-info"
              >
                Edit Location
              </button>
              <button 
                onClick={() => handleLocDelete(selectedLocation.id)}
                className="nb-btn-sm nb-btn-danger"
              >
                Delete Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Note Modal */}
      {isNoteCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg p-5 relative rounded-none">
            <button 
              onClick={() => {
                setIsNoteCreateOpen(false);
                setSelectedNote(null);
              }}
              className="absolute top-3 right-3 p-1 border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-xs active:translate-y-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <h3 className="font-display font-black text-lg uppercase border-b-2 border-black pb-2 mb-3">
              {selectedNote ? "Edit Note" : "Add Note"}
            </h3>
            <form onSubmit={handleNoteSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot Twist Idea"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="nb-input-sm text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Note Content</label>
                <textarea
                  placeholder="Write details of your note..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  rows={4}
                  required
                  className="nb-input-sm text-sm resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsNoteCreateOpen(false);
                    setSelectedNote(null);
                  }} 
                  className="nb-btn-sm bg-white"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="nb-btn-sm nb-btn-success">
                  {loading ? "Saving..." : selectedNote ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Timeline Event Modal */}
      {isEventCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg p-5 relative rounded-none">
            <button 
              onClick={() => {
                setIsEventCreateOpen(false);
                setSelectedEvent(null);
              }}
              className="absolute top-3 right-3 p-1 border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-xs active:translate-y-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <h3 className="font-display font-black text-lg uppercase border-b-2 border-black pb-2 mb-3">
              {selectedEvent ? "Edit Event" : "Add Event"}
            </h3>
            <form onSubmit={handleEventSubmit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Battle of the Golden Sun"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="nb-input-sm text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Date / Era</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Year 412 or Era of Magic"
                  value={eventForm.eventDate}
                  onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                  className="nb-input-sm text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-neutral-500">Description</label>
                <textarea
                  placeholder="Detail what happens during this event..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={2}
                  className="nb-input-sm text-sm resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end mt-1">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEventCreateOpen(false);
                    setSelectedEvent(null);
                  }} 
                  className="nb-btn-sm bg-white"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="nb-btn-sm nb-btn-success">
                  {loading ? "Saving..." : selectedEvent ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
