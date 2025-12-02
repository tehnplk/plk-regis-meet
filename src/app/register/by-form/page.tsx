import { Suspense } from 'react';
import { cookies } from 'next/headers';
import RegisterByFormPageClient from './RegisterByFormPageClient';

type InitialProfile = {
  name?: string;
  org?: string;
  position?: string;
  email?: string;
  phone?: string;
};

async function getInitialProfileFromCookie(): Promise<InitialProfile | undefined> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('profile')?.value;
  if (!raw) return undefined;

  try {
    const profile = JSON.parse(raw) as any;
    const org0 = Array.isArray(profile.organization) ? profile.organization[0] : undefined;

    const nameTh: string | undefined = profile.name_th;

    return {
      name: nameTh,
      org: (org0?.hname_th as string) ?? undefined,
      position: (org0?.position as string) ?? undefined,
      email: (profile.email as string) ?? undefined,
    };
  } catch {
    return undefined;
  }
}

export default async function RegisterByFormPage() {
  const initialProfile = await getInitialProfileFromCookie();

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 font-sans text-gray-900 p-6">กำลังโหลดข้อมูลงาน...</div>}>
      <RegisterByFormPageClient initialProfile={initialProfile} />
    </Suspense>
  );
}
