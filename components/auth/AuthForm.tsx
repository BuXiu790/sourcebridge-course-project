"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/States";
import type { SupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup" | "reset";

const submitLabels: Record<AuthMode, string> = {
  login: "Sign in",
  signup: "Create buyer account",
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState(initialMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsEmail = mode !== "reset";
  const needsPassword = true;
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
    if (mode === "signup" && !acceptedPrivacy) {
      setError("Agree to the course demo privacy notice before creating an account.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            confirmPassword,
            acceptedPrivacy,
          }),
        });
        const result: unknown = await response.json().catch(() => null);
        const responseError =
          typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
            ? result.error
            : "The account could not be created.";
        if (!response.ok) throw new Error(responseError);

        setMessage("Buyer account created. Opening your dashboard...");
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      const supabase = createClient(config);
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (authError) throw authError;
        router.replace(next);
        router.refresh();
        return;
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
      setError(
        authError instanceof TypeError
          ? "A network error interrupted the request. Check your connection and try again."
          : authError instanceof Error
            ? authError.message
            : "Authentication could not be completed.",
      );
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
          <div className="relative">
            <label htmlFor="password" className="field-label">
              {mode === "reset" ? "New password" : "Password"}
            </label>
            <input
              id="password"
              type={showPasswords ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              className="text-field pr-20"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-10 rounded px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              aria-pressed={showPasswords}
              onClick={() => setShowPasswords((visible) => !visible)}
            >
              {showPasswords ? "Hide" : "Show"}
            </button>
            <p className="field-help">Use at least 8 characters.</p>
          </div>
        ) : null}

        {needsConfirmation ? (
          <div>
            <label htmlFor="confirm-password" className="field-label">Confirm password</label>
            <input
              id="confirm-password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              className="text-field"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        ) : null}

        {mode === "signup" ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                checked={acceptedPrivacy}
                onChange={(event) => setAcceptedPrivacy(event.target.checked)}
                required
              />
              <span>
                I agree to the course demo privacy notice and understand that this account must not be used for real purchasing secrets, identity documents, payment information, or sensitive files.
              </span>
            </label>
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
        <Button type="submit" disabled={!config || isSubmitting} className="w-full">
          {isSubmitting ? "Please wait…" : submitLabels[mode]}
        </Button>
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-600">
          {mode !== "login" ? <Link className="font-semibold text-blue-700 hover:underline" href="/login">Already have an account? Sign in</Link> : null}
          {mode === "login" ? <Link className="font-semibold text-blue-700 hover:underline" href="/signup">Create account</Link> : null}
          {mode === "login" ? <span className="text-slate-500">Password recovery unavailable</span> : null}
        </div>
      </div>
    </form>
  );
}
