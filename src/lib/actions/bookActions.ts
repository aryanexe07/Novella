"use server";

import { db } from "../db";
import { ensureUserExists } from "../auth-server";
import { revalidatePath } from "next/cache";

export async function getBooks() {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  return db.book.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          chapters: true,
          characters: true,
          locations: true,
        },
      },
    },
  });
}

export async function getBookById(id: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  return db.book.findFirst({
    where: { id, userId: user.id },
    include: {
      chapters: {
        orderBy: { order: "asc" },
      },
      characters: {
        orderBy: { name: "asc" },
      },
      locations: {
        orderBy: { name: "asc" },
      },
      notes: {
        orderBy: { createdAt: "desc" },
      },
      events: {
        orderBy: { createdAt: "asc" },
      },
      relationships: {
        include: {
          characterA: true,
          characterB: true,
        },
      },
    },
  });
}

export async function createBook(data: {
  title: string;
  description?: string;
  coverImage?: string;
  status?: string;
}) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const book = await db.book.create({
    data: {
      userId: user.id,
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      status: data.status || "PLANNING",
    },
  });

  revalidatePath("/dashboard");
  return book;
}

export async function updateBook(
  id: string,
  data: {
    title?: string;
    description?: string;
    coverImage?: string;
    status?: string;
  }
) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const book = await db.book.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      status: data.status,
    },
  });

  revalidatePath(`/dashboard/books/${id}`);
  revalidatePath("/dashboard");
  return book;
}

export async function deleteBook(id: string) {
  const user = await ensureUserExists();
  if (!user) throw new Error("Unauthorized");

  const book = await db.book.delete({
    where: { id },
  });

  revalidatePath("/dashboard");
  return book;
}

export async function archiveBook(id: string) {
  return updateBook(id, { status: "ARCHIVED" });
}
