"use server";

import { db } from "../db";
import { ensureUserExists } from "../auth-server";
import { revalidatePath } from "next/cache";

export async function createNote(data: {
  bookId: string;
  title: string;
  content: string;
}) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const note = await db.note.create({
    data: {
      bookId: data.bookId,
      title: data.title,
      content: data.content,
    },
  });

  revalidatePath(`/dashboard/books/${data.bookId}`);
  return note;
}

export async function updateNote(
  id: string,
  data: {
    title?: string;
    content?: string;
  }
) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const note = await db.note.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
    },
  });

  revalidatePath(`/dashboard/books/${note.bookId}`);
  return note;
}

export async function deleteNote(id: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const note = await db.note.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/books/${note.bookId}`);
  return note;
}
