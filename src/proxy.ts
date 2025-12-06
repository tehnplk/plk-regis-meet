import { NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "./lib/jwt";

export async function proxy(request: any) {
  const { pathname } = request.nextUrl;
  
  // Check JWT for protected API routes
  if (pathname.startsWith('/api/events') && 
      ['POST', 'PUT', 'DELETE'].includes(request.method)) {
    
    const token = getTokenFromRequest(request);
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Check JWT for participants endpoints (privacy protection)
  if ((pathname.match(/^\/api\/events\/\d+\/participants$/) && request.method === 'POST') ||
      (pathname.match(/^\/api\/events\/\d+$/) && request.method === 'GET')) {
    
    const token = getTokenFromRequest(request);
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  // Check JWT for database API (admin only)
  if (pathname.startsWith('/api/database')) {
    const token = getTokenFromRequest(request);
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: 'Admin required' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
