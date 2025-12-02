import { Suspense } from 'react';
import RegisterByFormPageClient from './RegisterByFormPageClient';

export default function RegisterByFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 font-sans text-gray-900 p-6">กำลังโหลดข้อมูลงาน...</div>}>
      <RegisterByFormPageClient />
    </Suspense>
  );
}
