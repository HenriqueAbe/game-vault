export const IGDB_CLIENT_ID = process.env.EXPO_PUBLIC_IGDB_CLIENT_ID;
export const IGDB_CLIENT_SECRET = process.env.EXPO_PUBLIC_IGDB_CLIENT_SECRET;
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const configurado = Boolean(
  IGDB_CLIENT_ID && IGDB_CLIENT_SECRET && SUPABASE_URL && SUPABASE_ANON_KEY
);
