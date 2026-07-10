import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { Database, ProfileRow, UserRole } from "@/lib/database.types";
import { getSupabasePublicConfigOrNull } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
  profile: ProfileRow;
}

export function safeReturnTo(value: string | undefined, fallback = "/dashboard") {
  if (!value?.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://sourcebridge.local");
    if (url.origin !== "https://sourcebridge.local") return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export async function getCurrentAuth(): Promise<AuthContext | null> {
  if (!getSupabasePublicConfigOrNull()) return null;

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at,updated_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;
  return { supabase, user, profile };
}

export async function requireUser(returnTo: string): Promise<AuthContext> {
  const next = safeReturnTo(returnTo);
  if (!getSupabasePublicConfigOrNull()) {
    redirect(`/login?error=config&next=${encodeURIComponent(next)}`);
  }

  const auth = await getCurrentAuth();
  if (!auth) redirect(`/login?next=${encodeURIComponent(next)}`);
  return auth;
}

export async function requireRole(
  roles: readonly UserRole[],
  returnTo: string,
): Promise<AuthContext> {
  const auth = await requireUser(returnTo);
  if (!roles.includes(auth.profile.role)) {
    redirect("/dashboard?error=forbidden");
  }
  return auth;
}

export async function requireStaff(returnTo: string) {
  return requireRole(["operator", "admin"], returnTo);
}

export async function getApiAuth(roles?: readonly UserRole[]) {
  if (!getSupabasePublicConfigOrNull()) {
    return {
      ok: false as const,
      response: Response.json({ error: "Supabase is not configured." }, { status: 503 }),
    };
  }

  const auth = await getCurrentAuth();
  if (!auth) {
    return {
      ok: false as const,
      response: Response.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  if (roles && !roles.includes(auth.profile.role)) {
    return {
      ok: false as const,
      response: Response.json({ error: "Insufficient permissions." }, { status: 403 }),
    };
  }

  return { ok: true as const, auth };
}
