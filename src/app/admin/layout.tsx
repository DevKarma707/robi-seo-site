import type { Metadata } from "next";
import { Inter } from "next/font/google";

/**
 * `<html>` et `<body>` vivaient uniquement dans `[locale]/layout.tsx`, or
 * `/admin` est hors de ce segment : la route n'avait donc aucun layout
 * fournissant la structure du document. Next s'en accommodait en production
 * mais le signalait en développement, ce qui empêchait toute itération
 * visuelle sur l'admin.
 *
 * L'admin est privé : pas d'indexation, et la langue est fixée à fr.
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Admin — Robi AI",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
