import NextAuth, { type Session, type NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ? `${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth` : '/api/auth',
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 25, // 25 hours
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        console.log("credentials = ", credentials);
        if (credentials['cred-way'] == 'user-pass') {
          // ยังไม่เชื่อมต่อฐานข้อมูลจริง: ให้ login แบบ user-pass ไม่สำเร็จไปก่อน
          /*
           NOTE: โค้ด prisma ด้านล่างถูก comment ไว้ เพื่อให้ build ผ่าน
           แต่ยังเก็บเป็นตัวอย่างเผื่อเชื่อมฐานข้อมูลภายหลัง

           const user = await prisma.user.findUnique({
             where: {
               username: credentials?.username as string,
             },
           });
           if (!user) {
             return null; // ทำให้ auth fail และ redirect กลับหน้า sign-in
           }
           return {
             name: user.username,
             profile: JSON.stringify(user),
             ssj_department: (user as any).ssj_department,
           };
          */

          return null; // จะทำให้ authentication fail และ redirect กลับหน้า sign-in
        }
        return {
          name: 'provider-id',
          profile: credentials.profile!
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {      
        token.profile = (user as any).profile;      
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        (session.user as any).profile = (token as any).profile; // Add user profile to the session
      }
      return session;
    },
  },
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth(authOptions);