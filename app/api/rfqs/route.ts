import { getApiAuth } from "@/lib/auth";
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

  if (error || !rfq) {
    return Response.json({ error: "The sourcing request could not be saved." }, { status: 500 });
  }

  return Response.json({ id: rfq.id, rfqNumber: rfq.rfq_number }, { status: 201 });
}
