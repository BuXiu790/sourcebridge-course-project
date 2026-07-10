import assert from "node:assert/strict";
import test from "node:test";
import { validateSourcingRequest } from "../lib/validate-sourcing-request.ts";

function validRequest() {
  const nextMonth = new Date();
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);

  return {
    productName: "Foldable Fabric Storage Organizer Set",
    productCategory: "Home & Storage",
    referenceUrl: "https://example.com/reference",
    productDescription: "A neutral fabric organizer set for household storage.",
    referenceFileName: "reference.webp",
    material: "Non-woven fabric and reinforced cardboard",
    dimensions: "40 x 30 x 25 cm",
    color: "Warm gray",
    customLogo: "No",
    customPackaging: "Yes",
    additionalRequirements: "Flat-pack configuration",
    targetQuantity: "2500",
    targetUnitPrice: "6.50",
    destinationCountry: "United States",
    amazonMarketplace: "Amazon.com",
    desiredDeliveryDate: nextMonth.toISOString().slice(0, 10),
    sampleRequired: "Yes",
    preferredFulfillment: "Amazon FBA",
  };
}

test("accepts and normalizes a complete sourcing request", () => {
  const result = validateSourcingRequest(validRequest());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.data.targetQuantity, 2500);
  assert.equal(result.data.targetUnitPrice, 6.5);
  assert.equal(result.data.productCategory, "Home & Storage");
});

test("rejects an unselected product category", () => {
  const input = validRequest();
  input.productCategory = "";
  const result = validateSourcingRequest(input);
  assert.deepEqual(result, { ok: false, error: "Complete the required product fields." });
});

test("rejects invalid references and past delivery dates", () => {
  const invalidReference = validRequest();
  invalidReference.referenceUrl = "javascript:alert(1)";
  assert.deepEqual(validateSourcingRequest(invalidReference), {
    ok: false,
    error: "Enter a valid ASIN or http(s) reference URL.",
  });

  const pastDelivery = validRequest();
  pastDelivery.desiredDeliveryDate = "2020-01-01";
  assert.deepEqual(validateSourcingRequest(pastDelivery), {
    ok: false,
    error: "Complete the required delivery fields.",
  });
});
