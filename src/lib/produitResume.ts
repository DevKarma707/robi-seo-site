import type { ProduitReport } from "./adminApi";

/**
 * Transforme le rapport PostHog en quelques phrases lisibles.
 *
 * Un tableau de chiffres demande d'être interprété à chaque lecture ; une
 * phrase dit directement ce qui s'est passé. C'est cette version-là qu'on
 * relit le lundi matin, ou qu'on colle dans une conversation.
 *
 * Fonction pure, sans appel réseau : les mêmes données donnent toujours le
 * même texte, et le calcul reste vérifiable ligne à ligne.
 */

const pct = (part: number, total: number): string =>
  total > 0 ? `${Math.round((part / total) * 100)} %` : "—";

/** « 1 personne » / « 4 personnes » — le pluriel muet trahit un texte généré. */
const pl = (n: number, sing: string, plur = `${sing}s`) => `${n} ${n > 1 ? plur : sing}`;

export function construireResume(data: ProduitReport): string {
  if (!data.configured || !data.funnel) return "Rapport indisponible : PostHog n'est pas configuré.";

  const val = (event: string) => data.funnel!.find((f) => f.event === event)?.personnes ?? 0;

  const vues = val("$pageview");
  const clics = val("cta_app_clicked");
  const inscrits = val("signup");
  const actives = val("first_document_created");
  const pdf = val("pdf_downloaded");
  const paywall = val("paywall_viewed");
  const checkout = val("checkout_started");
  const payes = val("checkout_completed");

  const erreurs = data.erreurs ?? [];
  const occurrences = erreurs.reduce((s, e) => s + e.total, 0);
  const touches = erreurs.reduce((s, e) => s + e.personnes, 0);

  const lignes: string[] = [
    `Rapport produit — ${data.days} derniers jours`,
    "",
    `Acquisition : ${pl(vues, "personne")} ${vues > 1 ? "ont" : "a"} vu le site, ${clics} ${clics > 1 ? "ont" : "a"} cliqué vers l'app (${pct(clics, vues)}).`,
    `Inscriptions : ${pl(inscrits, "compte créé", "comptes créés")}${clics > 0 ? ` (${pct(inscrits, clics)} des clics)` : ""}.`,
    `Activation : ${pl(actives, "personne")} ${actives > 1 ? "ont" : "a"} créé un premier document${inscrits > 0 ? ` (${pct(actives, inscrits)} des inscrits)` : ""}, ${pl(pdf, "a téléchargé un PDF", "ont téléchargé un PDF")}.`,
    `Paiement : ${pl(paywall, "personne")} ${paywall > 1 ? "ont" : "a"} atteint la limite gratuite, ${checkout} ${checkout > 1 ? "ont" : "a"} lancé un paiement, ${pl(payes, "a payé", "ont payé")}.`,
  ];

  if (erreurs.length === 0) {
    lignes.push("Bugs : aucun sur la période.");
  } else {
    lignes.push(
      `Bugs : ${pl(erreurs.length, "erreur distincte", "erreurs distinctes")}, ${pl(occurrences, "occurrence")}, ${pl(touches, "personne touchée", "personnes touchées")}. La plus fréquente : « ${erreurs[0].message.slice(0, 120)} » (${erreurs[0].total}×).`
    );
  }

  // La marche la plus coûteuse en valeur absolue, pas en pourcentage : perdre
  // 80 personnes sur 100 pèse plus lourd que perdre 1 inscrit sur 2, même si
  // le second taux est plus spectaculaire.
  const etapes = data.funnel.filter((f) => f.personnes > 0);
  let pireEtape: { de: string; vers: string; perdus: number } | null = null;
  for (let i = 1; i < etapes.length; i++) {
    const perdus = etapes[i - 1].personnes - etapes[i].personnes;
    if (perdus > 0 && (!pireEtape || perdus > pireEtape.perdus)) {
      pireEtape = { de: etapes[i - 1].event, vers: etapes[i].event, perdus };
    }
  }

  if (pireEtape) {
    const LIB: Record<string, string> = {
      $pageview: "la visite du site",
      cta_app_clicked: "le clic vers l'app",
      signup: "l'inscription",
      first_document_created: "le premier document",
      pdf_downloaded: "le téléchargement du PDF",
      paywall_viewed: "la limite gratuite",
      checkout_started: "le début de paiement",
      checkout_completed: "le paiement",
    };
    lignes.push(
      "",
      `Là où ça coince : entre ${LIB[pireEtape.de] ?? pireEtape.de} et ${LIB[pireEtape.vers] ?? pireEtape.vers}, ${pireEtape.perdus} ${pireEtape.perdus > 1 ? "personnes abandonnent" : "personne abandonne"}.`
    );
  }

  if (vues === 0 && inscrits === 0) {
    lignes.push("", "Aucune donnée sur la période — trafic réellement nul, ou mesure pas encore déployée.");
  }

  return lignes.join("\n");
}
