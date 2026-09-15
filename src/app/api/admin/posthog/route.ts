import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Rapport produit : le tunnel et les bugs, lus dans PostHog.
 *
 * La clé personnelle PostHog (`phx_`) donne accès en LECTURE à toutes les
 * données du projet — elle ne doit jamais atteindre le navigateur. D'où cette
 * route serveur : le navigateur demande un rapport déjà agrégé, jamais la clé.
 * C'est le même partage des rôles que `adminAuth` avec le secret des
 * Cloud Functions.
 *
 * À ne pas confondre avec la clé `phc_` du site et de l'app, publique par
 * nature et qui, elle, ne sait qu'écrire des événements.
 */

const API_HOST = process.env.POSTHOG_API_HOST || "https://eu.posthog.com";
const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID;

/** Les moments du parcours, dans l'ordre où un utilisateur les traverse. */
const FUNNEL_EVENTS = [
  "$pageview",
  "cta_app_clicked",
  "signup",
  "first_document_created",
  "pdf_downloaded",
  "paywall_viewed",
  "checkout_started",
  "checkout_completed",
] as const;

type Row = (string | number | null)[];

async function hogql(query: string): Promise<Row[]> {
  const res = await fetch(`${API_HOST}/api/projects/${PROJECT_ID}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`posthog_${res.status}: ${detail.slice(0, 300)}`);
  }

  const json = (await res.json()) as { results?: Row[] };
  return json.results ?? [];
}

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  if (!API_KEY || !PROJECT_ID) {
    // Pas une erreur : l'onglet sait afficher la marche à suivre. Renvoyer un
    // 500 ici ferait passer une configuration manquante pour une panne.
    return NextResponse.json({ configured: false });
  }

  // Borné puis réinjecté comme entier : la valeur atterrit dans une requête
  // HogQL, une chaîne libre venant de l'URL n'y a pas sa place.
  const raw = Number(new URL(req.url).searchParams.get("days") || 7);
  const days = Number.isFinite(raw) ? Math.min(90, Math.max(1, Math.trunc(raw))) : 7;

  const since = `timestamp > now() - INTERVAL ${days} DAY`;
  const sincePrev = `timestamp > now() - INTERVAL ${days * 2} DAY AND timestamp <= now() - INTERVAL ${days} DAY`;
  const eventList = FUNNEL_EVENTS.map((e) => `'${e}'`).join(", ");
  const afterSignup = FUNNEL_EVENTS.slice(FUNNEL_EVENTS.indexOf("signup") + 1).map((e) => `'${e}'`).join(", ");

  // Les lectures ajoutées après coup (comparaison, anciens inscrits, pages
  // d'arrivée, sessions) ne doivent jamais faire tomber l'onglet : si PostHog
  // en refuse une, le rapport de base s'affiche quand même, sans ce bloc.
  const secondaire = (p: Promise<Row[]>) =>
    p.catch((e) => {
      console.error("[posthog] lecture secondaire ignorée", e);
      return null;
    });

  try {
    const [funnelRows, errorRows, ctaRows, hostRows, prevRows, anciensRows, origineRows, sessionRows] = await Promise.all([
      hogql(
        `SELECT event, count() AS total, count(DISTINCT person_id) AS personnes
         FROM events WHERE ${since} AND event IN (${eventList})
         GROUP BY event`
      ),
      // Les occurrences sont regroupées par type + message : une même erreur
      // chez trente utilisateurs doit se lire comme une ligne à traiter, pas
      // comme trente incidents distincts.
      hogql(
        `SELECT properties.$exception_type AS type,
                properties.$exception_message AS message,
                count() AS total,
                count(DISTINCT person_id) AS personnes,
                max(timestamp) AS dernier
         FROM events WHERE ${since} AND event IN ('$exception', 'error_boundary_caught')
         GROUP BY type, message ORDER BY total DESC LIMIT 10`
      ),
      hogql(
        `SELECT properties.page AS page, count() AS total
         FROM events WHERE ${since} AND event = 'cta_app_clicked'
         GROUP BY page ORDER BY total DESC LIMIT 10`
      ),
      // Quels domaines envoient réellement. Le site et l'app alimentent le
      // même projet : si l'un des deux disparaît de cette liste, la moitié du
      // tunnel est morte sans que les chiffres ne le disent — ils affichent
      // seulement des zéros, indistinguables d'une absence de trafic.
      hogql(
        `SELECT properties.$host AS domaine, count() AS total, max(timestamp) AS dernier
         FROM events WHERE ${since} AND isNotNull(properties.$host)
         GROUP BY domaine ORDER BY total DESC LIMIT 10`
      ),
      // Même tunnel sur la période d'avant, pour la flèche d'évolution.
      secondaire(hogql(
        `SELECT event, count(DISTINCT person_id) AS personnes
         FROM events WHERE ${sincePrev} AND event IN (${eventList})
         GROUP BY event`
      )),
      // Le tunnel compte chaque marche séparément : quelqu'un inscrit le mois
      // dernier peut créer un document cette semaine. Sans ce décompte, le
      // tunnel affiche « 0 inscrit, 1 document » et paraît faux.
      secondaire(hogql(
        `SELECT event, count(DISTINCT person_id) AS anciens
         FROM events WHERE ${since} AND event IN (${afterSignup})
           AND person_id NOT IN (SELECT person_id FROM events WHERE ${since} AND event = 'signup')
         GROUP BY event`
      )),
      // D'où viennent les inscrits et les payants : première page vue et site
      // d'origine, propriétés posées par posthog-js au premier passage. Le
      // cookie est partagé entre robi-app.com et go.robi-app.com, donc un
      // inscrit venu par un article garde cet article comme page d'arrivée.
      secondaire(hogql(
        `SELECT person.properties.$initial_current_url AS page,
                person.properties.$initial_referring_domain AS origine,
                count(DISTINCT if(event = 'signup', person_id, NULL)) AS inscrits,
                count(DISTINCT if(event = 'checkout_completed', person_id, NULL)) AS payants
         FROM events WHERE ${since} AND event IN ('signup', 'checkout_completed')
         GROUP BY page, origine ORDER BY inscrits DESC, payants DESC LIMIT 15`
      )),
      // Session de la dernière occurrence de chaque erreur, pour ouvrir l'enregistrement.
      secondaire(hogql(
        `SELECT properties.$exception_type AS type,
                properties.$exception_message AS message,
                argMax(properties.$session_id, timestamp) AS session
         FROM events WHERE ${since} AND event IN ('$exception', 'error_boundary_caught')
         GROUP BY type, message`
      )),
    ]);

    const countBy = (rows: Row[] | null) =>
      rows ? Object.fromEntries(rows.map((r) => [String(r[0]), Number(r[1]) || 0])) : null;
    const prev = countBy(prevRows);
    const anciens = countBy(anciensRows);
    const sessions = new Map((sessionRows ?? []).map((r) => [`${r[0] ?? ""}|${r[1] ?? ""}`, r[2] ? String(r[2]) : null]));

    const funnel = Object.fromEntries(
      funnelRows.map((r) => [String(r[0]), { total: Number(r[1]) || 0, personnes: Number(r[2]) || 0 }])
    );

    return NextResponse.json({
      configured: true,
      days,
      // L'ordre du parcours vient du code, pas de PostHog : un événement jamais
      // déclenché n'a pas de ligne dans le résultat et disparaîtrait du tunnel
      // au moment où son absence est justement l'information utile.
      funnel: FUNNEL_EVENTS.map((event) => ({
        event,
        total: funnel[event]?.total ?? 0,
        personnes: funnel[event]?.personnes ?? 0,
        // Absents (undefined) si la lecture a échoué : l'onglet masque alors flèches et mentions.
        ...(prev ? { precedent: prev[event] ?? 0 } : {}),
        ...(anciens ? { anciens: anciens[event] ?? 0 } : {}),
      })),
      erreurs: errorRows.map((r) => {
        const session = sessions.get(`${r[0] ?? ""}|${r[1] ?? ""}`);
        return {
          type: r[0] ? String(r[0]) : "Erreur",
          message: r[1] ? String(r[1]) : "(sans message)",
          total: Number(r[2]) || 0,
          personnes: Number(r[3]) || 0,
          dernier: r[4] ? String(r[4]) : null,
          // Lien direct vers l'enregistrement de la dernière occurrence, s'il existe.
          replay: session ? `${API_HOST}/project/${PROJECT_ID}/replay/${encodeURIComponent(session)}` : null,
        };
      }),
      // null = lecture refusée par PostHog, à ne pas confondre avec « aucune inscription ».
      origines: origineRows
        ? origineRows.map((r) => ({
            page: r[0] ? String(r[0]) : null,
            origine: r[1] ? String(r[1]) : null,
            inscrits: Number(r[2]) || 0,
            payants: Number(r[3]) || 0,
          }))
        : null,
      cta: ctaRows.map((r) => ({ page: r[0] ? String(r[0]) : "—", total: Number(r[1]) || 0 })),
      mesure: {
        // Lue côté serveur : `NEXT_PUBLIC_` est inlinée dans le bundle du
        // navigateur au build, mais reste lisible ici. C'est le seul moyen de
        // distinguer « clé absente » de « personne n'est venu ».
        cleSiteConfiguree: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
        domaines: hostRows.map((r) => ({
          domaine: r[0] ? String(r[0]) : "—",
          total: Number(r[1]) || 0,
          dernier: r[2] ? String(r[2]) : null,
        })),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "posthog_failed" },
      { status: 502 }
    );
  }
}
