import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function request(pathname = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set(
    "test",
    `${process.pid}-${Date.now()}-${Math.random()}-${pathname}`,
  );
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html", ...init.headers },
      ...init,
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the public SourceBridge routes", async () => {
  const routes = [
    ["/", "Source Smarter from China"],
    ["/login", "Sign in to SourceBridge"],
    ["/signup", "Create your SourceBridge account"],
    ["/forgot-password", "Reset your password"],
  ];

  for (const [pathname, expectedText] of routes) {
    const response = await request(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /SourceBridge/);
    assert.ok(html.includes(expectedText), `${pathname} should include ${expectedText}`);
    assert.match(html, /not affiliated with or endorsed by Amazon/);

    if (pathname === "/") {
      assert.match(html, /href="\/#workflow"/);
      assert.match(html, /Prototype Service Targets/);
      assert.match(html, /not actual operating results/);
    } else {
      assert.match(html, /Supabase configuration required/);
    }
  }
});

test("redirects protected pages to login when Supabase is not configured", async () => {
  const paths = [
    "/dashboard",
    "/rfqs/new",
    "/rfqs/00000000-0000-4000-8000-000000000001",
    "/reset-password",
    "/admin",
    "/admin/rfqs",
    "/admin/rfqs/00000000-0000-4000-8000-000000000001",
    "/admin/suppliers",
    "/admin/quotes",
  ];

  for (const pathname of paths) {
    const response = await request(pathname);
    assert.equal(response.status, 307, pathname);
    const location = new URL(response.headers.get("location"));
    assert.equal(location.pathname, "/login");
    assert.equal(location.searchParams.get("next"), pathname);
    assert.equal(location.searchParams.get("error"), "config");
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  }
});

test("rejects protected API writes when Supabase is not configured", async () => {
  const response = await request("/api/rfqs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productName: "Test" }),
  });

  assert.equal(response.status, 503);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  assert.deepEqual(await response.json(), { error: "Supabase is not configured." });
});

test("removes starter preview code and metadata", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /Source Smarter/);
  assert.match(layout, /SourceBridge/);
  assert.doesNotMatch(layout, /codex-preview|Starter Project/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
