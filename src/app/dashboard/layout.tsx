import React from "react";
import { redirect } from "next/navigation";
import { ensureUserExists } from "@/lib/auth-server";
import { getBooks } from "@/lib/actions/bookActions";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const revalidate = 0; // Disable server layout caching

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Ensure user profile exists
  const dbUser = await ensureUserExists();
  if (!dbUser) {
    redirect("/");
  }

  // 2. Fetch user's books for the sidebar
  let books = [];
  try {
    books = await getBooks();
  } catch (error) {
    console.error("Failed to load sidebar books:", error);
  }

  return (
    <DashboardShell initialBooks={books}>
      {children}
    </DashboardShell>
  );
}
