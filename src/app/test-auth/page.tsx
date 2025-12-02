import { signInWithHealthId } from "../actions/sign-in";

export default function TestAuthPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="p-6 rounded-lg shadow bg-white space-y-4 text-center">
        <h1 className="text-lg font-semibold">Test Auth</h1>
        <p className="text-sm text-gray-600">ทดสอบ Sign in ด้วย Health ID</p>
        <form action={signInWithHealthId}>
          <input type="hidden" name="landing" value="/profile" />
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
