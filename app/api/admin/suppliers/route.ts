import { getApiAuth } from "@/lib/auth";

function optional(value: unknown) { return typeof value === "string" && value.trim() ? value.trim() : null; }

export async function POST(request: Request) {
  const result = await getApiAuth(["operator", "admin"]);
  if (!result.ok) return result.response;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const companyName = optional(body?.companyName);
  if (!companyName) return Response.json({ error: "Company name is required." }, { status: 400 });
  const { data, error } = await result.auth.supabase.from("suppliers").insert({ company_name: companyName, contact_email: optional(body?.contactEmail), location: optional(body?.location), capabilities: optional(body?.capabilities), notes: optional(body?.notes), active: body?.active !== false }).select("id").single();
  if (error || !data) return Response.json({ error: "The supplier could not be created." }, { status: 500 });
  return Response.json({ id: data.id }, { status: 201 });
}
