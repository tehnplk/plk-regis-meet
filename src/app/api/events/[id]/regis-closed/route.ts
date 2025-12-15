import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';

interface Params {
  id: string;
}

export async function PATCH(
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
  if (!requesterProviderId) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const existing = await prisma.event.findUnique({
    where: { id },
    select: { providerIdCreated: true },
  });

  if (!existing) {
    return new NextResponse('Not found', { status: 404 });
  }

  const existingOwner = existing.providerIdCreated;
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

  const { regis_closed } = body as { regis_closed?: boolean };

  if (typeof regis_closed !== 'boolean') {
    return new NextResponse('Invalid regis_closed', { status: 400 });
  }

  try {
    const event = await prisma.event.update({
      where: { id },
      data: {
        regis_closed,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
