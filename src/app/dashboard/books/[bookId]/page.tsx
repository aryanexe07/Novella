import React from "react";
import { redirect } from "next/navigation";
import { ensureUserExists } from "@/lib/auth-server";
import { getBookById } from "@/lib/actions/bookActions";
import { BookWorkspace } from "@/components/book/BookWorkspace";

interface PageProps {
  params: Promise<{ bookId: string }> | { bookId: string };
}

export const revalidate = 0; // Prevent server-side page caching for fresh DB operations

export default async function BookDetailPage({ params }: PageProps) {
  // Support async params in Next.js 15
  const resolvedParams = await params;
  const { bookId } = resolvedParams;

  const user = await ensureUserExists();
  if (!user) {
    redirect("/");
  }

  let book = null;
  try {
    book = await getBookById(bookId);
  } catch (error) {
    console.error("Failed to fetch book detail:", error);
  }

  if (!book) {
    redirect("/dashboard/books");
  }

  return <BookWorkspace book={book as Parameters<typeof BookWorkspace>[0]["book"]} />;
}

