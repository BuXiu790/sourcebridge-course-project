import type {
  CostItem,
  RfqSummary,
  SupplierQuote,
  TimelineEvent,
} from "@/lib/types";

export const rfqs: RfqSummary[] = [
  {
    id: "demo-001",
    rfqNumber: "DEMO-001",
    productName: "Foldable Fabric Storage Organizer Set",
    targetMarket: "Amazon US",
    quantity: 2_500,
    status: "Quotes Ready",
    createdAt: "Jul 2, 2026",
    quoteCount: 2,
    estimatedValue: 16_000,
  },
  {
    id: "demo-002",
    rfqNumber: "DEMO-002",
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
    rfqNumber: "DEMO-003",
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
    rfqNumber: "DEMO-004",
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
    rfqNumber: "DEMO-005",
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
    unitPrice: 6.4,
    moq: 800,
    sampleCost: 42,
    leadTime: "22–26 days",
    packaging: "Flat-packed recycled polybag + 5-ply export carton",
    notes:
      "Three organizer sizes, reinforced handles, and removable support boards are included in the unit price.",
    recommended: true,
  },
  {
    id: "quote-b",
    supplierId: "CN-SUP-1183",
    unitPrice: 6.68,
    moq: 600,
    sampleCost: 30,
    leadTime: "18–23 days",
    packaging: "Paper belly band + recycled polybag + export carton",
    notes:
      "Lower MOQ and shorter lead time. A heavier 900D fabric option adds $0.22 per set.",
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
    detail: "Initial manufacturing capability and commercial terms reviewed.",
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
  { label: "Estimated Amazon selling price", amount: 29.99, kind: "revenue" },
  { label: "Amazon referral fee", amount: 4.5, kind: "cost" },
  { label: "Estimated FBA fee", amount: 5.18, kind: "cost" },
  { label: "Product cost", amount: 6.4, kind: "cost" },
  { label: "Packaging and labeling", amount: 0.48, kind: "cost" },
  { label: "Domestic shipping", amount: 0.32, kind: "cost" },
  { label: "International freight", amount: 1.95, kind: "cost" },
  { label: "Duty and tax estimate", amount: 0.45, kind: "cost" },
  { label: "Advertising allowance", amount: 3, kind: "cost" },
  { label: "Returns and defect allowance", amount: 0.6, kind: "cost" },
  { label: "SourceBridge service fee", amount: 0.55, kind: "cost" },
  { label: "Estimated profit", amount: 6.56, kind: "profit" },
];

export const dashboardStats = [
  { label: "Active Requests", value: "5", note: "+1 this month" },
  { label: "Awaiting Approval", value: "2", note: "Quotes or samples" },
  { label: "In Production", value: "1", note: "On schedule" },
  {
    label: "Total Estimated Order Value",
    value: "$78,825",
    note: "Across active RFQs",
  },
];
