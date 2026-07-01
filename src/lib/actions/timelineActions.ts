"use server";

import { db } from "../db";
import { ensureUserExists } from "../auth-server";
import { revalidatePath } from "next/cache";

export async function createTimelineEvent(data: {
  bookId: string;
  title: string;
  description?: string;
  eventDate: string;
}) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const event = await db.timelineEvent.create({
    data: {
      bookId: data.bookId,
      title: data.title,
      description: data.description,
      eventDate: data.eventDate,
    },
  });

  revalidatePath(`/dashboard/books/${data.bookId}`);
  return event;
}

export async function updateTimelineEvent(
  id: string,
  data: {
    title?: string;
    description?: string;
    eventDate?: string;
  }
) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const event = await db.timelineEvent.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      eventDate: data.eventDate,
    },
  });

  revalidatePath(`/dashboard/books/${event.bookId}`);
  return event;
}

export async function deleteTimelineEvent(id: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const event = await db.timelineEvent.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/books/${event.bookId}`);
  return event;
}
