import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
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

test("server-renders every SourceBridge route", async () => {
  const routes = [
    ["/", "Source Smarter from China"],
    ["/dashboard", "Sourcing requests"],
    ["/rfqs/new", "Tell us what you need to source"],
    ["/rfqs/demo-001", "Verified quotes"],
  ];

  for (const [pathname, expectedText] of routes) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /SourceBridge/);
    assert.ok(html.includes(expectedText), `${pathname} should include ${expectedText}`);

    if (pathname === "/") assert.match(html, /href="\/#workflow"/);
    if (pathname === "/dashboard") assert.match(html, /href="\/rfqs\/demo-001"/);
    if (pathname === "/rfqs/demo-001") {
      assert.match(html, /Estimates only\./);
      assert.match(html, /Actual Amazon fees, freight, duties and other costs may vary\./);
    }
  }
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
