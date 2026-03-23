import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bags Receipt — Print Your Trade",
  description: "Turn your Bags.fm trade into a shareable thermal receipt. Flex your gains (or roast your losses).",
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://bagsreceipt.xyz"),
  openGraph: {
    title: "Bags Receipt",
    description: "Print your Bags.fm trade as a receipt",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bags Receipt",
    description: "Print your Bags.fm trade as a receipt",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
