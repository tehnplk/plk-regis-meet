import { NextResponse } from "next/server";
import { auth } from "./authConfig";

// Proxy is responsible only for protecting page routes (not API).
// Concept:
// 1) ทุก API endpoint ปกป้องด้วย JWT ภายใน route handler เอง
// 2) page route ที่อยู่ภายใต้ /admin/* ต้องผ่าน NextAuth credential
// 3) ไม่เอา user authentication (NextAuth) ไปยุ่งกับ API

export async function proxy(request: any) {
  const { pathname } = request.nextUrl;
  return NextResponse.next();
  // Protect admin pages using NextAuth session
  if (pathname.startsWith('/admin')) {
    const session = await auth();

    if (!session?.user) {
      // ถ้าไม่มี session ให้ redirect ไป flow login (processProviderId)
      const url = new URL('/processProviderId', request.nextUrl);
      // ส่ง landing กลับมาเพื่อให้ login เสร็จแล้วกลับเข้าหน้าเดิมได้
      url.searchParams.set('landing', pathname + request.nextUrl.search);
      url.searchParams.set('is_auth', 'yes');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Proxy ใช้เฉพาะกับหน้า /admin/* เท่านั้น
export const config = {
  //matcher: ['/admin/:path*'],
};
