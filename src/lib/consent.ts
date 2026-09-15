/**
 * Gestion du consentement cookies (RGPD / ePrivacy).
 *
 * Deux catégories non essentielles sont soumises à consentement :
 *  - `analytics`  : Google Analytics 4
 *  - `marketing`  : Tolt + Reditus (affiliation)
 *
 * Les cookies strictement nécessaires (auth, langue, thème) et la mesure
 * d'audience interne (VisitLogger → Firestore, agrégée, sans identifiant
 * persistant) ne sont pas soumis à consentement — cf. exemption CNIL.
 */

export const CONSENT_STORAGE_KEY = "robi_cookie_consent";

/** Version du bandeau. L'incrémenter invalide les choix passés (nouveau tracker, etc.). */
export const CONSENT_VERSION = 1;

export type ConsentCategory = "analytics" | "marketing";

export interface ConsentState {
  version: number;
  /** Date ISO du choix — sert de preuve de consentement. */
  date: string;
  analytics: boolean;
  marketing: boolean;
}

/** Aucun consentement par défaut : tout est refusé tant que l'utilisateur n'a pas choisi. */
export const DENIED_ALL: Omit<ConsentState, "version" | "date"> = {
  analytics: false,
  marketing: false,
};

export const GRANTED_ALL: Omit<ConsentState, "version" | "date"> = {
  analytics: true,
  marketing: true,
};

/** Évènement émis quand le choix change, pour que les composants se remontent. */
export const CONSENT_EVENT = "robi:consent-change";

/**
 * Lit le choix stocké. Retourne `null` si aucun choix valide n'a été fait —
 * l'appelant doit alors traiter tout comme refusé et afficher le bandeau.
 */
export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== CONSENT_VERSION) return null;
    return {
      version: CONSENT_VERSION,
      date: typeof parsed.date === "string" ? parsed.date : new Date().toISOString(),
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
    };
  } catch {
    return null;
  }
}

/** Enregistre le choix et notifie l'application. */
export function writeConsent(choice: Omit<ConsentState, "version" | "date">): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    date: new Date().toISOString(),
    analytics: choice.analytics,
    marketing: choice.marketing,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage indisponible (navigation privée stricte) : on n'échoue pas,
      // le choix vaudra pour la session en cours via l'évènement ci-dessous.
    }
    window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_EVENT, { detail: state }));
  }
  return state;
}

/** Efface le choix : le bandeau réapparaît (utilisé par « Gérer mes cookies »). */
export function clearConsent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // idem : pas de localStorage, rien à effacer.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}

/**
 * Pousse l'état du consentement dans Google Consent Mode v2.
 * Appelé au boot (tout `denied`) puis à chaque changement (`update`).
 */
export function pushConsentMode(
  mode: "default" | "update",
  choice: Pick<ConsentState, "analytics" | "marketing">
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  // gtag() pousse son objet `arguments` brut dans dataLayer : Google lit un
  // objet array-like (clés "0","1","2" + length), pas un vrai tableau. On
  // reproduit exactement cette forme.
  const payload = {
    ad_storage: choice.marketing ? "granted" : "denied",
    ad_user_data: choice.marketing ? "granted" : "denied",
    ad_personalization: choice.marketing ? "granted" : "denied",
    analytics_storage: choice.analytics ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  };
  w.dataLayer.push({ 0: "consent", 1: mode, 2: payload, length: 3 });
}
