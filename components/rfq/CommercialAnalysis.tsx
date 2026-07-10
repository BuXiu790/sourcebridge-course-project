"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorAlert } from "@/components/ui/States";
import type { CostItem, SupplierQuote } from "@/lib/types";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function QuoteCard({
  quote,
  selected,
  onSelect,
  disabled,
}: {
  quote: SupplierQuote;
  selected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}) {
  const rows = [
    { label: "Unit price", value: currency.format(quote.unitPrice) },
    { label: "MOQ", value: `${quote.moq.toLocaleString("en-US")} units` },
    { label: "Sample cost", value: currency.format(quote.sampleCost) },
    { label: "Lead time", value: quote.leadTime },
    { label: "Packaging", value: quote.packaging },
  ];

  return (
    <article
      className={`relative overflow-hidden rounded-xl border bg-white ${
        selected ? "border-blue-600 ring-2 ring-blue-600/15" : "border-slate-200"
      }`}
    >
      {quote.recommended ? (
        <div className="bg-blue-600 px-5 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-white">
          Recommended option
        </div>
      ) : null}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Supplier ID</p>
            <h3 className="mt-1.5 font-mono text-lg font-bold text-slate-950">{quote.supplierId}</h3>
          </div>
          <p className="text-right text-2xl font-bold tracking-tight text-blue-700">
            {currency.format(quote.unitPrice)}
            <span className="block text-xs font-medium text-slate-500">per unit</span>
          </p>
        </div>

        <dl className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
          {rows.slice(1).map((row) => (
            <div key={row.label} className="grid grid-cols-[110px_1fr] gap-4 py-3 text-sm">
              <dt className="text-slate-500">{row.label}</dt>
              <dd className="text-right font-medium leading-5 text-slate-800">{row.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 rounded-lg bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{quote.notes}</p>
        </div>
        <Button
          onClick={() => onSelect(quote.id)}
          disabled={disabled}
          variant={selected ? "secondary" : "primary"}
          className="mt-5 w-full"
          aria-pressed={selected}
        >
          {selected ? "Quote Selected" : "Select Quote"}
        </Button>
      </div>
    </article>
  );
}

function CostEstimate({
  costItems,
  selectedQuote,
  quantity,
}: {
  costItems: CostItem[];
  selectedQuote?: SupplierQuote;
  quantity: number;
}) {
  const estimate = useMemo(() => {
    const sellingPrice = costItems.find((item) => item.kind === "revenue")?.amount ?? 0;
    const costs = costItems
      .filter((item) => item.kind === "cost")
      .map((item) =>
        item.label === "Product cost" && selectedQuote
          ? { ...item, amount: selectedQuote.unitPrice }
          : item,
      );
    const totalCosts = costs.reduce((total, item) => total + item.amount, 0);
    const profit = sellingPrice - totalCosts;
    const margin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
    return { sellingPrice, costs, totalCosts, profit, margin };
  }, [costItems, selectedQuote]);

  return (
    <section className="panel overflow-hidden" aria-labelledby="cost-heading">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Demo working model</p>
          <h2 id="cost-heading" className="mt-2 text-xl font-bold text-slate-950">Cost & profit estimate</h2>
          <p className="mt-1 text-sm text-slate-500">Illustrative USD amounts per unit</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-4 py-3 sm:text-right">
          <p className="text-xs font-medium text-slate-500">Model quantity</p>
          <p className="mt-1 font-bold text-slate-950">{quantity.toLocaleString("en-US")} units</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_.85fr]">
        <div className="divide-y divide-slate-100 px-5 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-3.5 text-sm">
            <p className="font-semibold text-slate-900">Estimated Amazon selling price</p>
            <p className="font-bold text-slate-950">{currency.format(estimate.sellingPrice)}</p>
          </div>
          {estimate.costs.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-4 py-3 text-sm">
              <p className="text-slate-600">{item.label}</p>
              <p className="font-semibold text-slate-800">−{currency.format(item.amount)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">Estimated outcome</p>
          <dl className="mt-6 space-y-5">
            <div className="flex items-end justify-between gap-3 border-b border-slate-700 pb-5">
              <dt className="text-sm text-slate-300">Total estimated costs</dt>
              <dd className="text-lg font-bold">{currency.format(estimate.totalCosts)}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-300">Estimated profit</dt>
              <dd className="mt-2 text-4xl font-bold tracking-tight text-white">{currency.format(estimate.profit)}</dd>
              <dd className="mt-1 text-xs text-slate-400">per unit</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-300">Estimated margin</dt>
              <dd className="mt-2 text-2xl font-bold text-blue-300">{estimate.margin.toFixed(1)}%</dd>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
              <dt className="text-xs text-slate-400">Estimated order profit</dt>
              <dd className="mt-1 text-lg font-bold">{currency.format(estimate.profit * quantity)}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900 sm:px-6">
        <strong>Estimates only.</strong> Actual Amazon fees, freight, duties and other costs may vary.
      </div>
    </section>
  );
}

export function CommercialAnalysis({
  quotes,
  costItems = [],
  quantity,
  rfqId,
  initialSelectedQuoteId,
}: {
  quotes: SupplierQuote[];
  costItems?: CostItem[];
  quantity: number;
  rfqId?: string;
  initialSelectedQuoteId?: string | null;
}) {
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | undefined>(initialSelectedQuoteId ?? undefined);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [selectionError, setSelectionError] = useState<string>();
  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId);

  async function handleSelectQuote(quoteId: string) {
    setSelectionError(undefined);
    if (!rfqId) {
      setSelectedQuoteId(quoteId);
      return;
    }

    setIsSavingQuote(true);
    try {
      const response = await fetch(`/api/rfqs/${rfqId}/select-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "The quote selection could not be saved.");
      setSelectedQuoteId(quoteId);
    } catch (error) {
      setSelectionError(error instanceof Error ? error.message : "The quote selection could not be saved.");
    } finally {
      setIsSavingQuote(false);
    }
  }

  return (
    <div className="space-y-6">
      <section aria-labelledby="quotes-heading">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Supplier comparison</p>
            <h2 id="quotes-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Comparable quotes</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            Supplier names are anonymized in this prototype view. Supplier details are disclosed before sampling or purchase, after both parties confirm the sourcing terms.
          </p>
        </div>
        {quotes.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {quotes.map((quote) => (
              <QuoteCard
                key={quote.id}
                quote={quote}
                selected={quote.id === selectedQuoteId}
                onSelect={(quoteId) => void handleSelectQuote(quoteId)}
                disabled={isSavingQuote}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No comparable quotes yet"
            description="The sourcing team has not published a supplier quote for this RFQ."
          />
        )}
        <div className="min-h-12" aria-live="polite">
          {selectionError ? <div className="mt-4"><ErrorAlert message={selectionError} /></div> : selectedQuote ? (
            <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <strong>{selectedQuote.supplierId}</strong> is selected for this RFQ. This records a sourcing preference; no order has been placed.
            </p>
          ) : quotes.length ? (
            <p className="mt-4 text-xs text-slate-500">Select a quote to record your sourcing preference.</p>
          ) : null}
        </div>
      </section>

      {costItems.length ? (
        <CostEstimate costItems={costItems} selectedQuote={selectedQuote} quantity={quantity} />
      ) : (
        <section className="panel p-5 sm:p-6" aria-labelledby="cost-heading">
          <h2 id="cost-heading" className="text-xl font-bold text-slate-950">Cost & profit estimate</h2>
          <div className="mt-5">
            <EmptyState
              title="Cost model not configured"
              description="Real RFQs do not inherit public demo assumptions. A cost model will appear after selling-price, fee, freight, duty, and allowance inputs are recorded for this request."
            />
          </div>
        </section>
      )}
    </div>
  );
}
