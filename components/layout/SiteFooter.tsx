import Link from "next/link";
import { Brand } from "@/components/layout/SiteHeader";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Brand />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
            A clearer sourcing workflow for Amazon sellers buying from China.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Platform</p>
          <div className="mt-3 flex flex-col items-start gap-2 text-sm text-slate-600">
            <Link className="hover:text-blue-700" href="/dashboard">
              Buyer Dashboard
            </Link>
            <Link className="hover:text-blue-700" href="/rfqs/new">
              New Sourcing Request
            </Link>
            <Link className="hover:text-blue-700" href="/demo">
              Public Course Demo
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Prototype note</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Homepage targets and the RFQ preview are illustrative. Authenticated
            records come from the configured Supabase project.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-5 text-center text-xs leading-5 text-slate-500">
        <p>© 2026 SourceBridge. Course Release v1.0 · Frontend framework practice project.</p>
        <p className="mt-1">
          SourceBridge is an independent sourcing workflow prototype and is not affiliated with or endorsed by Amazon.
        </p>
      </div>
    </footer>
  );
}
