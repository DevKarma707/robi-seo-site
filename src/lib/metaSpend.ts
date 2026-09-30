/**
 * Dépense publicitaire Meta par mois, pour l'onglet Dépenses de l'admin.
 *
 * Même compte et même jeton que l'onglet Ads (route /api/admin/meta-ads) :
 * serveur uniquement, le navigateur ne reçoit que des totaux. Demandé le
 * 30/09/2026 — la pub est la dépense qui compte, et l'onglet Dépenses ne la
 * voyait pas.
 */
const GRAPH = "https://graph.facebook.com/v23.0";
const ACCOUNT_ID = (process.env.META_AD_ACCOUNT_ID || "1585474145862630").replace(/^act_/, "");

export interface MetaMonthlySpend {
  /** YYYY-MM → montant dépensé, dans la devise du compte. */
  byMonth: Record<string, number>;
  currency: string | null;
  /** Renseigné si Meta n'a pas répondu : l'onglet le dit au lieu d'afficher 0. */
  error?: string;
}

async function graph<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = process.env.META_ADS_ACCESS_TOKEN;
  if (!token) throw new Error("META_ADS_ACCESS_TOKEN absent");
  const url = new URL(`${GRAPH}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const json = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok || json.error) throw new Error(json.error?.message || `meta_${res.status}`);
  return json as T;
}

export async function metaMonthlySpend(months: string[]): Promise<MetaMonthlySpend> {
  if (!months.length) return { byMonth: {}, currency: null };
  const sorted = [...months].sort();
  const since = `${sorted[0]}-01`;
  const until = new Date().toISOString().slice(0, 10);
  try {
    const [account, insights] = await Promise.all([
      graph<{ currency?: string }>(`act_${ACCOUNT_ID}`, { fields: "currency" }),
      graph<{ data?: { date_start: string; spend?: string }[] }>(`act_${ACCOUNT_ID}/insights`, {
        level: "account",
        time_increment: "monthly",
        time_range: JSON.stringify({ since, until }),
        fields: "spend",
      }),
    ]);
    const byMonth: Record<string, number> = {};
    for (const row of insights.data ?? []) {
      const m = row.date_start.slice(0, 7);
      byMonth[m] = Math.round(((byMonth[m] || 0) + (Number(row.spend) || 0)) * 100) / 100;
    }
    return { byMonth, currency: account.currency ?? null };
  } catch (error) {
    return { byMonth: {}, currency: null, error: (error as Error).message };
  }
}
