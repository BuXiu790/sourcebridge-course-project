import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/Button";
import { dashboardStats, rfqs } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Buyer Dashboard",
  description: "Track demo sourcing requests and purchasing milestones.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Demo workspace
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Welcome back, Alex
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Here is what is moving across your sourcing pipeline.
            </p>
          </div>
          <ButtonLink href="/rfqs/new" className="w-full sm:w-auto" testId="dashboard-new-rfq">
            <span className="text-lg leading-none" aria-hidden="true">+</span>
            New Sourcing Request
          </ButtonLink>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Sourcing summary">
          {dashboardStats.map((stat) => (
            <article key={stat.label} className="panel p-5">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{stat.value}</p>
              <p className="mt-2 text-xs text-slate-500">{stat.note}</p>
            </article>
          ))}
        </section>

        <div className="mt-6">
          <DashboardView rfqs={rfqs} />
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          All values and RFQs on this dashboard are illustrative demo data and do not represent live orders.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

