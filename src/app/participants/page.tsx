import { Suspense } from 'react';
import ParticipantsPageClient from './ParticipantsPageClient';

// TEAM_001: Participants page wrapper with Suspense for useSearchParams.

export default function ParticipantsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 font-sans text-gray-900 p-6">กำลังโหลดข้อมูลผู้เข้าร่วม...</div>}>
      <ParticipantsPageClient />
    </Suspense>
  );
}
