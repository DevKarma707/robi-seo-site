"use client";

import { useConsent } from "@/hooks/useConsent";

/**
 * Lien « Gérer mes cookies » du pied de page : efface le choix stocké, ce qui
 * fait réapparaître le bandeau. Garantit un retrait du consentement aussi
 * simple que son octroi (exigence RGPD art. 7-3).
 */
export function ManageCookiesButton({ label }: { label: string }) {
  const { reset } = useConsent();

  return (
    <button
      type="button"
      onClick={() => {
        reset();
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }}
      className="text-left text-white/50 hover:text-[#BEF221] text-xs md:text-sm transition-colors"
    >
      {label}
    </button>
  );
}
