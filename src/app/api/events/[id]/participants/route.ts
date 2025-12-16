import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/jwt';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';

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
    select: {
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

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new NextResponse('Invalid form data', { status: 400 });
  }

  const name = String(form.get('name') ?? '').trim();
  const org = String(form.get('org') ?? '').trim();
  const position = String(form.get('position') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const phone = String(form.get('phone') ?? '').trim();
  const providerId = String(form.get('providerId') ?? '').trim();
  const foodTypeRaw = String(form.get('foodType') ?? '').trim();
  const originDoc = form.get('originDoc');

  if (!name || !org || !phone) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  const normalizedEmail = email;
  const normalizedFoodType = foodTypeRaw === 'islam' ? 'islam' : 'normal';
  const normalizedStatus: 'confirmed' | 'pending' | 'cancelled' = 'confirmed';

  const MAX_DOC_BYTES = 10 * 1024 * 1024;
  const allowedMimes = new Set(['application/pdf', 'image/jpeg', 'image/png']);

  let originDocPath: string | null = null;
  let originDocMime: string | null = null;
  let originDocName: string | null = null;
  let originDocUploadedAt: Date | null = null;
  let originDocBytes: Buffer | null = null;
  let originDocExt: string | null = null;

  if (originDoc instanceof File && originDoc.size > 0) {
    if (originDoc.size > MAX_DOC_BYTES) {
      return new NextResponse('File too large', { status: 413 });
    }
    const mime = (originDoc.type ?? '').toLowerCase();
    if (!allowedMimes.has(mime)) {
      return new NextResponse('Invalid file type', { status: 415 });
    }
    originDocMime = mime;
    originDocName = originDoc.name || null;
    originDocUploadedAt = new Date();

    originDocExt = (() => {
      if (mime === 'application/pdf') return 'pdf';
      if (mime === 'image/jpeg') return 'jpg';
      if (mime === 'image/png') return 'png';
      return 'bin';
    })();

    const ab = await originDoc.arrayBuffer();
    originDocBytes = Buffer.from(ab);
  }

  let createdAbsPath: string | null = null;

  try {
    const now = new Date();
    const regDate = now.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        select: {
          id: true,
          regis_closed: true,
          needOriginApprovePaper: true,
          registered: true,
          capacity: true,
          status: true,
          beginDate: true,
          endDate: true,
        },
      });

      if (!event) {
        return { error: new NextResponse('Event not found', { status: 404 }) } as const;
      }

      const endText = (event.endDate && event.endDate.trim() !== '' ? event.endDate : event.beginDate).trim();
      const endDate = endText ? new Date(endText) : null;
      const isPastEvent = (() => {
        if (!endDate || Number.isNaN(endDate.getTime())) return false;
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        return Date.now() > endOfDay.getTime();
      })();

      const isFull = event.status === 'full' || event.registered >= event.capacity;
      if (event.regis_closed || isFull || isPastEvent) {
        // If already full and not yet marked regis_closed, mark it once.
        if (!event.regis_closed && (isFull || isPastEvent)) {
          await tx.event.update({ where: { id: eventId }, data: { regis_closed: true } });
        }
        return { error: new NextResponse('Registration closed', { status: 403 }) } as const;
      }

      if (event.needOriginApprovePaper && !originDocBytes) {
        return { error: new NextResponse('Missing required document', { status: 400 }) } as const;
      }

      if (originDocBytes && originDocExt) {
        const fileName = `${Date.now()}-${randomUUID()}.${originDocExt}`;
        const relPath = path.posix.join('uploads', 'origin-docs', String(eventId), fileName);
        const absPath = path.join(process.cwd(), ...relPath.split('/'));
        const dir = path.dirname(absPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(absPath, originDocBytes);
        createdAbsPath = absPath;
        originDocPath = relPath;
      }

      const willBeFull = event.registered + 1 >= event.capacity;

      const participant = await tx.participant.create({
        data: {
          eventId,
          name,
          org,
          position: position ?? '',
          email: normalizedEmail,
          phone,
          providerId: providerId && providerId.trim() !== '' ? providerId : null,
          foodType: normalizedFoodType,
          status: normalizedStatus,
          regDate,
          regTime: now,
          originDocPath: originDocPath ?? undefined,
          originDocMime: originDocMime ?? undefined,
          originDocName: originDocName ?? undefined,
          originDocUploadedAt: originDocUploadedAt ?? undefined,
        },
      });

      await tx.event.update({
        where: { id: eventId },
        data: {
          registered: { increment: 1 },
          ...(willBeFull ? { regis_closed: true } : {}),
        },
      });

      return { participant } as const;
    });

    if ('error' in result) {
      if (createdAbsPath) {
        try {
          await fs.unlink(createdAbsPath);
        } catch {
          // ignore
        }
      }
      return result.error;
    }

    return NextResponse.json({ participant: result.participant }, { status: 201 });
  } catch (error) {
    console.error(error);
    if (createdAbsPath) {
      try {
        await fs.unlink(createdAbsPath);
      } catch {
        // ignore
      }
    }
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
