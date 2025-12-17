// Client-side JWT token management
import { getApiUrl } from './api';

const TOKEN_KEY = 'jwt_token';

export async function getJWTToken(): Promise<string | null> {
  try {
    const tryFetch = async (url: string) => {
      const res = await fetch(getApiUrl(url));
      if (!res.ok) return null;
      const data = await res.json();
      const token = data.token as string | undefined;
      if (!token) return null;
      localStorage.setItem(TOKEN_KEY, token);
      return token;
    };

    // Check if token exists in localStorage and is still valid
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
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
            const payload = JSON.parse(payloadJson) as {
              exp?: number;
              providerId?: string;
              fullName?: string;
              orgName?: string;
            };

            const now = Math.floor(Date.now() / 1000);

            // If token has no exp, treat it as non-expiring
            if (!payload.exp || now < payload.exp) {
              // If this token already has providerId, prefer it as a privileged token
              if (payload.providerId) {
                // If this is an older token without fullName, try to refresh it from session.
                // This ensures audit fields like providerFullNameCreated are populated.
                if (!payload.fullName || !payload.orgName) {
                  const refreshed = await tryFetch('/api/auth/token');
                  if (refreshed) {
                    return refreshed;
                  }
                }
                return stored;
              }

              // Token is a valid public token (no providerId). Try to upgrade to a
              // session-based token if the user is logged in; if that fails, keep using
              // the public token so read-only endpoints still work.
              const sessionToken = await tryFetch('/api/auth/token');
              if (sessionToken) {
                return sessionToken;
              }

              return stored;
            }
          }
        }
      } catch {
        // If decoding fails, fall through to fetch a fresh token
      }

      // Token invalid or expired – clear and fetch a new one
      localStorage.removeItem(TOKEN_KEY);
    }

    // Fetch new token from API (prefer session token, fallback to public token)

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
