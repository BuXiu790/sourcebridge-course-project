import { getApiAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/database.types";

const roles: UserRole[] = ["buyer", "operator", "admin"];

export async function POST(request: Request) {
  const result = await getApiAuth(["admin"]);
  if (!result.ok) return result.response;
  const body = (await request.json().catch(() => null)) as { email?: unknown; role?: unknown } | null;
  if (typeof body?.email !== "string" || typeof body.role !== "string" || !roles.includes(body.role as UserRole)) {
    return Response.json({ error: "Enter a registered email and valid role." }, { status: 400 });
  }
  const { error } = await result.auth.supabase.rpc("set_user_role", { target_email: body.email, new_role: body.role as UserRole });
  if (error) return Response.json({ error: error.message }, { status: 403 });
  return Response.json({ ok: true });
}
