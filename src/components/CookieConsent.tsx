"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { useConsent } from "@/hooks/useConsent";
import { Locale } from "@/lib/i18n/config";

interface CookieConsentProps {
  locale: Locale;
  dict: any;
}

/**
 * Bandeau de consentement cookies.
 *
 * Contraintes RGPD/CNIL respectées ici :
 *  - refuser est aussi simple qu'accepter (deux boutons de même niveau) ;
 *  - aucune case pré-cochée : les toggles du panneau démarrent à `false` ;
 *  - fermer sans choisir est impossible (pas de croix) — poursuivre la
 *    navigation ne vaut pas consentement, donc rien n'est déposé entre-temps ;
 *  - le choix est révocable via « Gérer mes cookies » en pied de page.
 */
export function CookieConsent({ locale, dict }: CookieConsentProps) {
  const { ready, hasChoice, accept } = useConsent();
  const [panelOpen, setPanelOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  // Rouvrir le panneau quand le choix est révoqué depuis le footer.
  useEffect(() => {
    if (!hasChoice) {
      setAnalytics(false);
      setMarketing(false);
    }
  }, [hasChoice]);

  // Tant que localStorage n'est pas lu, ne rien afficher (évite le flash).
  if (!ready || hasChoice) return null;

  const t = dict?.cookies ?? {};

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4"
    >
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#0D0630]/95 p-4 text-white shadow-2xl backdrop-blur-md sm:p-5">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-[#BEF221]" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 id="cookie-consent-title" className="text-sm font-bold sm:text-base">
              {t.title || "Nous respectons votre vie privée"}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-white/70 sm:text-sm">
              {t.description ||
                "Nous utilisons des cookies de mesure d'audience et d'affiliation. Ils ne sont déposés qu'avec votre accord."}{" "}
              <Link
                href={`/${locale}/privacy`}
                className="underline underline-offset-2 hover:text-[#BEF221]"
              >
                {t.learnMore || "En savoir plus"}
              </Link>
            </p>

            {panelOpen && (
              <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                <CategoryRow
                  title={t.essentialTitle || "Cookies essentiels"}
                  description={
                    t.essentialDescription ||
                    "Nécessaires au fonctionnement du site. Toujours actifs."
                  }
                  checked
                  disabled
                  alwaysOnLabel={t.alwaysOn || "Toujours actifs"}
                />
                <CategoryRow
                  title={t.analyticsTitle || "Cookies analytiques"}
                  description={
                    t.analyticsDescription ||
                    "Google Analytics — mesurer l'audience et améliorer le site."
                  }
                  checked={analytics}
                  onChange={setAnalytics}
                />
                <CategoryRow
                  title={t.marketingTitle || "Cookies marketing"}
                  description={
                    t.marketingDescription ||
                    "Suivi des programmes d'affiliation (Tolt, Reditus)."
                  }
                  checked={marketing}
                  onChange={setMarketing}
                />
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              {panelOpen ? (
                <button
                  type="button"
                  onClick={() => accept({ analytics, marketing })}
                  className="rounded-full bg-[#BEF221] px-5 py-2.5 text-xs font-bold text-[#0D0630] transition-transform active:scale-95 sm:text-sm"
                >
                  {t.savePreferences || "Enregistrer mes choix"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => accept({ analytics: true, marketing: true })}
                  className="rounded-full bg-[#BEF221] px-5 py-2.5 text-xs font-bold text-[#0D0630] transition-transform active:scale-95 sm:text-sm"
                >
                  {t.acceptAll || "Tout accepter"}
                </button>
              )}

              {/* Même poids visuel que l'acceptation : exigence CNIL. */}
              <button
                type="button"
                onClick={() => accept({ analytics: false, marketing: false })}
                className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/10 sm:text-sm"
              >
                {t.rejectAll || "Tout refuser"}
              </button>

              {!panelOpen && (
                <button
                  type="button"
                  onClick={() => setPanelOpen(true)}
                  className="px-2 py-2.5 text-xs font-medium text-white/60 underline underline-offset-2 transition-colors hover:text-white sm:text-sm"
                >
                  {t.customize || "Personnaliser"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
  alwaysOnLabel,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  alwaysOnLabel?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold sm:text-sm">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-white/60 sm:text-xs">
          {description}
        </p>
      </div>
      {disabled ? (
        <span className="shrink-0 whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/50">
          {alwaysOnLabel}
        </span>
      ) : (
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          onClick={() => onChange?.(!checked)}
          className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
            checked
              ? "border-[#BEF221] bg-[#BEF221]"
              : "border-white/25 bg-white/10"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full transition-transform ${
              checked ? "translate-x-[21px] bg-white" : "translate-x-0.5 bg-white/50"
            }`}
          />
        </button>
      )}
    </div>
  );
}
