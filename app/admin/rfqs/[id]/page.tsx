import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminRfqWorkspace } from "@/components/admin/AdminRfqWorkspace";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requireStaff } from "@/lib/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { DATABASE_TO_RFQ_STATUS } from "@/lib/types";

export const metadata: Metadata = { title: "Manage Sourcing Request" };
export const dynamic = "force-dynamic";

export default async function AdminRfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(`/admin/rfqs/${id}`);
  const config = getSupabasePublicConfig();
  const [{ data: rfq }, { data: suppliers }, { data: quotes }, { data: timeline }] = await Promise.all([
    auth.supabase.from("rfqs").select("*").eq("id", id).single(),
    auth.supabase.from("suppliers").select("*").eq("active", true).order("supplier_code"),
    auth.supabase.from("supplier_quotes").select("*").eq("rfq_id", id).order("created_at", { ascending: false }),
    auth.supabase.from("timeline_events").select("*").eq("rfq_id", id).order("event_date", { ascending: false }),
  ]);
  if (!rfq) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader account={{ email: auth.profile.email, role: auth.profile.role, config }} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <AdminNav />
        <nav className="text-sm text-slate-500"><Link href="/admin/rfqs" className="hover:underline">All RFQs</Link> <span aria-hidden="true">/</span> {rfq.rfq_number}</nav>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-3xl font-bold tracking-tight text-slate-950">{rfq.product_name}</h1><p className="mt-2 text-sm text-slate-600">{rfq.rfq_number} · {rfq.amazon_marketplace} · {rfq.target_quantity.toLocaleString("en-US")} units</p></div><StatusBadge status={DATABASE_TO_RFQ_STATUS[rfq.status]} /></div>
        <div className="mt-7"><AdminRfqWorkspace rfqId={rfq.id} status={rfq.status} suppliers={suppliers ?? []} quotes={quotes ?? []} timeline={timeline ?? []} /></div>
      </main>
      <SiteFooter />
    </div>
  );
}
