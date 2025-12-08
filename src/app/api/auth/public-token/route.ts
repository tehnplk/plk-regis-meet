import { NextResponse } from 'next/server';
import { generateToken } from '@/lib/jwt';

// Public token for read-only endpoints (e.g., participants listing) that require JWT presence
export async function GET() {
  try {
    const token = await generateToken({
      userId: 'public',
      email: undefined,
      providerId: undefined,
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('[public-token] error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
