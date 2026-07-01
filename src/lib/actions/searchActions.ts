"use server";

import { db } from "../db";
import { ensureUserExists } from "../auth-server";

export async function globalSearch(bookId: string, query: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  if (!query || query.trim() === "") {
    return { chapters: [], characters: [], locations: [], notes: [] };
  }

  const chapters = await db.chapter.findMany({
    where: {
      bookId,
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
      ],
    },
    select: { id: true, title: true },
    take: 5,
  });

  const characters = await db.character.findMany({
    where: {
      bookId,
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { aliases: { contains: query } },
        { notes: { contains: query } },
      ],
    },
    select: { id: true, name: true },
    take: 5,
  });

  const locations = await db.location.findMany({
    where: {
      bookId,
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { notes: { contains: query } },
      ],
    },
    select: { id: true, name: true },
    take: 5,
  });

  const notes = await db.note.findMany({
    where: {
      bookId,
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
      ],
    },
    select: { id: true, title: true },
    take: 5,
  });

  return { chapters, characters, locations, notes };
}
