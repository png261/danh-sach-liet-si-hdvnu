// Supabase Storage CDN base URL for public assets
export const STORAGE_URL =
  "https://lclvxneuknlwkwsatnwm.supabase.co/storage/v1/object/public/assets";

/** Returns the full CDN URL for a given asset filename */
export function asset(filename: string): string {
  return `${STORAGE_URL}/${filename}`;
}
