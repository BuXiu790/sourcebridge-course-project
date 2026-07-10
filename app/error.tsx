"use client";

import { Button } from "@/components/ui/Button";
import { ErrorAlert } from "@/components/ui/States";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-20">
      <ErrorAlert message="The page could not be displayed. Your demo data has not been changed." />
      <Button onClick={reset} className="mt-5">Try again</Button>
    </main>
  );
}
