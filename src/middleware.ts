import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isClerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isClerkEnabled) {
    return NextResponse.next();
  }

  try {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  } catch (e) {
    console.warn("Clerk middleware protection error, skipping since keys might not be verified:", e);
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)",
  ],
};
