"use server";

import { db } from "../db";
import { ensureUserExists } from "../auth-server";
import { revalidatePath } from "next/cache";

export async function createLocation(data: {
  bookId: string;
  name: string;
  description?: string;
  notes?: string;
}) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const location = await db.location.create({
    data: {
      bookId: data.bookId,
      name: data.name,
      description: data.description,
      notes: data.notes,
    },
  });

  revalidatePath(`/dashboard/books/${data.bookId}`);
  return location;
}

export async function updateLocation(
  id: string,
  data: {
    name?: string;
    description?: string;
    notes?: string;
  }
) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const location = await db.location.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      notes: data.notes,
    },
  });

  revalidatePath(`/dashboard/books/${location.bookId}`);
  return location;
}

export async function deleteLocation(id: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const location = await db.location.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/books/${location.bookId}`);
  return location;
}

export async function getLocationWithDetails(id: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const location = await db.location.findUnique({
    where: { id },
  });

  if (!location) return null;

  // Fetch backlinks (Mentions)
  const mentions = await db.mention.findMany({
    where: {
      entityId: id,
      entityType: "LOCATION",
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
    ...location,
    mentions,
  };
}
