"use client";

import React, { createContext } from "react";
import { ClerkProvider, SignInButton as ClerkSignInButton, useUser as useClerkUser, useAuth as useClerkAuth } from "@clerk/nextjs";

// Check if Clerk is enabled via publishable key
export const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const MOCK_USER = {
  id: "mock-user-123",
  email: "elena.rostova@novella.app",
  name: "Elena Rostova",
  firstName: "Elena",
  lastName: "Rostova",
  imageUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=elena",
};

interface AuthContextType {
  userId: string | null;
  isSignedIn: boolean;
  isLoaded: boolean;
}

const MockAuthContext = createContext<AuthContextType>({
  userId: MOCK_USER.id,
  isSignedIn: true,
  isLoaded: true,
});

export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  if (isClerkEnabled) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }

  return (
    <MockAuthContext.Provider value={{ userId: MOCK_USER.id, isSignedIn: true, isLoaded: true }}>
      {children}
    </MockAuthContext.Provider>
  );
}

// Client hooks wrapper
export function useAuth() {
  if (isClerkEnabled) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { userId, isSignedIn, isLoaded } = useClerkAuth();
    return { userId, isSignedIn, isLoaded };
  }

  return {
    userId: MOCK_USER.id,
    isSignedIn: true,
    isLoaded: true,
  };
}

export function useUser() {
  if (isClerkEnabled) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { user, isSignedIn, isLoaded } = useClerkUser();
    return { user, isSignedIn, isLoaded };
  }

  return {
    user: {
      id: MOCK_USER.id,
      firstName: MOCK_USER.firstName,
      lastName: MOCK_USER.lastName,
      fullName: MOCK_USER.name,
      imageUrl: MOCK_USER.imageUrl,
      primaryEmailAddress: {
        emailAddress: MOCK_USER.email,
      },
    },
    isSignedIn: true,
    isLoaded: true,
  };
}

// Components wrapper
export function SignIn({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) return null;

  return <>{children}</>;
}
export function SignOut({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return null;

  return <>{children}</>;
}

export function SignInButton({ children, mode }: { children?: React.ReactNode; mode?: "modal" | "redirect" }) {
  if (isClerkEnabled) {
    return <ClerkSignInButton mode={mode}>{children}</ClerkSignInButton>;
  }

  return <>{children || <button className="nb-btn">Sign In</button>}</>;
}

export function UserButton() {
  if (isClerkEnabled) {
    return ;
  }

  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MOCK_USER.imageUrl}
        alt={MOCK_USER.name}
        className="w-10 h-10 border-2 border-black rounded-none nb-shadow-sm bg-yellow-100"
      />
      <div className="hidden md:block text-left">
        <p className="font-bold text-sm text-black leading-tight">{MOCK_USER.name}</p>
        <p className="text-xs text-neutral-600 leading-tight">Mock Mode</p>
      </div>
    </div>
  );
}
