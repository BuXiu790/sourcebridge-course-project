import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const imageUrl = new URL("/og.png", baseUrl).toString();

  return {
    title: {
      default: "SourceBridge — Source Smarter from China",
      template: "%s | SourceBridge",
    },
    description:
      "A sourcing workflow prototype for Amazon sellers buying from China.",
    metadataBase: baseUrl,
    openGraph: {
      title: "SourceBridge — Source Smarter from China",
      description: "Supplier sourcing, comparable quotes, landed cost analysis, quality control, and fulfillment tracking in one workflow.",
      type: "website",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: "SourceBridge sourcing workflow" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "SourceBridge — Source Smarter from China",
      description: "A clearer China sourcing workflow for Amazon sellers.",
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
