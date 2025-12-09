// Client-side JWT token management
const TOKEN_KEY = 'jwt_token';

export async function getJWTToken(): Promise<string | null> {
  try {
    // Check if token exists in localStorage
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      // TODO: Check if token is still valid
      try {
        const parts = stored.split('.');
        if (parts.length === 3) {
          const payloadBase64 = parts[1];
          if (payloadBase64) {
            const padded = payloadBase64.padEnd(
              payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
              '=',
            );
            const payloadJson = atob(
              padded.replace(/-/g, '+').replace(/_/g, '/'),
            );
            const payload = JSON.parse(payloadJson) as { exp?: number };

            if (!payload.exp) {
              return stored;
            }

            const now = Math.floor(Date.now() / 1000);
            if (now < payload.exp) {
              return stored;
            }
          }
        }
      } catch {
        // If decoding fails, fall through to fetch a fresh token
      }

      // Token missing, invalid, or expired e clear and fetch a new one
      localStorage.removeItem(TOKEN_KEY);
    }

    // Fetch new token from API (prefer session token, fallback to public token)
    const tryFetch = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const token = data.token as string | undefined;
      if (!token) return null;
      localStorage.setItem(TOKEN_KEY, token);
      return token;
    };

    const sessionToken = await tryFetch('/api/auth/token');
    if (sessionToken) return sessionToken;

    const publicToken = await tryFetch('/api/auth/public-token');
    if (publicToken) return publicToken;
    
    return null;
  } catch (error) {
    console.error('Failed to get JWT token:', error);
    return null;
  }
}

export function clearJWTToken() {
  localStorage.removeItem(TOKEN_KEY);
}
