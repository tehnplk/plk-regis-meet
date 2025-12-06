import { NextResponse } from 'next/server';
import { auth } from '@/authConfig';
import { generateToken } from '@/lib/jwt';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Extract provider ID from profile
    const rawProfile = (session.user as any)?.profile as string | undefined;
    let providerId: string | null = null;
    
    if (rawProfile) {
      try {
        const profile = JSON.parse(rawProfile) as any;
        providerId = profile?.provider_id ?? profile?.providerId ?? null;
      } catch {
        providerId = null;
      }
    }

    // Generate JWT token
    const token = await generateToken({
      userId: session.user.id || session.user.email || 'unknown',
      providerId: providerId || undefined,
      email: session.user.email || undefined,
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('[token] error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
