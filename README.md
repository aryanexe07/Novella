<div align="center">
  <br />
  <pre style="font-family: 'Space Grotesk', monospace; font-size: 2.5rem; font-weight: 900; letter-spacing: -0.02em; background: #FDE047; padding: 0.5rem 1.5rem; border: 4px solid #000; display: inline-block; box-shadow: 6px 6px 0px 0px #000;">
    N O V E L L A
  </pre>
  <br />
  <p><strong>The Manuscript Workspace You Will Love.</strong></p>
  <p>A modern, distraction-free writing environment for novelists, worldbuilders, and indie authors.</p>
  <br />

  <p>
    <a href="https://itsnovella.vercel.app/">
      <img src="https://img.shields.io/badge/Live-Demo-FDE047?style=flat-square&logo=vercel&logoColor=black&labelColor=black" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/TipTap-3-EE5393?style=flat-square" alt="TipTap" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Clerk_Auth-6C47FF?style=flat-square&logo=clerk" alt="Clerk Auth" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
  </p>
  <br />
</div>

---

## 🚀 Overview

**Novella** is built specifically for authors who need to outline manuscripts, organize chapters, manage characters, track locations, and map timelines — all in one place. Unlike generic editors, Novella provides a purpose-built workspace that grows with your story.

> ✍️ **No spreadsheets. No clutter. No bloated plugins. Just what you need to finish your book.**

---

## ✨ Features

### 📝 Rich Text Editor
A custom TipTap editor with markdown support, focus writing mode, automatic word counter, and seamless layout settings. Write chapters with full formatting — headings, lists, blockquotes, links, and more — all within a clean, distraction-free interface.

### 🧑‍🤝‍🧑 Worldbuilding Profiles
Register **characters** and **locations** with detailed profiles:
- **Characters**: Name, age, aliases (for mention scanning), descriptions, and private backstory notes.
- **Locations**: Name, description, and worldbuilding notes.

### 🔗 Automatic Backlinks
Novella automatically scans your chapters on save, detects mentions of registered characters and locations, and builds a cross-reference index. Click any mention to jump directly to the relevant chapter.

### 📅 Story Timelines
Plot crucial events on a chronological scroll. Set historical descriptors (e.g. _"Age of Stars"_ or _"Year 412"_) or calendar dates. Timeline events are displayed in a vertical, scrollable list with clear visual markers.

### 📋 Bulletin Board (Notes)
A sticky-note playground for plots, research, ideas, and references. Keep your thoughts organized side-by-side with your manuscripts. Notes are simple, fast, and always accessible.

### 🕸️ Character Relationships
Map connections between characters — friendships, rivalries, family ties, romances, and more. Visualize your story's social web and keep track of who knows whom.

### 📊 Author Dashboard
A comprehensive overview of your writing progress:
- Total books, chapters, and words written
- Estimated reading time
- Writing goal progress bar (default 50,000 words)
- Recent chapters quick-access list
- Activity feed showing the latest changes across all content

### 🔍 Global Search
Quickly search across all your books by title or description using the global search palette (`Ctrl+K`).

### 🎨 Neo-Brutalist UI
A gorgeous visual language utilizing:
- Bold black borders
- Flat neon color palette (yellow, pink, cyan, green, orange, purple)
- Hard drop shadows
- Interactive hover/active transforms
- Playful, creative energy

---

## 🏗️ Tech Stack

| Category          | Technology                                                                 |
| ----------------- | -------------------------------------------------------------------------- |
| **Framework**     | [Next.js 15](https://nextjs.org/) (App Router, React 19, Turbopack)        |
| **Language**      | [TypeScript](https://www.typescriptlang.org/) 5.x                          |
| **Styling**       | [Tailwind CSS 4](https://tailwindcss.com/) (with custom neo-brutalist theme) |
| **Database**      | [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM 6](https://prisma.io/) |
| **Auth**          | [Clerk](https://clerk.com/) (authentication + user management)             |
| **Text Editor**   | [TipTap 3](https://tiptap.dev/) (React, rich text, mentions, links, placeholder) |
| **State Mgmt**    | [TanStack React Query 5](https://tanstack.com/query)                       |
| **Icons**         | [Lucide React](https://lucide.dev/)                                        |
| **Validation**    | [Zod 4](https://zod.dev/)                                                  |
| **Linting**       | [ESLint 9](https://eslint.org/) with `eslint-config-next`                  |

---

## 🧩 Database Schema

Novella uses a relational PostgreSQL database with the following models:

```
User (1) ──› (many) Book
Book  (1) ──› (many) Chapter
Book  (1) ──› (many) Character
Book  (1) ──› (many) Location
Book  (1) ──› (many) Note
Book  (1) ──› (many) TimelineEvent
Book  (1) ──› (many) Relationship

Chapter (1) ──› (many) Mention
Mention references Character or Location (polymorphic via entityType)
```

> See [`prisma/schema.prisma`](./prisma/schema.prisma) for the full schema definition.

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20.x or later
- [PostgreSQL](https://www.postgresql.org/) 14 or later
- A [Clerk](https://clerk.com/) account for authentication

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/novella.git
cd novella
npm install
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/novella?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/novella?schema=public"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 4. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> The landing page showcases Novella's features. Click **"Start Writing (Free)"** or navigate to `/dashboard` to access the author workspace.

### 🔗 Live Demo

Try the hosted version at **[https://itsnovella.vercel.app](https://itsnovella.vercel.app/)** — no setup required.

---

## 📁 Project Structure

```
novella/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── globals.css        # Global styles + neo-brutalist utility classes
│   │   ├── layout.tsx         # Root layout (Clerk + React Query providers)
│   │   ├── page.tsx           # Landing page (marketing)
│   │   └── dashboard/
│   │       ├── layout.tsx     # Dashboard layout (sidebar + auth guard)
│   │       ├── page.tsx       # Author dashboard overview
│   │       └── books/
│   │           ├── page.tsx   # Books grid with search, create, edit
│   │           └── [bookId]/
│   │               └── page.tsx  # Book workspace (chapters, characters, etc.)
│   ├── components/
│   │   ├── Editor.tsx         # TipTap rich text editor
│   │   ├── SearchBox.tsx      # Global search palette
│   │   ├── book/
│   │   │   └── BookWorkspace.tsx  # Full workspace panel for a single book
│   │   ├── dashboard/
│   │   │   ├── BooksGrid.tsx  # Book cards with CRUD modals
│   │   │   └── DashboardShell.tsx  # Sidebar + header layout shell
│   │   └── providers/
│   │       ├── AuthProvider.tsx    # Clerk AuthProvider wrapper
│   │       └── QueryProvider.tsx   # TanStack Query provider
│   ├── lib/
│   │   ├── auth-server.ts     # Server-side auth helpers (Clerk)
│   │   ├── db.ts              # Prisma client singleton
│   │   └── actions/           # Server actions (CRUD for all entities)
│   │       ├── bookActions.ts
│   │       ├── chapterActions.ts
│   │       ├── characterActions.ts
│   │       ├── locationActions.ts
│   │       ├── noteActions.ts
│   │       ├── searchActions.ts
│   │       └── timelineActions.ts
│   └── middleware.ts           # Clerk route protection for /dashboard/*
└── configuration files         # tsconfig, next.config, eslint, postcss, etc.
```

---

## 🧭 Roadmap

- [x] Book management (CRUD + search)
- [x] Chapter editor with TipTap
- [x] Character profiles with aliases
- [x] Location profiles
- [x] Planning notes
- [x] Story timeline
- [x] Character relationships
- [x] Automatic mention scanning & backlinks
- [x] Author dashboard with stats & activity feed
- [ ] Collaborative writing (real-time multi-author)
- [ ] Export to PDF / EPUB / DOCX
- [ ] Dark mode
- [ ] Mobile responsive improvements
- [ ] Custom writing goals per book
- [ ] Chapter word count history & charts

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve Novella, please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">
  <br />
  <p>
    Built with ❤️ for authors who need to get their stories out of their heads and onto the page.
  </p>
  <p>
    <sub>© 2025 Novella Workspace. All rights reserved.</sub>
  </p>
</div>

