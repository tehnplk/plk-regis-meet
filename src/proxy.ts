import { NextResponse } from "next/server";

// Middleware currently disabled: allow all routes without auth checks.
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
