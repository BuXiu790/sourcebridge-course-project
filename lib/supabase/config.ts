export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
    this.name = "SupabaseConfigError";
  }
}

export function getSupabasePublicConfig(): SupabasePublicConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) throw new SupabaseConfigError();
  return { url, anonKey };
}

export function getSupabasePublicConfigOrNull(): SupabasePublicConfig | null {
  try {
    return getSupabasePublicConfig();
  } catch (error) {
    if (error instanceof SupabaseConfigError) return null;
    throw error;
  }
}
