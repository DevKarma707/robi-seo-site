/**
 * Trafic interne : les appareils de l'équipe ne doivent pas gonfler les
 * statistiques (compteur maison de l'onglet Analytics, PostHog du site).
 *
 * Pas de filtre par adresse IP : elle change entre le wifi, la 4G et chaque
 * lieu de travail, et laisserait passer la moitié des visites. On marque
 * plutôt l'appareil : ouvrir l'admin avec un compte autorisé suffit, une fois
 * par navigateur.
 *
 * Le marqueur vit à deux endroits :
 *  - un cookie posé sur `.robi-app.com`, lisible aussi depuis go.robi-app.com ;
 *  - localStorage, qui survit quand le cookie est effacé ou en local.
 *
 * L'activité dans l'app, elle, est exclue côté requêtes PostHog par email
 * (route /api/admin/posthog) : ça couvre tous les appareils et l'historique.
 */

const KEY = "robi_interne";
const CINQ_ANS = 60 * 60 * 24 * 365 * 5;

export function markInternalDevice(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // Navigation privée ou stockage bloqué : le cookie prend le relais.
  }
  const domain = window.location.hostname.endsWith("robi-app.com") ? "; domain=.robi-app.com" : "";
  document.cookie = `${KEY}=1; path=/; max-age=${CINQ_ANS}; SameSite=Lax${domain}`;
}

export function isInternalDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (document.cookie.split("; ").some((c) => c === `${KEY}=1`)) return true;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
