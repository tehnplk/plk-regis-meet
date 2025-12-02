import { Suspense } from 'react';
import RegisterPageClient from './RegisterPageClient';

// TEAM_001: Standalone registration page wrapper with Suspense.

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 font-sans text-gray-900 p-6">กำลังโหลดข้อมูลงาน...</div>}>
      <RegisterPageClient />
    </Suspense>
  );
}
