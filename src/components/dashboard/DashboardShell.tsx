"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Search, 
  Plus, 
  Menu, 
  X, 
  Book
} from "lucide-react";
import { UserButton } from "@/components/providers/AuthProvider";
import { SearchBox } from "@/components/SearchBox";

interface BookCountSummary {
  id: string;
  title: string;
  status: string;
  _count: {
    chapters: number;
    characters: number;
    locations: number;
  };
}

interface DashboardShellProps {
  children: React.ReactNode;
  initialBooks: BookCountSummary[];
}

export function DashboardShell({ children, initialBooks }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const mainNavItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Books", href: "/dashboard/books", icon: BookOpen },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[var(--color-nb-cream)] text-black overflow-hidden">
      {/* Search Palette Component */}
      <SearchBox isOpen={searchOpen} onClose={() => setSearchOpen(false)} books={initialBooks} />

      {/* Mobile Header */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b-4 border-black z-30">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <span className="bg-black text-white px-2 py-0.5 font-display font-black text-lg tracking-widest border-2 border-black">
            N
          </span>
          <span className="font-display font-black text-xl tracking-tight">NOVELLA</span>
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSearchOpen(true)}
            className="p-1.5 border-2 border-black bg-[var(--color-nb-cyan)] nb-shadow-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Search className="w-5 h-5 text-black" />
          </button>
          <button 
            onClick={toggleMobileMenu}
            className="p-1.5 border-2 border-black bg-white nb-shadow-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-25 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop and Mobile drawer) */}
      <aside 
        className={`
          fixed md:sticky top-0 left-0 bottom-0 z-30
          w-64 bg-white border-r-4 border-black
          flex flex-col justify-between
          transition-transform duration-300 md:translate-x-0
          h-full md:h-screen shrink-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col overflow-y-auto flex-1">
          {/* Logo Section */}
          <div className="px-4 py-4 border-b-4 border-black flex items-center justify-between bg-[var(--color-nb-yellow)]">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <span className="bg-black text-white px-2 py-0.5 font-display font-black text-lg tracking-widest border-2 border-black">
                N
              </span>
              <span className="font-display font-black text-xl tracking-tight">NOVELLA</span>
            </Link>
            <button className="md:hidden border-2 border-black p-1 bg-white" onClick={() => setMobileMenuOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="px-4 py-4 border-b-4 border-black flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest mb-1">Workspace</p>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 font-bold text-sm border-2 border-black transition-all
                    ${isActive 
                      ? "bg-[var(--color-nb-pink)] text-black translate-x-0.5 translate-y-0.5 nb-shadow-xs" 
                      : "bg-white hover:bg-neutral-50 nb-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:nb-shadow-base active:translate-x-0.5 active:translate-y-0.5 active:nb-shadow-xs"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Quick Actions */}
            <button 
              onClick={() => {
                setSearchOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 font-bold text-sm border-2 border-black bg-white hover:bg-neutral-50 nb-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:nb-shadow-base active:translate-x-0.5 active:translate-y-0.5 active:nb-shadow-xs text-left w-full transition-all"
            >
              <Search className="w-4 h-4 shrink-0 text-black" />
              <span>Search (Ctrl+K)</span>
            </button>
          </nav>

          {/* Recent Books Navigation List */}
          <div className="px-4 py-4 flex-1 flex flex-col gap-3 min-h-[180px]">
            <div className="flex items-center justify-between border-t-2 border-black pt-4 -mx-4 px-4">
              <p className="text-[10px] font-black uppercase text-neutral-500 tracking-widest">Recent Books</p>
              <Link
                href="/dashboard/books?create=true"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 border-2 border-black bg-[var(--color-nb-green)] hover:bg-green-400 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all rounded-none"
                title="Create New Book"
              >
                <Plus className="w-3 h-3 text-black" />
              </Link>
            </div>

            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-480px)]">
              {initialBooks.length === 0 ? (
                <div className="border-2 border-dashed border-neutral-400 p-4 text-center">
                  <p className="text-xs text-neutral-500 font-bold">No books yet</p>
                  <Link 
                    href="/dashboard/books?create=true"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs text-[var(--color-nb-pink)] font-black hover:underline mt-1 block"
                  >
                    + Create One
                  </Link>
                </div>
              ) : (
                initialBooks.slice(0, 5).map((book) => {
                  const isActive = pathname.startsWith(`/dashboard/books/${book.id}`);
                  return (
                    <Link
                      key={book.id}
                      href={`/dashboard/books/${book.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm font-bold border-2 border-black transition-all truncate
                        ${isActive 
                          ? "bg-[var(--color-nb-cyan)] nb-shadow-xs translate-x-0.5 translate-y-0.5" 
                          : "bg-white hover:bg-neutral-50 nb-shadow-sm hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                        }
                      `}
                    >
                      <Book className="w-4 h-4 shrink-0" />
                      <span className="truncate flex-1">{book.title}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* User profile section */}
        <div className="px-4 py-4 border-t-4 border-black bg-neutral-100 flex items-center justify-between">
          <UserButton />
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Top Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b-4 border-black bg-white z-10 sticky top-0">
          <div>
            <h1 className="text-xl font-black font-display tracking-tight uppercase">
              {pathname === "/dashboard" 
                ? "Author Dashboard" 
                : pathname.startsWith("/dashboard/books") 
                  ? "Book Workspace" 
                  : "Workspace"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSearchOpen(true)}
              className="nb-btn-sm nb-btn-info flex items-center gap-2"
            >
              <Search className="w-3.5 h-3.5 text-black" />
              <span>Search Books</span>
              <span className="bg-white/50 border border-black/20 text-[10px] px-1.5 py-0.5 font-mono">Ctrl+K</span>
            </button>
          </div>
        </header>

        {/* Inner Content Workspace */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-[var(--color-nb-cream)] min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
}