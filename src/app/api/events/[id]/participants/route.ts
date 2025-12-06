import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);

  if (Number.isNaN(eventId)) {
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

  const { name, org, position, email, phone, foodType } = body as {
    name?: string;
    org?: string;
    position?: string;
    email?: string;
    phone?: string;
    foodType?: 'normal' | 'islam';
  };

  if (!name || !org || !email || !phone) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const normalizedFoodType = foodType === 'islam' ? 'islam' : 'normal';

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

    await prisma.$transaction([
      prisma.participant.create({
        data: {
          eventId,
          name,
          org,
          position: position ?? '',
          email,
          phone,
          foodType: normalizedFoodType,
          status: 'confirmed',
          regDate,
          regTime: now,
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          registered: { increment: 1 },
        },
      }),
    ]);

    return new NextResponse(null, { status: 201 });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
