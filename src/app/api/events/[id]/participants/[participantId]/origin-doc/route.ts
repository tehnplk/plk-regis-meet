import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';
import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

interface Params {
  id: string;
  participantId: string;
}

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const eventId = Number(resolvedParams.id);
  const participantId = Number(resolvedParams.participantId);

  if (Number.isNaN(eventId) || Number.isNaN(participantId)) {
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

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { providerIdCreated: true },
  });

  if (!event) {
    return new NextResponse('Event not found', { status: 404 });
  }

  if (!requesterProviderId || String(event.providerIdCreated ?? '') !== String(requesterProviderId)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
    select: {
      eventId: true,
      originDocPath: true,
      originDocMime: true,
      originDocName: true,
    },
  });

  if (!participant || participant.eventId !== eventId) {
    return new NextResponse('Participant not found', { status: 404 });
  }

  if (!participant.originDocPath) {
    return new NextResponse('Document not found', { status: 404 });
  }

  if (participant.originDocPath.includes('..')) {
    return new NextResponse('Invalid document path', { status: 400 });
  }

  const absPath = path.join(process.cwd(), ...participant.originDocPath.split('/'));

  let file: Buffer;
  try {
    file = await fs.readFile(absPath);
  } catch {
    return new NextResponse('Document not found', { status: 404 });
  }

  const headers = new Headers();
  headers.set('Content-Type', participant.originDocMime || 'application/octet-stream');

  const safeName = (participant.originDocName || 'document')
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 120);
  headers.set('Content-Disposition', `inline; filename="${safeName}"`);

  const body = new Uint8Array(file);
  return new NextResponse(body, { status: 200, headers });
}
