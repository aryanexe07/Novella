import { cache } from "react";
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
 *
 * Wrapped in React.cache() so that if a layout and child page both call
 * this in the same render pass, only one Clerk auth() and one DB query
 * are issued.
 */
export const ensureUserExists = cache(async () => {
  try {
    const { userId } = await clerkAuth();
    if (!userId) return null;

    let dbUser = await db.user.findUnique({ where: { id: userId } });
    if (dbUser) return dbUser;

    const user = await getCurrentUser();
    if (!user) return null;

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
  } catch (error) {
    console.error("Error in ensureUserExists:", error);
    return null;
  }
});
