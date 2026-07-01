import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  FileText, 
  PenTool, 
  Flame, 
  Plus, 
  Search, 
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
  let totalCharacters = 0;
  let totalLocations = 0;

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
    totalCharacters += book.characters.length;
    totalLocations += book.locations.length;

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
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="nb-card bg-nb-yellow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight leading-none uppercase">
            Welcome back, {user.name.split(" ")[0]}!
          </h2>
          <p className="text-sm font-bold text-neutral-800 mt-2">
            You have written <span className="underline decoration-wavy decoration-nb-pink font-black">{totalWords.toLocaleString()} words</span> across {totalBooks} book{totalBooks !== 1 && "s"}. Keep it going!
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white nb-border-thin px-4 py-2 nb-shadow-sm shrink-0">
          <Flame className="w-6 h-6 text-nb-orange fill-nb-orange animate-bounce" />
          <div>
            <p className="text-xs font-black uppercase text-neutral-500">Writing Streak</p>
            <p className="font-display font-black text-lg">5 Days Active!</p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="nb-card bg-white hover:-translate-y-1 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="bg-nb-pink p-3 nb-border-thin nb-shadow-sm shrink-0">
            <BookOpen className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-neutral-500">Total Books</p>
            <p className="text-2xl font-black font-display">{totalBooks}</p>
          </div>
        </div>

        <div className="nb-card bg-white hover:-translate-y-1 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="bg-nb-cyan p-3 nb-border-thin nb-shadow-sm shrink-0">
            <FileText className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-neutral-500">Chapters</p>
            <p className="text-2xl font-black font-display">{totalChapters}</p>
          </div>
        </div>

        <div className="nb-card bg-white hover:-translate-y-1 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="bg-nb-green p-3 nb-border-thin nb-shadow-sm shrink-0">
            <PenTool className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-neutral-500">Words Written</p>
            <p className="text-2xl font-black font-display">{totalWords.toLocaleString()}</p>
          </div>
        </div>

        <div className="nb-card bg-white hover:-translate-y-1 hover:shadow-lg transition-all flex items-center gap-4">
          <div className="bg-nb-orange p-3 nb-border-thin nb-shadow-sm shrink-0">
            <Clock className="w-6 h-6 text-black" />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-neutral-500">Reading Time</p>
            <p className="text-2xl font-black font-display">{readingTimeMinutes} mins</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Goal / Recent Chapters / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Goals & Quick Actions */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Writing Goal Card */}
          <div className="nb-card bg-white flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg uppercase flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-nb-pink" /> Story Goal
              </h3>
              <span className="text-xs font-black bg-neutral-100 border border-black px-2 py-0.5">{goalPercentage}%</span>
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">Goal: 50,000 words overall</p>
              <div className="w-full bg-neutral-200 border-2 border-black h-6 rounded-none overflow-hidden relative">
                <div 
                  className="bg-nb-pink h-full border-r-2 border-black transition-all"
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-neutral-600 font-medium">
              {totalWords >= wordGoal ? "🎉 You've reached your writing goal!" : `${(wordGoal - totalWords).toLocaleString()} more words to reach your target.`}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="nb-card bg-white flex flex-col gap-4">
            <h3 className="font-display font-black text-lg uppercase flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-nb-cyan" /> Quick Actions
            </h3>
            <div className="flex flex-col gap-3">
              <Link 
                href="/dashboard/books?create=true"
                className="nb-btn-success text-sm w-full py-2.5 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Plus className="w-4 h-4" /> Create New Book
              </Link>
              <Link 
                href="/dashboard/books"
                className="nb-btn bg-white hover:bg-neutral-50 text-sm w-full py-2.5 font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-center block"
              >
                <BookOpen className="w-4 h-4 inline-block mr-1.5" /> View Manuscripts
              </Link>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Recent Chapters & Activity Log */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Recent Chapters */}
          <div className="nb-card bg-white flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-lg uppercase">Recent Chapters</h3>
              <Link href="/dashboard/books" className="text-xs font-black text-nb-pink hover:underline flex items-center gap-1">
                View all books <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {topRecentChapters.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-neutral-300">
                  <p className="font-bold text-neutral-500">No chapters found.</p>
                  <p className="text-xs text-neutral-400">Open a book to start writing your first chapter.</p>
                </div>
              ) : (
                topRecentChapters.map((ch) => (
                  <div 
                    key={ch.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-2 border-black bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <div>
                      <Link 
                        href={`/dashboard/books/${ch.bookId}?tab=chapters&selectId=${ch.id}`}
                        className="font-display font-black text-base hover:text-nb-pink transition-colors truncate block max-w-sm"
                      >
                        {ch.title}
                      </Link>
                      <p className="text-xs font-bold text-neutral-500 mt-1">
                        Book: <span className="text-black underline">{ch.bookTitle}</span> • {ch.wordCount.toLocaleString()} words
                      </p>
                    </div>
                    <Link 
                      href={`/dashboard/books/${ch.bookId}?tab=chapters&selectId=${ch.id}`}
                      className="nb-btn-info text-xs py-1 px-3 mt-3 sm:mt-0 font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    >
                      Write <PenTool className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="nb-card bg-white flex flex-col gap-4">
            <div className="border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-lg uppercase">Recent Activity</h3>
            </div>

            <div className="flex flex-col gap-3">
              {topActivities.length === 0 ? (
                <p className="text-sm font-bold text-neutral-500 text-center py-6">Your activity timeline will appear here as you create content.</p>
              ) : (
                topActivities.map((act, index) => {
                  let badgeColor = "bg-nb-yellow";
                  let Icon = BookOpen;

                  if (act.type === "chapter") {
                    badgeColor = "bg-nb-pink";
                    Icon = FileText;
                  } else if (act.type === "character") {
                    badgeColor = "bg-nb-cyan";
                    Icon = Users;
                  } else if (act.type === "location") {
                    badgeColor = "bg-nb-green";
                    Icon = MapPin;
                  }

                  return (
                    <div key={`${act.id}-${index}`} className="flex items-center gap-3 text-sm">
                      <div className={`${badgeColor} p-2 border-2 border-black shrink-0 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`}>
                        <Icon className="w-4 h-4 text-black" />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-bold text-black truncate">{act.title}</p>
                        <p className="text-xs text-neutral-500 truncate">{act.subtitle}</p>
                      </div>
                      <span className="text-xs font-bold text-neutral-400 shrink-0">
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
