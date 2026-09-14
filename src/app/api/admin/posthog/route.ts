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
  const eventList = FUNNEL_EVENTS.map((e) => `'${e}'`).join(", ");

  try {
    const [funnelRows, errorRows, ctaRows, hostRows] = await Promise.all([
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
    ]);

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
      })),
      erreurs: errorRows.map((r) => ({
        type: r[0] ? String(r[0]) : "Erreur",
        message: r[1] ? String(r[1]) : "(sans message)",
        total: Number(r[2]) || 0,
        personnes: Number(r[3]) || 0,
        dernier: r[4] ? String(r[4]) : null,
      })),
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
