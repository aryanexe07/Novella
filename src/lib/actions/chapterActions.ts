"use server";

import { db } from "../db";
import { ensureUserExists } from "../auth-server";
import { revalidatePath } from "next/cache";

export async function createChapter(bookId: string, title: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  // Get current max order
  const lastChapter = await db.chapter.findFirst({
    where: { bookId },
    orderBy: { order: "desc" },
  });

  const nextOrder = lastChapter ? lastChapter.order + 1 : 0;

  const chapter = await db.chapter.create({
    data: {
      bookId,
      title,
      content: "<p>Start writing...</p>",
      order: nextOrder,
      wordCount: 0,
    },
  });

  revalidatePath(`/dashboard/books/${bookId}`);
  return chapter;
}

export async function updateChapter(
  id: string,
  data: {
    title?: string;
    content?: string;
    order?: number;
    wordCount?: number;
  }
) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const existingChapter = await db.chapter.findUnique({
    where: { id },
    select: { bookId: true },
  });

  if (!existingChapter) throw new Error("Chapter not found");

  const chapter = await db.chapter.update({
    where: { id },
    data: {
      title: data.title,
      content: data.content,
      order: data.order,
      wordCount: data.wordCount,
    },
  });

  // If content is updated, rerun mention scanner
  if (data.content !== undefined) {
    await scanAndCreateMentions(id, existingChapter.bookId, data.content);
  }

  revalidatePath(`/dashboard/books/${existingChapter.bookId}`);
  return chapter;
}

export async function deleteChapter(id: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const existingChapter = await db.chapter.findUnique({
    where: { id },
    select: { bookId: true },
  });

  if (!existingChapter) throw new Error("Chapter not found");

  const chapter = await db.chapter.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/books/${existingChapter.bookId}`);
  return chapter;
}

export async function reorderChapters(bookId: string, chapterIds: string[]) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  // We perform update for each in a transaction or loop
  const updates = chapterIds.map((id, index) =>
    db.chapter.update({
      where: { id, bookId },
      data: { order: index },
    })
  );

  await db.$transaction(updates);

  revalidatePath(`/dashboard/books/${bookId}`);
  return { success: true };
}

// Mention scanning engine
async function scanAndCreateMentions(chapterId: string, bookId: string, contentHtml: string) {
  try {
    // 1. Delete existing mentions
    await db.mention.deleteMany({
      where: { chapterId },
    });

    // Strip HTML tags to search plain text
    const plainText = contentHtml.replace(/<[^>]*>/g, " ");

    // 2. Fetch characters and locations for this book
    const characters = await db.character.findMany({
      where: { bookId },
    });

    const locations = await db.location.findMany({
      where: { bookId },
    });

    const mentionsToCreate: { chapterId: string; entityId: string; entityType: string }[] = [];

    const checkPresence = (name: string, aliasesStr?: string | null) => {
      if (!name) return false;
      const searchTerms = [name.trim().toLowerCase()];
      if (aliasesStr) {
        aliasesStr.split(",").forEach((alias) => {
          const trimmed = alias.trim().toLowerCase();
          if (trimmed) searchTerms.push(trimmed);
        });
      }

      const lowerText = plainText.toLowerCase();
      return searchTerms.some((term) => {
        // Safe boundary check
        const escaped = term.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const regex = new RegExp(`\\b${escaped}\\b`, "i");
        return regex.test(lowerText);
      });
    };

    // Scan characters
    for (const character of characters) {
      if (checkPresence(character.name, character.aliases)) {
        mentionsToCreate.push({
          chapterId,
          entityId: character.id,
          entityType: "CHARACTER",
        });
      }
    }

    // Scan locations
    for (const location of locations) {
      if (checkPresence(location.name)) {
        mentionsToCreate.push({
          chapterId,
          entityId: location.id,
          entityType: "LOCATION",
        });
      }
    }

    // Bulk insert mentions if any found
    if (mentionsToCreate.length > 0) {
      await db.mention.createMany({
        data: mentionsToCreate,
      });
    }
  } catch (error) {
    console.error("Mention scanner error:", error);
  }
}
