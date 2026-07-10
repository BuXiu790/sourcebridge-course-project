import { getApiAuth } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const result = await getApiAuth(["operator", "admin"]);
  if (!result.ok) return result.response;
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const supplierId = typeof body?.supplierId === "string" ? body.supplierId : "";
  const unitPrice = Number(body?.unitPrice);
  const moq = Number(body?.moq);
  const sampleCost = Number(body?.sampleCost);
  const leadTimeDays = Number(body?.leadTimeDays);
  const packaging = typeof body?.packaging === "string" ? body.packaging.trim() : "";
  const notes = typeof body?.notes === "string" && body.notes.trim() ? body.notes.trim() : null;
  if (!supplierId || !Number.isFinite(unitPrice) || unitPrice <= 0 || !Number.isInteger(moq) || moq < 1 || !Number.isFinite(sampleCost) || sampleCost < 0 || !Number.isInteger(leadTimeDays) || leadTimeDays < 1 || !packaging) return Response.json({ error: "Complete all required quote fields with valid values." }, { status: 400 });
  const { data: supplier } = await result.auth.supabase.from("suppliers").select("id,supplier_code").eq("id", supplierId).eq("active", true).single();
  if (!supplier) return Response.json({ error: "Select an active supplier." }, { status: 400 });
  const { error } = await result.auth.supabase.from("supplier_quotes").insert({ rfq_id: id, supplier_id: supplier.id, supplier_label: supplier.supplier_code, unit_price: unitPrice, moq, sample_cost: sampleCost, lead_time_days: leadTimeDays, packaging, notes, created_by: result.auth.user.id });
  if (error) return Response.json({ error: "The quote could not be added. A supplier can only have one quote per RFQ." }, { status: 500 });
  return Response.json({ ok: true }, { status: 201 });
}
