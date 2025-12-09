import { auth } from '@/authConfig';

// Use NextAuth middleware only for admin routes. All API routes remain
// decoupled and rely solely on JWT for authorization.
export default auth;

export const config = {
  matcher: ['/admin/:path*'],
};
