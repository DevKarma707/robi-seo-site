"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CONSENT_EVENT,
  ConsentState,
  DENIED_ALL,
  clearConsent,
  readConsent,
  writeConsent,
} from "@/lib/consent";

/**
 * État du consentement, synchronisé entre tous les composants montés
 * (via l'évènement `CONSENT_EVENT`) et entre onglets (via `storage`).
 *
 * `ready` reste `false` durant le premier rendu serveur/hydratation : tant
 * qu'il est faux, aucun tracker ne doit être monté et le bandeau reste caché
 * (sinon il flasherait à chaque navigation même après acceptation).
 */
export function useConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);

    const onChange = () => setConsent(readConsent());
    window.addEventListener(CONSENT_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CONSENT_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const accept = useCallback((choice: Pick<ConsentState, "analytics" | "marketing">) => {
    writeConsent({ analytics: choice.analytics, marketing: choice.marketing });
  }, []);

  const reset = useCallback(() => clearConsent(), []);

  return {
    ready,
    /** `true` seulement si l'utilisateur a fait un choix explicite. */
    hasChoice: consent !== null,
    /** Refus par défaut tant qu'aucun choix n'a été exprimé. */
    analytics: consent?.analytics ?? DENIED_ALL.analytics,
    marketing: consent?.marketing ?? DENIED_ALL.marketing,
    accept,
    reset,
  };
}
