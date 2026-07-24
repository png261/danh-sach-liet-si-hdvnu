// Static assets base URL served via Vercel/Next.js CDN (0 Supabase Storage egress)
export const STORAGE_URL = "";

/** Returns the full CDN/local URL for a given asset filename */
export function asset(filename: string): string {
  const clean = filename.replace(/^\//, "");
  return `/${clean}`;
}

