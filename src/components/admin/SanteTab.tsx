"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Mail, MonitorX,
  RefreshCw, Sparkles, ServerCrash, XCircle,
} from "lucide-react";
import { fetchHealthReport, type HealthReport, type HealthSignature } from "@/lib/adminApi";
import { ACCENT, ACCENT_INK, btn, card } from "./ui";

const RED = "#f87171";
const AMBER = "#fbbf24";

const SEVERITY: Record<HealthReport["severity"], { label: string; color: string; icon: React.ReactNode; blurb: string }> = {
  ok: {
    label: "Tout est vert",
    color: ACCENT,
    icon: <CheckCircle2 size={18} />,
    blurb: "Aucun signal anormal sur la fenêtre analysée.",
  },
  warn: {
    label: "À surveiller",
    color: AMBER,
    icon: <AlertTriangle size={18} />,
    blurb: "Des incidents sont remontés sans que le service soit interrompu.",
  },
  down: {
    label: "Incident sérieux",
    color: RED,
    icon: <XCircle size={18} />,
    blurb: "Un chemin critique est cassé. À traiter en priorité.",
  },
};

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";

const relative = (iso?: string | null) => {
  if (!iso) return "—";
  const h = Math.round((Date.now() - Date.parse(iso)) / 3_600_000);
  if (h < 1) return "il y a moins d'une heure";
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
};

function Kpi({
  label, value, sub, icon, tone,
}: {
  label: string; value: React.ReactNode; sub?: string; icon: React.ReactNode; tone: "good" | "bad" | "neutral";
}) {
  const color = tone === "bad" ? RED : tone === "good" ? ACCENT : "#fff";
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center gap-1.5 mb-1.5 text-slate-500">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
      </div>
      <span className="font-black text-3xl" style={{ color }}>{value}</span>
      {sub && <p className="text-[11px] mt-1 text-slate-500">{sub}</p>}
    </div>
  );
}

/** Grouped incidents. The signature collapses ids and numbers so repeats stack. */
function Incidents({
  title, icon, items, empty, tone = "bad",
}: {
  title: string; icon: React.ReactNode; items: HealthSignature[]; empty: string; tone?: "bad" | "neutral";
}) {
  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: items.length ? (tone === "bad" ? RED : AMBER) : ACCENT }}>{icon}</span>
        <p className="text-xs font-black uppercase tracking-widest text-slate-900">{title}</p>
        {items.length > 0 && (
          <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: `${RED}22`, color: RED }}>
            {items.reduce((s, i) => s + i.count, 0)}
          </span>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-500">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.signature} className="flex items-start gap-3">
              <span
                className="mt-0.5 min-w-[26px] h-[22px] px-1.5 rounded-md text-[11px] font-black flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${RED}1f`, color: RED }}
              >
                {it.count}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] text-slate-700 font-mono break-words leading-snug">{it.sample}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">dernière fois {relative(it.lastSeen)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DailyBars({ days }: { days: { date: string; count: number }[] }) {
  if (days.length === 0) return null;
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={15} style={{ color: ACCENT_INK }} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-900">Incidents par jour</p>
      </div>
      <div className="flex items-end gap-1 h-20">
        {days.map((d) => (
          // h-full matters: without a resolved parent height the bars' own
          // percentage heights collapse to zero and the chart renders empty.
          <div key={d.date} className="flex-1 h-full flex flex-col justify-end group relative">
            <div
              className="w-full rounded-sm"
              style={{ height: `${Math.max((d.count / max) * 100, 4)}%`, backgroundColor: d.count > 0 ? RED : "rgba(255,255,255,0.08)" }}
            />
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-900 opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {d.count} · {d.date.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SanteTab: React.FC = () => {
  const [days, setDays] = useState(7);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      setReport(await fetchHealthReport(d));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(days); }, [load, days]);

  if (loading && !report) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Diagnostic en cours…
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className={`${card} p-5 space-y-2`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={16} />
          <p className="font-black text-sm">Diagnostic indisponible</p>
        </div>
        <p className="text-xs text-slate-600">{error}</p>
        <button onClick={() => load(days)} className={`${btn} mt-2`}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!report) return null;

  const sev = SEVERITY[report.severity];
  const cronLate = report.cron.staleHours === null || report.cron.staleHours > 26;
  const cronMeta = (report.cron.last?.meta || {}) as Record<string, number | string>;

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <div className="rounded-2xl border p-5" style={{ borderColor: `${sev.color}33`, backgroundColor: `${sev.color}0d` }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span style={{ color: sev.color }} className="mt-0.5">{sev.icon}</span>
            <div>
              <p className="font-black text-base" style={{ color: sev.color }}>{sev.label}</p>
              <p className="text-[12px] text-slate-600 mt-0.5">{sev.blurb}</p>
              {report.problems.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {report.problems.map((p) => (
                    <li key={p} className="text-[12px] text-slate-700 flex items-start gap-2">
                      <span className="mt-[7px] w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: sev.color }} />
                      {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {[7, 30].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                  days === d ? "bg-slate-200 text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {d} j
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi
          label="Emails en échec"
          icon={<Mail size={13} />}
          value={
            report.emails.failureRate === null
              ? <span className="text-slate-400 text-xl">index en cours</span>
              : `${report.emails.failureRate}%`
          }
          sub={
            report.emails.failed !== null
              ? `${report.emails.failed} échec(s) / ${(report.emails.sent ?? 0) + report.emails.failed} envoi(s)`
              : undefined
          }
          tone={report.emails.failureRate !== null && report.emails.failureRate > 5 ? "bad" : "good"}
        />
        <Kpi
          label="Plantages app"
          icon={<MonitorX size={13} />}
          value={report.clientErrors.total}
          sub={report.clientErrors.affectedUsers > 0 ? `${report.clientErrors.affectedUsers} compte(s) touché(s)` : undefined}
          tone={report.clientErrors.total > 0 ? "bad" : "good"}
        />
        <Kpi
          label="Échecs IA"
          icon={<Sparkles size={13} />}
          value={report.aiFailures.total}
          tone={report.aiFailures.total > 0 ? "bad" : "good"}
        />
        <Kpi
          label="Erreurs fonctions"
          icon={<ServerCrash size={13} />}
          value={report.functionErrors.total}
          sub={Object.keys(report.functionErrors.bySource).length > 0 ? Object.entries(report.functionErrors.bySource).map(([k, v]) => `${k} (${v})`).join(", ") : undefined}
          tone={report.functionErrors.total > 0 ? "bad" : "good"}
        />
      </div>

      {/* Cron */}
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={15} style={{ color: cronLate ? RED : ACCENT }} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">Relances automatiques</p>
          <span
            className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
            style={{ backgroundColor: cronLate ? `${RED}22` : `${ACCENT}22`, color: cronLate ? RED : ACCENT }}
          >
            {cronLate ? "en retard" : "à l'heure"}
          </span>
        </div>
        {report.cron.last ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Dernier passage</p>
              <p className="text-sm font-bold text-slate-900">{fmtDate(report.cron.last.at)}</p>
              <p className="text-[10px] text-slate-400">{relative(report.cron.last.at)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Issue</p>
              <p className="text-sm font-bold text-slate-900">{String(cronMeta.outcome ?? "—")}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Relances envoyées</p>
              <p className="text-sm font-bold text-slate-900">{String(cronMeta.sent ?? 0)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Échecs / ignorés</p>
              <p className="text-sm font-bold text-slate-900">{String(cronMeta.failed ?? 0)} / {String(cronMeta.skipped ?? 0)}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-600">
            Aucune trace d&apos;exécution. Le job tourne tous les jours à 8 h (Europe/Paris) —
            la première trace apparaîtra au prochain passage. Si rien n&apos;arrive demain,
            c&apos;est qu&apos;il ne tourne pas.
          </p>
        )}
      </div>

      <DailyBars days={report.daily} />

      {/* Incidents détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Incidents
          title="Plantages de l'app"
          icon={<MonitorX size={15} />}
          items={report.clientErrors.top}
          empty="Aucun plantage remonté."
        />
        <Incidents
          title="Échecs de génération IA"
          icon={<Sparkles size={15} />}
          items={report.aiFailures.top}
          empty="Aucun échec de génération."
        />
        <Incidents
          title="Emails refusés"
          icon={<Mail size={15} />}
          items={report.emailErrors.top}
          empty="Aucun envoi refusé."
        />
        <Incidents
          title="Erreurs de fonctions"
          icon={<ServerCrash size={15} />}
          items={report.functionErrors.top}
          empty="Aucune erreur côté serveur."
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-400">
          Fenêtre {report.windowDays} j · calculé {fmtDate(report.computedAt)} · rétention 30 j
          {report.truncated ? " · liste tronquée à 5 000 événements" : ""}
        </p>
        <button
          onClick={() => load(days)}
          disabled={loading}
          className={btn}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualiser
        </button>
      </div>
    </div>
  );
};

export default SanteTab;
