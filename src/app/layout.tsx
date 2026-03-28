import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Robi AI | Logiciel de Facturation IA pour Freelances",
    template: "%s | Robi AI",
  },
  description:
    "Créez vos devis et factures en 30 secondes avec l'IA. Relances automatiques, paiement Stripe intégré. Rejoignez 2000+ freelances.",
  keywords: [
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
    url: "https://www.robi-app.com",
    title: "Robi AI | Logiciel de Facturation IA pour Freelances",
    description:
      "Créez vos devis et factures en 30 secondes avec l'IA. Relances automatiques, paiement Stripe intégré.",
    siteName: "Robi AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Robi AI | Logiciel de Facturation IA",
    description: "Créez vos devis et factures en 30 secondes avec l'IA.",
    creator: "@robi_ai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
