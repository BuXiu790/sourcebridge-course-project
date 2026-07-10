"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton({ config }: { config: SupabasePublicConfig }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);
    const supabase = createClient(config);
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isSigningOut}
      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:text-slate-400"
    >
      {isSigningOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
