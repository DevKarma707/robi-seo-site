import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Onglet Ads : ce que les pubs Meta coûtent et rapportent, lu dans l'API
 * Marketing (Graph API).
 *
 * Le jeton (utilisateur système du Business Manager « Robi Ai », droit
 * ads_read) lit tout le compte publicitaire : il reste ici, sur le serveur.
 * Le navigateur reçoit des agrégats déjà calculés, jamais le jeton — même
 * partage des rôles que la route PostHog.
 */

const GRAPH = "https://graph.facebook.com/v23.0";
const TOKEN = process.env.META_ADS_ACCESS_TOKEN;
/** Compte « Robi AI ». Les comptes perso et AIR-Agency du même utilisateur sont ignorés. */
const ACCOUNT_ID = (process.env.META_AD_ACCOUNT_ID || "1585474145862630").replace(/^act_/, "");

const INSIGHT_FIELDS = "spend,impressions,reach,clicks,ctr,cpc,cpm,actions,action_values,purchase_roas";
/**
 * Par pub, en plus : de quoi juger une vidéo — l'accroche (vues de 3 s),
 * la tenue (ThruPlay), les clics sur le lien et la fréquence.
 */
const AD_INSIGHT_FIELDS = `${INSIGHT_FIELDS},inline_link_clicks,frequency,video_thruplay_watched_actions`;

/** Période du classement des pubs, choisie dans l'onglet. Le graphe et les KPI restent sur 30 jours. */
const PERIODES = { "7": 7, "30": 30, max: null } as const;
type Periode = keyof typeof PERIODES;

/**
 * Ce qu'on appelle « résultat », du plus au moins précieux. Meta ne renvoie
 * pas le « résultat » de l'interface dans l'API d'insights : on prend le
 * premier type d'action qui remonte, et on le nomme — un « coût par
 * résultat » sans savoir de quel résultat on parle ne se compare à rien.
 */
const RESULT_TYPES: { types: string[]; label: string }[] = [
  { types: ["omni_purchase", "purchase", "offsite_conversion.fb_pixel_purchase"], label: "achats" },
  { types: ["omni_complete_registration", "complete_registration", "offsite_conversion.fb_pixel_complete_registration"], label: "inscriptions" },
  { types: ["lead", "offsite_conversion.fb_pixel_lead", "onsite_conversion.lead_grouped"], label: "leads" },
  { types: ["omni_app_install", "mobile_app_install", "app_install"], label: "installations" },
  { types: ["landing_page_view", "omni_landing_page_view"], label: "vues de page" },
  { types: ["link_click"], label: "clics sur le lien" },
];
const PURCHASE_TYPES = RESULT_TYPES[0].types;

type Action = { action_type: string; value: string };
interface Insight {
  date_start?: string;
  spend?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: Action[];
  action_values?: Action[];
  purchase_roas?: Action[];
  inline_link_clicks?: string;
  frequency?: string;
  video_thruplay_watched_actions?: Action[];
}
interface GraphList<T> { data?: T[]; paging?: { next?: string } }

class MetaError extends Error {
  constructor(message: string, public code?: number) { super(message); }
}

async function graph<T>(pathOrUrl: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(pathOrUrl.startsWith("http") ? pathOrUrl : `${GRAPH}/${pathOrUrl}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  // En en-tête plutôt qu'en paramètre : une URL finit dans les journaux, pas un en-tête.
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` }, cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } };
  if (!res.ok || json.error) {
    throw new MetaError(json.error?.message || `meta_${res.status}`, json.error?.code);
  }
  return json as T;
}

/** Suit la pagination, bornée : au-delà de 500 pubs, l'onglet n'est plus le bon outil. */
async function graphAll<T>(path: string, params: Record<string, string>, max = 500): Promise<T[]> {
  const out: T[] = [];
  let page = await graph<GraphList<T>>(path, params);
  out.push(...(page.data ?? []));
  while (page.paging?.next && out.length < max) {
    page = await graph<GraphList<T>>(page.paging.next);
    out.push(...(page.data ?? []));
  }
  return out;
}

const n = (s?: string) => (s ? Number(s) || 0 : 0);
const sumTypes = (list: Action[] | undefined, types: string[]) => {
  // Meta renvoie souvent la même conversion sous plusieurs noms (omni_…,
  // offsite_…) : on prend le premier présent, jamais la somme.
  for (const t of types) {
    const hit = list?.find((a) => a.action_type === t);
    if (hit) return n(hit.value);
  }
  return 0;
};

/** Le premier type de résultat présent dans ces actions. */
const resultOf = (actions?: Action[]) => {
  for (const r of RESULT_TYPES) {
    const v = sumTypes(actions, r.types);
    if (v > 0) return { value: v, label: r.label };
  }
  return { value: 0, label: null as string | null };
};

const roasOf = (i: Insight) => {
  const direct = i.purchase_roas?.[0]?.value;
  if (direct) return Number(direct) || null;
  const valeur = sumTypes(i.action_values, PURCHASE_TYPES);
  return valeur > 0 && n(i.spend) > 0 ? valeur / n(i.spend) : null;
};

/** AAAA-MM-JJ dans le fuseau du compte : « aujourd'hui » chez Meta n'est pas celui du serveur Vercel (UTC). */
const dayIn = (tz: string, offsetDays = 0) => {
  const d = new Date(Date.now() - offsetDays * 86_400_000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
};

/** Budgets en centimes chez Meta (devises à deux décimales, dont l'euro). */
const budget = (s?: string) => (s ? Number(s) / 100 : null);

/** Date Meta (« 2026-10-01T00:00:00+0200 ») → ISO, ou null. */
const iso = (s?: string) => {
  if (!s) return null;
  const t = Date.parse(s.replace(/([+-]\d{2})(\d{2})$/, "$1:$2"));
  return Number.isNaN(t) ? null : new Date(t).toISOString();
};

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  if (!TOKEN) {
    // Pas une panne : l'onglet affiche la marche à suivre pour brancher Meta.
    return NextResponse.json({ configured: false, accountId: ACCOUNT_ID });
  }

  const act = `act_${ACCOUNT_ID}`;
  const demandee = new URL(req.url).searchParams.get("periode") ?? "30";
  const periode: Periode = demandee in PERIODES ? (demandee as Periode) : "30";

  try {
    const account = await graph<{
      id: string; name: string; currency: string; timezone_name: string; account_status: number; amount_spent?: string;
    }>(act, { fields: "name,currency,timezone_name,account_status,amount_spent" });

    const tz = account.timezone_name || "Europe/Paris";
    const today = dayIn(tz);
    const since = dayIn(tz, 29);
    const timeRange = JSON.stringify({ since, until: today });
    const jours = PERIODES[periode];
    const adInsights = jours === null
      ? `insights.date_preset(maximum){${AD_INSIGHT_FIELDS}}`
      : `insights.time_range(${JSON.stringify({ since: dayIn(tz, jours - 1), until: today })}){${AD_INSIGHT_FIELDS}}`;

    const [dailyRows, ads, pixels] = await Promise.all([
      graphAll<Insight>(`${act}/insights`, {
        level: "account",
        time_increment: "1",
        time_range: timeRange,
        fields: INSIGHT_FIELDS,
        limit: "100",
      }),
      graphAll<{
        id: string; name: string; effective_status: string; created_time?: string;
        campaign?: { id: string; name: string; objective?: string; daily_budget?: string; lifetime_budget?: string; start_time?: string; stop_time?: string };
        adset?: { id: string; name: string; daily_budget?: string; lifetime_budget?: string; optimization_goal?: string; start_time?: string; end_time?: string };
        creative?: { id: string; thumbnail_url?: string; image_url?: string; video_id?: string };
        insights?: { data?: Insight[] };
      }>(`${act}/ads`, {
        fields: [
          "name", "effective_status", "created_time",
          "campaign{name,objective,daily_budget,lifetime_budget,start_time,stop_time}",
          "adset{name,daily_budget,lifetime_budget,optimization_goal,start_time,end_time}",
          "creative{thumbnail_url,image_url,video_id}",
          adInsights,
        ].join(","),
        limit: "100",
      }),
      // Lecture secondaire : un refus sur les pixels ne doit pas masquer les dépenses.
      graph<GraphList<{ id: string; name: string; last_fired_time?: string }>>(`${act}/adspixels`, {
        fields: "name,last_fired_time",
      }).then((r) => r.data ?? []).catch(() => null),
    ]);

    // Meta n'envoie pas les jours sans dépense : on les recrée à zéro, sinon
    // la courbe relie deux jours payés comme s'il n'y avait rien eu entre.
    const byDay = new Map(dailyRows.map((r) => [r.date_start, r]));
    const daily = Array.from({ length: 30 }, (_, i) => {
      const date = dayIn(tz, 29 - i);
      const r = byDay.get(date);
      return {
        date,
        spend: n(r?.spend),
        impressions: n(r?.impressions),
        clicks: n(r?.clicks),
        results: resultOf(r?.actions).value,
      };
    });

    const sumSpend = (days: number) => daily.slice(-days).reduce((s, d) => s + d.spend, 0);

    // Totaux 30 j recalculés depuis les jours, pas lus d'un appel à part :
    // les chiffres de l'onglet se recoupent toujours entre eux.
    const allActions = new Map<string, number>();
    const allValues = new Map<string, number>();
    for (const r of dailyRows) {
      for (const a of r.actions ?? []) allActions.set(a.action_type, (allActions.get(a.action_type) ?? 0) + n(a.value));
      for (const a of r.action_values ?? []) allValues.set(a.action_type, (allValues.get(a.action_type) ?? 0) + n(a.value));
    }
    const toList = (m: Map<string, number>) => [...m].map(([action_type, v]) => ({ action_type, value: String(v) }));
    const spend30 = sumSpend(30);
    const impressions30 = daily.reduce((s, d) => s + d.impressions, 0);
    const clicks30 = daily.reduce((s, d) => s + d.clicks, 0);
    const result30 = resultOf(toList(allActions));
    const purchaseValue30 = sumTypes(toList(allValues), PURCHASE_TYPES);

    return NextResponse.json({
      configured: true,
      account: {
        id: ACCOUNT_ID,
        name: account.name,
        currency: account.currency,
        timezone: tz,
        // 1 = actif ; 2 = désactivé ; 3 = impayé ; 7/9 = en revue / grâce…
        status: account.account_status,
        // Cumul depuis la création du compte, en centimes chez Meta.
        lifetimeSpend: account.amount_spent ? Number(account.amount_spent) / 100 : 0,
      },
      totals: {
        today: sumSpend(1),
        d7: sumSpend(7),
        d30: spend30,
        impressions: impressions30,
        clicks: clicks30,
        cpm: impressions30 ? (spend30 / impressions30) * 1000 : null,
        cpc: clicks30 ? spend30 / clicks30 : null,
        ctr: impressions30 ? clicks30 / impressions30 : null,
        results: result30.value,
        resultLabel: result30.label,
        costPerResult: result30.value ? spend30 / result30.value : null,
        purchaseValue: purchaseValue30,
        roas: purchaseValue30 > 0 && spend30 > 0 ? purchaseValue30 / spend30 : null,
      },
      daily,
      periode,
      ads: ads.map((a) => {
        const i = a.insights?.data?.[0] ?? {};
        const r = resultOf(i.actions);
        // Vues de 3 s (« video_view ») et ThruPlay (15 s ou fin de vidéo) :
        // l'accroche et la tenue, rapportées aux impressions.
        const vues3s = sumTypes(i.actions, ["video_view"]);
        const thruplays = sumTypes(i.video_thruplay_watched_actions, ["video_view"]);
        return {
          id: a.id,
          name: a.name,
          status: a.effective_status,
          createdAt: a.created_time ?? null,
          campaign: a.campaign ? { id: a.campaign.id, name: a.campaign.name, objective: a.campaign.objective ?? null } : null,
          adset: a.adset ? { id: a.adset.id, name: a.adset.name, optimizationGoal: a.adset.optimization_goal ?? null } : null,
          // Budget au niveau de l'ensemble de pubs, sinon de la campagne (budget CBO).
          dailyBudget: budget(a.adset?.daily_budget) ?? budget(a.campaign?.daily_budget),
          lifetimeBudget: budget(a.adset?.lifetime_budget) ?? budget(a.campaign?.lifetime_budget),
          thumbnail: a.creative?.thumbnail_url || a.creative?.image_url || null,
          /** Vidéo Meta diffusée : c'est par elle que l'onglet retrouve la créa de VALIDÉ. */
          videoId: a.creative?.video_id ?? null,
          // Début / fin effectifs : ceux de l'ensemble de pubs s'ils existent, sinon de la campagne.
          startsAt: iso(a.adset?.start_time) ?? iso(a.campaign?.start_time),
          endsAt: iso(a.adset?.end_time) ?? iso(a.campaign?.stop_time),
          linkClicks: n(i.inline_link_clicks),
          landingViews: sumTypes(i.actions, ["landing_page_view", "omni_landing_page_view"]),
          leads: sumTypes(i.actions, RESULT_TYPES[2].types),
          signups: sumTypes(i.actions, RESULT_TYPES[1].types),
          purchases: sumTypes(i.actions, PURCHASE_TYPES),
          videoViews: vues3s,
          thruplays,
          frequency: i.frequency ? Number(i.frequency) : null,
          spend: n(i.spend),
          impressions: n(i.impressions),
          reach: n(i.reach),
          clicks: n(i.clicks),
          ctr: i.ctr ? Number(i.ctr) / 100 : null,
          cpc: i.cpc ? Number(i.cpc) : null,
          cpm: i.cpm ? Number(i.cpm) : null,
          results: r.value,
          resultLabel: r.label,
          costPerResult: r.value && n(i.spend) ? n(i.spend) / r.value : null,
          roas: roasOf(i),
        };
      }),
      // null = lecture refusée ; [] = aucun pixel sur le compte.
      pixels: pixels?.map((p) => ({ id: p.id, name: p.name, lastFired: p.last_fired_time ?? null })) ?? null,
      computedAt: new Date().toISOString(),
    });
  } catch (e) {
    const code = e instanceof MetaError ? e.code : undefined;
    // 190 = jeton expiré ou révoqué : le seul cas où il faut agir côté Meta, pas attendre.
    const message = code === 190
      ? "Jeton Meta invalide ou expiré — en régénérer un (utilisateur système, ads_read) et remplacer META_ADS_ACCESS_TOKEN sur Vercel."
      : e instanceof Error ? e.message : "meta_failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
