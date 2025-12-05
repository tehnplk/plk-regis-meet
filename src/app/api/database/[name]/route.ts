import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  name: string;
}

const MAX_ROWS = 300;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { name } = await params;

  if (!name || !/^[A-Za-z0-9_]+$/.test(name)) {
    return NextResponse.json({ error: 'Invalid table name' }, { status: 400 });
  }

  const exists =
    (await prisma.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_schema
      WHERE type = 'table' AND lower(name) = lower(${name})
    `) ?? [];

  if (exists.length === 0) {
    return NextResponse.json({ error: 'Table not found' }, { status: 404 });
  }

  const tableName = exists[0].name;

  try {
    const columnsInfo =
      (await prisma.$queryRaw<{ name: string }[]>`
        SELECT name FROM pragma_table_info(${tableName})
      `) ?? [];

    const rows =
      (await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "${tableName}" LIMIT ${MAX_ROWS}`,
      )) ?? [];
    const columns =
      columnsInfo.length > 0
        ? columnsInfo.map((c) => c.name)
        : rows.length > 0
        ? Object.keys(rows[0])
        : [];

    return NextResponse.json({
      table: tableName,
      columns,
      rows,
      limit: MAX_ROWS,
    });
  } catch (error) {
    console.error('[database] fetch table error', error);
    return NextResponse.json({ error: 'Failed to read table' }, { status: 500 });
  }
}
