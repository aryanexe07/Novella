"use server";

import { db } from "../db";
import { ensureUserExists } from "../auth-server";
import { revalidatePath } from "next/cache";

// Character CRUD
export async function createCharacter(data: {
  bookId: string;
  name: string;
  description?: string;
  aliases?: string;
  age?: string;
  notes?: string;
}) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const character = await db.character.create({
    data: {
      bookId: data.bookId,
      name: data.name,
      description: data.description,
      aliases: data.aliases,
      age: data.age,
      notes: data.notes,
    },
  });

  revalidatePath(`/dashboard/books/${data.bookId}`);
  return character;
}

export async function updateCharacter(
  id: string,
  data: {
    name?: string;
    description?: string;
    aliases?: string;
    age?: string;
    notes?: string;
  }
) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const character = await db.character.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      aliases: data.aliases,
      age: data.age,
      notes: data.notes,
    },
  });

  revalidatePath(`/dashboard/books/${character.bookId}`);
  return character;
}

export async function deleteCharacter(id: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const character = await db.character.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/books/${character.bookId}`);
  return character;
}

export async function getCharacterWithDetails(id: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const character = await db.character.findUnique({
    where: { id },
    include: {
      relationshipsA: {
        include: {
          characterB: true,
        },
      },
      relationshipsB: {
        include: {
          characterA: true,
        },
      },
    },
  });

  if (!character) return null;

  // Fetch backlinks (Mentions)
  const mentions = await db.mention.findMany({
    where: {
      entityId: id,
      entityType: "CHARACTER",
    },
    include: {
      chapter: true,
    },
    orderBy: {
      chapter: {
        order: "asc",
      },
    },
  });

  return {
    ...character,
    mentions,
  };
}

// Relationships Management
export async function createRelationship(data: {
  bookId: string;
  characterAId: string;
  characterBId: string;
  relationshipType: string;
}) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const relationship = await db.relationship.create({
    data: {
      bookId: data.bookId,
      characterAId: data.characterAId,
      characterBId: data.characterBId,
      relationshipType: data.relationshipType,
    },
  });

  revalidatePath(`/dashboard/books/${data.bookId}`);
  return relationship;
}

export async function deleteRelationship(id: string, bookId: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const relationship = await db.relationship.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/books/${bookId}`);
  return relationship;
}
