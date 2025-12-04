module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/authConfig.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "handlers",
    ()=>handlers,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth/core/providers/credentials.js [app-route] (ecmascript)");
;
;
const authOptions = {
    session: {
        strategy: 'jwt',
        maxAge: 60 * 60 * 25
    },
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])({
            async authorize (credentials) {
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
          */ return null; // จะทำให้ authentication fail และ redirect กลับหน้า sign-in
                }
                return {
                    name: 'provider-id',
                    profile: credentials.profile
                };
            }
        })
    ],
    callbacks: {
        async jwt ({ token, user }) {
            if (user) {
                token.profile = user.profile;
            }
            return token;
        },
        async session ({ session, token }) {
            if (token && session.user) {
                session.user.profile = token.profile; // Add user profile to the session
            }
            return session;
        }
    }
};
const { handlers, auth, signIn, signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])(authOptions);
}),
"[project]/src/app/api/auth/healthid/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$authConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/authConfig.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');
    const landing = searchParams.get('landing');
    const is_auth = searchParams.get('is_auth') === 'yes';
    const redirectTo = landing || '/';
    if (!code) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Authorization code is missing'
        }, {
            status: 400
        });
    }
    console.log("Authorization Health id Code :", code);
    const response = await fetch('https://moph.id.th/api/v1/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.HEALTH_REDIRECT_URI,
            client_id: process.env.HEALTH_CLIENT_ID,
            client_secret: process.env.HEALTH_CLIENT_SECRET
        })
    });
    const data = await response.json();
    if (!response.ok) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: data.error || 'Failed to fetch Health ID token'
        }, {
            status: response.status
        });
    }
    // Removed sensitive data logging for security
    const userResponse = await fetch('https://provider.id.th/api/v1/services/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: process.env.PROVIDER_CLIENT_ID,
            secret_key: process.env.PROVIDER_CLIENT_SECRET,
            token_by: 'Health ID',
            token: data.data.access_token
        })
    });
    const userData = await userResponse.json();
    // Removed sensitive data logging for security
    if (!userResponse.ok) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: userData.error || 'Failed to fetch provider data'
        }, {
            status: userResponse.status
        });
    }
    const profileResponse = await fetch('https://provider.id.th/api/v1/services/profile?position_type=1', {
        method: 'GET',
        headers: {
            'client-id': process.env.PROVIDER_CLIENT_ID,
            'secret-key': process.env.PROVIDER_CLIENT_SECRET,
            'Authorization': `Bearer ${userData.data.access_token}`
        }
    });
    const profileData = await profileResponse.json();
    // Removed sensitive data logging for security
    if (!profileResponse.ok) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: profileData.error || 'Failed to fetch profile data'
        }, {
            status: profileResponse.status
        });
    }
    if (!is_auth) {
        //เก็บ profileData.data ลง session
        //redirectpage ไปที่ตัวแปร landing
        const res = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(redirectTo, request.url));
        res.cookies.set('profile', JSON.stringify(profileData.data), {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 10
        });
        return res;
    }
    const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$authConfig$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["signIn"])('credentials', {
        'cred-way': 'provider-id',
        'profile': JSON.stringify(profileData.data),
        redirectTo: redirectTo
    });
    console.log("res sign in = ", res);
    // Return the signIn result to ensure proper route handler response
    return res;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e13477e2._.js.map