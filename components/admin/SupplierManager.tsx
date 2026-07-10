"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorAlert } from "@/components/ui/States";
import type { SupplierRow } from "@/lib/database.types";

interface SupplierDraft {
  id?: string;
  companyName: string;
  contactEmail: string;
  location: string;
  capabilities: string;
  notes: string;
  active: boolean;
}

const emptyDraft: SupplierDraft = {
  companyName: "",
  contactEmail: "",
  location: "",
  capabilities: "",
  notes: "",
  active: true,
};

export function SupplierManager({ suppliers }: { suppliers: SupplierRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<SupplierDraft>(emptyDraft);
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  async function saveSupplier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    if (!draft.companyName.trim()) {
      setError("Enter the supplier company name for the internal operations record.");
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(draft.id ? `/api/admin/suppliers/${draft.id}` : "/api/admin/suppliers", {
        method: draft.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "The supplier could not be saved.");
      setDraft(emptyDraft);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The supplier could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
      <form onSubmit={saveSupplier} className="panel overflow-hidden lg:sticky lg:top-24">
        <div className="border-b border-slate-200 px-5 py-5"><h2 className="text-lg font-bold text-slate-950">{draft.id ? "Edit supplier" : "Add supplier"}</h2><p className="mt-1 text-sm text-slate-500">Internal operations data; buyers do not receive this company record.</p></div>
        <div className="space-y-5 p-5 sm:p-6">
          {error ? <ErrorAlert message={error} /> : null}
          <div><label className="field-label" htmlFor="company-name">Company name</label><input id="company-name" className="text-field" required value={draft.companyName} onChange={(event) => setDraft((current) => ({ ...current, companyName: event.target.value }))} /></div>
          <div><label className="field-label" htmlFor="contact-email">Contact email</label><input id="contact-email" type="email" className="text-field" value={draft.contactEmail} onChange={(event) => setDraft((current) => ({ ...current, contactEmail: event.target.value }))} /></div>
          <div><label className="field-label" htmlFor="supplier-location">Location</label><input id="supplier-location" className="text-field" value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} /></div>
          <div><label className="field-label" htmlFor="capabilities">Capabilities</label><textarea id="capabilities" rows={3} className="text-field" value={draft.capabilities} onChange={(event) => setDraft((current) => ({ ...current, capabilities: event.target.value }))} /></div>
          <div><label className="field-label" htmlFor="supplier-notes">Notes</label><textarea id="supplier-notes" rows={3} className="text-field" value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} /></div>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} />Active supplier</label>
        </div>
        <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-5"><Button type="submit" disabled={isSaving}>{isSaving ? "Saving…" : "Save supplier"}</Button>{draft.id ? <Button variant="ghost" onClick={() => setDraft(emptyDraft)}>Cancel</Button> : null}</div>
      </form>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-5"><h2 className="text-lg font-bold text-slate-950">Supplier directory</h2><p className="mt-1 text-sm text-slate-500">{suppliers.length} internal supplier records</p></div>
        {suppliers.length ? <div className="divide-y divide-slate-100">{suppliers.map((supplier) => (
          <article key={supplier.id} className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-xs font-semibold text-blue-700">{supplier.supplier_code}</p><h3 className="mt-1 font-bold text-slate-950">{supplier.company_name}</h3><p className="mt-2 text-sm text-slate-600">{supplier.location || "Location not provided"}</p></div><Button variant="secondary" onClick={() => setDraft({ id: supplier.id, companyName: supplier.company_name, contactEmail: supplier.contact_email || "", location: supplier.location || "", capabilities: supplier.capabilities || "", notes: supplier.notes || "", active: supplier.active })}>Edit</Button></div>
            {supplier.capabilities ? <p className="mt-4 text-sm leading-6 text-slate-600">{supplier.capabilities}</p> : null}
          </article>
        ))}</div> : <div className="p-5"><EmptyState title="No suppliers yet" description="Create the first internal supplier record to start adding RFQ quotes." /></div>}
      </section>
    </div>
  );
}
