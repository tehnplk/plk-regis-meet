import { NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken, type JWTPayload } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  // Require any valid JWT (session or public) so that all API endpoints are consistently protected.
  const token = getTokenFromRequest(request);
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return new NextResponse('Invalid token', { status: 401 });
  }

  try {
    const events = await prisma.event.findMany({
      orderBy: [
        { beginDate: 'asc' },
        { id: 'asc' },
      ],
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

  const {
    title,
    beginDate,
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
    registerMethod,
  } = body as {
    title?: string;
    beginDate?: string;
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
    registerMethod?: number;
  };

  let providerIdCreated: string | null = null;
  const token = getTokenFromRequest(request);
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    return new NextResponse('Invalid token', { status: 401 });
  }
  
  providerIdCreated = payload.providerId ?? null;

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
    !beginDate ||
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
        beginDate,
        endDate: endDate ?? null,
        time,
        location,
        latitude: numericLatitude,
        longitude: numericLongitude,
        enableCheckInRadius: Boolean(enableCheckInRadius),
        checkInRadiusMeters: numericCheckInRadius,
        registered: 0,
        capacity: numericCapacity,
        status: eventStatus,
        description,
        docLink,
        requiredItems: requiredItems ?? null,
        registerMethod: registerMethod ?? 3,
        providerIdCreated: providerIdCreated ?? null,
        datetimeCreated: new Date(),
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
