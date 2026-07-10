import type { SourcingFormData } from "@/lib/types";

export interface ValidatedSourcingRequest {
  productName: string;
  productCategory: string;
  referenceUrl: string | null;
  productDescription: string;
  referenceFileName: string | null;
  material: string;
  dimensions: string;
  color: string;
  customLogo: string;
  customPackaging: string;
  additionalRequirements: string | null;
  targetQuantity: number;
  targetUnitPrice: number;
  destinationCountry: string;
  amazonMarketplace: string;
  desiredDeliveryDate: string;
  sampleRequired: string;
  preferredFulfillment: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(record: Record<string, unknown>, key: keyof SourcingFormData) {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function isValidReference(value: string) {
  if (!value) return true;
  if (/^[A-Z0-9]{10}$/i.test(value)) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidDeliveryDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  return value >= new Date().toISOString().slice(0, 10);
}

export function validateSourcingRequest(input: unknown):
  | { ok: true; data: ValidatedSourcingRequest }
  | { ok: false; error: string } {
  if (!isRecord(input)) return { ok: false, error: "Invalid request body." };

  const productName = stringValue(input, "productName");
  const productCategory = stringValue(input, "productCategory");
  const productDescription = stringValue(input, "productDescription");
  const material = stringValue(input, "material");
  const dimensions = stringValue(input, "dimensions");
  const color = stringValue(input, "color");
  const destinationCountry = stringValue(input, "destinationCountry");
  const amazonMarketplace = stringValue(input, "amazonMarketplace");
  const desiredDeliveryDate = stringValue(input, "desiredDeliveryDate");
  const targetQuantity = Number(stringValue(input, "targetQuantity"));
  const targetUnitPrice = Number(stringValue(input, "targetUnitPrice"));
  const referenceUrl = stringValue(input, "referenceUrl");

  if (!productName || !productCategory || productDescription.length < 20) {
    return { ok: false, error: "Complete the required product fields." };
  }
  if (!isValidReference(referenceUrl)) {
    return { ok: false, error: "Enter a valid ASIN or http(s) reference URL." };
  }
  if (!material || !dimensions || !color) {
    return { ok: false, error: "Complete the required specification fields." };
  }
  if (!Number.isInteger(targetQuantity) || targetQuantity < 1 || !Number.isFinite(targetUnitPrice) || targetUnitPrice <= 0) {
    return { ok: false, error: "Enter valid commercial targets." };
  }
  if (!destinationCountry || !amazonMarketplace || !isValidDeliveryDate(desiredDeliveryDate)) {
    return { ok: false, error: "Complete the required delivery fields." };
  }

  return {
    ok: true,
    data: {
      productName,
      productCategory,
      referenceUrl: referenceUrl || null,
      productDescription,
      referenceFileName: stringValue(input, "referenceFileName") || null,
      material,
      dimensions,
      color,
      customLogo: stringValue(input, "customLogo") || "No",
      customPackaging: stringValue(input, "customPackaging") || "No",
      additionalRequirements: stringValue(input, "additionalRequirements") || null,
      targetQuantity,
      targetUnitPrice,
      destinationCountry,
      amazonMarketplace,
      desiredDeliveryDate,
      sampleRequired: stringValue(input, "sampleRequired") || "Yes",
      preferredFulfillment: stringValue(input, "preferredFulfillment") || "Amazon FBA",
    },
  };
}
