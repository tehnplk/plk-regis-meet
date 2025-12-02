import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface TableInfo {
  name: string;
}

export async function GET() {
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
