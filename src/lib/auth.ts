// Client-side JWT token management
const TOKEN_KEY = 'jwt_token';

export async function getJWTToken(): Promise<string | null> {
  try {
    // Check if token exists in localStorage
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      // TODO: Check if token is still valid
      return stored;
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
