import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";
import { MODE_SCRIPT } from "@/lib/adminMode";

/**
 * `<html>` et `<body>` vivaient uniquement dans `[locale]/layout.tsx`, or
 * `/admin` est hors de ce segment : la route n'avait donc aucun layout
 * fournissant la structure du document. Next s'en accommodait en production
 * mais le signalait en développement, ce qui empêchait toute itération
 * visuelle sur l'admin.
 *
 * L'admin est privé : pas d'indexation, et la langue est fixée à fr.
 */

/**
 * Refonte de septembre 2026 : Manrope pour toute l'interface, JetBrains Mono
 * pour les chiffres. Outfit et Inter se ressemblaient trop pour créer une
 * hiérarchie ; un couple sans-serif / monospace la donne sans effort.
 */
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Admin — Robi AI",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // Le script pose `data-admin-mode` sur <html> avant l'hydratation : React
    // ne l'a pas rendu, d'où le suppressHydrationWarning.
    <html lang="fr" suppressHydrationWarning>
      <body className={`${manrope.variable} ${mono.variable} antialiased`}>
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
