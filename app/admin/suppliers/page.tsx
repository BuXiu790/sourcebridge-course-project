import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { SupplierManager } from "@/components/admin/SupplierManager";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { requireStaff } from "@/lib/auth";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export const metadata: Metadata = { title: "Supplier Directory" };
export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const auth = await requireStaff("/admin/suppliers");
  const config = getSupabasePublicConfig();
  const { data: suppliers } = await auth.supabase.from("suppliers").select("*").order("created_at", { ascending: false });
  return <div className="min-h-screen bg-slate-50"><SiteHeader account={{ email: auth.profile.email, role: auth.profile.role, config }} /><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"><h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Supplier directory</h1><p className="mt-2 text-base text-slate-600">Create and maintain internal supplier records used for RFQ quotes.</p><div className="mt-7"><AdminNav /></div><SupplierManager suppliers={suppliers ?? []} /></main><SiteFooter /></div>;
}
