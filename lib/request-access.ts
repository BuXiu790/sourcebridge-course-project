export type ProtectedAccessDecision = "allow" | "login" | "login-config" | "api-unauthorized" | "api-unavailable";

interface ProtectedAccessInput {
  authenticated: boolean;
  configured: boolean;
  isApi: boolean;
  isProtected: boolean;
}

export function getProtectedAccessDecision({
  authenticated,
  configured,
  isApi,
  isProtected,
}: ProtectedAccessInput): ProtectedAccessDecision {
  if (!isProtected) return "allow";
  if (!configured) return isApi ? "api-unavailable" : "login-config";
  if (!authenticated) return isApi ? "api-unauthorized" : "login";
  return "allow";
}
