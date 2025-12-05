import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  table: string;
}

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const table = resolvedParams.table;

  if (!table) {
    return new NextResponse('Table name is required', { status: 400 });
  }

  try {
    // ตรวจสอบว่าตารางนี้มีอยู่จริง และไม่ใช่ตารางระบบ
    const existing = await prisma.$queryRaw<
      { name: string }[]
    >`SELECT name FROM sqlite_schema WHERE type = 'table' AND name = ${table} AND name NOT LIKE 'sqlite_%'`;

    if (!existing.length) {
      return new NextResponse('Table not found', { status: 404 });
    }

    // ดึงข้อมูลทั้งหมด (limit 200 แค่เพื่อไม่ให้หนักเกินไป)
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM "${table}" LIMIT 200`,
    );

    return NextResponse.json({ table, rows });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
