import PosterCardClient from './PosterCardClient';
import { prisma } from '@/lib/prisma';

type PosterSearchParams = {
  eventId?: string | string[];
};

export default async function PosterPage({
  searchParams,
}: {
  searchParams: Promise<PosterSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawEventId = resolvedSearchParams.eventId;
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;
  const numericEventId = eventId ? Number(eventId) : null;

  const event =
    numericEventId && !Number.isNaN(numericEventId)
      ? await prisma.event.findUnique({
          where: { id: numericEventId },
          select: {
            id: true,
            title: true,
            beginDate: true,
            endDate: true,
            time: true,
            location: true,
            registered: true,
            capacity: true,
            status: true,
            description: true,
            requiredItems: true,
            docLink: true,
          },
        })
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 text-gray-900">
      <main className="max-w-4xl mx-auto p-6">
        {!event && (
          <div className="rounded-xl border border-emerald-200 bg-white/70 px-4 py-6 shadow-sm text-center text-gray-700">
            {eventId
              ? 'ไม่พบข้อมูลงานนี้'
              : 'โปรดระบุ eventId ใน query string เช่น /poster?eventId=1'}
          </div>
        )}

        {event && <PosterCardClient event={event} />}
      </main>
    </div>
  );
}
