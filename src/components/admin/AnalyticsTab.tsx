"use client";

import React from "react";
import { TrendingUp, TrendingDown, Globe, BarChart2 } from "lucide-react";
import type { VisitStats } from "@/lib/firebase";
import { card, kpiLabel, kpiValue, sectionTitle } from "./ui";
import { AreaCurve, CountUp } from "./motion";
import SearchConsoleBlock from "./SearchConsoleBlock";

const SOURCE_COLORS: Record<string, string> = {
  Direct: "#BEF221",
  Google: "#4285F4",
  Bing: "#008373",
  Instagram: "#E1306C",
  Facebook: "#1877F2",
  LinkedIn: "#0A66C2",
  WhatsApp: "#25D366",
  ChatGPT: "#10A37F",
  Autre: "#888888",
};

const fmtDay = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

function Bar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="a-track flex-1 h-1.5 rounded-full overflow-hidden">
      {/* Une source par couleur (les barres par réseau ont la leur) écrase
          l'aplat par défaut de `a-bar`. */}
      <div
        className="a-bar h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, ...(color ? { background: color } : {}) }}
      />
    </div>
  );
}

/**
 * Visiteurs sur 30 jours. Une courbe plutôt qu'un histogramme : sur trente
 * barres fines, l'œil lisait du bruit ; la tendance, elle, se lit d'un trait.
 * Le détail d'un jour reste au survol.
 */
function VisitorsChart({ days }: { days: { date: string; count: number }[] }) {
  if (days.length < 2) return null;
  return (
    <>
      <AreaCurve points={days.map((d) => ({ value: d.count, label: fmtDay(d.date) }))} height={150} />
      <div className="a-mono flex justify-between text-[10.5px] text-slate-400 mt-2">
        <span>{fmtDay(days[0].date)}</span>
        <span>Aujourd&apos;hui</span>
      </div>
    </>
  );
}

const AnalyticsTab: React.FC<{ visits: VisitStats }> = ({ visits }) => {
  const weekDelta =
    visits.prevWeek > 0 ? Math.round(((visits.week - visits.prevWeek) / visits.prevWeek) * 100) : null;

  const maxPage = visits.byPage[0]?.count || 1;
  const maxSource = visits.bySource[0]?.count || 1;
  const totalSource = visits.bySource.reduce((s, r) => s + r.count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Aujourd'hui", value: visits.today },
          { label: "7 derniers jours", value: visits.week, delta: weekDelta },
          { label: "30 derniers jours", value: visits.month },
          { label: "Semaine précédente", value: visits.prevWeek },
        ].map(({ label, value, delta }) => (
          <div key={label} className={`${card} a-card-hover p-4`}>
            <p className={kpiLabel}>{label}</p>
            <div className="flex items-end gap-2 mt-3">
              <span className={kpiValue}><CountUp value={value} /></span>
              {delta !== null && delta !== undefined && (
                <span
                  className={`a-mono inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full mb-0.5 ${
                    delta >= 0 ? "bg-[var(--color-accent)]/20 text-[var(--admin-ink)]" : "bg-red-50 text-red-600"
                  }`}
                >
                  {delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {delta >= 0 ? "+" : ""}
                  {delta} %
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Visiteurs 30 jours */}
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 size={15} className="text-[var(--admin-ink)]" />
          <p className={sectionTitle}>Visiteurs · 30 derniers jours</p>
        </div>
        {visits.month === 0 ? (
          <p className="text-xs text-slate-500">Pas encore de données — les visites apparaîtront ici.</p>
        ) : (
          <VisitorsChart days={visits.days} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages les plus visitées */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={15} className="text-[var(--admin-ink)]" />
            <p className={sectionTitle}>Pages les plus visitées</p>
          </div>
          <div className="space-y-2.5">
            {visits.byPage.length === 0 && <p className="text-xs text-slate-500">Pas encore de données.</p>}
            {visits.byPage.map(({ path, count }) => (
              <div key={path} className="flex items-center gap-3">
                <span className="a-mono text-[11px] w-40 truncate text-slate-600">{path}</span>
                <Bar value={count} max={maxPage} />
                <span className="a-mono text-xs w-8 text-right text-slate-900 tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sources de trafic */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-[var(--admin-ink)]" />
            <p className={sectionTitle}>Sources de trafic</p>
          </div>
          <div className="space-y-2.5">
            {visits.bySource.length === 0 && <p className="text-xs text-slate-500">Pas encore de données.</p>}
            {visits.bySource.map(({ source, count }) => {
              const color = SOURCE_COLORS[source] ?? "#888";
              const pct = Math.round((count / totalSource) * 100);
              return (
                <div key={source} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-28">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[12px] font-semibold truncate text-slate-900">{source}</span>
                  </div>
                  <Bar value={count} max={maxSource} color={color} />
                  <span className="a-mono text-xs w-10 text-right text-slate-500 tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Console — photos des exports, comparées d'un import à l'autre */}
      <div className="pt-4">
        <SearchConsoleBlock />
      </div>
    </div>
  );
};

export default AnalyticsTab;
