"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Crown, Globe, RefreshCw, AlertTriangle, TrendingDown, Filter } from "lucide-react";
import { fetchAppStats, type AppStats } from "@/lib/adminApi";
import type { VisitStats } from "@/lib/firebase";

const ACCENT = "#BEF221";
const card = "rounded-2xl border bg-white/[0.03] border-white/8";

const COUNTRY_NAMES: Record<string, string> = {
  fr: "France", ma: "Maroc", be: "Belgique", ch: "Suisse", ca: "Canada",
  lu: "Luxembourg", sn: "Sénégal", ci: "Côte d'Ivoire", es: "Espagne",
  pt: "Portugal", us: "États-Unis", gb: "Royaume-Uni", ie: "Irlande",
  nl: "Pays-Bas", au: "Australie", ae: "Émirats arabes unis",
};

function Kpi({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className={`${card} p-4`}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/40">{label}</p>
      <span className="font-black text-3xl" style={{ color: accent ? ACCENT : "#fff" }}>{value}</span>
      {sub && <p className="text-[11px] mt-1 text-white/40">{sub}</p>}
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color ?? ACCENT }} />
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
  const max = Math.max(1, ...steps.map((s) => s.value));

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <Filter size={15} style={{ color: ACCENT }} />
        <p className="text-xs font-black uppercase tracking-widest text-white">Funnel</p>
      </div>
      <div className="space-y-3">
        {steps.map((s, i) => {
          const prev = i > 0 ? steps[i - 1].value : null;
          const rate = prev && prev > 0 ? Math.round((s.value / prev) * 1000) / 10 : null;
          return (
            <div key={s.label} className="flex items-center gap-3">
              <span className="text-[11px] w-52 text-white/60">
                {s.label}
                {s.note && <span className="text-white/25"> · {s.note}</span>}
              </span>
              <Bar value={s.value} max={max} />
              <span className="text-sm font-black w-12 text-right text-white">{s.value}</span>
              <span className="text-[11px] w-16 text-right font-bold" style={{ color: rate === null ? "transparent" : rate < 10 ? "#f87171" : ACCENT }}>
                {rate === null ? "—" : `${rate}%`}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-white/25 mt-4 leading-relaxed">
        Les taux comparent chaque étape à la précédente. Visites et inscriptions sont
        sur 30 jours ; activés et Pro sont cumulés depuis le début — les deux derniers
        taux sont donc optimistes, ils servent à repérer une marche qui s&apos;effondre,
        pas à mesurer une cohorte.
      </p>
    </div>
  );
}

const PilotageTab: React.FC<{ visits: VisitStats }> = ({ visits }) => {
  const [stats, setStats] = useState<AppStats | null>(null);
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

  if (loading && !stats) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement des stats app…
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className={`${card} p-5 space-y-2`}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle size={16} />
          <p className="font-black text-sm">Stats app indisponibles</p>
        </div>
        <p className="text-xs text-white/50">{error}</p>
        <p className="text-[11px] text-white/30">
          Vérifie que <code className="text-[#BEF221]">ADMIN_STATS_SECRET</code> est bien
          défini côté Vercel (Production) pour ce projet.
        </p>
        <button onClick={() => load()} className="mt-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20">
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
      {/* KPIs inscriptions */}
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
              ? <span className="text-white/30 text-xl">index en cours</span>
              : `${stats.documents.invoices} / ${stats.documents.estimates}`
          }
        />
        <Kpi label="Comptes activés" value={stats.activated} sub={`${stats.activationRate}% ont créé ≥ 1 doc`} />
        <Kpi label="Clients enregistrés" value={stats.clients} sub={`${stats.products} produits`} />
      </div>

      <Funnel stats={stats} visits={visits} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pays */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={15} style={{ color: ACCENT }} />
            <p className="text-xs font-black uppercase tracking-widest text-white">Répartition par pays</p>
          </div>
          <div className="space-y-2.5">
            {stats.topCountries.map(({ code, count }) => (
              <div key={code} className="flex items-center gap-3">
                <span className="text-[11px] w-28 truncate text-white/60">
                  {code === "—" ? <span className="text-white/25">non renseigné</span> : COUNTRY_NAMES[code] || code}
                </span>
                <Bar value={count} max={maxCountry} />
                <span className="text-xs font-black w-6 text-right text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Crown size={15} style={{ color: ACCENT }} />
            <p className="text-xs font-black uppercase tracking-widest text-white">Comptes Pro par origine</p>
          </div>
          {plans.length === 0 ? (
            <p className="text-xs text-white/40">Aucun compte Pro.</p>
          ) : (
            <div className="space-y-2.5">
              {plans.map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <span className="text-[11px] text-white/60">
                    {plan === "admin_granted" ? "Offert (admin)" : plan === "unknown" ? "Origine inconnue" : plan}
                  </span>
                  <span className="text-xs font-black text-white">{count}</span>
                </div>
              ))}
            </div>
          )}
          {plans.some(([p]) => p === "admin_granted" || p === "unknown") && (
            <p className="text-[10px] text-white/30 mt-4 flex items-start gap-1.5">
              <TrendingDown size={12} className="mt-0.5 flex-shrink-0" />
              Les comptes « offerts » et « origine inconnue » ne sont pas des ventes.
              Le chiffre d&apos;affaires réel viendra de Polar.
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/25">
          Calculé {new Date(stats.computedAt).toLocaleString("fr-FR")}
          {stats.cached ? " · en cache (5 min)" : ""}
          {" · agrégats uniquement, aucune donnée personnelle"}
        </p>
        <button
          onClick={() => load(true)}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Recalculer
        </button>
      </div>
    </div>
  );
};

export default PilotageTab;
