import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { safeReturnTo } from "@/lib/auth";
import { getSupabasePublicConfigOrNull } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const message = params.error === "auth_callback" ? "The email link could not be verified. Request a new link and try again." : undefined;

  return (
    <AuthShell
      eyebrow="Course Release v1.1"
      title="Sign in to SourceBridge"
      description="Sign in to your course demo Buyer workspace, or create a new Buyer account. Operator and Admin roles remain restricted to approved internal accounts."
    >
      <AuthForm
        mode="login"
        config={getSupabasePublicConfigOrNull()}
        next={safeReturnTo(params.next)}
        initialMessage={message}
      />
    </AuthShell>
  );
}
