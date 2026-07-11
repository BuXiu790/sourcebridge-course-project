import { getSupabasePublicConfigOrNull } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { validateSignup } from "@/lib/validate-signup";

function authErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null || !("status" in error)) return undefined;
  return typeof error.status === "number" ? error.status : undefined;
}

function signupErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const status = authErrorStatus(error);

  if (status === 429 || message.includes("rate") || message.includes("too many")) {
    return Response.json(
      { code: "RATE_LIMITED", error: "Too many attempts. Wait a few minutes and try again." },
      { status: 429 },
    );
  }
  if (message.includes("already registered") || message.includes("already exists")) {
    return Response.json(
      { code: "EMAIL_REGISTERED", error: "An account already exists for this email. Sign in instead." },
      { status: 409 },
    );
  }
  if (message.includes("signup") && (message.includes("disabled") || message.includes("not allowed"))) {
    return Response.json(
      { code: "SIGNUP_DISABLED", error: "Course demo registration is currently unavailable." },
      { status: 403 },
    );
  }
  if (message.includes("password")) {
    return Response.json(
      { code: "PASSWORD_REJECTED", error: "Use a stronger password with at least 8 characters." },
      { status: 400 },
    );
  }
  if (status && status >= 500) {
    return Response.json(
      { code: "AUTH_UNAVAILABLE", error: "Registration is temporarily unavailable. Try again shortly." },
      { status: 502 },
    );
  }

  return Response.json(
    { code: "REGISTRATION_FAILED", error: "The account could not be created. Check your details and try again." },
    { status: 500 },
  );
}

export async function POST(request: Request) {
  if (!getSupabasePublicConfigOrNull()) {
    return Response.json(
      { code: "SUPABASE_UNAVAILABLE", error: "Registration is unavailable because Supabase is not configured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ code: "INVALID_JSON", error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateSignup(body);
  if (!validated.ok) {
    return Response.json({ code: validated.code, error: validated.error }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) return signupErrorResponse(error);
  if (!data.user || !data.session) {
    return Response.json(
      {
        code: "SESSION_UNAVAILABLE",
        error: "Automatic sign-in is unavailable. Contact the course demo administrator.",
      },
      { status: 503 },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile || profile.role !== "buyer") {
    await supabase.auth.signOut();
    return Response.json(
      { code: "PROFILE_FAILED", error: "The Buyer profile could not be initialized safely." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, redirectTo: "/dashboard" }, { status: 201 });
}
