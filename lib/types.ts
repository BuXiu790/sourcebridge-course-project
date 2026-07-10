export const RFQ_STATUSES = [
  "Draft",
  "Sourcing",
  "Quotes Ready",
  "Sample Review",
  "In Production",
  "Quality Inspection",
  "Shipping",
  "Completed",
] as const;

export type RfqStatus = (typeof RFQ_STATUSES)[number];

export interface RfqSummary {
  id: string;
  rfqNumber: string;
  productName: string;
  targetMarket: string;
  quantity: number;
  status: RfqStatus;
  createdAt: string;
  quoteCount: number;
  estimatedValue: number;
}

export const DATABASE_TO_RFQ_STATUS = {
  draft: "Draft",
  sourcing: "Sourcing",
  quotes_ready: "Quotes Ready",
  sample_review: "Sample Review",
  in_production: "In Production",
  quality_inspection: "Quality Inspection",
  shipping: "Shipping",
  completed: "Completed",
} as const satisfies Record<import("@/lib/database.types").DatabaseRfqStatus, RfqStatus>;

export const RFQ_STATUS_TO_DATABASE = {
  Draft: "draft",
  Sourcing: "sourcing",
  "Quotes Ready": "quotes_ready",
  "Sample Review": "sample_review",
  "In Production": "in_production",
  "Quality Inspection": "quality_inspection",
  Shipping: "shipping",
  Completed: "completed",
} as const satisfies Record<RfqStatus, import("@/lib/database.types").DatabaseRfqStatus>;

export const DATABASE_RFQ_STATUSES = Object.keys(
  DATABASE_TO_RFQ_STATUS,
) as import("@/lib/database.types").DatabaseRfqStatus[];

export interface SupplierQuote {
  id: string;
  supplierId: string;
  unitPrice: number;
  moq: number;
  sampleCost: number;
  leadTime: string;
  packaging: string;
  notes: string;
  recommended?: boolean;
}

export interface TimelineEvent {
  label: string;
  detail: string;
  date?: string;
  state: "complete" | "current" | "upcoming";
}

export interface CostItem {
  label: string;
  amount: number;
  kind: "revenue" | "cost" | "profit";
}

export interface SourcingFormData {
  productName: string;
  productCategory: string;
  referenceUrl: string;
  productDescription: string;
  referenceFileName: string;
  material: string;
  dimensions: string;
  color: string;
  customLogo: string;
  customPackaging: string;
  additionalRequirements: string;
  targetQuantity: string;
  targetUnitPrice: string;
  destinationCountry: string;
  amazonMarketplace: string;
  desiredDeliveryDate: string;
  sampleRequired: string;
  preferredFulfillment: string;
}
