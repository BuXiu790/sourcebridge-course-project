import { getApiAuth } from "@/lib/auth";

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await getApiAuth();
  if (!result.ok) return result.response;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { quoteId?: unknown } | null;
  if (!isUuid(id) || !isUuid(body?.quoteId)) {
    return Response.json({ error: "Invalid RFQ or quote identifier." }, { status: 400 });
  }

  const { data, error } = await result.auth.supabase
    .from("rfqs")
    .update({ selected_quote_id: body.quoteId })
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) {
    return Response.json({ error: "The quote selection is unavailable for this RFQ." }, { status: 403 });
  }
  return Response.json({ ok: true });
}
