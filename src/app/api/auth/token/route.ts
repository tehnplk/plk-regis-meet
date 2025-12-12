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
    let fullName: string | null = null;
    let orgName: string | null = null;
    
    if (rawProfile) {
      try {
        const profile = JSON.parse(rawProfile) as any;
        providerId = profile?.provider_id ?? profile?.providerId ?? null;

        const titleTh = profile?.title_th ?? '';
        const firstTh = profile?.firstname_th ?? '';
        const lastTh = profile?.lastname_th ?? '';
        const nameTh = profile?.name_th ?? '';
        const fullNameParts = [`${titleTh}${firstTh}`.trim(), lastTh].filter(Boolean);
        const computed = fullNameParts.length > 0 ? fullNameParts.join(' ').trim() : nameTh;
        fullName = computed || null;

        const orgRaw = profile?.organization;
        const orgList = Array.isArray(orgRaw) ? orgRaw : [];
        const firstOrg = orgList[0] ?? null;
        const firstOrgName = (firstOrg?.hname_th as string | undefined) ?? null;
        orgName = firstOrgName ? String(firstOrgName) : null;
      } catch {
        providerId = null;
        fullName = null;
        orgName = null;
      }
    }

    // Generate JWT token
    const token = await generateToken({
      userId: session.user.id || session.user.email || 'unknown',
      providerId: providerId || undefined,
      fullName: fullName || undefined,
      orgName: orgName || undefined,
      email: session.user.email || undefined,
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error('[token] error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
