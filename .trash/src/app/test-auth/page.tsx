import { signInWithHealthId } from "../actions/sign-in";

export default function TestAuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-bold text-gray-800">ทดสอบ Health ID Auth</h1>
        <p className="text-sm text-gray-600">
          กดปุ่มด้านล่างเพื่อเริ่มกระบวนการเข้าสู่ระบบด้วย Health ID
        </p>
        <form action={signInWithHealthId}>
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            เข้าสู่ระบบด้วย Health ID
          </button>
        </form>
      </div>
    </div>
  );
}
