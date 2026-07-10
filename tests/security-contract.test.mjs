import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migrationUrl = new URL(
  "../supabase/migrations/202607110001_sourcebridge_phase2.sql",
  import.meta.url,
);

test("migration enables RLS on every business table", async () => {
  const sql = await readFile(migrationUrl, "utf8");
  const tables = [
    "profiles",
    "rfqs",
    "suppliers",
    "supplier_quotes",
    "timeline_events",
    "attachments",
  ];

  for (const table of tables) {
    assert.match(
      sql,
      new RegExp(`alter table public\\.${table} enable row level security;`, "i"),
      `${table} must have RLS enabled`,
    );
  }

  assert.match(sql, /revoke all on public\.profiles,[\s\S]*from anon;/i);
  assert.doesNotMatch(sql, /create policy[\s\S]*?\bto anon\b/i);
});

test("migration forces buyer signup and protects staff-only operations", async () => {
  const sql = await readFile(migrationUrl, "utf8");

  assert.match(sql, /handle_new_user[\s\S]*insert into public\.profiles[\s\S]*'buyer'/i);
  assert.match(sql, /set_user_role[\s\S]*private\.is_admin\(\)/i);
  assert.match(sql, /profiles_update_admin_only[\s\S]*private\.is_admin\(\)/i);
  assert.match(sql, /rfqs_select_owner_or_staff[\s\S]*buyer_id = \(select auth\.uid\(\)\)/i);
  assert.match(sql, /suppliers_insert_staff[\s\S]*private\.is_staff\(\)/i);
  assert.match(sql, /supplier_quotes_insert_staff[\s\S]*private\.is_staff\(\)/i);
  assert.match(sql, /timeline_events_insert_staff[\s\S]*private\.is_staff\(\)/i);
});

test("application uses server authorization and keeps demo RFQs separate", async () => {
  const [proxy, auth, signup, dashboard, newRfq, packageJson] = await Promise.all([
    readFile(new URL("../lib/supabase/proxy.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/auth.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/auth/AuthForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/rfq/SourcingRequestForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  for (const prefix of ["/dashboard", "/rfqs", "/admin", "/api/rfqs", "/api/admin"]) {
    assert.ok(proxy.includes(`"${prefix}"`), `${prefix} must be proxy-protected`);
  }
  assert.match(proxy, /auth\.getClaims\(\)/);
  assert.match(auth, /requireRole/);
  assert.match(auth, /redirect\("\/dashboard\?error=forbidden"\)/);
  assert.doesNotMatch(signup, /name=["']role["']/i);
  assert.doesNotMatch(dashboard, /mock-data|DEMO_RFQS/);
  assert.match(newRfq, /fetch\("\/api\/rfqs"/);
  assert.match(packageJson, /@supabase\/ssr/);
});

test("browser bundles do not reference a service-role credential", async () => {
  const files = [
    "../components/auth/AuthForm.tsx",
    "../lib/supabase/client.ts",
    "../lib/supabase/config.ts",
    "../lib/supabase/server.ts",
    "../app/api/rfqs/route.ts",
  ];
  const source = (
    await Promise.all(files.map((file) => readFile(new URL(file, import.meta.url), "utf8")))
  ).join("\n");

  assert.doesNotMatch(source, /service[_ -]?role|SUPABASE_SECRET_KEY/i);
  assert.match(source, /NEXT_PUBLIC_SUPABASE_ANON_KEY/);
});
