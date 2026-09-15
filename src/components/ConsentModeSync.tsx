"use client";

import { useEffect } from "react";
import { useConsent } from "@/hooks/useConsent";
import { pushConsentMode } from "@/lib/consent";

/**
 * Pousse l'état du consentement dans Google Consent Mode v2.
 *
 * Un `default` en tout-refusé est poussé dès le premier rendu client, avant
 * tout chargement de gtag.js, puis un `update` à chaque changement de choix.
 * Cela couvre le retrait du consentement : GA, déjà chargé, cesse d'écrire.
 */
export function ConsentModeSync() {
  const { ready, analytics, marketing } = useConsent();

  useEffect(() => {
    pushConsentMode("default", { analytics: false, marketing: false });
  }, []);

  useEffect(() => {
    if (!ready) return;
    pushConsentMode("update", { analytics, marketing });
  }, [ready, analytics, marketing]);

  return null;
}
