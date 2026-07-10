import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CommercialAnalysis } from "@/components/rfq/CommercialAnalysis";
import { RfqTimeline } from "@/components/rfq/RfqTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { costItems, rfqs, supplierQuotes, timeline } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Sourcing Request",
  description: "Review sourcing progress, supplier quotes, and demo landed cost estimates.",
};

const specs = [
  { label: "Material", value: "Food-grade silicone + PP lid" },
  { label: "Dimensions", value: "19 × 13 × 7 cm expanded" },
  { label: "Colors", value: "Navy, sage, and sand" },
  { label: "Custom logo", value: "Debossed on lid" },
  { label: "Custom packaging", value: "Recyclable kraft sleeve" },
  { label: "Compliance", value: "FDA/LFGB food-contact test reports requested" },
];

const attachments = [
  { name: "product-reference.jpg", meta: "Reference image · 1.8 MB" },
  { name: "packaging-brief.pdf", meta: "Packaging requirements · 640 KB" },
  { name: "logo-guidelines.pdf", meta: "Brand artwork reference · 2.1 MB" },
];

export default async function RfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const rfq = rfqs.find((item) => item.id === id) ?? rfqs[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <nav className="mb-5 flex items-center gap-2 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link className="rounded-sm hover:text-blue-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600" href="/dashboard">
            Dashboard
          </Link>
          <span aria-hidden="true">/</span>
          <span className="font-mono text-xs font-semibold uppercase text-slate-700">{rfq.id}</span>
        </nav>

        <section className="panel overflow-hidden">
          <div className="border-l-4 border-blue-600 px-5 py-6 sm:px-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-mono text-xs font-bold uppercase tracking-wider text-blue-700">RFQ #{rfq.id}</p>
                  <StatusBadge status={rfq.status} />
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{rfq.productName}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Private-label product sourcing for {rfq.targetMarket}, including custom colors, branding, and retail-ready packaging.
                </p>
              </div>
              <span className="self-start rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">Demo RFQ</span>
            </div>
          </div>
          <dl className="grid border-t border-slate-200 bg-slate-50 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Target quantity", `${rfq.quantity.toLocaleString("en-US")} units`],
              ["Target market", rfq.targetMarket],
              ["Created", rfq.createdAt],
              ["Quotes received", `${rfq.quoteCount} verified quotes`],
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="timeline-heading" className="text-lg font-bold text-slate-950">Sourcing timeline</h2>
                <p className="mt-1 text-sm text-slate-500">Full path from requirements to delivery</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">3 / 8 stages</span>
            </div>
            <RfqTimeline events={timeline} />
          </section>

          <div className="space-y-6">
            <section className="panel p-5 sm:p-6" aria-labelledby="specs-heading">
              <h2 id="specs-heading" className="text-lg font-bold text-slate-950">Product specifications</h2>
              <dl className="mt-5 divide-y divide-slate-100 border-y border-slate-100">
                {specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-[120px_1fr] gap-4 py-3 text-sm">
                    <dt className="text-slate-500">{spec.label}</dt>
                    <dd className="text-right font-medium leading-5 text-slate-800">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="panel p-5 sm:p-6" aria-labelledby="files-heading">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 id="files-heading" className="text-lg font-bold text-slate-950">Attachments</h2>
                  <p className="mt-1 text-sm text-slate-500">Reference files for this sourcing brief</p>
                </div>
                <span className="text-xs font-semibold text-slate-500">3 files</span>
              </div>
              <ul className="mt-5 space-y-2">
                {attachments.map((file) => (
                  <li key={file.name} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3.5 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">FILE</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{file.meta}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">Demo</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="mt-10">
          <CommercialAnalysis quotes={supplierQuotes} costItems={costItems} quantity={rfq.quantity} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

