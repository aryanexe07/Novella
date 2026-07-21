import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  FileText, 
  PenTool, 
  Flame, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Users,
  MapPin,
  Clock
} from "lucide-react";
import { ensureUserExists } from "@/lib/auth-server";
import { db } from "@/lib/db";

export const revalidate = 0;

export default async function DashboardPage() {
  const user = await ensureUserExists();
  if (!user) return null;

  // 1. Fetch books
  const books = await db.book.findMany({
    where: { userId: user.id },
    include: {
      chapters: {
        select: {
          id: true,
          title: true,
          wordCount: true,
          updatedAt: true,
        }
      },
      characters: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        }
      },
      locations: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        }
      }
    }
  });

  // Calculate statistics
  const totalBooks = books.length;
  let totalChapters = 0;
  let totalWords = 0;

  // Recent chapters list
  interface RecentChapterItem {
    id: string;
    title: string;
    wordCount: number;
    updatedAt: Date;
    bookId: string;
    bookTitle: string;
  }

  const recentChapters: RecentChapterItem[] = [];

  // Recent activity list
  interface ActivityItem {
    id: string;
    type: "book" | "chapter" | "character" | "location";
    title: string;
    subtitle: string;
    date: Date;
  }

  const activities: ActivityItem[] = [];

  books.forEach(book => {
    totalChapters += book.chapters.length;

    book.chapters.forEach(ch => {
      totalWords += ch.wordCount;
      recentChapters.push({
        id: ch.id,
        title: ch.title,
        wordCount: ch.wordCount,
        updatedAt: ch.updatedAt,
        bookId: book.id,
        bookTitle: book.title,
      });

      activities.push({
        id: ch.id,
        type: "chapter",
        title: `Updated chapter "${ch.title}"`,
        subtitle: `in book "${book.title}"`,
        date: ch.updatedAt,
      });
    });

    book.characters.forEach(char => {
      activities.push({
        id: char.id,
        type: "character",
        title: `Created character "${char.name}"`,
        subtitle: `in book "${book.title}"`,
        date: char.createdAt,
      });
    });

    book.locations.forEach(loc => {
      activities.push({
        id: loc.id,
        type: "location",
        title: `Added location "${loc.name}"`,
        subtitle: `in book "${book.title}"`,
        date: loc.createdAt,
      });
    });

    activities.push({
      id: book.id,
      type: "book",
      title: `Created book "${book.title}"`,
      subtitle: `Status: ${book.status}`,
      date: book.createdAt,
    });
  });

  // Sort lists
  recentChapters.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  const topRecentChapters = recentChapters.slice(0, 3);
  const topActivities = activities.slice(0, 5);

  // Simple statistics
  const readingTimeMinutes = Math.ceil(totalWords / 200); // 200 words per minute
  const wordGoal = 50000;
  const goalPercentage = Math.min(100, Math.round((totalWords / wordGoal) * 100));

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome Banner */}
      <div className="nb-card bg-[var(--color-nb-yellow)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-none uppercase">
            Welcome back, {(user.name ?? "Writer").split(" ")[0]}!
          </h2>
          <p className="text-sm font-bold text-neutral-700 mt-1.5">
            You have written <span className="underline decoration-wavy decoration-[var(--color-nb-pink)] font-black">{totalWords.toLocaleString()} words</span> across {totalBooks} book{totalBooks !== 1 && "s"}. Keep it going!
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1.5 nb-shadow-sm shrink-0">
          <Flame className="w-4 h-5 text-[var(--color-nb-orange)]" />
          <div>
            <p className="text-[9px] font-black uppercase text-neutral-500">Writing Streak</p>
            <p className="font-display font-black text-sm">5 Days Active!</p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="nb-card bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-3 p-3">
          <div className="bg-[var(--color-nb-pink)] p-2 border-2 border-black nb-shadow-xs shrink-0">
            <BookOpen className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-neutral-500">Books</p>
            <p className="text-lg font-black font-display">{totalBooks}</p>
          </div>
        </div>

        <div className="nb-card bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-3 p-3">
          <div className="bg-[var(--color-nb-cyan)] p-2 border-2 border-black nb-shadow-xs shrink-0">
            <FileText className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-neutral-500">Chapters</p>
            <p className="text-lg font-black font-display">{totalChapters}</p>
          </div>
        </div>

        <div className="nb-card bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-3 p-3">
          <div className="bg-[var(--color-nb-green)] p-2 border-2 border-black nb-shadow-xs shrink-0">
            <PenTool className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-neutral-500">Words</p>
            <p className="text-lg font-black font-display">{totalWords.toLocaleString()}</p>
          </div>
        </div>

        <div className="nb-card bg-white hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-3 p-3">
          <div className="bg-[var(--color-nb-orange)] p-2 border-2 border-black nb-shadow-xs shrink-0">
            <Clock className="w-4 h-4 text-black" />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-neutral-500">Read Time</p>
            <p className="text-lg font-black font-display">{readingTimeMinutes}m</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Goal / Recent Chapters / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column: Goals & Quick Actions */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Writing Goal Card */}
          <div className="nb-card bg-white flex flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-sm uppercase flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--color-nb-pink)]" /> Story Goal
              </h3>
              <span className="text-[10px] font-black bg-neutral-100 border border-black px-1.5 py-0.5">{goalPercentage}%</span>
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-600 mb-1.5">Goal: 50,000 words</p>
              <div className="w-full bg-neutral-200 border-2 border-black h-3 rounded-none overflow-hidden">
                <div 
                  className="bg-[var(--color-nb-pink)] h-full border-r-2 border-black transition-all"
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] text-neutral-600 font-medium">
              {totalWords >= wordGoal ? "You've reached your writing goal!" : `${(wordGoal - totalWords).toLocaleString()} more words to reach your target.`}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="nb-card bg-white flex flex-col gap-2.5 p-4">
            <h3 className="font-display font-black text-sm uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-nb-cyan)]" /> Quick Actions
            </h3>
            <div className="flex flex-col gap-1.5">
              <Link 
                href="/dashboard/books?create=true"
                className="nb-btn-sm nb-btn-success w-full"
              >
                <Plus className="w-3.5 h-3.5" /> Create New Book
              </Link>
              <Link 
                href="/dashboard/books"
                className="nb-btn-sm bg-white hover:bg-neutral-50 w-full text-center"
              >
                <BookOpen className="w-3.5 h-3.5" /> View Manuscripts
              </Link>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Recent Chapters & Activity Log */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          
          {/* Recent Chapters */}
          <div className="nb-card bg-white flex flex-col gap-2.5 p-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-sm uppercase">Recent Chapters</h3>
              <Link href="/dashboard/books" className="text-[9px] font-black text-[var(--color-nb-pink)] hover:underline flex items-center gap-1">
                View all books <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-1.5">
              {topRecentChapters.length === 0 ? (
                <div className="py-5 text-center border-2 border-dashed border-neutral-300">
                  <p className="font-bold text-neutral-500 text-sm">No chapters found.</p>
                  <p className="text-xs text-neutral-400">Open a book to start writing your first chapter.</p>
                </div>
              ) : (
                topRecentChapters.map((ch) => (
                  <div 
                    key={ch.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 py-2.5 border-2 border-black bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 nb-shadow-sm hover:nb-shadow-base active:translate-x-0.5 active:translate-y-0.5 active:nb-shadow-xs transition-all"
                  >
                    <div>
                      <Link 
                        href={`/dashboard/books/${ch.bookId}?tab=chapters&selectId=${ch.id}`}
                        className="font-display font-black text-sm hover:text-[var(--color-nb-pink)] transition-colors truncate block max-w-xs"
                      >
                        {ch.title}
                      </Link>
                      <p className="text-[10px] font-bold text-neutral-500 mt-0.5">
                        {ch.bookTitle} • {ch.wordCount.toLocaleString()} words
                      </p>
                    </div>
                    <Link 
                      href={`/dashboard/books/${ch.bookId}?tab=chapters&selectId=${ch.id}`}
                      className="nb-btn-sm nb-btn-info mt-1.5 sm:mt-0"
                    >
                      Write <PenTool className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="nb-card bg-white flex flex-col gap-2.5 p-4">
            <div className="border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-sm uppercase">Recent Activity</h3>
            </div>

            <div className="flex flex-col gap-1.5">
              {topActivities.length === 0 ? (
                <p className="text-sm font-bold text-neutral-500 text-center py-5">Your activity timeline will appear here as you create content.</p>
              ) : (
                topActivities.map((act, index) => {
                  let badgeColor = "bg-[var(--color-nb-yellow)]";
                  let Icon = BookOpen;

                  if (act.type === "chapter") {
                    badgeColor = "bg-[var(--color-nb-pink)]";
                    Icon = FileText;
                  } else if (act.type === "character") {
                    badgeColor = "bg-[var(--color-nb-cyan)]";
                    Icon = Users;
                  } else if (act.type === "location") {
                    badgeColor = "bg-[var(--color-nb-green)]";
                    Icon = MapPin;
                  }

                  return (
                    <div key={`${act.id}-${index}`} className="flex items-center gap-2 text-sm">
                      <div className={`${badgeColor} p-1.5 border-2 border-black shrink-0 nb-shadow-xs`}>
                        <Icon className="w-3 h-3 text-black" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-black truncate text-xs">{act.title}</p>
                        <p className="text-[10px] text-neutral-500 truncate">{act.subtitle}</p>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 shrink-0">
                        {new Date(act.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
