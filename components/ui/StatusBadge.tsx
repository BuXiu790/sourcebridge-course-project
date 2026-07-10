import type { RfqStatus } from "@/lib/types";

const statusStyles: Record<RfqStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 ring-slate-200",
  Sourcing: "bg-sky-50 text-sky-700 ring-sky-200",
  "Quotes Ready": "bg-blue-50 text-blue-700 ring-blue-200",
  "Sample Review": "bg-violet-50 text-violet-700 ring-violet-200",
  "In Production": "bg-amber-50 text-amber-800 ring-amber-200",
  "Quality Inspection": "bg-orange-50 text-orange-800 ring-orange-200",
  Shipping: "bg-cyan-50 text-cyan-800 ring-cyan-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function StatusBadge({ status }: { status: RfqStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

