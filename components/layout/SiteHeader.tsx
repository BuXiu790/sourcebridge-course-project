import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { ButtonLink } from "@/components/ui/Button";
import type { UserRole } from "@/lib/database.types";
import type { SupabasePublicConfig } from "@/lib/supabase/config";

export interface HeaderAccount {
  email: string;
  role: UserRole;
  config: SupabasePublicConfig;
}

export function Brand() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 rounded-md font-bold tracking-tight text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
      aria-label="SourceBridge home"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-xs font-black text-white">
        SB
      </span>
      <span className="text-lg">SourceBridge</span>
    </Link>
  );
}

export function SiteHeader({ account }: { account?: HeaderAccount }) {
  const canAccessAdmin = account?.role === "operator" || account?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          <Link className="nav-link" href="/#workflow">
            How it works
          </Link>
          <Link className="nav-link" href="/#capabilities">
            Capabilities
          </Link>
          <Link className="nav-link" href="/demo">
            Course Demo
          </Link>
          <Link className="nav-link" href="/dashboard">
            Dashboard
          </Link>
          {canAccessAdmin ? (
            <Link className="nav-link" href="/admin">
              Operations
            </Link>
          ) : null}
        </nav>
        {account ? (
          <div className="flex items-center gap-3">
            <span className="hidden max-w-48 truncate text-xs text-slate-500 lg:block">{account.email}</span>
            <SignOutButton config={account.config} />
          </div>
        ) : (
          <ButtonLink href="/rfqs/new" className="px-3 sm:px-4">
            <span className="hidden sm:inline">Submit a Request</span>
            <span className="sm:hidden">New RFQ</span>
          </ButtonLink>
        )}
      </div>
    </header>
  );
}
