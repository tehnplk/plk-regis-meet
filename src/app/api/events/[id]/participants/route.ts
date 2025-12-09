import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

interface Params {
  id: string;
}

async function requireJwt(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }
  const payload = await verifyToken(token);
  if (!payload) return null;
  return payload;
}

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  if (Number.isNaN(eventId)) {
    return new NextResponse('Invalid id', { status: 400 });
  }

  // Require JWT (session or public) to mitigate scraping
  const payload = await requireJwt(request);
  if (!payload) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { participants: true },
  });

  if (!event) {
    return new NextResponse('Event not found', { status: 404 });
  }

  return NextResponse.json({ participants: event.participants });
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  if (Number.isNaN(eventId)) {
    return new NextResponse('Invalid id', { status: 400 });
  }

  const payload = await requireJwt(request);
  if (!payload) {
    return new NextResponse('Unauthorized', { status: 401 });
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

  const { name, org, position, email, phone, foodType, status } = body as {
    name?: string;
    org?: string;
    position?: string;
    email?: string;
    phone?: string;
    foodType?: 'normal' | 'islam';
    status?: 'confirmed' | 'pending' | 'cancelled';
  };

  if (!name || !org || !phone) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const normalizedFoodType = foodType === 'islam' ? 'islam' : 'normal';
  const normalizedStatus: 'confirmed' | 'pending' | 'cancelled' =
    status === 'pending' ? 'pending' : status === 'cancelled' ? 'cancelled' : 'confirmed';

  try {
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) {
      return new NextResponse('Event not found', { status: 404 });
    }

    const now = new Date();
    const regDate = now.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const participant = await prisma.participant.create({
      data: {
        eventId,
        name,
        org,
        position: position ?? '',
        email: email ?? null,
        phone,
        foodType: normalizedFoodType,
        status: normalizedStatus,
        regDate,
        regTime: now,
      },
    });

    await prisma.event.update({
      where: { id: eventId },
      data: {
        registered: { increment: 1 },
      },
    });

    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  if (Number.isNaN(eventId)) {
    return new NextResponse('Invalid id', { status: 400 });
  }

  const payload = await requireJwt(request);
  if (!payload) {
    return new NextResponse('Unauthorized', { status: 401 });
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

  const { participantId, name, org, position, email, phone, foodType, status } = body as {
    participantId?: number;
    name?: string;
    org?: string;
    position?: string;
    email?: string;
    phone?: string;
    foodType?: 'normal' | 'islam';
    status?: 'confirmed' | 'pending' | 'cancelled';
  };

  if (!participantId) {
    return new NextResponse('Missing participantId', { status: 400 });
  }

  const normalizedFoodType = foodType === 'islam' ? 'islam' : 'normal';
  const normalizedStatus: 'confirmed' | 'pending' | 'cancelled' =
    status === 'pending' ? 'pending' : status === 'cancelled' ? 'cancelled' : 'confirmed';

  try {
    const existing = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { eventId: true },
    });
    if (!existing || existing.eventId !== eventId) {
      return new NextResponse('Participant not found', { status: 404 });
    }

    const participant = await prisma.participant.update({
      where: { id: participantId },
      data: {
        name,
        org,
        position: position ?? '',
        email,
        phone,
        foodType: normalizedFoodType,
        status: normalizedStatus,
      },
    });

    return NextResponse.json({ participant });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  if (Number.isNaN(eventId)) {
    return new NextResponse('Invalid id', { status: 400 });
  }

  const payload = await requireJwt(request);
  if (!payload) {
    return new NextResponse('Unauthorized', { status: 401 });
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

  const { participantId } = body as { participantId?: number };
  if (!participantId) {
    return new NextResponse('Missing participantId', { status: 400 });
  }

  try {
    const existing = await prisma.participant.findUnique({
      where: { id: participantId },
      select: { eventId: true },
    });
    if (!existing || existing.eventId !== eventId) {
      return new NextResponse('Participant not found', { status: 404 });
    }

    await prisma.$transaction([
      prisma.participant.delete({ where: { id: participantId } }),
      prisma.event.update({
        where: { id: eventId },
        data: { registered: { decrement: 1 } },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
