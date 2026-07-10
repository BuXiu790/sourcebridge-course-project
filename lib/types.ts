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
  productName: string;
  targetMarket: string;
  quantity: number;
  status: RfqStatus;
  createdAt: string;
  quoteCount: number;
  estimatedValue: number;
}

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

