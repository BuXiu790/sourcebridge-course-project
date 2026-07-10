import { StatusBadge } from "@/components/ui/StatusBadge";

const quoteRows = [
  { id: "CN-SUP-0427", price: "$7.85", lead: "28–32 days" },
  { id: "CN-SUP-1183", price: "$8.10", lead: "24–29 days" },
];

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-blue-100/60" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              RFQ #DEMO-001
            </p>
            <p className="mt-1 font-semibold text-slate-950">
              Collapsible Silicone Lunch Box Set
            </p>
          </div>
          <StatusBadge status="Quotes Ready" />
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <div className="metric-card">
            <p className="metric-label">Target quantity</p>
            <p className="metric-value">2,500</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Destination</p>
            <p className="metric-value">United States</p>
          </div>
          <div className="metric-card">
            <p className="metric-label">Quotes received</p>
            <p className="metric-value">2 verified</p>
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-950">Quote comparison</p>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Demo
            </span>
          </div>
          <div className="space-y-2">
            {quoteRows.map((quote) => (
              <div
                key={quote.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-lg border border-slate-200 px-3.5 py-3 sm:grid-cols-3"
              >
                <p className="text-sm font-semibold text-slate-800">{quote.id}</p>
                <p className="hidden text-sm text-slate-600 sm:block">{quote.lead}</p>
                <p className="text-right text-sm font-bold text-blue-700">{quote.price}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[38%] rounded-full bg-blue-600" />
            </div>
            <span className="text-xs font-semibold text-slate-600">3 of 8 stages</span>
          </div>
        </div>
      </div>
    </div>
  );
}

