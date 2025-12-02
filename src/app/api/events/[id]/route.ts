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
