import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

export async function GET(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const rows =
      (await prisma.$queryRaw<
        {
          providerId: string;
          fullname: string;
          organization: any;
          lastLogin: string;
          loginCount: bigint | number;
        }[]
      >`SELECT providerId, fullname, organization, MAX(datetime) as lastLogin, COUNT(*) as loginCount FROM LoginLog GROUP BY providerId, fullname, organization ORDER BY lastLogin DESC`) ?? [];

    const logs = rows.map((row: {
      providerId: string;
      fullname: string;
      organization: any;
      lastLogin: string;
      loginCount: bigint | number;
    }) => ({
      providerId: row.providerId,
      fullname: row.fullname,
      organization: row.organization,
      lastLogin: row.lastLogin,
      loginCount: typeof row.loginCount === 'bigint' ? Number(row.loginCount) : row.loginCount ?? 0,
    }));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('[admin/approve] fetch login logs error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
