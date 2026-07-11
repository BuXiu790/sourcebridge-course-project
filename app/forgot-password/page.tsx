import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Course demo limitation"
      title="Password recovery is unavailable"
      description="The course demo does not send recovery emails while custom SMTP is unavailable. No reset request will be submitted from this page."
    >
      <div className="panel p-6 sm:p-7">
        <p className="text-sm leading-6 text-slate-600">
          Custom SMTP and verified email recovery must be configured before a commercial release. For the course demo, return to sign in or create a separate Buyer account with a unique password.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/login">Return to sign in</ButtonLink>
          <ButtonLink href="/signup" variant="secondary">Create Buyer account</ButtonLink>
        </div>
      </div>
    </AuthShell>
  );
}
