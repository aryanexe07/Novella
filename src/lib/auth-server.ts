import { auth as clerkAuth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getAuth() {
  const { userId } = await clerkAuth();
  return { userId };
}

export async function getCurrentUser() {
  const user = await clerkCurrentUser();
  if (!user) return null;

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? "",
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "Author",
    imageUrl: user.imageUrl,
  };
}

/**
 * Ensures the authenticated Clerk user exists in the database.
 * Creates the user row if it is missing (upsert pattern).
 * Returns the DB user record, or null if unauthenticated.
 */
export async function ensureUserExists() {
  const { userId } = await clerkAuth();
  if (!userId) return null;

  // 1. Try to find the user in the database first (fast path)
  let dbUser = await db.user.findUnique({ where: { id: userId } });
  if (dbUser) return dbUser;

  // 2. If not found, fetch Clerk user details (slow path)
  const user = await getCurrentUser();
  if (!user) return null;

  // 3. Upsert to handle concurrent requests safely creating the user
  dbUser = await db.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name: user.name,
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });

  return dbUser;
}
