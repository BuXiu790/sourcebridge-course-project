"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/States";
import type { SupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup" | "forgot" | "reset";

const submitLabels: Record<AuthMode, string> = {
  login: "Sign in",
  signup: "Create buyer account",
  forgot: "Send reset email",
  reset: "Update password",
};

export function AuthForm({
  mode,
  config,
  next = "/dashboard",
  initialMessage,
}: {
  mode: AuthMode;
  config: SupabasePublicConfig | null;
  next?: string;
  initialMessage?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState(initialMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsEmail = mode !== "reset";
  const needsPassword = mode !== "forgot";
  const needsConfirmation = mode === "signup" || mode === "reset";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setMessage(undefined);

    if (!config) {
      setError("Supabase is not configured for this environment yet.");
      return;
    }
    const normalizedEmail = email.trim();
    if (needsEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (needsPassword && password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (needsConfirmation && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient(config);

    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (authError) throw authError;
        router.replace(next);
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        const { data, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: fullName.trim() ? { full_name: fullName.trim() } : {},
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.replace(next);
          router.refresh();
          return;
        }
        setMessage("Check your email to verify your address, then return to sign in.");
      }

      if (mode === "forgot") {
        const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;
        const { error: authError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo,
        });
        if (authError) throw authError;
        setMessage("If an account exists for this email, a password reset link has been sent.");
      }

      if (mode === "reset") {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setMessage("Password updated. Redirecting to your dashboard…");
        window.setTimeout(() => {
          router.replace("/dashboard");
          router.refresh();
        }, 700);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication could not be completed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel overflow-hidden" noValidate>
      <div className="space-y-5 px-5 py-6 sm:px-7 sm:py-7">
        {!config ? (
          <ErrorAlert
            title="Supabase configuration required"
            message="Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable authentication. No credentials have been guessed or embedded."
          />
        ) : null}
        {error ? <ErrorAlert message={error} /> : null}
        {message ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800" role="status">
            {message}
          </div>
        ) : null}

        {mode === "signup" ? (
          <div>
            <label htmlFor="full-name" className="field-label">Full name</label>
            <input
              id="full-name"
              autoComplete="name"
              className="text-field"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Alex Morgan"
            />
          </div>
        ) : null}

        {needsEmail ? (
          <div>
            <label htmlFor="email" className="field-label">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="text-field"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </div>
        ) : null}

        {needsPassword ? (
          <div>
            <label htmlFor="password" className="field-label">
              {mode === "reset" ? "New password" : "Password"}
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              className="text-field"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="field-help">Use at least 8 characters.</p>
          </div>
        ) : null}

        {needsConfirmation ? (
          <div>
            <label htmlFor="confirm-password" className="field-label">Confirm password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="text-field"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
        <Button type="submit" disabled={!config || isSubmitting} className="w-full">
          {isSubmitting ? "Please wait…" : submitLabels[mode]}
        </Button>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
          {mode !== "login" ? <Link className="font-semibold text-blue-700 hover:underline" href="/login">Sign in</Link> : null}
          {mode === "login" ? <Link className="font-semibold text-blue-700 hover:underline" href="/signup">Create account</Link> : null}
          {mode === "login" ? <Link className="font-semibold text-blue-700 hover:underline" href="/forgot-password">Forgot password?</Link> : null}
        </div>
      </div>
    </form>
  );
}
