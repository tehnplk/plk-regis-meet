import { providerIdProcess } from "../actions/sign-in";

interface LoginSearchParams {
  callbackUrl?: string | string[];
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawCallback = resolvedSearchParams.callbackUrl;
  const callbackUrl = Array.isArray(rawCallback)
    ? rawCallback[0]
    : rawCallback;

  const landing = callbackUrl || "/profile";

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="p-6 rounded-lg shadow bg-white space-y-4 text-center">
        <h1 className="text-lg font-semibold">Login</h1>
        <p className="text-sm text-gray-600">
          เข้าสู่ระบบด้วย Provider ID / Health ID
        </p>
        <form action={providerIdProcess} className="space-y-3">
          <input type="hidden" name="landing" value={landing} />
          <input type="hidden" name="is_auth" value="yes" />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in with Health ID
          </button>
        </form>
      </div>
    </main>
  );
}
