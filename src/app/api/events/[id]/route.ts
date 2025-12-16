import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken, type JWTPayload } from '@/lib/jwt';

interface Params {
  id: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  if (Number.isNaN(id)) {
    return new NextResponse('Invalid id', { status: 400 });
  }

  // Require any valid JWT (session or public) to mitigate scraping; public token is allowed.
  const token = getTokenFromRequest(request);
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return new NextResponse('Invalid token', { status: 401 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        beginDate: true,
        endDate: true,
        time: true,
        location: true,
        latitude: true,
        longitude: true,
        enableCheckInRadius: true,
        regis_closed: true,
        needOriginApprovePaper: true,
        checkInRadiusMeters: true,
        registered: true,
        capacity: true,
        status: true,
        description: true,
        docLink: true,
        requiredItems: true,
        secretPass: true,
        preTestLink: true,
        posTestLink: true,
        registerMethod: true,
        providerIdCreated: true,
        providerFullNameCreated: true,
        providerOrgNameCreated: true,
        datetimeCreated: true,
        participants: {
          select: {
            id: true,
            eventId: true,
            name: true,
            org: true,
            position: true,
            email: true,
            phone: true,
            providerId: true,
            foodType: true,
            status: true,
            regDate: true,
            regTime: true,
            originDocPath: true,
            originDocMime: true,
            originDocName: true,
            originDocUploadedAt: true,
          },
        },
      },
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

  const token = getTokenFromRequest(request);
  if (!token) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    return new NextResponse('Invalid token', { status: 401 });
  }
  
  const requesterProviderId = payload.providerId ?? null;

  const existing = await prisma.event.findUnique({
    where: { id },
    select: { providerIdCreated: true },
  });

  if (!existing) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Require a real providerId for all edits (public token cannot edit)
  if (!requesterProviderId) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const existingOwner = existing.providerIdCreated;

  // If an owner is already set and does not match the requester, forbid edit
  if (existingOwner && existingOwner !== String(requesterProviderId)) {
    return new NextResponse('Forbidden', { status: 403 });
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
    preTestLink,
    posTestLink,
    registerMethod,
    needOriginApprovePaper,
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
    preTestLink?: string | null;
    posTestLink?: string | null;
    registerMethod?: number;
    needOriginApprovePaper?: boolean;
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
    const event = await prisma.event.update({
      where: { id },
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
        capacity: numericCapacity,
        status: eventStatus,
        description,
        docLink,
        requiredItems: requiredItems ?? null,
        preTestLink,
        posTestLink,
        registerMethod: registerMethod ?? 3,
        ...(typeof needOriginApprovePaper === 'boolean'
          ? { needOriginApprovePaper }
          : {}),
        // If this event did not yet have an owner, claim it for the current provider
        ...(existingOwner ? {} : { providerIdCreated: String(requesterProviderId) }),
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
