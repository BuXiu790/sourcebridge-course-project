import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { RoleManager } from "@/components/admin/RoleManager";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { requireStaff } from "@/lib/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { DATABASE_TO_RFQ_STATUS } from "@/lib/types";

export const metadata: Metadata = { title: "Operations Overview" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const auth = await requireStaff("/admin");
  const config = getSupabasePublicConfig();
  const [{ data: rfqs }, { data: profiles }] = await Promise.all([
    auth.supabase.from("rfqs").select("id,status"),
    auth.supabase.from("profiles").select("*").order("created_at", { ascending: false }),
  ]);
  const rows = rfqs ?? [];
  const stats = [
    ["Total RFQs", rows.length],
    ["Sourcing", rows.filter((rfq) => DATABASE_TO_RFQ_STATUS[rfq.status] === "Sourcing").length],
    ["Awaiting buyer", rows.filter((rfq) => rfq.status === "quotes_ready" || rfq.status === "sample_review").length],
    ["In fulfillment", rows.filter((rfq) => ["in_production", "quality_inspection", "shipping"].includes(rfq.status)).length],
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader account={{ email: auth.profile.email, role: auth.profile.role, config }} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Operator and admin workspace</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Operations overview</h1>
        <p className="mt-2 text-base text-slate-600">Review the live sourcing pipeline and manage authorized user roles.</p>
        <div className="mt-7"><AdminNav /></div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="RFQ status summary">
          {stats.map(([label, value]) => <article key={label} className="panel p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-2xl font-bold text-slate-950">{value}</p></article>)}
        </section>

        <div className="mt-6"><RoleManager profiles={profiles ?? []} canEdit={auth.profile.role === "admin"} /></div>
      </main>
      <SiteFooter />
    </div>
  );
}
