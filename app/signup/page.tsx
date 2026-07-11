import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { getSupabasePublicConfigOrNull } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Create a Buyer account" };
export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Course Release v1.1"
      title="Create a Buyer account"
      description="Create a course demo account to submit and track your own sourcing requests. Every public registration is assigned the Buyer role by the database."
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950" role="note">
          <p className="font-bold">Course demo registration. Email ownership is not verified in this version. Do not reuse a password from another website.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>This account is for course demonstration only.</li>
            <li>Do not enter real sourcing secrets or upload identity, payment, or sensitive files.</li>
            <li>Email confirmation and password recovery will be enabled after custom SMTP is configured.</li>
          </ul>
        </div>
        <AuthForm mode="signup" config={getSupabasePublicConfigOrNull()} />
      </div>
    </AuthShell>
  );
}
