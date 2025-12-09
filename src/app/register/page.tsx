import { providerIdProcess } from '../actions/sign-in';
import { prisma } from '@/lib/prisma';
import RegisterEntryClient from './RegisterEntryClient';

interface RegisterSearchParams {
  eventId?: string | string[];
}

export default async function RegisterEntryPage({
  searchParams,
}: {
  searchParams: Promise<RegisterSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawEventId = resolvedSearchParams.eventId;
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;
  const numericEventId = eventId ? Number(eventId) : null;

  const eventData =
    numericEventId && !Number.isNaN(numericEventId)
      ? await prisma.event.findUnique({
          where: { id: numericEventId },
          select: {
            title: true,
            registerMethod: true,
            enableCheckInRadius: true,
            checkInRadiusMeters: true,
            latitude: true,
            longitude: true,
          },
        })
      : null;

  const eventTitle = eventData?.title ?? null;
  // registerMethod: 1=provider_id only, 2=form only, 3=both
  const registerMethod = eventData?.registerMethod ?? 3;
  const allowProviderId = registerMethod === 1 || registerMethod === 3;
  const allowForm = registerMethod === 2 || registerMethod === 3;

  const landingBase = '/register/by-form';
  const byFormHref = eventId ? `${landingBase}?eventId=${eventId}` : landingBase;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <RegisterEntryClient
        eventId={eventId}
        eventTitle={eventTitle}
        allowProviderId={allowProviderId}
        allowForm={allowForm}
        byFormHref={byFormHref}
        providerIdAction={providerIdProcess}
        enableCheckInRadius={eventData?.enableCheckInRadius}
        checkInRadiusMeters={eventData?.checkInRadiusMeters}
        eventLatitude={eventData?.latitude}
        eventLongitude={eventData?.longitude}
      />
    </div>
  );
}
