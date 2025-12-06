import Image from 'next/image';
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
        {eventId && (
          <div className="rounded-xl border-2 border-emerald-500 px-4 py-3 shadow-sm">
            <p className="text-lg font-semibold text-emerald-900">เลือกวิธีลงทะเบียนสำหรับ</p>
            <p className="text-2xl font-black text-emerald-950">
              eventId: {eventId}{' '}
              {eventTitle ? (
                <span className="ml-2 text-xl font-semibold text-emerald-800">({eventTitle})</span>
              ) : (
                ''
              )}
            </p>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <form
            action={providerIdProcess}
            className="w-full rounded-lg border border-emerald-300 bg-emerald-100 px-4 py-6 text-left shadow-sm hover:border-emerald-400 hover:shadow-md cursor-pointer"
          >
            <input type="hidden" name="landing" value={byFormHref} />
            <input type="hidden" name="is_auth" value="no" />
            <button
              type="submit"
              className="block w-full cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/images/provider_id.png"
                  alt="Provider ID"
                  width={64}
                  height={64}
                  className="h-14 w-14 rounded-md border border-emerald-200 bg-white object-contain p-1 shadow-sm"
                />
                <div>
                  <div className="text-lg font-semibold text-gray-900">ลงทะเบียนด้วย Provider ID</div>
                  <p className="mt-1 text-sm text-gray-600">ใช้บัญชีผู้ให้บริการของ MOPH Platform</p>
                </div>
              </div>
            </button>
          </form>

          <a
            href={byFormHref}
            className="w-full rounded-lg border border-blue-300 bg-blue-100 px-4 py-6 text-left shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Image
                src="/images/google-forms.png"
                alt="แบบฟอร์ม"
                width={64}
                height={64}
                className="h-14 w-14 rounded-md border border-blue-200 bg-white object-contain p-1 shadow-sm"
              />
              <div>
                <div className="text-lg font-semibold text-gray-900">ลงทะเบียนด้วยแบบฟอร์ม</div>
                <p className="mt-1 text-sm text-gray-600">กรอกข้อมูลเข้าร่วมกิจกรรมด้วยตนเอง</p>
              </div>
            </div>
          </a>
        </div>
      </main>
    </div>
  );
}
