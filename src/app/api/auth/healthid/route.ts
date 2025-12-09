import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signIn } from '@/authConfig'
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code');
    const landing = searchParams.get('landing')
    const is_auth = searchParams.get('is_auth') === 'yes';
    const redirectTo = landing || '/';

    if (!code) {
        return NextResponse.json({ error: 'Authorization code is missing' }, { status: 400 });
    }
    console.log("Authorization Health id Code :", code);

    const response = await fetch('https://moph.id.th/api/v1/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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
        return NextResponse.json({ error: data.error || 'Failed to fetch Health ID token' }, { status: response.status });
    }
    // Removed sensitive data logging for security


    const userResponse = await fetch('https://provider.id.th/api/v1/services/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            client_id: process.env.PROVIDER_CLIENT_ID,
            secret_key: process.env.PROVIDER_CLIENT_SECRET, // Changed from PROVIDER_SECRET_KEY
            token_by: 'Health ID',
            token: data.data.access_token
        })
    });
    const userData = await userResponse.json();
    // Removed sensitive data logging for security
    if (!userResponse.ok) {
        return NextResponse.json({ error: userData.error || 'Failed to fetch provider data' }, { status: userResponse.status });
    }

    const profileResponse = await fetch('https://provider.id.th/api/v1/services/profile?position_type=1', {
        method: 'GET',
        headers: {
            'client-id': process.env.PROVIDER_CLIENT_ID!,
            'secret-key': process.env.PROVIDER_CLIENT_SECRET!,
            'Authorization': `Bearer ${userData.data.access_token}`
        }

    });
    const profileData = await profileResponse.json();
    // Removed sensitive data logging for security
    if (!profileResponse.ok) {
        return NextResponse.json({ error: profileData.error || 'Failed to fetch profile data' }, { status: profileResponse.status });
    }

    const providerId = (profileData?.data as any)?.provider_id;
    const titleTh = (profileData?.data as any)?.title_th ?? '';
    const firstnameTh = (profileData?.data as any)?.firstname_th ?? '';
    const lastnameTh = (profileData?.data as any)?.lastname_th ?? '';
    const fullname = `${titleTh}${firstnameTh} ${lastnameTh}`.trim();
    const organizationRaw = (profileData?.data as any)?.organization ?? [];
    const organization = Array.isArray(organizationRaw)
        ? organizationRaw.map((org: any) => ({
            hcode: org?.hcode ?? null,
            hname_th: org?.hname_th ?? null,
        }))
        : [];

    if (!providerId || !fullname) {
        return NextResponse.json(
            { error: 'Missing providerId or fullname from profile data' },
            { status: 502 },
        );
    }

    try {
        await prisma.loginLog.create({
            data: {
                providerId: String(providerId),
                fullname: String(fullname),
                organization: organization as any,
            },
        });
    } catch (err) {
        console.error('[healthid] login log failed', err);
    }

    if (!is_auth) {
        //เก็บ profileData.data ลง session
        //redirectpage ไปที่ตัวแปร landing
        // เชคว่า NEXT_PUBLIC_SITE_URL ที่ env.production มั้ย 
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.url;
        const res = NextResponse.redirect(new URL(redirectTo, baseUrl));

        const isSecure = request.nextUrl.protocol === 'https:';
        res.cookies.set('profile', JSON.stringify(profileData.data), {
            httpOnly: true,
            secure: isSecure,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 10, // 10 minutes
        });
        return res;
    }
    
    const res = await signIn('credentials', {
        'cred-way': 'provider-id',
        'profile': JSON.stringify(profileData.data),
        redirectTo: redirectTo
    });
    console.log("res sign in = ", res);
    
    // Return the signIn result to ensure proper route handler response
    return res;
}