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

    // Fetch new token from API
    const res = await fetch('/api/auth/token');
    if (res.ok) {
      const data = await res.json();
      const token = data.token;
      
      // Store in localStorage
      localStorage.setItem(TOKEN_KEY, token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get JWT token:', error);
    return null;
  }
}

export function clearJWTToken() {
  localStorage.removeItem(TOKEN_KEY);
}
