import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { getSupabasePublicConfigOrNull } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create buyer account" };
export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="New buyer account"
      title="Create your SourceBridge account"
      description="New registrations are always created with buyer access. Operator and admin roles can only be assigned through protected administrative workflows."
    >
      <AuthForm mode="signup" config={getSupabasePublicConfigOrNull()} />
    </AuthShell>
  );
}
