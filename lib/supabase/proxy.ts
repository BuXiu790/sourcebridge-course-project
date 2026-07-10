import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { getSupabasePublicConfigOrNull } from "@/lib/supabase/config";

const protectedPrefixes = [
  "/dashboard",
  "/rfqs",
  "/admin",
  "/reset-password",
  "/api/rfqs",
  "/api/admin",
];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isApiPath(pathname: string) {
  return pathname.startsWith("/api/");
}

function addPrivateCacheHeaders(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

function loginRedirect(request: NextRequest, reason?: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  if (reason) url.searchParams.set("error", reason);
  return addPrivateCacheHeaders(NextResponse.redirect(url));
}

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfigOrNull();
  const protectedPath = isProtectedPath(request.nextUrl.pathname);

  if (!config) {
    if (!protectedPath) return NextResponse.next({ request });
    if (isApiPath(request.nextUrl.pathname)) {
      return NextResponse.json(
        { error: "Supabase is not configured." },
        { status: 503, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    return loginRedirect(request, "config");
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(config.url, config.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;

  if (protectedPath && (error || !userId)) {
    if (isApiPath(request.nextUrl.pathname)) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401, headers: { "Cache-Control": "private, no-store" } },
      );
    }
    return loginRedirect(request);
  }

  return protectedPath ? addPrivateCacheHeaders(response) : response;
}
