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
      eyebrow="Course demo accounts only"
      title="Sign in to SourceBridge"
      description="Use an instructor-approved course demo account to access private sourcing requests, comparable quotes, production milestones, and administration tools. Public registration is disabled for Course Release v1.0."
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
