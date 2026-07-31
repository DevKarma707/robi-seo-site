"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Crown, Globe, RefreshCw, AlertTriangle, TrendingDown, Filter, Rocket, Euro, Siren, CheckCircle2 } from "lucide-react";
import {
  fetchAppStats, fetchLaunchConfig, fetchHealthReport, computeDisplayedSold,
  type AppStats, type LaunchConfig, type HealthReport,
} from "@/lib/adminApi";
import type { VisitStats } from "@/lib/firebase";
import { ACCENT, ACCENT_INK, btn, card, kpiLabel, kpiValue, sectionTitle } from "./ui";

// ~110 Ko de tracés SVG : chargés seulement quand l'onglet Pilotage s'ouvre.
const WorldMapBlock = dynamic(() => import("./WorldMapBlock"), {
  ssr: false,
  loading: () => (
    <div className={`${card} p-5 h-64 flex items-center justify-center text-slate-400 text-xs`}>
      Chargement de la carte…
    </div>
  ),
});

const COUNTRY_NAMES: Record<string, string> = {
  fr: "France", ma: "Maroc", be: "Belgique", ch: "Suisse", ca: "Canada",
  lu: "Luxembourg", sn: "Sénégal", ci: "Côte d'Ivoire", es: "Espagne",
  pt: "Portugal", us: "États-Unis", gb: "Royaume-Uni", ie: "Irlande",
  nl: "Pays-Bas", au: "Australie", ae: "Émirats arabes unis",
};

function Kpi({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className={`${card} a-card-hover a-kpi p-4`}>
      <p className={`${kpiLabel} mb-2`}>{label}</p>
      <span className={`${kpiValue} ${accent ? "a-figure-accent" : ""}`}>{value}</span>
      {sub && <p className="text-[11px] mt-2 text-slate-500">{sub}</p>}
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="a-bar h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, ...(color ? { background: color, boxShadow: "none" } : {}) }} />
    </div>
  );
}

/**
 * The funnel is the point of this tab: visits come from the site's own counter
 * (project robi-seo), the rest from the aggregated app endpoint. Seeing them
 * side by side is what tells you where the money leaks.
 */
function Funnel({ stats, visits }: { stats: AppStats; visits: VisitStats }) {
  const steps = [
    { label: "Visites site · 30 j", value: visits.month, note: "compteur maison" },
    { label: "Inscriptions · 30 j", value: stats.signups.j30 },
    { label: "Comptes activés (≥ 1 doc)", value: stats.activated, note: "tous comptes" },
    { label: "Ventes réelles", value: stats.soldSeats, note: "hors comptes offerts" },
  ];

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter size={15} style={{ color: ACCENT_INK }} />
        <p className={sectionTitle}>Funnel</p>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => {
          const prev = i > 0 ? steps[i - 1].value : null;
          const rate = prev && prev > 0 ? Math.round((s.value / prev) * 1000) / 10 : null;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-[11px] w-52 text-slate-600">
                {s.label}
                {s.note && <span className="text-slate-400"> · {s.note}</span>}
              </span>
              {/* La barre porte le TAUX de passage, pas la valeur absolue.
                  À l'échelle des valeurs, 1240 visites face à 12 inscriptions
                  écrasait tout : trois étapes sur quatre étaient des traits
                  invisibles, et un entonnoir illisible ne sert à rien. La
                  valeur reste lue en chiffres, juste à droite. */}
              <Bar value={rate === null ? 100 : rate} max={100} />
              <span className="text-sm font-black w-12 text-right text-slate-900 tabular-nums">{s.value}</span>
              <span className="text-[11px] w-16 text-right font-bold" style={{ color: rate === null ? "transparent" : rate < 10 ? "#f87171" : ACCENT }}>
                {rate === null ? "—" : `${rate}%`}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
        Les taux comparent chaque étape à la précédente. Visites et inscriptions sont
        sur 30 jours ; activés et Pro sont cumulés depuis le début — les deux derniers
        taux sont donc optimistes, ils servent à repérer une marche qui s&apos;effondre,
        pas à mesurer une cohorte.
      </p>
    </div>
  );
}


/**
 * Bloc de tête : les trois choses qui décident si le lancement marche.
 * Les inscriptions et l'usage restent utiles mais passent dessous — ce ne
 * sont pas eux qu'on regarde en ouvrant la page.
 */
/**
 * `days` est calculé à l'arrivée de la config, pas ici : lire l'heure pendant
 * le rendu est impur (écart serveur/client à l'hydratation) et le faire dans
 * un effet déclencherait un second rendu en cascade. Le bon endroit est la
 * réponse du fetch, qui est déjà un événement.
 */
export function Lancement({ config, days }: { config: LaunchConfig | null; days: number | null }) {
  if (!config) return null;
  const sold = config.realSold;
  const pct = config.totalSeats > 0 ? Math.min(100, (sold / config.totalSeats) * 100) : 0;
  const remaining = Math.max(0, config.totalSeats - computeDisplayedSold(config));

  return (
    <div className={`${card} p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Rocket size={16} style={{ color: ACCENT_INK }} />
        <p className={sectionTitle}>Offre de lancement</p>
        {!config.enabled && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
            désactivée
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-x-10 gap-y-4">
        <div>
          <p className={`${kpiLabel} mb-2`}>Ventes réelles</p>
          <p className="a-display font-extrabold text-[54px] leading-none tracking-tight tabular-nums a-figure-accent">
            {sold}
            <span className="text-slate-300 text-[28px] font-bold"> / {config.totalSeats}</span>
          </p>
        </div>
        <div>
          <p className={`${kpiLabel} mb-2`}>Places restantes</p>
          <p className="a-display font-extrabold text-[34px] leading-none tabular-nums text-slate-900">{remaining}</p>
        </div>
        {days !== null && (
          <div>
            <p className={`${kpiLabel} mb-2`}>Fin de l&apos;offre</p>
            <p className="a-display font-extrabold text-[34px] leading-none tabular-nums text-slate-900">
              {days > 0 ? `J-${days}` : "échue"}
            </p>
          </div>
        )}
      </div>

      <div className="a-track h-2 rounded-full overflow-hidden mt-5">
        <div className="a-bar h-full rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Le CA total viendra de Polar. Tant que le token manque, on le dit. */
export function Revenu({ config }: { config: LaunchConfig | null }) {
  const ca = config ? config.realSold * 59 : null;
  return (
    <div className={`${card} p-6`}>
      <div className="flex items-center gap-2 mb-4">
        <Euro size={16} style={{ color: ACCENT_INK }} />
        <p className={sectionTitle}>Chiffre d&apos;affaires</p>
      </div>
      <p className="a-display font-extrabold text-[40px] leading-none tabular-nums a-figure">
        {ca === null ? "—" : `${ca.toLocaleString("fr-FR")} €`}
      </p>
      <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
        Estimation à partir des ventes réelles × 59 €. Le montant encaissé exact,
        les remboursements et le net après commissions demandent un token Polar
        avec le scope <code className="text-[var(--admin-ink)]">orders:read</code> — c&apos;est
        une tâche de ton kanban.
      </p>
    </div>
  );
}

/** Ce qui casse ou attend une décision, remonté en haut de page. */
export function Alertes({ health, error }: { health: HealthReport | null; error: string | null }) {
  const ok = health && health.severity === "ok" && health.problems.length === 0;
  return (
    <div className={`${card} p-6`}>
      <div className="flex items-center gap-2 mb-4">
        {ok ? <CheckCircle2 size={16} style={{ color: ACCENT_INK }} /> : <Siren size={16} className="text-red-600" />}
        <p className={sectionTitle}>Ce qui demande une action</p>
      </div>
      {error ? (
        <p className="text-[12px] text-slate-500">Diagnostic indisponible : {error}</p>
      ) : !health ? (
        <p className="text-[12px] text-slate-400">Analyse en cours…</p>
      ) : ok ? (
        <p className="text-[13px] text-slate-600">
          Rien d&apos;anormal sur les {health.windowDays} derniers jours.
        </p>
      ) : (
        <ul className="space-y-2">
          {health.problems.slice(0, 4).map((p) => (
            <li key={p} className="flex items-start gap-2 text-[13px] text-slate-700">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-500" />
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const PilotageTab: React.FC<{ visits: VisitStats }> = ({ visits }) => {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [config, setConfig] = useState<LaunchConfig | null>(null);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [health, setHealth] = useState<HealthReport | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      setStats(await fetchAppStats(refresh));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Chargés à part : une panne de l'un ne doit pas vider la page entière.
  useEffect(() => {
    fetchLaunchConfig()
      .then((c) => {
        setConfig(c);
        setDaysLeft(
          c.deadline ? Math.ceil((new Date(c.deadline).getTime() - Date.now()) / 86_400_000) : null
        );
      })
      .catch(() => setConfig(null));
    fetchHealthReport().then(setHealth).catch((e) => setHealthError((e as Error).message));
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement des stats app…
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className={`${card} p-5 space-y-2`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={16} />
          <p className="font-black text-sm">Stats app indisponibles</p>
        </div>
        <p className="text-xs text-slate-600">{error}</p>
        <p className="text-[11px] text-slate-400">
          Vérifie que <code className="text-[var(--admin-ink)]">ADMIN_STATS_SECRET</code> est bien
          défini côté Vercel (Production) pour ce projet.
        </p>
        <button onClick={() => load()} className={`${btn} mt-2`}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const maxCountry = stats.topCountries[0]?.count || 1;
  const plans = Object.entries(stats.byPlan).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      <Lancement config={config} days={daysLeft} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Revenu config={config} />
        <Alertes health={health} error={healthError} />
      </div>

      {/* Secondaire : le détail des inscriptions et de l'usage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Inscrits (total)" value={stats.signups.total} sub={`+${stats.signups.j7} sur 7 j`} />
        <Kpi label="Inscrits · 30 j" value={stats.signups.j30} />
        <Kpi label="Actifs · 7 j" value={stats.active.j7} sub={`${stats.active.j30} sur 30 j`} />
        <Kpi
          label="Ventes réelles"
          value={stats.soldSeats}
          sub={`${stats.proAccounts} comptes Pro au total`}
          accent
        />
      </div>

      {/* KPIs usage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Documents créés" value={stats.documents.total} sub={`${stats.avgDocsPerUser} / compte en moyenne`} />
        <Kpi
          label="Factures / Devis"
          value={
            stats.documents.invoices === null
              ? <span className="text-slate-400 text-xl">index en cours</span>
              : `${stats.documents.invoices} / ${stats.documents.estimates}`
          }
        />
        <Kpi label="Comptes activés" value={stats.activated} sub={`${stats.activationRate}% ont créé ≥ 1 doc`} />
        <Kpi label="Clients enregistrés" value={stats.clients} sub={`${stats.products} produits`} />
      </div>

      <Funnel stats={stats} visits={visits} />

      <WorldMapBlock countries={stats.topCountries} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pays */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={15} style={{ color: ACCENT_INK }} />
            <p className={sectionTitle}>Répartition par pays</p>
          </div>
          <div className="space-y-2.5">
            {stats.topCountries.map(({ code, count }) => (
              <div key={code} className="flex items-center gap-3">
                <span className="text-[11px] w-28 truncate text-slate-600">
                  {code === "—" ? <span className="text-slate-400">non renseigné</span> : COUNTRY_NAMES[code] || code}
                </span>
                <Bar value={count} max={maxCountry} />
                <span className="text-xs font-black w-6 text-right text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Crown size={15} style={{ color: ACCENT_INK }} />
            <p className={sectionTitle}>Comptes Pro par origine</p>
          </div>
          {plans.length === 0 ? (
            <p className="text-xs text-slate-500">Aucun compte Pro.</p>
          ) : (
            <div className="space-y-2.5">
              {plans.map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600">
                    {plan === "admin_granted" ? "Offert (admin)" : plan === "unknown" ? "Origine inconnue" : plan}
                  </span>
                  <span className="text-xs font-black text-slate-900">{count}</span>
                </div>
              ))}
            </div>
          )}
          {plans.some(([p]) => p === "admin_granted" || p === "unknown") && (
            <p className="text-[10px] text-slate-400 mt-4 flex items-start gap-1.5">
              <TrendingDown size={12} className="mt-0.5 flex-shrink-0" />
              Les comptes « offerts » et « origine inconnue » ne sont pas des ventes.
              Le chiffre d&apos;affaires réel viendra de Polar.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-400">
          Calculé {new Date(stats.computedAt).toLocaleString("fr-FR")}
          {stats.cached ? " · en cache (5 min)" : ""}
          {" · agrégats uniquement, aucune donnée personnelle"}
        </p>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className={btn}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Recalculer
        </button>
      </div>
    </div>
  );
};

export default PilotageTab;
