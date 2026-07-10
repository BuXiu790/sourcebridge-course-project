import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CommercialAnalysis } from "@/components/rfq/CommercialAnalysis";
import { RfqTimeline } from "@/components/rfq/RfqTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requireUser } from "@/lib/auth";
import type { DatabaseRfqStatus, TimelineEventRow } from "@/lib/database.types";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { DATABASE_TO_RFQ_STATUS, type SupplierQuote, type TimelineEvent } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sourcing Request",
  description: "Review sourcing progress and comparable supplier quotes.",
};
export const dynamic = "force-dynamic";

const timelineStages: Array<{
  status: DatabaseRfqStatus;
  label: string;
  detail: string;
}> = [
  { status: "draft", label: "Requirements Submitted", detail: "Buyer requirements were submitted." },
  { status: "sourcing", label: "Supplier Sourcing", detail: "Relevant manufacturing capabilities and commercial terms are being reviewed." },
  { status: "quotes_ready", label: "Quotes Ready", detail: "Comparable supplier quotes are ready for buyer review." },
  { status: "sample_review", label: "Sample Review", detail: "Appearance, function, packaging, and labeling are under review." },
  { status: "in_production", label: "In Production", detail: "Production milestones and exceptions are being tracked." },
  { status: "quality_inspection", label: "Quality Inspection", detail: "Pre-shipment inspection and report review." },
  { status: "shipping", label: "Shipping", detail: "International freight and customs milestones." },
  { status: "completed", label: "Completed", detail: "Delivery confirmed and RFQ closed." },
];

function buildTimeline(currentStatus: DatabaseRfqStatus, rows: TimelineEventRow[]): TimelineEvent[] {
  const currentIndex = timelineStages.findIndex((stage) => stage.status === currentStatus);
  return timelineStages.map((stage, index) => {
    const recorded = rows
      .filter((event) => event.status === stage.status)
      .sort((a, b) => b.event_date.localeCompare(a.event_date))[0];
    return {
      label: recorded?.title || stage.label,
      detail: recorded?.detail || stage.detail,
      date: recorded
        ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(recorded.event_date))
        : undefined,
      state: index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming",
    };
  });
}

export default async function RfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const auth = await requireUser(`/rfqs/${id}`);
  const config = getSupabasePublicConfig();
  const { data: rfq, error } = await auth.supabase.from("rfqs").select("*").eq("id", id).single();
  if (error || !rfq) notFound();

  const [{ data: quoteRows }, { data: timelineRows }, { data: attachmentRows }] = await Promise.all([
    auth.supabase.from("supplier_quotes").select("*").eq("rfq_id", id).order("unit_price"),
    auth.supabase.from("timeline_events").select("*").eq("rfq_id", id).order("sort_order").order("event_date"),
    auth.supabase.from("attachments").select("*").eq("rfq_id", id).order("created_at"),
  ]);

  const quotes: SupplierQuote[] = (quoteRows ?? []).map((quote, index) => ({
    id: quote.id,
    supplierId: quote.supplier_label,
    unitPrice: Number(quote.unit_price),
    moq: quote.moq,
    sampleCost: Number(quote.sample_cost),
    leadTime: `${quote.lead_time_days} days`,
    packaging: quote.packaging,
    notes: quote.notes || "No additional notes were provided.",
    recommended: index === 0,
  }));

  const specs = [
    ["Category", rfq.product_category],
    ["Material", rfq.material],
    ["Dimensions", rfq.dimensions],
    ["Colors", rfq.color],
    ["Custom logo", rfq.custom_logo],
    ["Custom packaging", rfq.custom_packaging],
    ["Requirements", rfq.additional_requirements || "None provided"],
  ];
  const timeline = buildTimeline(rfq.status, timelineRows ?? []);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader account={{ email: auth.profile.email, role: auth.profile.role, config }} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <nav className="mb-5 flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link className="rounded-sm hover:text-blue-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" href="/dashboard">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <span className="font-mono text-xs font-semibold uppercase text-slate-700">{rfq.rfq_number}</span>
        </nav>

        <section className="panel overflow-hidden">
          <div className="border-l-4 border-blue-600 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-blue-700">{rfq.rfq_number}</p>
                  <StatusBadge status={DATABASE_TO_RFQ_STATUS[rfq.status]} />
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{rfq.product_name}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{rfq.product_description}</p>
              </div>
              <span className="self-start rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">Private RFQ</span>
            </div>
          </div>
          <dl className="grid border-t border-slate-200 bg-slate-50 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Target quantity", `${rfq.target_quantity.toLocaleString("en-US")} units`],
              ["Target market", rfq.amazon_marketplace],
              ["Created", new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(rfq.created_at))],
              ["Quotes received", `${quotes.length} comparable quotes`],
            ].map(([label, value], index) => (
              <div key={label} className={`px-5 py-4 sm:px-6 ${index > 0 ? "sm:border-l sm:border-slate-200" : ""}`}>
                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm font-bold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.9fr]">
          <section className="panel p-5 sm:p-6" aria-labelledby="timeline-heading">
            <h2 id="timeline-heading" className="text-lg font-bold text-slate-950">Sourcing timeline</h2>
            <p className="mt-1 text-sm text-slate-500">Full path from requirements to delivery</p>
            <RfqTimeline events={timeline} />
            <div className="mt-7 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-bold text-slate-950">Recorded updates</h3>
              {timelineRows?.length ? (
                <ol className="mt-3 space-y-3">
                  {[...timelineRows].reverse().map((event) => (
                    <li key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                        <time className="text-xs text-slate-500" dateTime={event.event_date}>
                          {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(event.event_date))}
                        </time>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{event.detail}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-slate-500">No operational updates have been recorded yet.</p>
              )}
            </div>
          </section>

          <div className="space-y-6">
            <section className="panel p-5 sm:p-6" aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="text-lg font-bold text-slate-950">Product specifications</h2>
              <dl className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
                {specs.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[120px_1fr] gap-4 py-3 text-sm">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right font-medium leading-5 text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="panel p-5 sm:p-6" aria-labelledby="files-heading">
              <h2 id="files-heading" className="text-lg font-bold text-slate-950">Attachments</h2>
              {attachmentRows?.length ? (
                <ul className="mt-5 space-y-2">
                  {attachmentRows.map((file) => (
                    <li key={file.id} className="rounded-lg border border-slate-200 px-3.5 py-3">
                      <p className="truncate text-sm font-semibold text-slate-800">{file.file_name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{file.category}</p>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-sm text-slate-500">No attachments have been saved for this RFQ.</p>}
            </section>
          </div>
        </div>

        <div className="mt-10">
          <CommercialAnalysis
            quotes={quotes}
            quantity={rfq.target_quantity}
            rfqId={rfq.id}
            initialSelectedQuoteId={rfq.selected_quote_id}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
