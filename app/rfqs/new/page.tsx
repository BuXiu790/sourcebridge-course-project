import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SourcingRequestForm } from "@/components/rfq/SourcingRequestForm";

export const metadata: Metadata = {
  title: "New Sourcing Request",
  description: "Create a new demo sourcing request for products from China.",
};

export default function NewRfqPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">New sourcing request</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Tell us what you need to source
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            A detailed brief helps the sourcing team identify better-fit suppliers and return more comparable quotes.
          </p>
        </div>
        <SourcingRequestForm />
      </main>
      <SiteFooter />
    </div>
  );
}

