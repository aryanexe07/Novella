import type { Metadata } from "next";
import "./globals.css";
import { AuthProviderWrapper } from "@/components/providers/AuthProvider";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
  title: "Novella — Workspace for Authors",
  description: "A modern, distraction-free writing environment for novelists, worldbuilders, and indie authors. Manage chapters, characters, locations, notes, and timelines.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-[var(--color-nb-cream)] text-black select-none">
        <AuthProviderWrapper>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
