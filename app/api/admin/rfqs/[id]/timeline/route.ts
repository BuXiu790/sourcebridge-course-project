import { getApiAuth } from "@/lib/auth";
import type { DatabaseRfqStatus } from "@/lib/database.types";
import { DATABASE_RFQ_STATUSES } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getApiAuth(["operator", "admin"]);
  if (!result.ok) return result.response;
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const detail = typeof body?.detail === "string" ? body.detail.trim() : "";
  const status = typeof body?.status === "string" && DATABASE_RFQ_STATUSES.includes(body.status as DatabaseRfqStatus) ? body.status as DatabaseRfqStatus : null;
  if (!title || !detail) return Response.json({ error: "Title and details are required." }, { status: 400 });
  const { error } = await result.auth.supabase.from("timeline_events").insert({ rfq_id: id, status, title, detail, created_by: result.auth.user.id });
  if (error) return Response.json({ error: "The timeline event could not be added." }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
