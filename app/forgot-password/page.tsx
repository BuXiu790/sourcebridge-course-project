import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { getSupabasePublicConfigOrNull } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your account email. If a matching account exists, Supabase will send a secure recovery link."
    >
      <AuthForm mode="forgot" config={getSupabasePublicConfigOrNull()} />
    </AuthShell>
  );
}
