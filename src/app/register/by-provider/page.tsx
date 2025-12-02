'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../../_components/event-ui';

export default function RegisterByProviderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const goBack = () => {
    if (eventId) {
      router.push(`/register?eventId=${eventId}`);
    } else {
      router.push('/register');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">ลงทะเบียนด้วย Provider</h2>
        {eventId && (
          <p className="text-gray-600 text-sm">eventId: {eventId}</p>
        )}
        <p className="text-gray-600 text-sm">ใส่ปุ่ม provider ที่นี่ (Google / Line / ฯลฯ)</p>
        <button
          type="button"
          onClick={goBack}
          className="mt-4 inline-flex items-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300"
        >
          กลับไปเลือกวิธีสมัคร
        </button>
      </main>
    </div>
  );
}
