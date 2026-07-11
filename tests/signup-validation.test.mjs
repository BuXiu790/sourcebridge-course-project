import assert from "node:assert/strict";
import test from "node:test";
import { validateSignup } from "../lib/validate-signup.ts";

function validSignup() {
  return {
    email: "  student@example.com ",
    password: "unique-course-password",
    confirmPassword: "unique-course-password",
    acceptedPrivacy: true,
  };
}

test("accepts and normalizes a complete Buyer registration", () => {
  const result = validateSignup(validSignup());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.email, "student@example.com");
  assert.equal(result.data.acceptedPrivacy, true);
});

test("rejects missing fields, invalid email, and short passwords", () => {
  assert.equal(validateSignup({}).ok, false);

  const invalidEmail = validSignup();
  invalidEmail.email = "not-an-email";
  assert.deepEqual(validateSignup(invalidEmail), {
    ok: false,
    code: "INVALID_EMAIL",
    error: "Enter a valid email address.",
  });

  const shortPassword = validSignup();
  shortPassword.password = "short";
  shortPassword.confirmPassword = "short";
  assert.equal(validateSignup(shortPassword).ok, false);
});

test("rejects password mismatch and missing privacy consent", () => {
  const mismatch = validSignup();
  mismatch.confirmPassword = "different-password";
  assert.equal(validateSignup(mismatch).ok, false);

  const noConsent = validSignup();
  noConsent.acceptedPrivacy = false;
  assert.deepEqual(validateSignup(noConsent), {
    ok: false,
    code: "PRIVACY_REQUIRED",
    error: "Agree to the course demo privacy notice before creating an account.",
  });
});

test("rejects every client-supplied privileged registration field", () => {
  for (const field of ["role", "is_admin", "operator", "supplier"]) {
    const attemptedEscalation = { ...validSignup(), [field]: "admin" };
    const result = validateSignup(attemptedEscalation);
    assert.equal(result.ok, false, field);
    if (!result.ok) assert.equal(result.code, "PRIVILEGED_FIELD", field);
  }
});
