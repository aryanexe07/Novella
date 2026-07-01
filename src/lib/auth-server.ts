import { auth as clerkAuth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";
import { db } from "./db";

const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const MOCK_USER = {
  id: "mock-user-123",
  email: "elena.rostova@novella.app",
  name: "Elena Rostova",
  firstName: "Elena",
  lastName: "Rostova",
  imageUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=elena",
};

export async function getAuth() {
  if (isClerkEnabled) {
    try {
      const { userId } = await clerkAuth();
      return { userId };
    } catch (e) {
      console.warn("Clerk auth failed on server, using mock user. Error:", e);
      return { userId: MOCK_USER.id };
    }
  }

  return { userId: MOCK_USER.id };
}

export async function getCurrentUser() {
  if (isClerkEnabled) {
    try {
      const user = await clerkCurrentUser();
      if (!user) return null;
      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Author",
        imageUrl: user.imageUrl,
      };
    } catch (e) {
      console.warn("Clerk currentUser failed on server, using mock user. Error:", e);
      return {
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        name: MOCK_USER.name,
        imageUrl: MOCK_USER.imageUrl,
      };
    }
  }

  return {
    id: MOCK_USER.id,
    email: MOCK_USER.email,
    name: MOCK_USER.name,
    imageUrl: MOCK_USER.imageUrl,
  };
}

// Automatically registers user in local DB if not present
export async function ensureUserExists() {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    let dbUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    }

    return dbUser;
  } catch (error) {
    console.error("Failed to ensure user exists:", error);
    return null;
  }
}
