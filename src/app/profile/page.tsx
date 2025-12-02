import { auth } from "@/authConfig";

export default async function ProfilePage() {
  const session = await auth();
  const rawProfile = (session?.user as any)?.profile as string | undefined;

  let parsedProfile: unknown = null;

  if (rawProfile) {
    try {
      parsedProfile = JSON.parse(rawProfile);
    } catch {
      parsedProfile = rawProfile;
    }
  }

  const displayData =
    parsedProfile ?? { message: "No provider profile found in session" };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold mb-4">Provider ID Profile (JSON)</h1>
        {!session && (
          <p className="text-sm text-red-500 mb-4">
            ไม่พบ session กรุณาเข้าสู่ระบบผ่าน Health ID ก่อน
          </p>
        )}
        <pre className="text-xs bg-slate-900 text-slate-100 rounded-md p-4 overflow-auto">
{JSON.stringify(displayData, null, 2)}
        </pre>
      </div>
    </main>
  );
}
