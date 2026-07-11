import { getApiAuth } from "@/lib/auth";
import { COURSE_RFQ_LIMIT, COURSE_RFQ_LIMIT_MESSAGE } from "@/lib/course-limits";
import { validateSourcingRequest } from "@/lib/validate-sourcing-request";

export async function POST(request: Request) {
  const result = await getApiAuth();
  if (!result.ok) return result.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validated = validateSourcingRequest(body);
  if (!validated.ok) return Response.json({ error: validated.error }, { status: 400 });

  if (result.auth.profile.role === "buyer") {
    const { count, error: countError } = await result.auth.supabase
      .from("rfqs")
      .select("id", { count: "exact", head: true })
      .eq("buyer_id", result.auth.user.id);

    if (countError) {
      return Response.json({ error: "The course RFQ allowance could not be checked." }, { status: 500 });
    }
    if ((count ?? 0) >= COURSE_RFQ_LIMIT) {
      return Response.json(
        { code: "COURSE_RFQ_LIMIT", error: COURSE_RFQ_LIMIT_MESSAGE, limit: COURSE_RFQ_LIMIT },
        { status: 403 },
      );
    }
  }

  const data = validated.data;
  const { data: rfq, error } = await result.auth.supabase
    .from("rfqs")
    .insert({
      buyer_id: result.auth.user.id,
      product_name: data.productName,
      product_category: data.productCategory,
      reference_url: data.referenceUrl,
      product_description: data.productDescription,
      reference_file_name: data.referenceFileName,
      material: data.material,
      dimensions: data.dimensions,
      color: data.color,
      custom_logo: data.customLogo,
      custom_packaging: data.customPackaging,
      additional_requirements: data.additionalRequirements,
      target_quantity: data.targetQuantity,
      target_unit_price: data.targetUnitPrice,
      destination_country: data.destinationCountry,
      amazon_marketplace: data.amazonMarketplace,
      desired_delivery_date: data.desiredDeliveryDate,
      sample_required: data.sampleRequired,
      preferred_fulfillment: data.preferredFulfillment,
      status: "sourcing",
    })
    .select("id,rfq_number")
    .single();

  if (error?.code === "P0001" && error.message.includes("Course demo limit reached")) {
    return Response.json(
      { code: "COURSE_RFQ_LIMIT", error: COURSE_RFQ_LIMIT_MESSAGE, limit: COURSE_RFQ_LIMIT },
      { status: 403 },
    );
  }
  if (error || !rfq) {
    return Response.json({ error: "The sourcing request could not be saved." }, { status: 500 });
  }

  return Response.json({ id: rfq.id, rfqNumber: rfq.rfq_number }, { status: 201 });
}
