import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@/components/Analytics";

export const metadata: Metadata = {
  title: {
    default: "Facture AI : Devis & Factures par Intelligence Artificielle | Robi",
    template: "%s | Robi AI",
  },
  description:
    "Robi, la facture AI : créez vos devis et factures en 30 secondes en parlant à l'IA. Relances automatiques, paiement Stripe intégré. Essai gratuit.",
  keywords: [
    "facture ai",
    "facture ia",
    "facturation freelance",
    "logiciel facturation",
    "facture auto-entrepreneur",
    "devis en ligne",
    "facturation ia",
  ],
  authors: [{ name: "Robi AI" }],
  creator: "Robi AI",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://robi-app.com",
    title: "Facture AI : Devis & Factures par Intelligence Artificielle | Robi",
    description:
      "Robi, la facture AI : créez vos devis et factures en 30 secondes en parlant à l'IA. Relances automatiques, paiement Stripe intégré.",
    siteName: "Robi AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Facture AI : Factures par Intelligence Artificielle | Robi",
    description: "Robi, la facture AI : créez vos devis et factures en 30 secondes en parlant à l'IA.",
    creator: "@robi_ai",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "1024x1024" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Analytics />
      {children}
    </>
  );
}
