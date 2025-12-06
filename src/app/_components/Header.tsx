'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { CalendarCheck, ChevronLeft, UserPlus } from 'lucide-react';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const showBack = pathname !== '/';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  const getUserName = () => {
    const rawProfile = (session?.user as any)?.profile as string | undefined;
    if (rawProfile) {
      try {
        const profile = JSON.parse(rawProfile) as any;
        const titleTh = profile?.title_th ?? '';
        const firstTh = profile?.firstname_th ?? '';
        const lastTh = profile?.lastname_th ?? '';
        const nameTh = profile?.name_th ?? '';

        const fullNameParts = [`${titleTh}${firstTh}`.trim(), lastTh].filter(Boolean);
        const fullName = fullNameParts.length > 0 ? fullNameParts.join(' ').trim() : nameTh;
        return fullName || null;
      } catch {
        return null;
      }
    }

    return (session?.user?.name as string | undefined) ?? null;
  };

  const userName = getUserName();

  const handleLogin = () => {
    router.push('/processProviderId');
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/', redirect: true });
  };

  const displayName = userName ?? 'ผู้ใช้งาน';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600 focus:outline-none cursor-pointer"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">ย้อนกลับ</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg shadow-sm">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">PLK-HEALTH Events</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {session && (
            <a
              href="/create-event"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <UserPlus size={16} />
              <span>สร้างกิจกรรม</span>
            </a>
          )}
          {session && (
            <a
              href="/admin"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <CalendarCheck size={16} />
              <span>รายการกิจกรรม</span>
            </a>
          )}
          {userName ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[160px] truncate text-gray-700">{displayName}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-red-600 hover:underline cursor-pointer"
              >
                [ออกระบบ]
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="px-3 py-1.5 rounded-lg border border-emerald-500 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              เข้าระบบ
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
