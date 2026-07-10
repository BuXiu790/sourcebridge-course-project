import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { requireUser } from "@/lib/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Choose a new password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const auth = await requireUser("/reset-password");
  const config = getSupabasePublicConfig();

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Choose a new password"
      description="Set a new password for your verified SourceBridge account."
      account={{ email: auth.profile.email, role: auth.profile.role, config }}
    >
      <AuthForm mode="reset" config={config} />
    </AuthShell>
  );
}
