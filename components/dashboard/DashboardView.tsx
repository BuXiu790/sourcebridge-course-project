"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RFQ_STATUSES, type RfqStatus, type RfqSummary } from "@/lib/types";

type StatusFilter = "All statuses" | RfqStatus;

const formatQuantity = (quantity: number) => new Intl.NumberFormat("en-US").format(quantity);

export function DashboardView({ rfqs }: { rfqs: RfqSummary[] }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All statuses");

  const filteredRfqs = useMemo(
    () =>
      statusFilter === "All statuses"
        ? rfqs
        : rfqs.filter((rfq) => rfq.status === statusFilter),
    [rfqs, statusFilter],
  );

  return (
    <section className="panel overflow-hidden" aria-labelledby="requests-heading">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <h2 id="requests-heading" className="text-lg font-bold text-slate-950">
            Sourcing requests
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Monitor quotes, approvals, production, and delivery milestones.
          </p>
        </div>
        <div className="w-full sm:w-56">
          <label htmlFor="status-filter" className="field-label text-xs">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="text-field mt-1.5"
          >
            <option>All statuses</option>
            {RFQ_STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredRfqs.length === 0 ? (
        <div className="p-5 sm:p-6">
          <EmptyState
            title="No requests match this status"
            description="Choose a different status to return to your sourcing pipeline."
          />
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-3.5" scope="col">RFQ</th>
                  <th className="px-4 py-3.5" scope="col">Product</th>
                  <th className="px-4 py-3.5" scope="col">Market</th>
                  <th className="px-4 py-3.5" scope="col">Quantity</th>
                  <th className="px-4 py-3.5" scope="col">Status</th>
                  <th className="px-4 py-3.5" scope="col">Created</th>
                  <th className="px-4 py-3.5 text-right" scope="col">Quotes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRfqs.map((rfq) => (
                  <tr key={rfq.id} className="transition-colors hover:bg-blue-50/40">
                    <td className="px-6 py-4 font-mono text-xs font-semibold uppercase text-blue-700">
                      <Link
                        href={`/rfqs/${rfq.id}`}
                        className="rounded-sm hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        {rfq.id}
                      </Link>
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <Link
                        href={`/rfqs/${rfq.id}`}
                        className="font-semibold text-slate-900 hover:text-blue-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        {rfq.productName}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{rfq.targetMarket}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatQuantity(rfq.quantity)}</td>
                    <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={rfq.status} /></td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{rfq.createdAt}</td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">{rfq.quoteCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-200 lg:hidden">
            {filteredRfqs.map((rfq) => (
              <Link
                key={rfq.id}
                href={`/rfqs/${rfq.id}`}
                className="block p-5 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold uppercase text-blue-700">{rfq.id}</p>
                    <h3 className="mt-1.5 font-semibold text-slate-950">{rfq.productName}</h3>
                  </div>
                  <span className="text-slate-400" aria-hidden="true">→</span>
                </div>
                <div className="mt-4"><StatusBadge status={rfq.status} /></div>
                <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-sm sm:grid-cols-4">
                  <div><dt className="text-xs text-slate-500">Market</dt><dd className="mt-1 font-medium text-slate-800">{rfq.targetMarket}</dd></div>
                  <div><dt className="text-xs text-slate-500">Quantity</dt><dd className="mt-1 font-medium text-slate-800">{formatQuantity(rfq.quantity)}</dd></div>
                  <div><dt className="text-xs text-slate-500">Created</dt><dd className="mt-1 font-medium text-slate-800">{rfq.createdAt}</dd></div>
                  <div><dt className="text-xs text-slate-500">Quotes</dt><dd className="mt-1 font-medium text-slate-800">{rfq.quoteCount}</dd></div>
                </dl>
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

