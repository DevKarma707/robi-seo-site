import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

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

/**
 * Outfit est la police de titres de la charte (BRAND_KIT §3, poids 600–800).
 * L'admin ne l'utilisait nulle part : tout était en Inter, d'où des titres
 * qui ne se distinguaient du corps de texte que par la graisse.
 */
const outfit = Outfit({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Admin — Robi AI",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>{children}</body>
    </html>
  );
}
