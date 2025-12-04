import { NextResponse } from "next/server";
import { auth } from "@/authConfig";

export default auth((req) => {
  // If no session → redirect to /login (with callbackUrl)
  if (!req.auth) {
    const callbackUrl = `${req.nextUrl.pathname}${req.nextUrl.search}`;
    const loginUrl = new URL("/login", req.nextUrl.origin);
    if (callbackUrl) {
      loginUrl.searchParams.set("callbackUrl", callbackUrl);
    }
    return NextResponse.redirect(loginUrl);
  }
  // If session exists → allow access
  return NextResponse.next();
});

export const config = {
  matcher: ["/create-event/:path*"],
};
