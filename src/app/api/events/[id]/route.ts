import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (Number.isNaN(id)) {
    return new NextResponse('Invalid id', { status: 400 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!event) {
      return new NextResponse('Not found', { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (Number.isNaN(id)) {
    return new NextResponse('Invalid id', { status: 400 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return new NextResponse('Invalid payload', { status: 400 });
  }

  const {
    title,
    date,
    endDate,
    time,
    location,
    capacity,
    description,
    status,
    latitude,
    longitude,
    enableCheckInRadius,
    checkInRadiusMeters,
    docLink,
    requiredItems,
  } = body as {
    title?: string;
    date?: string;
    endDate?: string | null;
    time?: string;
    location?: string;
    capacity?: number | string;
    description?: string;
    status?: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
    enableCheckInRadius?: boolean;
    checkInRadiusMeters?: number | string | null;
    docLink?: string | null;
    requiredItems?: string | null;
  };

  const numericCapacity =
    typeof capacity === 'string' ? Number(capacity) : capacity;
  const numericLatitude =
    typeof latitude === 'string' ? Number(latitude) : latitude ?? null;
  const numericLongitude =
    typeof longitude === 'string' ? Number(longitude) : longitude ?? null;
  const numericCheckInRadius =
    typeof checkInRadiusMeters === 'string'
      ? Number(checkInRadiusMeters)
      : checkInRadiusMeters ?? null;

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
    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        date,
        endDate: endDate ?? null,
        time,
        location,
        latitude: numericLatitude,
        longitude: numericLongitude,
        enableCheckInRadius: Boolean(enableCheckInRadius),
        checkInRadiusMeters: numericCheckInRadius,
        capacity: numericCapacity,
        status: eventStatus,
        description,
        docLink,
        requiredItems: requiredItems ?? null,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
