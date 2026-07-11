import type { Metadata } from "next";
import { DemoRfqOverview } from "@/components/demo/DemoRfqOverview";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export const metadata: Metadata = {
  title: "Public Course Demo",
  description: "Read-only SourceBridge Course Release v1.0 RFQ workflow demo.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">Public read-only demo</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            A complete sourcing workflow, ready for course presentation
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Quote selection below is a browser-only what-if interaction. It does not write to Supabase, place an order, or represent a real supplier relationship.
          </p>
        </div>
        <DemoRfqOverview />
      </main>
      <SiteFooter />
    </div>
  );
}
