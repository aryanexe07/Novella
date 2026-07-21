"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Plus, 
  Book, 
  FileText, 
  Users, 
  MapPin, 
  Trash2, 
  Archive, 
  Edit3, 
  X,
  Search,
  BookOpen
} from "lucide-react";
import { createBook, updateBook, deleteBook } from "@/lib/actions/bookActions";

interface BookItem {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  status: string;
  createdAt: Date;
  _count: {
    chapters: number;
    characters: number;
    locations: number;
  };
}

interface BooksGridProps {
  initialBooks: BookItem[];
}

export function BooksGrid({ initialBooks }: BooksGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<BookItem[]>(initialBooks);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("PLANNING");
  const [loading, setLoading] = useState(false);

  // Open create modal if URL search params have create=true
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreateOpen(true);
      // Clean up parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams]);

  // Sync state if initialBooks changes
  useEffect(() => {
    setBooks(initialBooks);
  }, [initialBooks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const newBook = await createBook({
        title,
        description,
        coverImage: coverImage || undefined,
        status,
      });

      // Insert new book into local state or refresh
      setBooks([
        {
          ...newBook,
          _count: { chapters: 0, characters: 0, locations: 0 }
        } satisfies BookItem,
        ...books
      ]);

      setIsCreateOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error("Failed to create book:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (book: BookItem) => {
    setSelectedBook(book);
    setTitle(book.title);
    setDescription(book.description || "");
    setCoverImage(book.coverImage || "");
    setStatus(book.status);
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !title.trim()) return;

    setLoading(true);
    try {
      await updateBook(selectedBook.id, {
        title,
        description,
        coverImage: coverImage || undefined,
        status,
      });

      setBooks(books.map(b => b.id === selectedBook.id 
        ? { ...b, title, description, coverImage: coverImage || null, status } 
        : b
      ));

      setIsEditOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      console.error("Failed to update book:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you absolutely sure you want to delete this book? This will permanently remove all chapters, characters, and data!")) return;

    try {
      await deleteBook(id);
      setBooks(books.filter(b => b.id !== id));
      router.refresh();
    } catch (err) {
      console.error("Failed to delete book:", err);
    }
  };

  const handleArchive = async (book: BookItem) => {
    try {
      const newStatus = book.status === "ARCHIVED" ? "PLANNING" : "ARCHIVED";
      await updateBook(book.id, { status: newStatus });
      setBooks(books.map(b => b.id === book.id ? { ...b, status: newStatus } : b));
      router.refresh();
    } catch (err) {
      console.error("Failed to archive book:", err);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCoverImage("");
    setStatus("PLANNING");
    setSelectedBook(null);
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (b.description && b.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search books by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="nb-input pl-10 w-full text-sm"
          />
        </div>

        <button 
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="nb-btn-primary font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        >
          <Plus className="w-5 h-5" /> New Book
        </button>
      </div>

      {/* Grid List */}
      {filteredBooks.length === 0 ? (
        <div className="nb-card bg-white py-16 text-center flex flex-col items-center justify-center gap-4">
          <BookOpen className="w-12 h-12 text-neutral-400 stroke-1" />
          <div>
            <h3 className="font-display font-black text-xl uppercase">No books found</h3>
            <p className="text-sm text-neutral-500 mt-1">Get started by creating your first workspace!</p>
          </div>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="nb-btn-success text-sm py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Create a Book
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map((book) => {
            const isArchived = book.status === "ARCHIVED";
            let statusColor = "bg-nb-yellow";
            if (book.status === "WRITING") statusColor = "bg-nb-pink";
            else if (book.status === "EDITING") statusColor = "bg-nb-cyan";
            else if (book.status === "COMPLETED") statusColor = "bg-nb-green";
            else if (isArchived) statusColor = "bg-neutral-300";

            return (
              <div 
                key={book.id}
                className={`nb-card bg-white flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg transition-all ${isArchived ? "opacity-75" : ""}`}
              >
                <div>
                  {/* Card Header Cover Image / Placeholder */}
                  <div className="aspect-[16/9] border-2 border-black bg-neutral-100 flex items-center justify-center overflow-hidden mb-4 relative">
                    {book.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Book className="w-10 h-10 text-neutral-400" />
                        <span className="font-display font-black text-xs text-neutral-500 uppercase tracking-wider">NOVELLA</span>
                      </div>
                    )}
                    <span className={`absolute top-3 right-3 border-2 border-black px-2 py-0.5 text-xs font-black uppercase ${statusColor} shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}>
                      {book.status}
                    </span>
                  </div>

                  {/* Metadata */}
                  <Link 
                    href={`/dashboard/books/${book.id}`}
                    className="font-display font-black text-xl hover:text-nb-pink transition-colors line-clamp-1 uppercase block"
                  >
                    {book.title}
                  </Link>
                  <p className="text-xs font-medium text-neutral-600 mt-2 line-clamp-2 min-h-[2rem]">
                    {book.description || "No description provided."}
                  </p>

                  {/* Summary counts */}
                  <div className="grid grid-cols-3 gap-2 border-t-2 border-b-2 border-black py-3 my-4">
                    <div className="text-center">
                      <p className="text-xs text-neutral-400 font-bold uppercase">Chapters</p>
                      <p className="font-display font-black text-sm flex items-center justify-center gap-1 mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-nb-pink shrink-0" />
                        {book._count.chapters}
                      </p>
                    </div>
                    <div className="text-center border-l-2 border-r-2 border-black px-1">
                      <p className="text-xs text-neutral-400 font-bold uppercase">Characters</p>
                      <p className="font-display font-black text-sm flex items-center justify-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-nb-cyan shrink-0" />
                        {book._count.characters}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-400 font-bold uppercase">Locations</p>
                      <p className="font-display font-black text-sm flex items-center justify-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-nb-green shrink-0" />
                        {book._count.locations}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-3 mt-2">
                  <Link 
                    href={`/dashboard/books/${book.id}`}
                    className="nb-btn-info text-xs flex-1 py-1.5 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center block"
                  >
                    Workspace
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleEditClick(book)}
                      className="p-1.5 border-2 border-black bg-white hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      title="Edit Book Details"
                    >
                      <Edit3 className="w-4 h-4 text-black" />
                    </button>
                    <button 
                      onClick={() => handleArchive(book)}
                      className={`p-1.5 border-2 border-black hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${isArchived ? "bg-nb-yellow" : "bg-white"}`}
                      title={isArchived ? "Unarchive Book" : "Archive Book"}
                    >
                      <Archive className="w-4 h-4 text-black" />
                    </button>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      className="p-1.5 border-2 border-black bg-red-100 hover:bg-red-200 active:translate-x-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      title="Delete Book"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg rounded-none p-6 relative">
            <button 
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5"
            >
              <X className="w-4 h-4 text-black" />
            </button>

            <h3 className="font-display font-black text-2xl uppercase border-b-2 border-black pb-2 mb-4">
              Create New Book
            </h3>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Glass Kingdom"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="nb-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Description</label>
                <textarea
                  placeholder="What is this story about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="nb-input text-sm resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or leave blank"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="nb-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="nb-select text-sm"
                >
                  <option value="PLANNING">Planning</option>
                  <option value="WRITING">Writing</option>
                  <option value="EDITING">Editing</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="nb-btn bg-white hover:bg-neutral-50 text-sm py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="nb-btn-primary text-sm py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {loading ? "Creating..." : "Create Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-black nb-shadow-lg rounded-none p-6 relative">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 p-1 border-2 border-black bg-white hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5"
            >
              <X className="w-4 h-4 text-black" />
            </button>

            <h3 className="font-display font-black text-2xl uppercase border-b-2 border-black pb-2 mb-4">
              Edit Book Details
            </h3>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Book Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="nb-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="nb-input text-sm resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Cover Image URL (Optional)</label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="nb-input text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-black uppercase text-neutral-500">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="nb-select text-sm"
                >
                  <option value="PLANNING">Planning</option>
                  <option value="WRITING">Writing</option>
                  <option value="EDITING">Editing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="nb-btn bg-white hover:bg-neutral-50 text-sm py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="nb-btn-primary text-sm py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    
  );
}
