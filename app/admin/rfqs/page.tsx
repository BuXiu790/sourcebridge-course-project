import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { requireStaff } from "@/lib/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { DATABASE_TO_RFQ_STATUS } from "@/lib/types";

export const metadata: Metadata = { title: "All Sourcing Requests" };
export const dynamic = "force-dynamic";

export default async function AdminRfqsPage() {
  const auth = await requireStaff("/admin/rfqs");
  const config = getSupabasePublicConfig();
  const [{ data: rfqs }, { data: profiles }] = await Promise.all([
    auth.supabase.from("rfqs").select("id,rfq_number,buyer_id,product_name,target_quantity,amazon_marketplace,status,created_at").order("created_at", { ascending: false }),
    auth.supabase.from("profiles").select("id,email,full_name,role,created_at,updated_at"),
  ]);
  const buyers = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader account={{ email: auth.profile.email, role: auth.profile.role, config }} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">All sourcing requests</h1>
        <p className="mt-2 text-base text-slate-600">Operator and admin view across all buyer accounts.</p>
        <div className="mt-7"><AdminNav /></div>
        <section className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-3.5">RFQ</th><th className="px-4 py-3.5">Product</th><th className="px-4 py-3.5">Buyer</th><th className="px-4 py-3.5">Market</th><th className="px-4 py-3.5">Quantity</th><th className="px-4 py-3.5">Status</th><th className="px-6 py-3.5 text-right">Created</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {(rfqs ?? []).map((rfq) => {
                  const buyer = buyers.get(rfq.buyer_id);
                  return <tr key={rfq.id}><td className="px-6 py-4 font-mono text-xs font-semibold text-blue-700"><Link href={`/admin/rfqs/${rfq.id}`} className="hover:underline">{rfq.rfq_number}</Link></td><td className="px-4 py-4 font-semibold text-slate-900">{rfq.product_name}</td><td className="px-4 py-4 text-slate-600">{buyer?.full_name || buyer?.email || "Unknown"}</td><td className="px-4 py-4 text-slate-600">{rfq.amazon_marketplace}</td><td className="px-4 py-4 text-slate-600">{rfq.target_quantity.toLocaleString("en-US")}</td><td className="px-4 py-4"><StatusBadge status={DATABASE_TO_RFQ_STATUS[rfq.status]} /></td><td className="px-6 py-4 text-right text-slate-600">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(rfq.created_at))}</td></tr>;
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
