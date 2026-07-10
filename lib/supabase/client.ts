"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import type { SupabasePublicConfig } from "@/lib/supabase/config";

export function createClient(config: SupabasePublicConfig) {
  return createBrowserClient<Database>(config.url, config.anonKey);
}
