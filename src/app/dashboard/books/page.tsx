import React from "react";
import { ensureUserExists } from "@/lib/auth-server";
import { getBooks } from "@/lib/actions/bookActions";
import { BooksGrid } from "@/components/dashboard/BooksGrid";

export const revalidate = 0; // Disable cache for immediate CRUD feedback

export default async function BooksPage() {
  const user = await ensureUserExists();
  if (!user) return null;

  let books: Awaited<ReturnType<typeof getBooks>> = [];
  try {
    books = await getBooks();
  } catch (error) {
    console.error("Failed to load books grid:", error);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5 border-b-4 border-black pb-3">
        <h2 className="text-2xl font-black font-display tracking-tight uppercase">My Manuscripts</h2>
        <p className="text-xs font-bold text-neutral-500">
          Create and organize your books, outline chapters, and build your story world.
        </p>
      </div>
      <BooksGrid initialBooks={books} />
    </div>
  );
}
