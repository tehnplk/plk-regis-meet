import { Header } from '../_components/event-ui';
import { providerIdProcess } from '../actions/sign-in';
import { prisma } from '@/lib/prisma';

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

  const eventTitle =
    numericEventId && !Number.isNaN(numericEventId)
      ? (
          await prisma.event.findUnique({
            where: { id: numericEventId },
            select: { title: true },
          })
        )?.title ?? null
      : null;

  const landingBase = '/register/by-form';
  const byFormHref = eventId ? `${landingBase}?eventId=${eventId}` : landingBase;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">เลือกวิธีการลงทะเบียน</h2>
        {eventId && (
          <p className="text-gray-600 text-sm">
            สำหรับ eventId: {eventId} {eventTitle ? `(${eventTitle})` : ''}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <form
            action={providerIdProcess}
            className="w-full rounded-lg border border-emerald-300 bg-emerald-100 px-4 py-6 text-left shadow-sm hover:border-emerald-400 hover:shadow-md"
          >
            <input type="hidden" name="landing" value={byFormHref} />
            <input type="hidden" name="is_auth" value="no" />
            <button type="submit" className="text-left w-full">
              <div className="text-lg font-semibold text-gray-900">ลงทะเบียนด้วย Provider</div>
              <p className="mt-1 text-sm text-gray-600">ใช้บัญชีผู้ให้บริการของ MOPH Platform</p>
            </button>
          </form>

          <a
            href={byFormHref}
            className="w-full rounded-lg border border-blue-300 bg-blue-100 px-4 py-6 text-left shadow-sm hover:border-blue-400 hover:shadow-md"
          >
            <div className="text-lg font-semibold text-gray-900">ลงทะเบียนด้วยแบบฟอร์ม</div>
            <p className="mt-1 text-sm text-gray-600">กรอกข้อมูลเข้าร่วมกิจกรรมด้วยตนเอง</p>
          </a>
        </div>
      </main>
    </div>
  );
}
