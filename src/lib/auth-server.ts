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
  const user = await getCurrentUser();
  if (!user) return null;

  const dbUser = await db.user.upsert({
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
