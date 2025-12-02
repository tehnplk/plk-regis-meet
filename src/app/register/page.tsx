'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '../_components/event-ui';

export default function RegisterEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const goToByProvider = () => {
    if (eventId) {
      router.push(`/register/by-provider?eventId=${eventId}`);
    } else {
      router.push('/register/by-provider');
    }
  };

  const goToByForm = () => {
    if (eventId) {
      router.push(`/register/by-form?eventId=${eventId}`);
    } else {
      router.push('/register/by-form');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">เลือกวิธีการลงทะเบียน</h2>
        {eventId && (
          <p className="text-gray-600 text-sm">สำหรับ eventId: {eventId}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={goToByProvider}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-6 text-left shadow-sm hover:border-slate-300 hover:shadow-md"
          >
            <div className="text-lg font-semibold text-gray-900">สมัครด้วย Provider</div>
            <p className="mt-1 text-sm text-gray-600">ใช้บัญชีจากภายนอก เช่น Google, Line ฯลฯ</p>
          </button>

          <button
            type="button"
            onClick={goToByForm}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-6 text-left shadow-sm hover:border-slate-300 hover:shadow-md"
          >
            <div className="text-lg font-semibold text-gray-900">สมัครด้วยแบบฟอร์ม</div>
            <p className="mt-1 text-sm text-gray-600">กรอกข้อมูลผู้เข้าร่วมงานด้วยตัวเอง</p>
          </button>
        </div>
      </main>
    </div>
  );
}
