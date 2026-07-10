import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { requireStaff } from "@/lib/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Supplier Quotes" };
export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const auth = await requireStaff("/admin/quotes");
  const config = getSupabasePublicConfig();
  const [{ data: quotes }, { data: rfqs }] = await Promise.all([
    auth.supabase.from("supplier_quotes").select("*").order("created_at", { ascending: false }),
    auth.supabase.from("rfqs").select("id,rfq_number,product_name"),
  ]);
  const rfqMap = new Map((rfqs ?? []).map((rfq) => [rfq.id, rfq]));
  return <div className="min-h-screen bg-slate-50"><SiteHeader account={{ email: auth.profile.email, role: auth.profile.role, config }} /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Comparable quotes</h1><p className="mt-2 text-base text-slate-600">All quote records entered by authorized operations users.</p><div className="mt-7"><AdminNav /></div><section className="panel overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-6 py-3.5">RFQ</th><th className="px-4 py-3.5">Supplier</th><th className="px-4 py-3.5">Unit price</th><th className="px-4 py-3.5">MOQ</th><th className="px-4 py-3.5">Lead time</th><th className="px-6 py-3.5 text-right">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{(quotes ?? []).map((quote) => { const rfq = rfqMap.get(quote.rfq_id); return <tr key={quote.id}><td className="px-6 py-4"><Link href={`/admin/rfqs/${quote.rfq_id}`} className="font-mono text-xs font-semibold text-blue-700 hover:underline">{rfq?.rfq_number || "Unknown RFQ"}</Link><p className="mt-1 text-xs text-slate-500">{rfq?.product_name}</p></td><td className="px-4 py-4 font-mono text-xs text-slate-700">{quote.supplier_label}</td><td className="px-4 py-4 font-semibold text-slate-900">${Number(quote.unit_price).toFixed(2)}</td><td className="px-4 py-4 text-slate-600">{quote.moq.toLocaleString("en-US")}</td><td className="px-4 py-4 text-slate-600">{quote.lead_time_days} days</td><td className="px-6 py-4 text-right text-slate-600">{new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(quote.created_at))}</td></tr>; })}</tbody></table></div></section></main><SiteFooter /></div>;
}
