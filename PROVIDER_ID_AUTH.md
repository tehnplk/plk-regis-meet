0. สร้าง src/authConfig.ts

1. สร้าง actions/sign-in.ts
```
'use server'
import { redirect } from 'next/navigation';
export const signInWithHealthId = async (formData: FormData) => {    
    const clientId = process.env.HEALTH_CLIENT_ID;
    const redirectUri = process.env.HEALTH_REDIRECT_URI;
    const url = `https://moph.id.th/oauth/redirect?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    redirect(url);
}
```

2. สร้าง api/auth/healthid/route.ts