"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

/**
 * PostHog pour le site public — l'autre moitié du tunnel, celle que l'app
 * (go.robi-app.com) ne peut pas voir : d'où viennent les visiteurs et
 * combien cliquent vers l'app.
 *
 * Le même projet PostHog que l'app, volontairement : deux projets séparés
 * couperaient le parcours en deux et rendraient tout taux de conversion
 * incalculable. La clé doit donc être la même valeur `phc_` des deux côtés.
 *
 * No-op si la clé est absente, comme VisitLogger avec Firebase.
 */
export function PostHogTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (!POSTHOG_KEY) {
      // Échouer bruyamment. La clé est figée dans le bundle au moment du
      // build : si elle manque alors, le site se tait pour toujours sans
      // qu'aucune erreur n'apparaisse nulle part — on l'a découvert en
      // constatant zéro page vue côté PostHog alors que tout semblait posé.
      console.warn(
        "[PostHog] NEXT_PUBLIC_POSTHOG_KEY absente du build : le site " +
          "n'envoie aucune mesure. Vérifier la variable sur le projet Vercel " +
          "du site, puis redéployer (la valeur est lue à la construction).",
      );
      return;
    }
    if (posthog.__loaded) return;

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      // Le routeur App fait de la navigation côté client : la capture
      // automatique ne verrait que le premier chargement. On envoie
      // `$pageview` à la main sur chaque changement de route (plus bas).
      capture_pageview: false,
      // LE point qui relie les deux dépôts. Le cookie est posé sur
      // `.robi-app.com` plutôt que sur l'hôte exact, donc un visiteur reste
      // la même personne entre robi-app.com et go.robi-app.com. Sans ça,
      // chaque inscrit compterait pour deux et l'attribution serait perdue
      // au moment précis où elle devient intéressante. C'est déjà le
      // comportement par défaut de posthog-js pour ce domaine ; explicite
      // ici parce que tout le montage en dépend.
      cross_subdomain_cookie: true,
    });
  }, []);

  // Vue de page, y compris les navigations client. `$current_url` est lu sur
  // window plutôt que construit depuis `pathname` : il porte la query string,
  // donc les `utm_*` et le `?ref=` d'affiliation.
  useEffect(() => {
    if (!POSTHOG_KEY || !pathname) return;
    posthog.capture("$pageview", { $current_url: window.location.href });
  }, [pathname]);

  // Clic vers l'app : la dernière chose observable ici, la première marche du
  // tunnel. Délégué sur le document comme le handler d'affiliation — les CTA
  // sont dispersés dans une quinzaine de composants, les intercepter un par un
  // serait à refaire à chaque nouvelle page.
  useEffect(() => {
    if (!POSTHOG_KEY) return;

    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.("a");
      if (!link?.href?.includes("go.robi-app.com")) return;

      posthog.capture("cta_app_clicked", {
        texte: link.textContent?.trim().slice(0, 80) || undefined,
        page: window.location.pathname,
        destination: link.href,
      });
    };

    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
