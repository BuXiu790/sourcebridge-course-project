import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { safeReturnTo } from "@/lib/auth";
import { SupabaseConfigError } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const allowedOtpTypes: EmailOtpType[] = [
  "email",
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeReturnTo(url.searchParams.get("next") ?? undefined);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  try {
    const supabase = await createClient();
    let error: Error | null = null;

    if (code) {
      const result = await supabase.auth.exchangeCodeForSession(code);
      error = result.error;
    } else if (tokenHash && type && allowedOtpTypes.includes(type)) {
      const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      error = result.error;
    } else {
      error = new Error("Missing or invalid authentication callback parameters.");
    }

    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return NextResponse.redirect(new URL("/login?error=config", url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback", url.origin));
}
