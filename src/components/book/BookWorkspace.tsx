"use client";

import React, { useState, useEffect } from "react";
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
  BookOpen,
  CalendarDays,
  UserPlus
} from "lucide-react";
import { Editor } from "@/components/Editor";

// Server action imports
import { createChapter, deleteChapter, reorderChapters, updateChapter } from "@/lib/actions/chapterActions";
import { createCharacter, updateCharacter, deleteCharacter, createRelationship, deleteRelationship } from "@/lib/actions/characterActions";
import { createLocation, updateLocation, deleteLocation } from "@/lib/actions/locationActions";
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
  const [charMentions, setCharMentions] = useState<any[]>([]);

  // Relationship Form State
  const [relationForm, setRelationForm] = useState({ targetCharId: "", type: "" });

  // Location State
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLocCreateOpen, setIsLocCreateOpen] = useState(false);
  const [isLocDetailsOpen, setIsLocDetailsOpen] = useState(false);
  const [locForm, setLocForm] = useState({ name: "", description: "", notes: "" });
  const [locMentions, setLocMentions] = useState<any[]>([]);

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
  }, [searchParams, book]);

  // Set default selected chapter
  useEffect(() => {
    if (activeTab === "chapters" && book.chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(book.chapters[0].id);
    }
  }, [activeTab, book, selectedChapterId]);

  const activeChapter = book.chapters.find(c => c.id === selectedChapterId);

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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCharacterDetails = async (char: Character) => {
    setSelectedCharacter(char);
    setIsCharDetailsOpen(true);
    setCharMentions([]);

    // Fetch mentions/backlinks asynchronously via dynamic load helper or actions
    try {
      const { getCharacterWithDetails } = await import("@/lib/actions/characterActions");
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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenLocationDetails = async (loc: Location) => {
    setSelectedLocation(loc);
    setIsLocDetailsOpen(true);
    setLocMentions([]);

    try {
      const { getLocationWithDetails } = await import("@/lib/actions/locationActions");
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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
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
      router.refresh();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-black pb-4 gap-4">
        <div>
          <span className="text-xs font-black uppercase bg-white border-2 border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            Manuscript workspace
          </span>
          <h2 className="text-3xl font-black font-display tracking-tight uppercase mt-2">{book.title}</h2>
          <p className="text-xs font-bold text-neutral-600 mt-1 line-clamp-1">{book.description}</p>
        </div>
      </div>

      {/* Tabs list (Neo-Brutalist Tabs) */}
      <div className="flex flex-wrap gap-2.5 border-b-2 border-black pb-3 overflow-x-auto select-none">
        {tabs.map(t => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                // Clear selected item on tab change
                if (t.id !== "chapters") setSelectedChapterId(null);
              }}
              className={`
                flex items-center gap-2 px-4 py-2 font-display font-black text-sm border-2 border-black transition-all rounded-none
                ${isActive 
                  ? `${t.color} text-black translate-x-0.5 translate-y-0.5 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]` 
                  : "bg-white hover:bg-neutral-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{t.name}</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full items-stretch">
            {/* Chapters Navigator */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <div className="nb-card bg-neutral-50 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                  <h3 className="font-display font-black text-base uppercase">Chapters</h3>
                  <button 
                    onClick={() => setIsChapterCreateOpen(true)}
                    className="p-1 border-2 border-black bg-nb-green hover:bg-green-400 active:translate-y-0.5 transition-all shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
                  {book.chapters.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-bold text-center py-6">No chapters created yet.</p>
                  ) : (
                    book.chapters.map((ch, idx) => {
                      const isSelected = ch.id === selectedChapterId;
                      return (
                        <div 
                          key={ch.id}
                          className={`
                            flex items-center justify-between p-2.5 border-2 border-black transition-all text-xs font-bold
                            ${isSelected 
                              ? "bg-nb-pink text-black" 
                              : "bg-white hover:bg-neutral-50"
                            }
                          `}
                        >
                          <button
                            onClick={() => setSelectedChapterId(ch.id)}
                            className="flex-1 text-left truncate font-display font-bold text-sm outline-none"
                          >
                            <span className="text-[10px] bg-black text-white px-1.5 py-0.5 mr-2 font-mono">
                              Ch {idx + 1}
                            </span>
                            {ch.title}
                            <span className="block text-[10px] text-neutral-500 mt-1 font-sans">
                              {ch.wordCount.toLocaleString()} words
                            </span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => handleMoveChapter(idx, "up")}
                              disabled={idx === 0}
                              className="p-0.5 border border-black bg-white disabled:opacity-30"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => handleMoveChapter(idx, "down")}
                              disabled={idx === book.chapters.length - 1}
                              className="p-0.5 border border-black bg-white disabled:opacity-30"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button 
                              onClick={() => handleChapterDelete(ch.id)}
                              className="p-0.5 border border-black bg-red-50 hover:bg-red-200"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
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
            <div className="lg:col-span-3">
              {activeChapter ? (
                <Editor 
                  key={activeChapter.id}
                  chapterId={activeChapter.id}
                  initialTitle={activeChapter.title}
                  initialContent={activeChapter.content}
                  onSaveSuccess={handleEditorSaveSuccess}
                />
              ) : (
                <div className="nb-card bg-white py-20 text-center flex flex-col items-center justify-center gap-4">
                  <FileText className="w-12 h-12 text-neutral-400 stroke-1" />
                  <div>
                    <h3 className="font-display font-black text-xl uppercase">No chapter selected</h3>
                    <p className="text-sm text-neutral-500 mt-1">Select or create a chapter to begin drafting your story.</p>
                  </div>
                  <button 
                    onClick={() => setIsChapterCreateOpen(true)}
                    className="nb-btn-primary text-sm py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    + Create Chapter
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
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl uppercase">Characters Directory</h3>
              <button 
                onClick={() => {
                  setCharForm({ name: "", description: "", aliases: "", age: "", notes: "" });
                  setSelectedCharacter(null);
                  setIsCharCreateOpen(true);
                }}
                className="nb-btn-primary font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs py-2"
              >
                <Plus className="w-4 h-4" /> Add Character
              </button>
            </div>

            {book.characters.length === 0 ? (
              <div className="nb-card bg-white py-12 text-center flex flex-col items-center justify-center gap-3">
                <Users className="w-10 h-10 text-neutral-400" />
                <p className="font-bold text-neutral-600">No characters registered for this book yet.</p>
                <button onClick={() => setIsCharCreateOpen(true)} className="nb-btn text-xs bg-nb-cyan shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">+ Register Character</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {book.characters.map((char) => (
                  <div key={char.id} className="nb-card bg-white flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div>
                      <div className="flex items-center justify-between border-b border-neutral-300 pb-2 mb-2">
                        <h4 className="font-display font-black text-lg truncate uppercase">{char.name}</h4>
                        {char.age && (
                          <span className="text-[10px] font-black bg-neutral-100 border border-black px-1.5 py-0.5">
                            Age: {char.age}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600 font-medium line-clamp-3 min-h-[2.5rem]">
                        {char.description || "No description provided."}
                      </p>
                      {char.aliases && (
                        <div className="mt-3 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] font-black uppercase text-neutral-400 mr-1">Aliases:</span>
                          {char.aliases.split(",").map((al, i) => (
                            <span key={i} className="text-[9px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 border border-black font-bold">
                              {al.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button 
                        onClick={() => handleOpenCharacterDetails(char)}
                        className="nb-btn-info text-xs py-1.5 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-1 text-center"
                      >
                        Profile & Backlinks
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
                        className="p-1.5 border-2 border-black bg-white hover:bg-neutral-50 active:translate-y-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Edit3 className="w-4 h-4 text-black" />
                      </button>
                      <button 
                        onClick={() => handleCharDelete(char.id)}
                        className="p-1.5 border-2 border-black bg-red-50 hover:bg-red-200 active:translate-y-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
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
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl uppercase">Locations Directory</h3>
              <button 
                onClick={() => {
                  setLocForm({ name: "", description: "", notes: "" });
                  setSelectedLocation(null);
                  setIsLocCreateOpen(true);
                }}
                className="nb-btn-primary font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs py-2"
              >
                <Plus className="w-4 h-4" /> Add Location
              </button>
            </div>

            {book.locations.length === 0 ? (
              <div className="nb-card bg-white py-12 text-center flex flex-col items-center justify-center gap-3">
                <MapPin className="w-10 h-10 text-neutral-400" />
                <p className="font-bold text-neutral-600">No locations registered for this book yet.</p>
                <button onClick={() => setIsLocCreateOpen(true)} className="nb-btn text-xs bg-nb-green shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">+ Register Location</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {book.locations.map((loc) => (
                  <div key={loc.id} className="nb-card bg-white flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div>
                      <h4 className="font-display font-black text-lg border-b border-neutral-300 pb-2 mb-2 uppercase truncate">{loc.name}</h4>
                      <p className="text-xs text-neutral-600 font-medium line-clamp-3 min-h-[2.5rem]">
                        {loc.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button 
                        onClick={() => handleOpenLocationDetails(loc)}
                        className="nb-btn-info text-xs py-1.5 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-1 text-center"
                      >
                        Details & Backlinks
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
                        className="p-1.5 border-2 border-black bg-white hover:bg-neutral-50 active:translate-y-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Edit3 className="w-4 h-4 text-black" />
                      </button>
                      <button 
                        onClick={() => handleLocDelete(loc.id)}
                        className="p-1.5 border-2 border-black bg-red-50 hover:bg-red-200 active:translate-y-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
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
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl uppercase">Planning Notes</h3>
              <button 
                onClick={() => {
                  setNoteForm({ title: "", content: "" });
                  setSelectedNote(null);
                  setIsNoteCreateOpen(true);
                }}
                className="nb-btn-primary font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs py-2"
              >
                <Plus className="w-4 h-4" /> Add Note
              </button>
            </div>

            {book.notes.length === 0 ? (
              <div className="nb-card bg-white py-12 text-center flex flex-col items-center justify-center gap-3">
                <Notebook className="w-10 h-10 text-neutral-400" />
                <p className="font-bold text-neutral-600">No planning notes created yet.</p>
                <button onClick={() => setIsNoteCreateOpen(true)} className="nb-btn text-xs bg-nb-orange shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">+ Create Note</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {book.notes.map((note) => (
                  <div key={note.id} className="nb-card bg-white flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all border-t-8 border-t-nb-orange">
                    <div>
                      <h4 className="font-display font-black text-lg border-b border-neutral-300 pb-2 mb-2 uppercase truncate">{note.title}</h4>
                      <p className="text-xs text-neutral-700 whitespace-pre-wrap line-clamp-5 min-h-[4rem]">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 border-t border-neutral-200 pt-3">
                      <button 
                        onClick={() => {
                          setSelectedNote(note);
                          setNoteForm({ title: note.title, content: note.content });
                          setIsNoteCreateOpen(true);
                        }}
                        className="nb-btn-info text-xs py-1.5 font-bold shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] flex-1 text-center"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleNoteDelete(note.id)}
                        className="p-1.5 border-2 border-black bg-red-50 hover:bg-red-200 active:translate-y-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
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
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-xl uppercase">Story Timeline</h3>
              <button 
                onClick={() => {
                  setEventForm({ title: "", description: "", eventDate: "" });
                  setSelectedEvent(null);
                  setIsEventCreateOpen(true);
                }}
                className="nb-btn-primary font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs py-2"
              >
                <Plus className="w-4 h-4" /> Add Timeline Event
              </button>
            </div>

            {book.events.length === 0 ? (
              <div className="nb-card bg-white py-12 text-center flex flex-col items-center justify-center gap-3">
                <Calendar className="w-10 h-10 text-neutral-400" />
                <p className="font-bold text-neutral-600">No events defined in the timeline yet.</p>
                <button onClick={() => setIsEventCreateOpen(true)} className="nb-btn text-xs bg-nb-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">+ Add Event</button>
              </div>
            ) : (
              <div className="relative border-l-4 border-black ml-4 md:ml-10 flex flex-col gap-8 py-4">
                {book.events.map((ev) => (
                  <div key={ev.id} className="relative pl-6 md:pl-10">
                    {/* Circle Dot */}
                    <div className="absolute -left-[14px] top-1 w-6 h-6 rounded-none bg-nb-yellow border-4 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]" />

                    {/* Timeline Event Card */}
                    <div className="nb-card bg-white max-w-2xl hover:-translate-y-0.5 hover:shadow-lg transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-300 pb-2 mb-2 gap-2">
                        <div>
                          <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5">
                            Date: {ev.eventDate}
                          </span>
                          <h4 className="font-display font-black text-lg uppercase mt-1">{ev.title}</h4>
                        </div>
                        
                        <div className="flex items-center gap-2">
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
                            className="p-1 border border-black bg-white hover:bg-neutral-50"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-black" />
                          </button>
                          <button 
                            onClick={() => handleEventDelete(ev.id)}
                            className="p-1 border border-black bg-red-50 hover:bg-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-700 whitespace-pre-wrap font-medium">
                        {ev.description || "No description provided."}
                      </p>
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
          <div className="flex flex-col gap-6">
            <div className="border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-xl uppercase">Character Connections</h3>
              <p className="text-xs text-neutral-600 font-bold mt-1">
                Relationships between characters registered in the story.
              </p>
            </div>

            {book.relationships.length === 0 ? (
              <div className="nb-card bg-white py-12 text-center flex flex-col items-center justify-center gap-2">
                <GitFork className="w-10 h-10 text-neutral-400" />
                <p className="font-bold text-neutral-500">No relationships mapped yet.</p>
                <p className="text-xs text-neutral-400">Open a Character profile to define a connection!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {book.relationships.map((rel) => (
                  <div key={rel.id} className="nb-card bg-white flex items-center justify-between p-4 border-t-8 border-t-nb-purple hover:-translate-y-0.5 hover:shadow-lg transition-all">
                    <div className="flex-1 truncate">
                      <div className="flex items-center gap-2 font-display font-black text-sm uppercase">
                        <span>{rel.characterA.name}</span>
                        <span className="text-neutral-400 text-xs">↔</span>
                        <span>{rel.characterB.name}</span>
                      </div>
                      <span className="text-xs font-black uppercase text-nb-purple bg-purple-50 border border-black/30 px-2 py-0.5 mt-2 inline-block">
                        {rel.relationshipType}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleRelationDelete(rel.id)}
                      className="p-1.5 border-2 border-black bg-red-50 hover:bg-red-200 active:translate-y-0.5 shrink-0 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
                      title="Delete Relationship"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
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
          <div className="w-full max-w-sm bg-white border-4 border-black nb-shadow-lg p-6 relative rounded-none">
            <button 
              onClick={() => setIsChapterCreateOpen(false)}
              className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-neutral-50"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-black text-xl uppercase border-b-2 border-black pb-2 mb-4">Create Chapter</h3>
            <form onSubmit={handleChapterCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Chapter Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1: The Encounter"
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  className="nb-input text-sm"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setIsChapterCreateOpen(false)} className="nb-btn text-xs bg-white py-1">Cancel</button>
                <button type="submit" disabled={loading} className="nb-btn-success text-xs py-1">{loading ? "Creating..." : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Character Modal */}
      {isCharCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg p-6 relative rounded-none max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsCharCreateOpen(false)}
              className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-neutral-50"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-black text-xl uppercase border-b-2 border-black pb-2 mb-4">
              {selectedCharacter ? "Edit Character" : "Add Character"}
            </h3>
            <form onSubmit={handleCharSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rostova"
                  value={charForm.name}
                  onChange={(e) => setCharForm({ ...charForm, name: e.target.value })}
                  className="nb-input text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase text-neutral-500">Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 24 or Unknown"
                    value={charForm.age}
                    onChange={(e) => setCharForm({ ...charForm, age: e.target.value })}
                    className="nb-input text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black uppercase text-neutral-500">Aliases (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. The Falcon, Elena"
                    value={charForm.aliases}
                    onChange={(e) => setCharForm({ ...charForm, aliases: e.target.value })}
                    className="nb-input text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Description</label>
                <textarea
                  placeholder="Short summary of this character's description..."
                  value={charForm.description}
                  onChange={(e) => setCharForm({ ...charForm, description: e.target.value })}
                  rows={2}
                  className="nb-input text-sm resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Private Notes</label>
                <textarea
                  placeholder="Secret character development details, backstories..."
                  value={charForm.notes}
                  onChange={(e) => setCharForm({ ...charForm, notes: e.target.value })}
                  rows={3}
                  className="nb-input text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setIsCharCreateOpen(false)} className="nb-btn text-xs bg-white py-1">Cancel</button>
                <button type="submit" disabled={loading} className="nb-btn-success text-xs py-1">
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
          <div className="w-full max-w-lg bg-white border-l-4 border-black h-full flex flex-col justify-between p-6 overflow-y-auto rounded-none relative">
            <button 
              onClick={() => setIsCharDetailsOpen(false)}
              className="absolute top-6 right-6 p-1.5 border-2 border-black bg-white hover:bg-neutral-50 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex-1 flex flex-col gap-6">
              {/* Profile Title Banner */}
              <div className="border-b-4 border-black pb-4 pr-12">
                <span className="text-[10px] font-black uppercase bg-nb-cyan border border-black px-2 py-0.5">
                  Character Profile
                </span>
                <h3 className="font-display font-black text-2xl uppercase mt-2">{selectedCharacter.name}</h3>
                {selectedCharacter.age && (
                  <p className="text-xs font-black text-neutral-500 mt-1">Age: <span className="text-black">{selectedCharacter.age}</span></p>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-black uppercase text-neutral-400">Description</p>
                <p className="text-sm font-bold text-neutral-800 bg-neutral-50 border-2 border-black p-3 whitespace-pre-wrap">
                  {selectedCharacter.description || "No description written yet."}
                </p>
              </div>

              {/* Private Notes */}
              {selectedCharacter.notes && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-black uppercase text-neutral-400">Notes & Backstory</p>
                  <p className="text-xs font-medium text-neutral-700 bg-neutral-100 border border-neutral-300 p-3 whitespace-pre-wrap">
                    {selectedCharacter.notes}
                  </p>
                </div>
              )}

              {/* Mention backlinks */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-black uppercase text-neutral-400 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" /> Mention Backlinks
                </p>
                <div className="flex flex-col gap-2">
                  {charMentions.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-bold border-2 border-dashed border-neutral-300 p-3 text-center">
                      Not mentioned in any chapters yet. (The database automatically links characters on save!)
                    </p>
                  ) : (
                    charMentions.map((men: any) => (
                      <button
                        key={men.id}
                        onClick={() => {
                          setIsCharDetailsOpen(false);
                          setActiveTab("chapters");
                          setSelectedChapterId(men.chapter.id);
                        }}
                        className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-neutral-50 text-left font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-y-0.5"
                      >
                        <span className="truncate">{men.chapter.title}</span>
                        <span className="text-[9px] bg-nb-pink border border-black px-1.5 py-0.5 shrink-0">Open Editor</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Relationships Builder inside Drawer */}
              <div className="flex flex-col gap-3 border-t-2 border-black pt-4">
                <p className="text-xs font-black uppercase text-neutral-400 flex items-center gap-1.5">
                  <GitFork className="w-3.5 h-3.5" /> Character Relationships
                </p>
                
                {/* Form to add */}
                <form onSubmit={handleCreateRelationship} className="flex gap-2 items-center">
                  <select
                    value={relationForm.targetCharId}
                    onChange={(e) => setRelationForm({ ...relationForm, targetCharId: e.target.value })}
                    className="border-2 border-black px-2 py-1.5 text-xs font-bold bg-white focus:bg-yellow-50 outline-none flex-1"
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
                    className="border-2 border-black px-2 py-1 bg-white focus:bg-yellow-50 outline-none text-xs font-bold w-1/3"
                    required
                  />
                  <button type="submit" className="p-1.5 border-2 border-black bg-nb-green shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5">
                    <UserPlus className="w-4 h-4 text-black" />
                  </button>
                </form>

                {/* List of relationships for this character */}
                <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto">
                  {book.relationships
                    .filter(r => r.characterAId === selectedCharacter.id || r.characterBId === selectedCharacter.id)
                    .map(r => {
                      const isCharA = r.characterAId === selectedCharacter.id;
                      const partnerName = isCharA ? r.characterB.name : r.characterA.name;
                      return (
                        <div key={r.id} className="flex items-center justify-between p-2 border border-black bg-neutral-50 text-xs font-bold">
                          <span>{partnerName} is a <strong className="text-nb-pink font-black underline">{r.relationshipType}</strong></span>
                          <button onClick={() => handleRelationDelete(r.id)} className="p-0.5 border border-black bg-white">
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </button>
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t-2 border-black pt-4 bg-white sticky bottom-0">
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
                className="nb-btn-info text-xs py-1.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => handleCharDelete(selectedCharacter.id)}
                className="nb-btn-danger text-xs py-1.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
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
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg p-6 relative rounded-none max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsLocCreateOpen(false)}
              className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-neutral-50"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-black text-xl uppercase border-b-2 border-black pb-2 mb-4">
              {selectedLocation ? "Edit Location" : "Add Location"}
            </h3>
            <form onSubmit={handleLocSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Northern Keep"
                  value={locForm.name}
                  onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                  className="nb-input text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Description</label>
                <textarea
                  placeholder="Describe what this location looks and feels like..."
                  value={locForm.description}
                  onChange={(e) => setLocForm({ ...locForm, description: e.target.value })}
                  rows={3}
                  className="nb-input text-sm resize-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Worldbuilding Notes</label>
                <textarea
                  placeholder="History, features, secrets of this location..."
                  value={locForm.notes}
                  onChange={(e) => setLocForm({ ...locForm, notes: e.target.value })}
                  rows={3}
                  className="nb-input text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setIsLocCreateOpen(false)} className="nb-btn text-xs bg-white py-1">Cancel</button>
                <button type="submit" disabled={loading} className="nb-btn-success text-xs py-1">
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
          <div className="w-full max-w-lg bg-white border-l-4 border-black h-full flex flex-col justify-between p-6 overflow-y-auto rounded-none relative">
            <button 
              onClick={() => setIsLocDetailsOpen(false)}
              className="absolute top-6 right-6 p-1.5 border-2 border-black bg-white hover:bg-neutral-50 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex-1 flex flex-col gap-6">
              {/* Profile Title Banner */}
              <div className="border-b-4 border-black pb-4 pr-12">
                <span className="text-[10px] font-black uppercase bg-nb-green border border-black px-2 py-0.5">
                  Location File
                </span>
                <h3 className="font-display font-black text-2xl uppercase mt-2">{selectedLocation.name}</h3>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-black uppercase text-neutral-400">Description</p>
                <p className="text-sm font-bold text-neutral-800 bg-neutral-50 border-2 border-black p-3 whitespace-pre-wrap">
                  {selectedLocation.description || "No description written yet."}
                </p>
              </div>

              {/* Notes */}
              {selectedLocation.notes && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-black uppercase text-neutral-400">Worldbuilding Notes</p>
                  <p className="text-xs font-medium text-neutral-700 bg-neutral-100 border border-neutral-300 p-3 whitespace-pre-wrap">
                    {selectedLocation.notes}
                  </p>
                </div>
              )}

              {/* Mention backlinks */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-black uppercase text-neutral-400 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" /> Mention Backlinks
                </p>
                <div className="flex flex-col gap-2">
                  {locMentions.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-bold border-2 border-dashed border-neutral-300 p-3 text-center">
                      Not mentioned in any chapters yet. (The database automatically links locations on save!)
                    </p>
                  ) : (
                    locMentions.map((men: any) => (
                      <button
                        key={men.id}
                        onClick={() => {
                          setIsLocDetailsOpen(false);
                          setActiveTab("chapters");
                          setSelectedChapterId(men.chapter.id);
                        }}
                        className="flex items-center justify-between p-2 border-2 border-black bg-white hover:bg-neutral-50 text-left font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-y-0.5"
                      >
                        <span className="truncate">{men.chapter.title}</span>
                        <span className="text-[9px] bg-nb-pink border border-black px-1.5 py-0.5 shrink-0">Open Editor</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t-2 border-black pt-4 bg-white sticky bottom-0">
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
                className="nb-btn-info text-xs py-1.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
              >
                Edit Location
              </button>
              <button 
                onClick={() => handleLocDelete(selectedLocation.id)}
                className="nb-btn-danger text-xs py-1.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]"
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
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg p-6 relative rounded-none">
            <button 
              onClick={() => {
                setIsNoteCreateOpen(false);
                setSelectedNote(null);
              }}
              className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-neutral-50"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-black text-xl uppercase border-b-2 border-black pb-2 mb-4">
              {selectedNote ? "Edit Note" : "Add Planning Note"}
            </h3>
            <form onSubmit={handleNoteSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Plot Twist Idea"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="nb-input text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Note Content</label>
                <textarea
                  placeholder="Write details of your note..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  rows={4}
                  required
                  className="nb-input text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsNoteCreateOpen(false);
                    setSelectedNote(null);
                  }} 
                  className="nb-btn text-xs bg-white py-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="nb-btn-success text-xs py-1">
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
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg p-6 relative rounded-none">
            <button 
              onClick={() => {
                setIsEventCreateOpen(false);
                setSelectedEvent(null);
              }}
              className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-neutral-50"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-display font-black text-xl uppercase border-b-2 border-black pb-2 mb-4">
              {selectedEvent ? "Edit Event" : "Add Timeline Event"}
            </h3>
            <form onSubmit={handleEventSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Battle of the Golden Sun"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  className="nb-input text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Event Date / Era Descriptor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Year 412 or Era of Magic"
                  value={eventForm.eventDate}
                  onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                  className="nb-input text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Event Description</label>
                <textarea
                  placeholder="Detail what happens during this event..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={3}
                  className="nb-input text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEventCreateOpen(false);
                    setSelectedEvent(null);
                  }} 
                  className="nb-btn text-xs bg-white py-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="nb-btn-success text-xs py-1">
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
