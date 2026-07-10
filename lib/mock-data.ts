import type {
  CostItem,
  RfqSummary,
  SupplierQuote,
  TimelineEvent,
} from "@/lib/types";

export const rfqs: RfqSummary[] = [
  {
    id: "demo-001",
    productName: "Collapsible Silicone Lunch Box Set",
    targetMarket: "Amazon US",
    quantity: 2_500,
    status: "Quotes Ready",
    createdAt: "Jul 2, 2026",
    quoteCount: 2,
    estimatedValue: 19_625,
  },
  {
    id: "demo-002",
    productName: "Bamboo Drawer Organizer",
    targetMarket: "Amazon UK",
    quantity: 1_200,
    status: "Sample Review",
    createdAt: "Jun 24, 2026",
    quoteCount: 3,
    estimatedValue: 15_240,
  },
  {
    id: "demo-003",
    productName: "Portable Pet Water Bottle",
    targetMarket: "Amazon DE",
    quantity: 3_000,
    status: "In Production",
    createdAt: "Jun 11, 2026",
    quoteCount: 4,
    estimatedValue: 24_900,
  },
  {
    id: "demo-004",
    productName: "Travel Compression Packing Cubes",
    targetMarket: "Amazon CA",
    quantity: 1_500,
    status: "Quality Inspection",
    createdAt: "May 29, 2026",
    quoteCount: 3,
    estimatedValue: 13_875,
  },
  {
    id: "demo-005",
    productName: "Magnetic Cable Management Kit",
    targetMarket: "Amazon US",
    quantity: 2_000,
    status: "Sourcing",
    createdAt: "Jul 7, 2026",
    quoteCount: 0,
    estimatedValue: 8_810,
  },
];

export const supplierQuotes: SupplierQuote[] = [
  {
    id: "quote-a",
    supplierId: "CN-SUP-0427",
    unitPrice: 7.85,
    moq: 1_000,
    sampleCost: 48,
    leadTime: "28–32 days",
    packaging: "Recyclable kraft sleeve + 5-ply export carton",
    notes:
      "Logo mold is included at 2,500 units. Pantone color matching available after sample approval.",
    recommended: true,
  },
  {
    id: "quote-b",
    supplierId: "CN-SUP-1183",
    unitPrice: 8.1,
    moq: 800,
    sampleCost: 35,
    leadTime: "24–29 days",
    packaging: "Printed color box + 5-ply export carton",
    notes:
      "Shorter lead time and lower MOQ. Custom insert adds $0.18 per unit.",
  },
];

export const timeline: TimelineEvent[] = [
  {
    label: "Requirements Submitted",
    detail: "Product brief and commercial targets received.",
    date: "Jul 2",
    state: "complete",
  },
  {
    label: "Supplier Sourcing",
    detail: "Supplier capability and export readiness reviewed.",
    date: "Jul 3–6",
    state: "complete",
  },
  {
    label: "Quotes Ready",
    detail: "Two comparable supplier quotes are ready for review.",
    date: "Jul 8",
    state: "current",
  },
  {
    label: "Sample Review",
    detail: "Approve appearance, function, packaging, and labeling.",
    state: "upcoming",
  },
  {
    label: "In Production",
    detail: "Production milestones and exceptions will be tracked.",
    state: "upcoming",
  },
  {
    label: "Quality Inspection",
    detail: "Pre-shipment inspection and report review.",
    state: "upcoming",
  },
  {
    label: "Shipping",
    detail: "International freight and customs milestones.",
    state: "upcoming",
  },
  {
    label: "Completed",
    detail: "Delivery confirmed and RFQ closed.",
    state: "upcoming",
  },
];

export const costItems: CostItem[] = [
  { label: "Estimated Amazon selling price", amount: 34.99, kind: "revenue" },
  { label: "Amazon referral fee", amount: 5.25, kind: "cost" },
  { label: "Estimated FBA fee", amount: 4.6, kind: "cost" },
  { label: "Product cost", amount: 7.85, kind: "cost" },
  { label: "Packaging and labeling", amount: 0.62, kind: "cost" },
  { label: "Domestic shipping", amount: 0.28, kind: "cost" },
  { label: "International freight", amount: 1.75, kind: "cost" },
  { label: "Duty and tax estimate", amount: 0.59, kind: "cost" },
  { label: "Advertising allowance", amount: 3.5, kind: "cost" },
  { label: "Returns and defect allowance", amount: 0.7, kind: "cost" },
  { label: "SourceBridge service fee", amount: 0.65, kind: "cost" },
  { label: "Estimated profit", amount: 9.2, kind: "profit" },
];

export const dashboardStats = [
  { label: "Active Requests", value: "5", note: "+1 this month" },
  { label: "Awaiting Approval", value: "2", note: "Quotes or samples" },
  { label: "In Production", value: "1", note: "On schedule" },
  {
    label: "Total Estimated Order Value",
    value: "$82,450",
    note: "Across active RFQs",
  },
];

