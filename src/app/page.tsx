import React from "react";
import Link from "next/link";
import { 
  PenTool, 
  Users, 
  Notebook, 
  Calendar, 
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-nb-cream)] text-black flex flex-col justify-between selection:bg-nb-pink">
      {/* Header navbar */}
      <header className="px-6 md:px-12 py-6 border-b-4 border-black bg-white flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <span className="bg-nb-yellow border-2 border-black px-2 py-0.5 font-display font-black text-xl tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            N
          </span>
          <span className="font-display font-black text-2xl tracking-tight">NOVELLA</span>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="nb-btn-primary text-sm py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            Open Workspace <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main hero section */}
      <main className="flex-1 py-12 md:py-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col gap-16 md:gap-24 w-full">
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero left */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-left">
            <span className="nb-btn-secondary self-start text-xs font-black uppercase tracking-wider py-1 px-3 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] cursor-default select-none pointer-events-none">
              Built Specially for Writers
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-display tracking-tight leading-none uppercase">
              THE MANUSCRIPT <br />
              <span className="bg-nb-yellow border-4 border-black px-4 inline-block my-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                WORKSPACE
              </span> <br />
              YOU WILL LOVE.
            </h1>
            <p className="text-base md:text-lg font-bold text-neutral-800 max-w-xl leading-relaxed">
              Unlike generic editors, Novella is built specifically for authors who need to outline manuscripts, organize chapters, manage characters, track locations, and map timelines.
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <Link 
                href="/dashboard" 
                className="nb-btn-success text-base px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
              >
                Start Writing (Free) <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#features" 
                className="nb-btn bg-white hover:bg-neutral-50 text-base px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Hero right: Showcase preview card */}
          <div className="lg:col-span-5 relative">
            {/* Background design offsets */}
            <div className="absolute inset-0 bg-nb-cyan border-4 border-black translate-x-4 translate-y-4" />
            <div className="absolute inset-0 bg-nb-pink border-4 border-black -translate-x-3 -translate-y-3" />
            
            <div className="relative nb-card bg-white p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <span className="flex items-center gap-1.5 font-display font-black text-sm">
                  <span className="w-2.5 h-2.5 bg-nb-green rounded-full border border-black inline-block" />
                  CHAPTER_2.html
                </span>
                <span className="text-xs font-mono bg-neutral-100 border border-black px-1.5 py-0.5">
                  1,842 words
                </span>
              </div>
              <div className="flex flex-col gap-3 font-serif italic text-neutral-800 text-sm">
                <p>
                  Elena entered the gates of <strong className="bg-nb-green/30 border-b border-black text-black not-italic px-1">Northern Keep</strong>. The cold wind bit at her cloak, whistling through the high battlements.
                </p>
                <p>
                  She had traveled three days from the southern border, hoping to find the scholar. But the keep seemed abandoned, save for the guards on the wall...
                </p>
              </div>

              {/* Automatic relationship mention tags */}
              <div className="border-t-2 border-black pt-4 mt-2">
                <p className="text-[10px] font-black uppercase text-neutral-400">Detected Story Entities:</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-[10px] bg-nb-cyan font-black border border-black px-2 py-0.5">
                    Character: Elena
                  </span>
                  <span className="text-[10px] bg-nb-green font-black border border-black px-2 py-0.5">
                    Location: Northern Keep
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature section */}
        <section id="features" className="flex flex-col gap-12 border-t-4 border-black pt-16">
          <div className="text-center max-w-xl mx-auto flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight leading-none">
              DESIGNED FOR THE STORY
            </h2>
            <p className="text-sm md:text-base font-bold text-neutral-600">
              No spreadsheets, no clutter, no bloated plugins. Just what you need to finish your book.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="nb-card bg-white flex flex-col gap-4 border-t-8 border-t-nb-pink hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="bg-nb-pink p-3 border-2 border-black self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <PenTool className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-display font-black text-xl uppercase">Rich Text Editor</h3>
              <p className="text-sm font-medium text-neutral-600">
                A custom TipTap editor with markdown support, focus writing mode, automatic word counter, and seamless layout settings.
              </p>
            </div>

            <div className="nb-card bg-white flex flex-col gap-4 border-t-8 border-t-nb-cyan hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="bg-nb-cyan p-3 border-2 border-black self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-display font-black text-xl uppercase">Worldbuilding Profiles</h3>
              <p className="text-sm font-medium text-neutral-600">
                Register characters and locations with age, aliases, descriptions, and custom notes to build a comprehensive story guide.
              </p>
            </div>

            <div className="nb-card bg-white flex flex-col gap-4 border-t-8 border-t-nb-green hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="bg-nb-green p-3 border-2 border-black self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-display font-black text-xl uppercase">Automatic Backlinks</h3>
              <p className="text-sm font-medium text-neutral-600">
                Novella automatically scans your chapters on save, links mentions of characters/locations, and charts detailed reference lists.
              </p>
            </div>

            <div className="nb-card bg-white flex flex-col gap-4 border-t-8 border-t-nb-orange hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="bg-nb-orange p-3 border-2 border-black self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Calendar className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-display font-black text-xl uppercase">Story Timelines</h3>
              <p className="text-sm font-medium text-neutral-600">
                Plot crucial events on a chronological scroll. Set historical descriptors (like &quot;Age of Stars&quot;) or calendar dates.
              </p>
            </div>

            <div className="nb-card bg-white flex flex-col gap-4 border-t-8 border-t-nb-purple hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="bg-nb-purple p-3 border-2 border-black self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Notebook className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-display font-black text-xl uppercase">Bulletin Board</h3>
              <p className="text-sm font-medium text-neutral-600">
                A sticky-note playground for plots, research, ideas, and references, kept organized side-by-side with your books.
              </p>
            </div>

            <div className="nb-card bg-white flex flex-col gap-4 border-t-8 border-t-nb-yellow hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="bg-nb-yellow p-3 border-2 border-black self-start shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <h3 className="font-display font-black text-xl uppercase">Neo-Brutalist UI</h3>
              <p className="text-sm font-medium text-neutral-600">
                A gorgeous visual language utilizing bold borders, flat neon palettes, hard outlines, and playfulness to fuel creativity.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="nb-card bg-nb-pink border-4 border-black text-black py-16 px-6 md:px-12 text-center flex flex-col items-center gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-tight leading-none">
            READY TO FINISH YOUR BOOK?
          </h2>
          <p className="text-base md:text-lg font-bold max-w-lg text-neutral-900 leading-relaxed">
            Join other authors who have simplified their outlines, centralized their notes, and written their manuscripts with Novella.
          </p>
          <Link 
            href="/dashboard" 
            className="nb-btn bg-white hover:bg-neutral-50 text-base font-black px-8 py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            Create Your Manuscript
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-neutral-600">
        <p>© {new Date().getFullYear()} Novella Workspace. All rights reserved.</p>
        <p className="flex items-center gap-1 font-display font-black text-sm text-black">
          NOVELLA
        </p>
      </footer>
    </div>
  );
}
