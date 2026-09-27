// Classement des créas de l'onglet Ads : « laquelle tourne, laquelle marche ».
//
// Meta parle en pubs ; Ralph pense en créas (une vidéo de VALIDÉ). Une même
// vidéo peut tourner dans plusieurs pubs (FR, reciblage…) : on regroupe les
// pubs par créa, on additionne, puis on juge chaque créa sur un seul critère,
// le même pour toutes — sinon on compare un coût par visite à un coût par
// achat. Aucune dépendance à React : tout se teste en pur.
import type { MetaAdRow } from "./adminApi";
import type { AdCreative } from "./adCreatives";

export type StatutCrea = "diffusion" | "probleme" | "revue" | "programmee" | "pause" | "terminee";
export type Verdict = "meilleure" | "bonne" | "moyenne" | "couper" | "tot" | "attente";

export interface LigneCrea {
  /** Id de la créa, ou `ad:<id>` pour une pub dont la vidéo n'est pas dans VALIDÉ. */
  key: string;
  titre: string;
  langue: string | null;
  cover: string | null;
  crea: AdCreative | null;
  ads: MetaAdRow[];
  statut: StatutCrea;
  /** Premier démarrage à venir, si la créa est programmée. */
  debut: string | null;
  spend: number;
  impressions: number;
  linkClicks: number;
  landingViews: number;
  leads: number;
  signups: number;
  purchases: number;
  videoViews: number;
  thruplays: number;
  /** Part des impressions qui regardent 3 s : l'accroche. */
  hook: number | null;
  /** Part des impressions qui vont au bout (ThruPlay) : la tenue. */
  hold: number | null;
  /** Clics sur le lien / impressions. */
  ctr: number | null;
  /** Nombre de résultats au sens du critère commun. */
  resultats: number;
  /** Coût par résultat au sens du critère commun. */
  cout: number | null;
  verdict: Verdict;
}

/**
 * Le critère commun, du plus précieux au plus disponible. On ne monte d'un
 * cran que quand il y a assez d'événements pour que la comparaison ait un
 * sens : 2 inscriptions contre 1, c'est du bruit.
 */
export const CRITERES = [
  { id: "purchases", label: "achat", pluriel: "achats", min: 3 },
  { id: "signups", label: "inscription", pluriel: "inscriptions", min: 5 },
  { id: "leads", label: "clic vers l'app", pluriel: "clics vers l'app", min: 10 },
  { id: "landingViews", label: "visite", pluriel: "visites", min: 0 },
] as const;
export type Critere = (typeof CRITERES)[number];

/** Une créa se juge à partir de là — avant, Meta est encore en phase d'apprentissage. */
export const SEUIL_IMPRESSIONS = 1000;
export const SEUIL_DEPENSE = 5;

const EN_REVUE = ["PENDING_REVIEW", "IN_PROCESS", "PREAPPROVAL"];
const EN_ERREUR = ["DISAPPROVED", "WITH_ISSUES", "PENDING_BILLING_INFO"];

const statutDe = (ads: MetaAdRow[], now: number): { statut: StatutCrea; debut: string | null } => {
  const t = (s: string | null) => (s ? Date.parse(s) : NaN);
  const actives = ads.filter((a) => a.status === "ACTIVE");
  const enCours = actives.filter((a) => !(t(a.startsAt) > now) && !(t(a.endsAt) <= now));
  if (enCours.length) return { statut: "diffusion", debut: null };
  if (ads.some((a) => EN_ERREUR.includes(a.status))) return { statut: "probleme", debut: null };
  if (ads.some((a) => EN_REVUE.includes(a.status))) return { statut: "revue", debut: null };
  const aVenir = actives.filter((a) => t(a.startsAt) > now).map((a) => a.startsAt!).sort();
  if (aVenir.length) return { statut: "programmee", debut: aVenir[0] };
  if (ads.length && ads.every((a) => t(a.endsAt) <= now)) return { statut: "terminee", debut: null };
  return { statut: "pause", debut: null };
};

const somme = (ads: MetaAdRow[], k: keyof MetaAdRow) => ads.reduce((s, a) => s + ((a[k] as number) || 0), 0);

/**
 * Regroupe les pubs par créa. Une pub est rattachée par sa vidéo
 * (`metaVideoIds`, posé à l'envoi chez Meta), sinon par le lien posé à la
 * main (`metaAdId`). Les pubs orphelines gardent leur propre ligne.
 */
export function classerCreas(
  creas: AdCreative[],
  ads: MetaAdRow[],
  now = Date.now()
): { lignes: LigneCrea[]; critere: Critere } {
  const vivantes = ads.filter((a) => a.status !== "ARCHIVED" && a.status !== "DELETED");
  const parCrea = new Map<string, MetaAdRow[]>();
  const orphelines: MetaAdRow[] = [];
  for (const ad of vivantes) {
    const c = creas.find((c) => (ad.videoId && c.metaVideoIds?.includes(ad.videoId)) || c.metaAdId === ad.id);
    if (c) parCrea.set(c.id, [...(parCrea.get(c.id) ?? []), ad]);
    else orphelines.push(ad);
  }

  const groupes: { key: string; crea: AdCreative | null; ads: MetaAdRow[] }[] = [
    ...[...parCrea].map(([id, list]) => ({ key: id, crea: creas.find((c) => c.id === id)!, ads: list })),
    ...orphelines.map((a) => ({ key: `ad:${a.id}`, crea: null, ads: [a] })),
  ];

  const base = groupes.map((g) => {
    const impressions = somme(g.ads, "impressions");
    const videoViews = somme(g.ads, "videoViews");
    const thruplays = somme(g.ads, "thruplays");
    const linkClicks = somme(g.ads, "linkClicks");
    return {
      key: g.key,
      titre: g.crea?.titre ?? g.ads[0].name,
      langue: g.crea?.langue ?? null,
      cover: g.crea?.coverUrl ?? g.ads[0].thumbnail,
      crea: g.crea,
      ads: g.ads,
      ...statutDe(g.ads, now),
      spend: somme(g.ads, "spend"),
      impressions,
      linkClicks,
      landingViews: somme(g.ads, "landingViews"),
      leads: somme(g.ads, "leads"),
      signups: somme(g.ads, "signups"),
      purchases: somme(g.ads, "purchases"),
      videoViews,
      thruplays,
      hook: impressions ? videoViews / impressions : null,
      hold: impressions ? thruplays / impressions : null,
      ctr: impressions ? linkClicks / impressions : null,
    };
  });

  // « visite » a un seuil de 0 : il y a toujours un critère.
  const critere = CRITERES.find((c) => base.reduce((s, l) => s + l[c.id], 0) >= c.min)!;
  const jugeable = (l: { impressions: number; spend: number }) =>
    l.impressions >= SEUIL_IMPRESSIONS || l.spend >= SEUIL_DEPENSE;

  const avecCout = base.map((l) => {
    const resultats = l[critere.id];
    return { ...l, resultats, cout: resultats > 0 && l.spend > 0 ? l.spend / resultats : null };
  });
  const couts = avecCout.filter((l) => jugeable(l) && l.cout !== null).map((l) => l.cout!);
  const meilleur = couts.length ? Math.min(...couts) : null;

  const verdictDe = (l: (typeof avecCout)[number]): Verdict => {
    if (!l.impressions && !l.spend) return "attente";
    if (!jugeable(l)) return "tot";
    if (l.cout === null) {
      // Assez dépensé pour juger, et rien au bout : on coupe dès que ça coûte
      // deux fois le résultat de la meilleure (ou 10 € s'il n'y en a aucune).
      return l.spend >= (meilleur !== null ? meilleur * 2 : 10) ? "couper" : "moyenne";
    }
    if (l.cout === meilleur) return "meilleure";
    if (meilleur !== null && l.cout <= meilleur * 1.3) return "bonne";
    if (meilleur !== null && l.cout >= meilleur * 2) return "couper";
    return "moyenne";
  };

  const RANG: Record<Verdict, number> = { meilleure: 0, bonne: 1, moyenne: 2, couper: 3, tot: 4, attente: 5 };
  const lignes: LigneCrea[] = avecCout
    .map((l) => ({ ...l, verdict: verdictDe(l) }))
    .sort(
      (a, b) =>
        RANG[a.verdict] - RANG[b.verdict] ||
        (a.cout ?? Infinity) - (b.cout ?? Infinity) ||
        b.spend - a.spend ||
        a.titre.localeCompare(b.titre)
    );

  return { lignes, critere };
}
