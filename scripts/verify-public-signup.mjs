import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const root = new URL("../", import.meta.url);
const cleanupMarker = new URL(".private/sourcebridge-v1.1-temp-user-email.txt", root);

function readPublicEnvironment(source, name) {
  const prefix = `${name}=`;
  return source
    .split(/\r?\n/)
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

const [environmentSource, sessionSource] = await Promise.all([
  readFile(new URL(".env.local", root), "utf8"),
  readFile(new URL(".private/sourcebridge-live-sessions.json", root), "utf8"),
]);

const supabaseUrl = readPublicEnvironment(environmentSource, "NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey = readPublicEnvironment(environmentSource, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
const sessionBundle = JSON.parse(sessionSource);
assert.ok(supabaseUrl && supabaseKey, "Missing public Supabase configuration");
assert.ok(!/password|service[_ -]?role|database/i.test(sessionSource), "Protected sessions contain a forbidden secret type");

function freshClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}

const adminAccount = sessionBundle.accounts?.find((account) => account.role === "admin");
assert.ok(adminAccount?.accessToken && adminAccount?.refreshToken, "Missing protected Admin session");
const admin = freshClient();
const adminSession = await admin.auth.setSession({
  access_token: adminAccount.accessToken,
  refresh_token: adminAccount.refreshToken,
});
assert.ifError(adminSession.error);

const suffix = `${Date.now()}-${randomBytes(4).toString("hex")}`;
const email = `sourcebridge-course-${suffix}@example.com`;
const password = `Sb-${randomBytes(24).toString("base64url")}!`;
await writeFile(cleanupMarker, `${email}\n`, { encoding: "utf8", mode: 0o600 });

const buyer = freshClient();
const checks = [];
const createdRfqIds = [];

function validRfq(index) {
  const deliveryDate = new Date();
  deliveryDate.setUTCDate(deliveryDate.getUTCDate() + 45 + index);
  return {
    buyer_id: "",
    product_name: `TEST Course Signup Organizer ${index}`,
    product_category: "Home & Storage",
    product_description: "Temporary course registration acceptance record.",
    material: "Recycled polyester fabric",
    dimensions: "40 x 30 x 25 cm",
    color: "Slate gray",
    custom_logo: "No",
    custom_packaging: "No",
    target_quantity: 500,
    target_unit_price: 5.5,
    destination_country: "United States",
    amazon_marketplace: "Amazon.com",
    desired_delivery_date: deliveryDate.toISOString().slice(0, 10),
    sample_required: "Yes",
    preferred_fulfillment: "Amazon FBA",
    status: "sourcing",
  };
}

let userId;
try {
  const signup = await buyer.auth.signUp({
    email,
    password,
    options: { data: { role: "admin", is_admin: true, operator: true } },
  });
  assert.ifError(signup.error);
  assert.ok(signup.data.user && signup.data.session, "Public signup must create an immediate session");
  userId = signup.data.user.id;
  checks.push("public signup and immediate session");

  const profile = await buyer.from("profiles").select("id,email,role").eq("id", userId).single();
  assert.ifError(profile.error);
  assert.equal(profile.data.role, "buyer");
  checks.push("automatic Buyer profile and metadata role rejection");

  const roleAttack = await buyer.from("profiles").update({ role: "admin" }).eq("id", userId).select("role");
  assert.ok(roleAttack.error || roleAttack.data.length === 0, "Buyer role update unexpectedly succeeded");
  const rpcAttack = await buyer.rpc("set_user_role", { target_email: email, new_role: "admin" });
  assert.ok(rpcAttack.error, "Buyer unexpectedly called the Admin role RPC");
  const roleAfter = await buyer.from("profiles").select("role").eq("id", userId).single();
  assert.ifError(roleAfter.error);
  assert.equal(roleAfter.data.role, "buyer");
  checks.push("profile and RPC privilege escalation denied");

  const safeProfileUpdate = await buyer
    .from("profiles")
    .update({ full_name: "Course Demo Buyer" })
    .eq("id", userId)
    .select("full_name,role")
    .single();
  assert.ifError(safeProfileUpdate.error);
  assert.equal(safeProfileUpdate.data.role, "buyer");
  checks.push("safe own-profile update");

  const foreignData = await buyer.from("rfqs").select("id,buyer_id");
  assert.ifError(foreignData.error);
  assert.equal(foreignData.data.length, 0);
  const suppliers = await buyer.from("suppliers").select("id").limit(1);
  assert.ok(suppliers.error || suppliers.data.length === 0);
  checks.push("new Buyer isolation from existing RFQs and suppliers");

  for (let index = 1; index <= 5; index += 1) {
    const record = validRfq(index);
    record.buyer_id = userId;
    const inserted = await buyer.from("rfqs").insert(record).select("id").single();
    assert.ifError(inserted.error);
    createdRfqIds.push(inserted.data.id);
  }
  const sixth = validRfq(6);
  sixth.buyer_id = userId;
  const limitAttempt = await buyer.from("rfqs").insert(sixth).select("id");
  assert.ok(limitAttempt.error, "Sixth RFQ unexpectedly succeeded");
  assert.match(limitAttempt.error.message, /Course demo limit reached/i);
  checks.push("database-enforced five-RFQ limit");

  const reloaded = freshClient();
  const restored = await reloaded.auth.setSession({
    access_token: signup.data.session.access_token,
    refresh_token: signup.data.session.refresh_token,
  });
  assert.ifError(restored.error);
  assert.equal(restored.data.user?.id, userId);
  const persisted = await reloaded.from("rfqs").select("id");
  assert.ifError(persisted.error);
  assert.equal(persisted.data.length, 5);
  checks.push("session restoration and RFQ persistence");
} finally {
  if (createdRfqIds.length) {
    const cleanup = await admin.from("rfqs").delete().in("id", createdRfqIds);
    assert.ifError(cleanup.error);
  }
  await buyer.auth.signOut();
}

console.log(JSON.stringify({ ok: true, checks, temporaryBusinessDataCleaned: true, authUserCleanupRequired: true }));
