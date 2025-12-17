// Helper to get the correct API base path
export function getApiUrl(path: string): string {
  // In browser, use relative path which respects basePath
  // Next.js automatically handles basePath for internal navigation
  // but fetch() needs manual prefix
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${basePath}${normalizedPath}`;
}
