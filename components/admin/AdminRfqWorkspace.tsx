"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/States";
import type { DatabaseRfqStatus, SupplierQuoteRow, SupplierRow, TimelineEventRow } from "@/lib/database.types";
import { DATABASE_RFQ_STATUSES, DATABASE_TO_RFQ_STATUS } from "@/lib/types";

export function AdminRfqWorkspace({
  rfqId,
  status,
  suppliers,
  quotes,
  timeline,
}: {
  rfqId: string;
  status: DatabaseRfqStatus;
  suppliers: SupplierRow[];
  quotes: SupplierQuoteRow[];
  timeline: TimelineEventRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  async function send(path: string, payload: Record<string, string | number | null>) {
    setError(undefined);
    setIsSaving(true);
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "The update could not be saved.");
      router.refresh();
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The update could not be saved.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await send(`/api/admin/rfqs/${rfqId}/status`, { status: String(form.get("status")) });
  }

  async function addQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const saved = await send(`/api/admin/rfqs/${rfqId}/quotes`, {
      supplierId: String(form.get("supplierId")),
      unitPrice: Number(form.get("unitPrice")),
      moq: Number(form.get("moq")),
      sampleCost: Number(form.get("sampleCost")),
      leadTimeDays: Number(form.get("leadTimeDays")),
      packaging: String(form.get("packaging")),
      notes: String(form.get("notes")) || null,
    });
    if (saved) formElement.reset();
  }

  async function addTimeline(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const saved = await send(`/api/admin/rfqs/${rfqId}/timeline`, {
      status: String(form.get("status")) || null,
      title: String(form.get("title")),
      detail: String(form.get("detail")),
    });
    if (saved) formElement.reset();
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorAlert message={error} /> : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={updateStatus} className="panel p-5">
          <h2 className="font-bold text-slate-950">Update status</h2>
          <label className="field-label mt-4" htmlFor="admin-status">RFQ status</label>
          <select id="admin-status" name="status" defaultValue={status} className="text-field">
            {DATABASE_RFQ_STATUSES.map((value) => <option key={value} value={value}>{DATABASE_TO_RFQ_STATUS[value]}</option>)}
          </select>
          <Button type="submit" disabled={isSaving} className="mt-4 w-full">Save status</Button>
        </form>

        <form onSubmit={addTimeline} className="panel p-5 lg:col-span-2">
          <h2 className="font-bold text-slate-950">Add timeline event</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label className="field-label" htmlFor="timeline-title">Title</label><input id="timeline-title" name="title" required className="text-field" /></div>
            <div><label className="field-label" htmlFor="timeline-status">Stage</label><select id="timeline-status" name="status" className="text-field"><option value="">General update</option>{DATABASE_RFQ_STATUSES.map((value) => <option key={value} value={value}>{DATABASE_TO_RFQ_STATUS[value]}</option>)}</select></div>
            <div className="sm:col-span-2"><label className="field-label" htmlFor="timeline-detail">Details</label><textarea id="timeline-detail" name="detail" required rows={3} className="text-field" /></div>
          </div>
          <Button type="submit" disabled={isSaving} className="mt-4">Add event</Button>
        </form>
      </div>

      <form onSubmit={addQuote} className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-5"><h2 className="font-bold text-slate-950">Add comparable quote</h2><p className="mt-1 text-sm text-slate-500">Buyer view receives the anonymous supplier code, not the internal company name.</p></div>
        <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className="field-label" htmlFor="quote-supplier">Supplier</label><select id="quote-supplier" name="supplierId" required className="text-field"><option value="">Select supplier</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.supplier_code} — {supplier.company_name}</option>)}</select></div>
          <div><label className="field-label" htmlFor="quote-price">Unit price (USD)</label><input id="quote-price" name="unitPrice" type="number" min="0.01" step="0.01" required className="text-field" /></div>
          <div><label className="field-label" htmlFor="quote-moq">MOQ</label><input id="quote-moq" name="moq" type="number" min="1" step="1" required className="text-field" /></div>
          <div><label className="field-label" htmlFor="sample-cost">Sample cost</label><input id="sample-cost" name="sampleCost" type="number" min="0" step="0.01" defaultValue="0" required className="text-field" /></div>
          <div><label className="field-label" htmlFor="lead-time">Lead time (days)</label><input id="lead-time" name="leadTimeDays" type="number" min="1" step="1" required className="text-field" /></div>
          <div><label className="field-label" htmlFor="quote-packaging">Packaging</label><input id="quote-packaging" name="packaging" required className="text-field" /></div>
          <div className="sm:col-span-2 lg:col-span-3"><label className="field-label" htmlFor="quote-notes">Notes</label><textarea id="quote-notes" name="notes" rows={3} className="text-field" /></div>
        </div>
        <div className="border-t border-slate-200 bg-slate-50 p-5"><Button type="submit" disabled={isSaving || suppliers.length === 0}>Add quote</Button></div>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5"><h2 className="font-bold text-slate-950">Published quotes</h2><p className="mt-3 text-sm text-slate-600">{quotes.length} quotes attached to this RFQ.</p></section>
        <section className="panel p-5"><h2 className="font-bold text-slate-950">Timeline history</h2><p className="mt-3 text-sm text-slate-600">{timeline.length} saved timeline events.</p></section>
      </div>
    </div>
  );
}
