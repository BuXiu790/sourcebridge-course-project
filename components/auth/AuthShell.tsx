import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader, type HeaderAccount } from "@/components/layout/SiteHeader";

export function AuthShell({
  eyebrow,
  title,
  description,
  account,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  account?: HeaderAccount;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader account={account} />
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[.9fr_1.1fr] lg:items-start lg:px-8">
        <div className="pt-4 lg:pt-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">{description}</p>
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-900">Secure buyer workspace</p>
            <p className="mt-2">
              Authentication is handled by Supabase. Business records remain protected by server-side checks and database row-level security.
            </p>
          </div>
        </div>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
