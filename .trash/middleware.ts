import type { NextRequest } from 'next/server';
import { proxy } from './src/proxy';

export async function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: ['/api/:path*'],
  // Use Node.js runtime because jwt verification uses `jose`.
  runtime: 'nodejs',
};
