// src/app/proxy.ts
// Next.js 16: proxy.ts replaces middleware.ts
// Auth protection is handled in layouts, not here.
// This file handles only routing/redirects.
import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect bare root to home
  if (pathname === "/") {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};