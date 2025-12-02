import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return new NextResponse('Invalid payload', { status: 400 });
  }

  const { title, date, endDate, time, location, capacity, description, status } = body as {
    title?: string;
    date?: string;
    endDate?: string | null;
    time?: string;
    location?: string;
    capacity?: number | string;
    description?: string;
    status?: string;
  };

  const numericCapacity =
    typeof capacity === 'string' ? Number(capacity) : capacity;

  if (
    !title ||
    !date ||
    !time ||
    !location ||
    numericCapacity == null ||
    Number.isNaN(numericCapacity) ||
    !description
  ) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const eventStatus = status && typeof status === 'string' ? status : 'scheduled';

  try {
    const event = await prisma.event.create({
      data: {
        title,
        date,
        endDate: endDate ?? null,
        time,
        location,
        registered: 0,
        capacity: numericCapacity,
        status: eventStatus,
        description,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
