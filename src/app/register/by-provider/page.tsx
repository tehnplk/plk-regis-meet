import { Header } from '../../_components/event-ui';
import { providerIdProcess } from '../../actions/sign-in';

interface RegisterByProviderSearchParams {
  eventId?: string | string[];
}

export default async function RegisterByProviderPage({
  searchParams,
}: {
  searchParams: Promise<RegisterByProviderSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawEventId = resolvedSearchParams.eventId;
  const eventId = Array.isArray(rawEventId) ? rawEventId[0] : rawEventId;
  const landingBase = '/register/by-form';
  const landing = eventId ? `${landingBase}?eventId=${eventId}` : landingBase;
  const backHref = eventId ? `/register?eventId=${eventId}` : '/register';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">ลงทะเบียนด้วย Provider</h2>
        {eventId && (
          <p className="text-gray-600 text-sm">eventId: {eventId}</p>
        )}
        <p className="text-gray-600 text-sm">ใช้ Provider ID เชื่อมกับ Health ID เพื่อดึงข้อมูลผู้สมัคร</p>

        <form action={providerIdProcess} className="mt-4 space-y-3">
          <input type="hidden" name="landing" value={landing} />
          <input type="hidden" name="is_auth" value="no" />
          <button
            type="submit"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            สมัครด้วย Provider ID
          </button>
        </form>

        <a
          href={backHref}
          className="mt-4 inline-flex items-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300"
        >
          กลับไปเลือกวิธีสมัคร
        </a>
      </main>
    </div>
  );
}
