import assert from "node:assert/strict";
import test from "node:test";
import { getProtectedAccessDecision } from "../lib/request-access.ts";

test("fails closed with 503 or a configuration-aware login redirect when Supabase is unavailable", () => {
  assert.equal(
    getProtectedAccessDecision({ authenticated: false, configured: false, isApi: true, isProtected: true }),
    "api-unavailable",
  );
  assert.equal(
    getProtectedAccessDecision({ authenticated: false, configured: false, isApi: false, isProtected: true }),
    "login-config",
  );
});

test("returns 401 or redirects to login for anonymous users when Supabase is configured", () => {
  assert.equal(
    getProtectedAccessDecision({ authenticated: false, configured: true, isApi: true, isProtected: true }),
    "api-unauthorized",
  );
  assert.equal(
    getProtectedAccessDecision({ authenticated: false, configured: true, isApi: false, isProtected: true }),
    "login",
  );
});

test("allows public routes and authenticated access", () => {
  assert.equal(
    getProtectedAccessDecision({ authenticated: false, configured: false, isApi: false, isProtected: false }),
    "allow",
  );
  assert.equal(
    getProtectedAccessDecision({ authenticated: true, configured: true, isApi: false, isProtected: true }),
    "allow",
  );
});
