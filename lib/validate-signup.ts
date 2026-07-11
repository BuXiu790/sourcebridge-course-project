export interface SignupInput {
  email: string;
  password: string;
  confirmPassword: string;
  acceptedPrivacy: boolean;
}

export type SignupValidationResult =
  | { ok: true; data: SignupInput }
  | { ok: false; code: string; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const privilegedFields = ["role", "is_admin", "operator", "supplier"] as const;

export function validateSignup(value: unknown): SignupValidationResult {
  if (!isRecord(value)) {
    return { ok: false, code: "INVALID_BODY", error: "Enter your registration details." };
  }

  if (privilegedFields.some((field) => field in value)) {
    return {
      ok: false,
      code: "PRIVILEGED_FIELD",
      error: "Registration role fields are not accepted.",
    };
  }

  const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
  const password = typeof value.password === "string" ? value.password : "";
  const confirmPassword =
    typeof value.confirmPassword === "string" ? value.confirmPassword : "";
  const acceptedPrivacy = value.acceptedPrivacy === true;

  if (!email || !password || !confirmPassword) {
    return { ok: false, code: "REQUIRED", error: "Complete all required fields." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, code: "INVALID_EMAIL", error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return {
      ok: false,
      code: "PASSWORD_TOO_SHORT",
      error: "Use at least 8 characters for your password.",
    };
  }
  if (password !== confirmPassword) {
    return { ok: false, code: "PASSWORD_MISMATCH", error: "Passwords do not match." };
  }
  if (!acceptedPrivacy) {
    return {
      ok: false,
      code: "PRIVACY_REQUIRED",
      error: "Agree to the course demo privacy notice before creating an account.",
    };
  }

  return {
    ok: true,
    data: { email, password, confirmPassword, acceptedPrivacy },
  };
}
