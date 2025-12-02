'use server'

import { redirect } from 'next/navigation';

export const signInWithHealthId = async (formData: FormData) => {
    const landing = formData.get('landing');
    const clientId = process.env.HEALTH_CLIENT_ID;
    const redirectUri = process.env.HEALTH_REDIRECT_URI;
    const url = `https://moph.id.th/oauth/redirect?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&landing=${landing}`;
    redirect(url);
}
