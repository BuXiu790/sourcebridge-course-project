import { CommercialAnalysis } from "@/components/rfq/CommercialAnalysis";
import { RfqTimeline } from "@/components/rfq/RfqTimeline";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { costItems, supplierQuotes, timeline } from "@/lib/mock-data";

const specifications = [
  ["Category", "Home & Storage"],
  ["Material", "600D polyester fabric with removable reinforced panels"],
  ["Dimensions", "Large 42 × 30 × 25 cm; medium and small nested sizes"],
  ["Color", "Navy blue"],
  ["Logo", "Single-color woven label"],
  ["Packaging", "Flat-packed recycled polybag and 5-ply export carton"],
];

export function DemoRfqOverview() {
  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden" aria-labelledby="demo-rfq-heading">
        <div className="border-b border-blue-200 bg-blue-50 px-5 py-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            Course demo · illustrative data only
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            This record is not a real customer order, supplier transaction, or operating result.
          </p>
        </div>
        <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div>
            <p className="font-mono text-xs font-semibold text-blue-700">DEMO-001</p>
            <h1 id="demo-rfq-heading" className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Foldable Fabric Storage Organizer Set
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              A stable, read-only classroom scenario showing how SourceBridge connects requirements, comparable quotes, cost assumptions, quality checkpoints, and international fulfillment.
            </p>
          </div>
          <StatusBadge status="Shipping" />
        </div>
        <dl className="grid border-t border-slate-200 bg-slate-50 sm:grid-cols-3">
          {[["Target marketplace", "Amazon.com"], ["Target quantity", "2,500 sets"], ["Quote count", "2 anonymous demo quotes"]].map(([label, value]) => (
            <div key={label} className="border-b border-slate-200 px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-6">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</dt>
              <dd className="mt-1.5 text-sm font-bold text-slate-950">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <section className="panel p-5 sm:p-6" aria-labelledby="demo-specs-heading">
          <h2 id="demo-specs-heading" className="text-xl font-bold text-slate-950">Product specifications</h2>
          <dl className="mt-5 divide-y divide-slate-100">
            {specifications.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-3 text-sm sm:grid-cols-[130px_1fr] sm:gap-4">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium leading-6 text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="panel p-5 sm:p-6" aria-labelledby="demo-timeline-heading">
          <h2 id="demo-timeline-heading" className="text-xl font-bold text-slate-950">Fulfillment timeline</h2>
          <p className="mt-1 text-sm text-slate-500">Preloaded demo milestones for reliable classroom presentation.</p>
          <RfqTimeline events={timeline} />
        </section>
      </div>

      <CommercialAnalysis
        quotes={supplierQuotes}
        costItems={costItems}
        quantity={2500}
        initialSelectedQuoteId="quote-a"
      />
    </div>
  );
}
