import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

interface TableInfo {
  name: string;
}

export async function GET(request: Request) {
  // Require JWT for database inspection endpoints to avoid unauthenticated scraping.
  const token = getTokenFromRequest(request);
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return new NextResponse('Invalid token', { status: 401 });
  }
  try {
    // ดึงรายชื่อตารางจาก SQLite (ยกเว้นระบบ)
    const tables = (await prisma.$queryRaw<
      TableInfo[]
    >`SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`) ?? [];

    const tableWithCounts = await Promise.all(
      tables.map(async (t) => {
        const rows = (await prisma.$queryRawUnsafe<
          { count: bigint | number }[]
        >(`SELECT COUNT(*) as count FROM "${t.name}"`)) ?? [];
        const rawCount = rows[0]?.count ?? 0;
        const count = typeof rawCount === 'bigint' ? Number(rawCount) : rawCount;
        return {
          name: t.name,
          count,
        };
      }),
    );

    return NextResponse.json({ tables: tableWithCounts });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
