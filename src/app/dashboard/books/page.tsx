import React from "react";
import { ensureUserExists } from "@/lib/auth-server";
import { getBooks } from "@/lib/actions/bookActions";
import { BooksGrid } from "@/components/dashboard/BooksGrid";

export const revalidate = 0; // Disable cache for immediate CRUD feedback

export default async function BooksPage() {
  const user = await ensureUserExists();
  if (!user) return null;

  let books = [];
  try {
    books = await getBooks();
  } catch (error) {
    console.error("Failed to load books grid:", error);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b-4 border-black pb-4">
        <h2 className="text-3xl font-black font-display tracking-tight uppercase">My Manuscripts</h2>
        <p className="text-sm font-bold text-neutral-600">
          Create and organize your books, outline chapters, and build your story world.
        </p>
      </div>
      <BooksGrid initialBooks={books} />
    </div>
  );
}
