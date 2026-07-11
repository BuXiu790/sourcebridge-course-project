import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const root = new URL("../", import.meta.url);
const retainedProductName = "TEST - Foldable Fabric Storage Organizer Set";

function readPublicEnvironment(source, name) {
  const prefix = `${name}=`;
  const line = source
    .split(/\r?\n/)
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));
  return line?.slice(prefix.length);
}

const [environmentSource, sessionSource] = await Promise.all([
  readFile(new URL(".env.local", root), "utf8"),
  readFile(new URL(".private/sourcebridge-live-sessions.json", root), "utf8"),
]);

const supabaseUrl = readPublicEnvironment(environmentSource, "NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey = readPublicEnvironment(environmentSource, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
const sessionBundle = JSON.parse(sessionSource);

assert.ok(supabaseUrl, "Missing Supabase URL");
assert.ok(supabaseKey, "Missing Supabase public key");
assert.ok(!/password|service[_ -]?role|database/i.test(sessionSource), "Session bundle contains a forbidden secret type");
assert.equal(sessionBundle.accounts?.length, 4, "Expected four protected ordinary-user sessions");

function freshClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function authenticatedClient(account) {
  assert.ok(account.accessToken && account.refreshToken, `Missing protected session for ${account.role}`);
  const client = freshClient();
  const { data, error } = await client.auth.setSession({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
  });
  assert.ifError(error);
  assert.ok(data.user, `Session restoration failed for ${account.role}`);
  assert.equal(data.user.email, account.email);
  return { account, client, user: data.user };
}

const authenticatedSessions = await Promise.all(sessionBundle.accounts.map(authenticatedClient));
const admin = authenticatedSessions.find(({ account }) => account.role === "admin");
const operator = authenticatedSessions.find(({ account }) => account.role === "operator");
const buyers = authenticatedSessions.filter(({ account }) => account.role === "buyer");
assert.ok(admin && operator && buyers.length === 2, "Expected admin, operator, and two buyer sessions");

const checks = [];
const passed = (label) => checks.push(label);
let buyerA;
let buyerB;
let retainedRfq;
let temporarySupplierId;
let temporaryQuoteId;
let temporaryTimelineId;
let originalStatus;

try {
  for (const session of authenticatedSessions) {
    const { data, error } = await session.client
      .from("profiles")
      .select("id,role")
      .eq("id", session.user.id)
      .single();
    assert.ifError(error);
    assert.equal(data.role, session.account.role);
  }
  passed("four-account session restoration and roles");

  const anonymous = freshClient();
  for (const table of ["profiles", "rfqs", "suppliers", "supplier_quotes", "timeline_events", "attachments"]) {
    const result = await anonymous.from(table).select("*").limit(1);
    assert.ok(result.error || result.data.length === 0, `Anonymous read unexpectedly succeeded for ${table}`);
  }
  passed("anonymous denial for all six business tables");

  const { data: profiles, error: profilesError } = await admin.client.from("profiles").select("id,role");
  assert.ifError(profilesError);
  assert.ok(profiles.length >= 4);
  passed("admin profile and role visibility");

  for (const buyer of buyers) {
    const result = await buyer.client
      .from("rfqs")
      .select("*")
      .eq("product_name", retainedProductName)
      .maybeSingle();
    assert.ifError(result.error);
    if (result.data) {
      buyerA = buyer;
      retainedRfq = result.data;
    } else {
      buyerB = buyer;
    }
  }
  assert.ok(buyerA && buyerB && retainedRfq, "Could not identify the retained Buyer A workflow");
  originalStatus = retainedRfq.status;

  const [buyerBReadsRfq, buyerAReadsBuyerBProfile, buyerBReadsBuyerAProfile] = await Promise.all([
    buyerB.client.from("rfqs").select("id").eq("id", retainedRfq.id),
    buyerA.client.from("profiles").select("id").eq("id", buyerB.user.id),
    buyerB.client.from("profiles").select("id").eq("id", buyerA.user.id),
  ]);
  assert.ifError(buyerBReadsRfq.error);
  assert.ifError(buyerAReadsBuyerBProfile.error);
  assert.ifError(buyerBReadsBuyerAProfile.error);
  assert.equal(buyerBReadsRfq.data.length, 0);
  assert.equal(buyerAReadsBuyerBProfile.data.length, 0);
  assert.equal(buyerBReadsBuyerAProfile.data.length, 0);
  passed("buyer-to-buyer RFQ and profile isolation");

  const [buyerSupplierAttempt, buyerRoleAttempt, operatorRoleAttempt, buyerQuoteAttempt, buyerAttachmentAttempt] = await Promise.all([
    buyerA.client.from("suppliers").insert({ company_name: "DENIED Buyer Supplier" }),
    buyerA.client.from("profiles").update({ role: "admin" }).eq("id", buyerA.user.id).select("id,role"),
    operator.client.rpc("set_user_role", { target_email: operator.account.email, new_role: "admin" }),
    buyerA.client.from("supplier_quotes").insert({
      rfq_id: retainedRfq.id,
      supplier_id: "00000000-0000-0000-0000-000000000000",
      supplier_label: "DENIED",
      unit_price: 1,
      moq: 1,
      sample_cost: 0,
      lead_time_days: 1,
      packaging: "DENIED",
      created_by: buyerA.user.id,
    }),
    buyerB.client.from("attachments").insert({
      rfq_id: retainedRfq.id,
      uploaded_by: buyerB.user.id,
      file_name: "DENIED.txt",
      storage_path: "denied.txt",
    }),
  ]);
  assert.ok(buyerSupplierAttempt.error);
  assert.ok(buyerRoleAttempt.error || buyerRoleAttempt.data.length === 0);
  assert.ok(operatorRoleAttempt.error);
  assert.ok(buyerQuoteAttempt.error);
  assert.ok(buyerAttachmentAttempt.error);
  const buyerRoleAfterAttempt = await buyerA.client
    .from("profiles")
    .select("role")
    .eq("id", buyerA.user.id)
    .single();
  assert.ifError(buyerRoleAfterAttempt.error);
  assert.equal(buyerRoleAfterAttempt.data.role, "buyer");
  passed("buyer and operator privilege-escalation and write denial");

  const [operatorRfqs, adminRfqs, retainedQuotes, retainedTimeline, retainedAttachments] = await Promise.all([
    operator.client.from("rfqs").select("id").eq("id", retainedRfq.id),
    admin.client.from("rfqs").select("id").eq("id", retainedRfq.id),
    buyerA.client.from("supplier_quotes").select("id,supplier_id").eq("rfq_id", retainedRfq.id),
    buyerA.client.from("timeline_events").select("id,status").eq("rfq_id", retainedRfq.id),
    buyerA.client.from("attachments").select("id").eq("rfq_id", retainedRfq.id),
  ]);
  for (const result of [operatorRfqs, adminRfqs, retainedQuotes, retainedTimeline, retainedAttachments]) {
    assert.ifError(result.error);
  }
  assert.equal(operatorRfqs.data.length, 1);
  assert.equal(adminRfqs.data.length, 1);
  assert.ok(retainedQuotes.data.length >= 2);
  assert.ok(retainedQuotes.data.some(({ id }) => id === retainedRfq.selected_quote_id));
  assert.ok(retainedAttachments.data.length >= 1);
  for (const expectedStatus of ["sample_review", "in_production", "quality_inspection", "shipping"]) {
    assert.ok(retainedTimeline.data.some(({ status }) => status === expectedStatus), `Missing ${expectedStatus} timeline event`);
  }
  assert.equal(retainedRfq.status, "shipping");
  passed("retained RFQ, two quotes, selection, attachment, and fulfillment timeline");

  const roleNoOp = await admin.client.rpc("set_user_role", {
    target_email: buyerA.account.email,
    new_role: "buyer",
  });
  assert.ifError(roleNoOp.error);
  passed("admin-only role RPC");

  const marker = `TEST-AUTO-${Date.now()}`;
  const supplierInsert = await operator.client
    .from("suppliers")
    .insert({
      company_name: marker,
      location: "Zhejiang, China",
      capabilities: "Temporary acceptance record",
      notes: "Automatically removed by live acceptance verification.",
      active: true,
    })
    .select("id,supplier_code")
    .single();
  assert.ifError(supplierInsert.error);
  temporarySupplierId = supplierInsert.data.id;

  const supplierEdit = await operator.client
    .from("suppliers")
    .update({ notes: "Temporary operator create/edit check; removed automatically." })
    .eq("id", temporarySupplierId)
    .select("id")
    .single();
  assert.ifError(supplierEdit.error);

  const quoteInsert = await admin.client
    .from("supplier_quotes")
    .insert({
      rfq_id: retainedRfq.id,
      supplier_id: temporarySupplierId,
      supplier_label: supplierInsert.data.supplier_code,
      unit_price: 6.55,
      moq: 900,
      sample_cost: 40,
      lead_time_days: 22,
      packaging: "Temporary flat-pack acceptance record",
      notes: "Automatically removed by live acceptance verification.",
      created_by: admin.user.id,
    })
    .select("id")
    .single();
  assert.ifError(quoteInsert.error);
  temporaryQuoteId = quoteInsert.data.id;

  const timelineInsert = await admin.client
    .from("timeline_events")
    .insert({
      rfq_id: retainedRfq.id,
      status: "quality_inspection",
      title: marker,
      detail: "Temporary acceptance milestone; removed automatically.",
      created_by: admin.user.id,
    })
    .select("id")
    .single();
  assert.ifError(timelineInsert.error);
  temporaryTimelineId = timelineInsert.data.id;

  const statusUpdate = await admin.client
    .from("rfqs")
    .update({ status: "quality_inspection" })
    .eq("id", retainedRfq.id)
    .select("status")
    .single();
  assert.ifError(statusUpdate.error);
  assert.equal(statusUpdate.data.status, "quality_inspection");

  const [buyerSeesTemporaryQuote, buyerSeesTemporaryTimeline] = await Promise.all([
    buyerA.client.from("supplier_quotes").select("id").eq("id", temporaryQuoteId),
    buyerA.client.from("timeline_events").select("id").eq("id", temporaryTimelineId),
  ]);
  assert.ifError(buyerSeesTemporaryQuote.error);
  assert.ifError(buyerSeesTemporaryTimeline.error);
  assert.equal(buyerSeesTemporaryQuote.data.length, 1);
  assert.equal(buyerSeesTemporaryTimeline.data.length, 1);
  passed("operator/admin supplier, quote, status, and timeline management");

  const reloadedBuyer = await authenticatedClient(buyerA.account);
  const persisted = await reloadedBuyer.client
    .from("rfqs")
    .select("id,selected_quote_id")
    .eq("id", retainedRfq.id)
    .single();
  assert.ifError(persisted.error);
  assert.equal(persisted.data.selected_quote_id, retainedRfq.selected_quote_id);
  passed("new-client session and selected-quote persistence");
} finally {
  const cleanupErrors = [];
  if (retainedRfq && originalStatus) {
    const restore = await admin.client.from("rfqs").update({ status: originalStatus }).eq("id", retainedRfq.id);
    if (restore.error) cleanupErrors.push(restore.error.message);
  }
  if (temporaryTimelineId) {
    const cleanup = await admin.client.from("timeline_events").delete().eq("id", temporaryTimelineId);
    if (cleanup.error) cleanupErrors.push(cleanup.error.message);
  }
  if (temporaryQuoteId) {
    const cleanup = await admin.client.from("supplier_quotes").delete().eq("id", temporaryQuoteId);
    if (cleanup.error) cleanupErrors.push(cleanup.error.message);
  }
  if (temporarySupplierId) {
    const cleanup = await admin.client.from("suppliers").delete().eq("id", temporarySupplierId);
    if (cleanup.error) cleanupErrors.push(cleanup.error.message);
  }
  assert.deepEqual(cleanupErrors, [], `Live-test cleanup failed: ${cleanupErrors.join("; ")}`);
}

console.log(JSON.stringify({ ok: true, checks, retainedWorkflow: "buyer-a", temporaryDataCleaned: true }));
