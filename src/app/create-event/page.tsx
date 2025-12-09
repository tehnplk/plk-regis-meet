'use client';

// TEAM_001: Simple create-event page (placeholder UI for future implementation).
// Legacy route: redirect to the new admin route /admin/create-event while preserving query string.

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function LegacyCreateEventRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    const target = qs ? `/admin/create-event?${qs}` : '/admin/create-event';
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
      กำลังเปลี่ยนไปยังหน้า /admin/create-event ...
    </div>
  );
}
