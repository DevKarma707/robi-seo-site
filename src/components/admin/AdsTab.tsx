"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, BadgeEuro, Check, ClipboardCheck, Copy, Film, Link2, Play, Plug, RefreshCw, Target,
} from "lucide-react";
import { getMetaAds, type MetaAdRow, type MetaAdsReport } from "@/lib/adminApi";
import { subscribeToCreatives, linkCreativeToAd, type AdCreative } from "@/lib/adCreatives";
import { subscribeToPosts, type SocialPost } from "@/lib/socialPosts";
import { ACCENT_INK, btn, card, focusRing, kpiLabel, kpiValue, sectionTitle, select } from "./ui";
import { AreaCurve, CountUp } from "./motion";
import CampagnesBlock from "./CampagnesBlock";
import { toast } from "./toast";

/**
 * Onglet Ads : ce qui tourne, ce que ça coûte, ce que ça rapporte.
 *
 * Trois sources, du plus mesuré au plus déclaratif :
 *   1. Meta (API Marketing, via /api/admin/meta-ads) — dépense, diffusion, résultats ;
 *   2. la bibliothèque des créas validées (`adCreatives`, synchronisée depuis
 *      ROBI_DOC/VALIDÉ par scripts/syncCreas.ts) ;
 *   3. les plans de campagne saisis à la main (le même bloc que Réseaux).
 *
 * Tant que Meta n'est pas branché, les deux dernières restent utiles : on
 * voit ce qui est prêt à partir et ce qu'on a prévu d'en faire.
 */

const RED = "#dc2626";

const STATUS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "En cours", color: "#10B981" },
  PAUSED: { label: "En pause", color: "#f59e0b" },
  CAMPAIGN_PAUSED: { label: "Campagne en pause", color: "#f59e0b" },
  ADSET_PAUSED: { label: "Ensemble en pause", color: "#f59e0b" },
  PENDING_REVIEW: { label: "En revue", color: "#6366f1" },
  IN_PROCESS: { label: "En traitement", color: "#6366f1" },
  PREAPPROVAL: { label: "En revue", color: "#6366f1" },
  DISAPPROVED: { label: "Refusée", color: RED },
  WITH_ISSUES: { label: "Problème", color: RED },
  PENDING_BILLING_INFO: { label: "Paiement requis", color: RED },
  ARCHIVED: { label: "Archivée", color: "#94a3b8" },
  DELETED: { label: "Supprimée", color: "#94a3b8" },
};
const statusOf = (s: string) => STATUS[s] ?? { label: s.toLowerCase().replace(/_/g, " "), color: "#94a3b8" };
const ORDRE_STATUT = ["ACTIVE", "PENDING_REVIEW", "IN_PROCESS", "PREAPPROVAL", "WITH_ISSUES", "DISAPPROVED", "PENDING_BILLING_INFO", "ADSET_PAUSED", "CAMPAIGN_PAUSED", "PAUSED"];

const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const moneyFmt = (currency: string) => (v: number | null | undefined, decimals = 2) =>
  v === null || v === undefined
    ? "—"
    : v.toLocaleString("fr-FR", { style: "currency", currency, minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const int = (v?: number | null) => (v === null || v === undefined ? "—" : Math.round(v).toLocaleString("fr-FR"));
const pct = (v?: number | null) =>
  v === null || v === undefined ? "—" : `${(v * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;
const roasTxt = (v?: number | null) =>
  v === null || v === undefined ? "—" : `×${v.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}`;

function Kpi({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className={`${card} a-card-hover a-kpi p-4`}>
      <p className={`${kpiLabel} mb-2`}>{label}</p>
      <span className={`${kpiValue} ${accent ? "a-figure-accent" : ""}`}><CountUp value={value} /></span>
      {sub && <p className="text-[11px] mt-2 text-slate-500">{sub}</p>}
    </div>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />;
}

// ─── Brancher Meta ────────────────────────────────────────────────────

function ConnecterMeta({ accountId }: { accountId: string }) {
  const etapes: React.ReactNode[] = [
    <>Business Manager <strong className="text-slate-900">Robi Ai</strong> → Paramètres de l&apos;entreprise → <strong className="text-slate-900">Utilisateurs système</strong>.</>,
    <>Ajouter (ou reprendre) un utilisateur système, lui attribuer le compte publicitaire <span className="a-mono text-slate-900">{accountId}</span> en accès « Voir les performances ».</>,
    <>« Générer un nouveau token » : app du Business, permission <span className="a-mono text-slate-900">ads_read</span> uniquement, expiration « Jamais ».</>,
    <>Vercel → projet du site → Settings → Environment Variables : <span className="a-mono text-slate-900">META_ADS_ACCESS_TOKEN</span> en type <strong className="text-slate-900">Secret</strong>, puis redéployer.</>,
  ];
  return (
    <div className={`${card} p-6`}>
      <div className="flex items-center gap-2 mb-2">
        <Plug size={16} style={{ color: ACCENT_INK }} />
        <h3 className={sectionTitle}>Connecter Meta</h3>
      </div>
      <p className="text-[13px] text-slate-600 mb-5 max-w-[720px]">
        Compte publicitaire « Robi AI » repéré (EUR, actif, moyen de paiement OK) — encore aucune campagne dessus.
        Pour que cet onglet lise les dépenses, il lui faut un jeton en lecture seule, posé sur le serveur.
        Ce jeton, c&apos;est toi qui le crées et le colles : Claude ne le manipule pas.
      </p>
      <ol className="space-y-3 max-w-[760px]">
        {etapes.map((e, i) => (
          <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-slate-600">
            <span className="a-mono shrink-0 w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-[11px] text-slate-500">{i + 1}</span>
            <span className="pt-0.5">{e}</span>
          </li>
        ))}
      </ol>
      <p className="text-[12px] text-slate-500 mt-5">
        Option : <span className="a-mono">META_AD_ACCOUNT_ID</span> pour lire un autre compte (défaut {accountId}).
      </p>
    </div>
  );
}

function RappelPixel({ pixels }: { pixels: { name: string; lastFired: string | null }[] | undefined }) {
  const aucun = !pixels || pixels.length === 0;
  return (
    <div className={`${card} p-4 flex items-start gap-3`}>
      <Target size={16} className="mt-0.5 shrink-0" style={{ color: ACCENT_INK }} />
      <p className="text-[13px] leading-relaxed text-slate-700">
        <strong className="text-slate-900">
          {aucun ? "Pas encore de pixel Meta : pas de ROI possible." : "Le pixel Meta n'a jamais remonté d'événement."}
        </strong>{" "}
        Sans événements de conversion (inscription, achat), Meta ne sait optimiser que les clics et cet onglet ne peut
        calculer ni coût par inscription ni ROAS. À poser avant de lancer les pubs peintre : pixel sur robi-app.com et
        go.robi-app.com, avec <span className="a-mono">CompleteRegistration</span> à l&apos;inscription et{" "}
        <span className="a-mono">Purchase</span> (valeur + devise) au paiement.
      </p>
    </div>
  );
}

// ─── Pubs en cours ────────────────────────────────────────────────────

function TableauPubs({ ads, money }: { ads: MetaAdRow[]; money: ReturnType<typeof moneyFmt> }) {
  const th = "px-3 py-2.5 text-[11px] font-semibold text-slate-500 text-right whitespace-nowrap";
  const td = "px-3 py-3 a-mono text-[12.5px] text-slate-700 text-right tabular-nums whitespace-nowrap";
  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full min-w-[1080px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className={`${th} text-left pl-5`}>Pub</th>
            <th className={`${th} text-left`}>Statut</th>
            <th className={th}>Budget / j</th>
            <th className={th}>Dépense</th>
            <th className={th}>Impr.</th>
            <th className={th}>CPM</th>
            <th className={th}>Clics</th>
            <th className={th}>CTR</th>
            <th className={th}>CPC</th>
            <th className={th}>Résultats</th>
            <th className={th}>Coût / rés.</th>
            <th className={`${th} pr-5`}>ROAS</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((a) => {
            const st = statusOf(a.status);
            return (
              <tr key={a.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-900/[0.02]">
                <td className="pl-5 pr-3 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {a.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                    ) : (
                      <span className="w-10 h-10 rounded-lg shrink-0 border border-slate-200 flex items-center justify-center text-slate-400"><Film size={14} /></span>
                    )}
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 truncate max-w-[260px]" title={a.name}>{a.name}</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-[260px]" title={`${a.campaign?.name ?? ""} › ${a.adset?.name ?? ""}`}>
                        {a.campaign?.name ?? "—"}{a.adset ? ` › ${a.adset.name}` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-700 whitespace-nowrap">
                    <Dot color={st.color} /> {st.label}
                  </span>
                </td>
                <td className={td}>{a.dailyBudget !== null ? money(a.dailyBudget, 0) : a.lifetimeBudget !== null ? `${money(a.lifetimeBudget, 0)} total` : "—"}</td>
                <td className={`${td} font-semibold text-slate-900`}>{money(a.spend)}</td>
                <td className={td}>{int(a.impressions)}</td>
                <td className={td}>{money(a.cpm)}</td>
                <td className={td}>{int(a.clicks)}</td>
                <td className={td}>{pct(a.ctr)}</td>
                <td className={td}>{money(a.cpc)}</td>
                <td className={td}>
                  {a.results ? <>{int(a.results)} <span className="text-slate-400 font-sans text-[11px]">{a.resultLabel}</span></> : "—"}
                </td>
                <td className={td}>{money(a.costPerResult)}</td>
                <td className={`${td} pr-5`}>{roasTxt(a.roas)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Bibliothèque des créas ───────────────────────────────────────────

const FILTRES = [
  { id: "toutes", label: "Toutes", test: () => true },
  { id: "pub", label: "Pub Meta", test: (c: AdCreative) => c.usages.some((u) => /pub/i.test(u)) },
  { id: "reel", label: "Reel IG", test: (c: AdCreative) => c.usages.some((u) => /reel/i.test(u)) },
  { id: "us", label: "Anglais (US)", test: (c: AdCreative) => c.langue === "EN" },
] as const;

function CarteCrea({
  c, ad, ads, money,
}: {
  c: AdCreative;
  ad: MetaAdRow | undefined;
  ads: MetaAdRow[] | null;
  money: ReturnType<typeof moneyFmt>;
}) {
  const [lecture, setLecture] = useState(false);
  const [copie, setCopie] = useState(false);

  const relier = async (id: string) => {
    try {
      await linkCreativeToAd(c.id, id || null);
      toast("ok", id ? "Créa reliée à la pub." : "Lien retiré.");
    } catch (e) {
      toast("err", (e as Error).message);
    }
  };

  return (
    <div className={`${card} overflow-hidden flex flex-col`}>
      <div className="relative aspect-[9/16] bg-slate-100">
        {lecture && c.videoUrl ? (
          <video src={c.videoUrl} poster={c.coverUrl ?? undefined} controls autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <button
            onClick={() => setLecture(true)}
            disabled={!c.videoUrl}
            className={`group absolute inset-0 w-full h-full ${focusRing}`}
            aria-label={`Lire ${c.titre}`}
          >
            {c.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.coverUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-11 h-11 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110">
                <Play size={18} className="ml-0.5" fill="currentColor" />
              </span>
            </span>
          </button>
        )}
        <span className="a-mono absolute top-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-black/55 text-white pointer-events-none">
          {c.langue} · {c.duree ? `${c.duree} s` : c.format}
        </span>
        {ad && (
          <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-black/55 text-white pointer-events-none">
            <Dot color={statusOf(ad.status).color} /> {statusOf(ad.status).label}
          </span>
        )}
      </div>

      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-[13.5px] font-bold text-slate-900 leading-tight">
            {c.genre === "pub" ? "Pub" : "Reel"} · {c.titre}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{c.usages.join(" · ")}</p>
        </div>

        {ad ? (
          <p className="text-[12px] text-slate-700">
            <strong className="a-mono text-slate-900">{money(ad.spend)}</strong> sur 30 j
            {ad.results ? <> · {int(ad.results)} {ad.resultLabel}</> : null}
            {ad.costPerResult !== null ? <> · {money(ad.costPerResult)}/rés.</> : null}
          </p>
        ) : (
          <p className="text-[12px] text-slate-500">{c.statut || "—"}</p>
        )}

        <details className="text-[12px] text-slate-600 group/d">
          <summary className="cursor-pointer select-none text-slate-500 hover:text-slate-900 font-medium">Détails</summary>
          <div className="mt-2 space-y-2 leading-relaxed">
            {c.aSavoir && <p>{c.aSavoir}</p>}
            {c.legende && (
              <div className="rounded-lg border border-slate-200 p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-slate-500 flex-1">Légende</span>
                  <button
                    onClick={() => {
                      void navigator.clipboard.writeText(c.legende ?? "");
                      setCopie(true);
                      setTimeout(() => setCopie(false), 1800);
                    }}
                    className={`text-[11px] inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 ${focusRing}`}
                  >
                    {copie ? <ClipboardCheck size={12} /> : <Copy size={12} />} {copie ? "Copiée" : "Copier"}
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-slate-700">{c.legende}</p>
              </div>
            )}
            <p className="text-[11px] text-slate-400 break-all">{c.fichier}</p>
          </div>
        </details>

        {ads && ads.length > 0 && (
          <label className="mt-auto flex items-center gap-1.5 text-[11px] text-slate-500">
            <Link2 size={12} className="shrink-0" />
            <select
              className={`${select} !py-1 !px-2 !text-[11.5px] w-full min-w-0`}
              value={c.metaAdId ?? ""}
              onChange={(e) => void relier(e.target.value)}
              aria-label="Relier à une pub Meta"
            >
              <option value="">Relier à une pub Meta…</option>
              {ads.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}

function Bibliotheque({ creas, ads, money }: { creas: AdCreative[] | null; ads: MetaAdRow[] | null; money: ReturnType<typeof moneyFmt> }) {
  const [filtre, setFiltre] = useState<(typeof FILTRES)[number]["id"]>("toutes");
  const test = FILTRES.find((f) => f.id === filtre)!.test;
  const visibles = (creas ?? []).filter(test);
  const enPub = (creas ?? []).filter((c) => c.metaAdId && ads?.some((a) => a.id === c.metaAdId && a.status === "ACTIVE")).length;

  return (
    <div className={`${card} p-5 space-y-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className={sectionTitle}><span className="flex items-center gap-1.5"><Film size={14} /> Bibliothèque des créas</span></h3>
        <span className="text-[11px] text-slate-400">
          {creas ? `${creas.length} validée${creas.length > 1 ? "s" : ""} · ${enPub} en diffusion` : "chargement…"}
        </span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {FILTRES.map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltre(f.id)}
              className={`${btn} !py-1 ${filtre === f.id ? "!bg-slate-900/[0.06] !text-slate-900 !border-slate-300" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {creas && creas.length === 0 ? (
        <p className="text-[13px] text-slate-500">
          Bibliothèque vide. Depuis ROBI_WEB : <span className="a-mono text-slate-900">npx tsx scripts/syncCreas.ts</span> — lit
          ROBI_DOC/VALIDÉ/README.md et dépose vidéos et couvertures.
        </p>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {visibles.map((c) => (
            <CarteCrea key={c.id} c={c} ad={ads?.find((a) => a.id === c.metaAdId)} ads={ads} money={money} />
          ))}
        </div>
      )}
      <p className="text-[11px] text-slate-400">
        Source : ROBI_DOC/VALIDÉ. Une créa ajoutée au dossier apparaît ici après <span className="a-mono">npx tsx scripts/syncCreas.ts</span>.
      </p>
    </div>
  );
}

// ─── Onglet ───────────────────────────────────────────────────────────

export default function AdsTab() {
  const [data, setData] = useState<MetaAdsReport | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [creas, setCreas] = useState<AdCreative[] | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setData(await getMetaAds());
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Chargement impossible");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { void charger(); }, [charger]);
  useEffect(() => {
    const u1 = subscribeToCreatives(setCreas, (e) => toast("err", String(e)));
    const u2 = subscribeToPosts(setPosts, (e) => console.error(e));
    return () => { u1(); u2(); };
  }, []);

  const money = useMemo(() => moneyFmt(data?.account?.currency || "EUR"), [data?.account?.currency]);
  const t = data?.totals;
  const ads = useMemo(
    () =>
      data?.configured
        ? [...(data.ads ?? [])]
            .filter((a) => a.status !== "ARCHIVED" && a.status !== "DELETED")
            .sort((a, b) => {
              const ia = ORDRE_STATUT.indexOf(a.status), ib = ORDRE_STATUT.indexOf(b.status);
              return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || b.spend - a.spend;
            })
        : null,
    [data]
  );
  const actives = ads?.filter((a) => a.status === "ACTIVE").length ?? 0;
  const pixelMuet = data?.configured && data.pixels !== null && (data.pixels ?? []).every((p) => !p.lastFired);

  // Le verdict, lisible avant tout chiffre.
  const verdict = !data
    ? chargement ? "Lecture du compte Meta…" : ""
    : !data.configured
      ? "Meta n'est pas encore branché. Les créas prêtes et les plans de campagne sont à jour ci-dessous."
      : actives === 0
        ? `Rien ne tourne. ${money(t?.d30, 0)} dépensés sur 30 jours.`
        : `${actives} pub${actives > 1 ? "s" : ""} en cours · ${money(t?.today)} aujourd'hui · ${money(t?.d30, 0)} sur 30 jours${t?.roas ? ` · ROAS ${roasTxt(t.roas)}` : ""}.`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <p className="text-[14px] font-semibold text-slate-900 flex-1">{verdict}</p>
        {data?.configured && data.account && (
          <span className="hidden md:inline text-[11px] text-slate-400">
            {data.account.name} · {data.account.currency} · {data.account.timezone}
          </span>
        )}
        <button onClick={() => void charger()} className={btn} disabled={chargement}>
          <RefreshCw size={14} className={chargement ? "animate-spin" : ""} />
          Rafraîchir
        </button>
      </div>

      {erreur && (
        <div className={`${card} p-4 text-sm flex items-start gap-2`} style={{ color: RED }}>
          <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {erreur}
        </div>
      )}

      {data && !data.configured && (
        <>
          <ConnecterMeta accountId={data.accountId || "1585474145862630"} />
          <RappelPixel pixels={undefined} />
        </>
      )}

      {data?.configured && t && (
        <>
          {pixelMuet && <RappelPixel pixels={data.pixels ?? undefined} />}
          {data.account && data.account.status !== 1 && (
            <div className={`${card} p-4 text-[13px] flex items-start gap-2`} style={{ color: RED }}>
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              Le compte publicitaire n&apos;est pas actif chez Meta (statut {data.account.status}) : aucune pub ne sera diffusée.
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            <Kpi label="Dépensé aujourd'hui" value={money(t.today)} accent />
            <Kpi label="7 derniers jours" value={money(t.d7, 0)} />
            <Kpi label="30 derniers jours" value={money(t.d30, 0)} sub={`${money(data.account?.lifetimeSpend, 0)} depuis l'ouverture`} />
            <Kpi label="CPM" value={money(t.cpm)} sub={`${int(t.impressions)} impressions`} />
            <Kpi label="CPC · CTR" value={money(t.cpc)} sub={`${pct(t.ctr)} · ${int(t.clicks)} clics`} />
            <Kpi label="Coût par résultat" value={money(t.costPerResult)} sub={t.results ? `${int(t.results)} ${t.resultLabel}` : "aucun résultat remonté"} />
            <Kpi label="ROAS" value={roasTxt(t.roas)} sub={t.purchaseValue ? `${money(t.purchaseValue, 0)} de ventes attribuées` : "achats non remontés"} />
          </div>

          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <BadgeEuro size={14} className="text-slate-500" />
              <h3 className={sectionTitle}>Dépense par jour</h3>
              <span className="text-[11px] text-slate-400 ml-auto">30 jours · point lime = jour avec résultat</span>
            </div>
            {data.daily && (
              <div className="relative">
                <AreaCurve
                  points={data.daily.map((d) => ({ value: d.spend, label: fmtDay(d.date), mark: d.results > 0 }))}
                  height={160}
                  format={(v) => money(v)}
                />
                {t.d30 === 0 && (
                  <p className="absolute inset-0 flex items-center justify-center text-[13px] text-slate-500 pointer-events-none">
                    Aucune dépense sur 30 jours
                  </p>
                )}
                <div className="a-mono flex justify-between text-[10.5px] text-slate-400 mt-2">
                  <span>{fmtDay(data.daily[0].date)}</span>
                  <span>Aujourd&apos;hui</span>
                </div>
              </div>
            )}
          </div>

          <div className={`${card} p-5 space-y-4`}>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={sectionTitle}>Pubs en cours</h3>
              <span className="text-[11px] text-slate-400">
                {ads?.length ? `${ads.length} pub${ads.length > 1 ? "s" : ""} · ${actives} active${actives > 1 ? "s" : ""} · chiffres sur 30 jours` : ""}
              </span>
            </div>
            {ads && ads.length > 0 ? (
              <TableauPubs ads={ads} money={money} />
            ) : (
              <div className="flex items-start gap-3 text-[13px] text-slate-600">
                <Check size={16} className="mt-0.5 shrink-0 text-slate-400" />
                <p>
                  Aucune pub sur le compte {data.account?.name ?? "Robi AI"}. Les deux pubs peintre sont prêtes dans la
                  bibliothèque ci-dessous : pixel d&apos;abord, puis une campagne Ventes ou Inscriptions dans Ads Manager.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      <Bibliotheque creas={creas} ads={ads} money={money} />

      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <h3 className={sectionTitle}>Plans de campagne</h3>
          <span className="text-[11px] text-slate-400">saisis à la main · marché, angle, budget prévu — partagé avec l&apos;onglet Réseaux</span>
        </div>
        <CampagnesBlock marche="all" posts={posts} />
      </div>
    </div>
  );
}
