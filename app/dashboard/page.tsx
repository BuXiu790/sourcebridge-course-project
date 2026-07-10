import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/States";
import { requireUser } from "@/lib/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { DATABASE_TO_RFQ_STATUS, type RfqSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "Buyer Dashboard",
  description: "Track your sourcing requests and purchasing milestones.",
};
export const dynamic = "force-dynamic";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function DashboardPage() {
  const auth = await requireUser("/dashboard");
  const config = getSupabasePublicConfig();
  const { data: rfqRows, error } = await auth.supabase
    .from("rfqs")
    .select("id,rfq_number,product_name,amazon_marketplace,target_quantity,target_unit_price,status,created_at")
    .order("created_at", { ascending: false });

  let quoteCounts = new Map<string, number>();
  if (rfqRows?.length) {
    const { data: quoteRows } = await auth.supabase
      .from("supplier_quotes")
      .select("rfq_id")
      .in("rfq_id", rfqRows.map((rfq) => rfq.id));
    quoteCounts = new Map();
    quoteRows?.forEach((quote) => {
      quoteCounts.set(quote.rfq_id, (quoteCounts.get(quote.rfq_id) ?? 0) + 1);
    });
  }

  const rfqs: RfqSummary[] = (rfqRows ?? []).map((rfq) => ({
    id: rfq.id,
    rfqNumber: rfq.rfq_number,
    productName: rfq.product_name,
    targetMarket: rfq.amazon_marketplace,
    quantity: rfq.target_quantity,
    status: DATABASE_TO_RFQ_STATUS[rfq.status],
    createdAt: new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(rfq.created_at)),
    quoteCount: quoteCounts.get(rfq.id) ?? 0,
    estimatedValue: rfq.target_quantity * Number(rfq.target_unit_price),
  }));

  const active = rfqs.filter((rfq) => rfq.status !== "Completed");
  const awaiting = rfqs.filter((rfq) => rfq.status === "Quotes Ready" || rfq.status === "Sample Review");
  const production = rfqs.filter((rfq) => rfq.status === "In Production");
  const totalValue = active.reduce((total, rfq) => total + rfq.estimatedValue, 0);
  const stats = [
    { label: "Active Requests", value: String(active.length), note: "Excludes completed RFQs" },
    { label: "Awaiting Approval", value: String(awaiting.length), note: "Quotes or samples" },
    { label: "In Production", value: String(production.length), note: "Current production stage" },
    { label: "Total Estimated Order Value", value: currency.format(totalValue), note: "Based on buyer targets" },
  ];

  const displayName = auth.profile.full_name?.trim() || auth.profile.email.split("@")[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader account={{ email: auth.profile.email, role: auth.profile.role, config }} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Private workspace
            </span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, {displayName}
            </h1>
            <p className="mt-2 text-base text-slate-600">Here is what is moving across your sourcing pipeline.</p>
          </div>
          <ButtonLink href="/rfqs/new" className="w-full sm:w-auto" testId="dashboard-new-rfq">
            <span className="text-lg leading-none" aria-hidden="true">+</span>
            New Sourcing Request
          </ButtonLink>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Sourcing summary">
          {stats.map((stat) => (
            <article key={stat.label} className="panel p-5">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-500">{stat.note}</p>
            </article>
          ))}
        </section>

        {error ? <div className="mt-6"><ErrorAlert message="Your sourcing requests could not be loaded. Please try again." /></div> : null}
        <div className="mt-6"><DashboardView rfqs={rfqs} /></div>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          These records belong to your authenticated SourceBridge account. Prototype service targets on the public homepage remain separate demo content.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
