import { getApiAuth } from "@/lib/auth";
import type { DatabaseRfqStatus } from "@/lib/database.types";
import { DATABASE_RFQ_STATUSES } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getApiAuth(["operator", "admin"]);
  if (!result.ok) return result.response;
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  if (typeof body?.status !== "string" || !DATABASE_RFQ_STATUSES.includes(body.status as DatabaseRfqStatus)) return Response.json({ error: "Select a valid RFQ status." }, { status: 400 });
  const { data, error } = await result.auth.supabase.from("rfqs").update({ status: body.status as DatabaseRfqStatus }).eq("id", id).select("id").single();
  if (error || !data) return Response.json({ error: "The RFQ status could not be updated." }, { status: 500 });
  return Response.json({ ok: true });
}
