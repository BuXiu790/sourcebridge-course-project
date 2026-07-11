import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Registration unavailable" };

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Course Release v1.0"
      title="Public registration is paused"
      description="SourceBridge is currently published as a frontend framework course project. Email verification and public registration will be enabled after custom SMTP is configured."
    >
      <div className="panel p-6 sm:p-7">
        <p className="text-sm leading-6 text-slate-600">
          Course demo accounts are prepared privately for classroom presentation. No account credentials are published on this website.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/login">Return to sign in</ButtonLink>
          <ButtonLink href="/demo" variant="secondary">View public demo</ButtonLink>
        </div>
      </div>
    </AuthShell>
  );
}
