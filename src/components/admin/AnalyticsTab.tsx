"use client";

import React from "react";
import { TrendingUp, TrendingDown, Globe, BarChart2 } from "lucide-react";
import type { VisitStats } from "@/lib/firebase";

const ACCENT = "#BEF221";

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

function Bar({ value, max, color }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color ?? ACCENT }}
      />
    </div>
  );
}

function VisitorsChart({ days }: { days: { date: string; count: number }[] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="flex items-end gap-[3px] h-28">
      {days.map((d) => {
        const h = Math.round((d.count / max) * 100);
        const isToday = d.date === new Date().toISOString().split("T")[0];
        return (
          <div key={d.date} className="flex-1 flex flex-col justify-end group relative">
            <div
              className="w-full rounded-sm transition-all"
              style={{
                height: `${Math.max(h, d.count > 0 ? 6 : 2)}%`,
                backgroundColor: isToday ? ACCENT : "rgba(190,242,33,0.25)",
              }}
            />
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {d.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const AnalyticsTab: React.FC<{ visits: VisitStats }> = ({ visits }) => {
  const weekDelta =
    visits.prevWeek > 0 ? Math.round(((visits.week - visits.prevWeek) / visits.prevWeek) * 100) : null;

  const maxPage = visits.byPage[0]?.count || 1;
  const maxSource = visits.bySource[0]?.count || 1;
  const totalSource = visits.bySource.reduce((s, r) => s + r.count, 0) || 1;

  const card = "rounded-2xl border bg-white/[0.03] border-white/8";

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
          <div key={label} className={`${card} p-4`}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/40">{label}</p>
            <div className="flex items-end gap-2">
              <span className="font-black text-3xl text-white">{value}</span>
              {delta !== null && delta !== undefined && (
                <span
                  className={`flex items-center gap-0.5 text-xs font-bold mb-1 ${
                    delta >= 0 ? "text-[#BEF221]" : "text-red-400"
                  }`}
                >
                  {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {delta >= 0 ? "+" : ""}
                  {delta}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Visiteurs 30 jours */}
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={15} className="text-[#BEF221]" />
          <p className="text-xs font-black uppercase tracking-widest text-white">Visiteurs · 30 derniers jours</p>
        </div>
        {visits.month === 0 ? (
          <p className="text-xs text-white/40">Pas encore de données — les visites apparaîtront ici.</p>
        ) : (
          <VisitorsChart days={visits.days} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pages les plus visitées */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Globe size={15} className="text-[#BEF221]" />
            <p className="text-xs font-black uppercase tracking-widest text-white">Pages les plus visitées</p>
          </div>
          <div className="space-y-2.5">
            {visits.byPage.length === 0 && <p className="text-xs text-white/40">Pas encore de données.</p>}
            {visits.byPage.map(({ path, count }) => (
              <div key={path} className="flex items-center gap-3">
                <span className="text-[11px] font-mono w-40 truncate text-white/50">{path}</span>
                <Bar value={count} max={maxPage} />
                <span className="text-xs font-black w-6 text-right text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sources de trafic */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={15} className="text-[#BEF221]" />
            <p className="text-xs font-black uppercase tracking-widest text-white">Sources de trafic</p>
          </div>
          <div className="space-y-2.5">
            {visits.bySource.length === 0 && <p className="text-xs text-white/40">Pas encore de données.</p>}
            {visits.bySource.map(({ source, count }) => {
              const color = SOURCE_COLORS[source] ?? "#888";
              const pct = Math.round((count / totalSource) * 100);
              return (
                <div key={source} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-28">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[11px] font-semibold truncate text-white">{source}</span>
                  </div>
                  <Bar value={count} max={maxSource} color={color} />
                  <span className="text-xs font-black w-10 text-right text-white/40">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
