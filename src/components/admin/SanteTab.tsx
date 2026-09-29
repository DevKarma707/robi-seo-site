"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Mail, MonitorX,
  RefreshCw, Sparkles, ServerCrash, XCircle,
} from "lucide-react";
import { fetchHealthReport, type HealthReport, type HealthSignature } from "@/lib/adminApi";
import { diagnoseAi, type AiDiagnosis } from "@/lib/aiHealth";
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

const AI_STATUS: Record<AiDiagnosis["status"], { label: string; color: string }> = {
  ok: { label: "répond", color: ACCENT },
  degraded: { label: "instable", color: AMBER },
  down: { label: "bloquée", color: RED },
};

/**
 * L'IA en clair : état, cause de chaque échec, date, geste à faire.
 * « 4 échec(s) de génération IA » ne suffisait pas : le quota Gemini épuisé
 * du 25/09 n'était lisible qu'en ouvrant les signatures une à une.
 */
function AiCard({ ai }: { ai: AiDiagnosis }) {
  const st = AI_STATUS[ai.status];
  const sec = (ms: number | null) => (ms === null ? "—" : `${Math.round(ms / 1000)} s`);
  return (
    <div className={`${card} p-5 border-l-4`} style={{ borderLeftColor: st.color }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} style={{ color: st.color }} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-900">IA de l&apos;app</p>
        <span
          className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{ backgroundColor: `${st.color}22`, color: st.color }}
        >
          {st.label}
        </span>
      </div>

      {ai.causes.length === 0 ? (
        <p className="text-xs text-slate-600">Aucun échec sur la période.</p>
      ) : (
        <ul className="space-y-3">
          {ai.causes.map((c) => (
            <li key={c.kind}>
              <p className="text-[13px] font-bold text-slate-900 flex items-start gap-2">
                <span className="mt-[7px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.blocking ? RED : AMBER }} />
                {c.label}
              </p>
              <p className="text-[11px] text-slate-500 ml-3.5 mt-0.5">
                {c.count} fois · dernière le {fmtDate(c.lastSeen)} ({relative(c.lastSeen)})
              </p>
              <p className="text-[12px] text-slate-700 ml-3.5 mt-1">
                <span className="font-bold">À faire : </span>{c.action}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Appels</p>
          <p className="text-sm font-bold text-slate-900">{ai.calls ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Taux d&apos;échec</p>
          <p className="text-sm font-bold" style={{ color: ai.failureRate !== null && ai.failureRate >= 20 ? RED : undefined }}>
            {ai.failureRate === null ? "—" : `${ai.failureRate} %`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Temps médian</p>
          <p className="text-sm font-bold text-slate-900">{sec(ai.latencyP50Ms)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Pire temps</p>
          <p className="text-sm font-bold" style={{ color: ai.latencyWorstMs !== null && ai.latencyWorstMs > 30_000 ? AMBER : undefined }}>
            {sec(ai.latencyWorstMs)}
          </p>
        </div>
      </div>
    </div>
  );
}

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

/** Les quatre familles d'incidents, chacune sa couleur sur le graphe et la chronologie. */
const KINDS = [
  { key: "ai_failed", label: "IA", color: "#a78bfa" },
  { key: "client_error", label: "Plantage app", color: RED },
  { key: "email_failed", label: "E-mail refusé", color: "#60a5fa" },
  { key: "function_error", label: "Serveur", color: "#fb923c" },
] as const;
type KindKey = (typeof KINDS)[number]["key"];
const KIND_BY_KEY = Object.fromEntries(KINDS.map((k) => [k.key, k])) as Record<KindKey, (typeof KINDS)[number]>;

/** « 3 h 40 », « 25 min », « 2 j » : depuis combien de temps c'est calme. */
const since = (iso: string) => {
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (min < 60) return `${min} min`;
  if (min < 24 * 60) return `${Math.floor(min / 60)} h${min % 60 ? ` ${String(min % 60).padStart(2, "0")}` : ""}`;
  return `${Math.round(min / 1440)} j`;
};

/**
 * Où en est un incident, d'après sa dernière apparition :
 * moins d'une heure = en cours ; moins de 24 h = calme mais trop tôt pour
 * crier victoire ; au-delà = résolu. Même logique que le Cockpit.
 */
function statusOf(lastSeen: string): { label: string; color: string; ink: string } {
  const h = (Date.now() - Date.parse(lastSeen)) / 3_600_000;
  if (h < 1) return { label: "En cours", color: RED, ink: RED };
  if (h < 24) return { label: `Calme depuis ${since(lastSeen)}`, color: AMBER, ink: "#d97706" };
  // Pastille en vert accent, texte en ACCENT_INK : le vert clair sur fond
  // blanc (mode clair) ne se lisait pas.
  return { label: `Résolu · plus vu depuis ${since(lastSeen)}`, color: ACCENT, ink: ACCENT_INK };
}

/** « 29/09 11:00 », et « 29/09 11:00 → 15:24 » quand tout tient dans la journée. */
const hm = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
const dm = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
const span = (first: string | undefined, last: string) => {
  if (!first || first === last) return `${dm(last)} ${hm(last)}`;
  return dm(first) === dm(last) ? `${dm(first)} ${hm(first)} → ${hm(last)}` : `${dm(first)} ${hm(first)} → ${dm(last)} ${hm(last)}`;
};

const dayLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }).replace(".", "");

/**
 * Complète la série avec les jours sans incident.
 *
 * Le rapport ne renvoie que les jours qui PORTENT des événements : trois
 * échecs le même jour donnaient une série d'un seul point, et `flex-1`
 * l'étirait sur toute la largeur — un gros bloc rouge au lieu d'un graphe.
 * Un jour calme est une information, il doit occuper sa place.
 */
function fillDays(
  days: HealthReport["daily"],
  windowDays: number,
  today = new Date(),
): HealthReport["daily"] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const out: HealthReport["daily"] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push(byDate.get(key) ?? { date: key, count: 0, byKind: {} });
  }
  return out;
}

type Incident = HealthSignature & { kind: KindKey };

/**
 * Historique des incidents : où on en est (en cours / calme / résolu), un
 * graphe daté et coloré par type, puis la chronologie « du … au … ».
 * Avant : des barres rouges sans date ni légende — impossible de savoir
 * quand un problème avait commencé, ni s'il était réglé.
 */
export function IncidentHistory({ report }: { report: HealthReport }) {
  const [showAll, setShowAll] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const incidents: Incident[] = [
    ...report.aiFailures.top.map((s) => ({ ...s, kind: "ai_failed" as const })),
    ...report.clientErrors.top.map((s) => ({ ...s, kind: "client_error" as const })),
    ...report.emailErrors.top.map((s) => ({ ...s, kind: "email_failed" as const })),
    ...report.functionErrors.top.map((s) => ({ ...s, kind: "function_error" as const })),
  ].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));

  const latest = incidents[0] ?? null;
  const head = latest ? statusOf(latest.lastSeen) : null;
  const totals = Object.fromEntries(KINDS.map((k) => [k.key, 0])) as Record<KindKey, number>;
  const series = fillDays(report.daily, report.windowDays);
  series.forEach((d) => KINDS.forEach((k) => { totals[k.key] += d.byKind?.[k.key] ?? 0; }));
  const hasByKind = series.some((d) => d.byKind && Object.keys(d.byKind).length > 0);
  const max = Math.max(1, ...series.map((d) => d.count));
  const shown = showAll ? incidents : incidents.slice(0, 6);
  const labelEvery = series.length > 14 ? 5 : 1;

  return (
    <div className={`${card} p-5 space-y-5`}>
      {/* Où on en est, lisible en une seconde */}
      <div className="flex items-start gap-3">
        <Activity size={16} className="mt-0.5 flex-shrink-0" style={{ color: head?.color ?? ACCENT }} />
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">Historique des incidents</p>
          {latest && head ? (
            <p className="text-[13px] mt-1">
              <span className="font-black" style={{ color: head.ink }}>{head.label}</span>
              <span className="text-slate-600">
                {" "}— dernier incident le {dm(latest.lastSeen)} à {hm(latest.lastSeen)} ({KIND_BY_KEY[latest.kind].label.toLowerCase()})
              </span>
            </p>
          ) : (
            <p className="text-[13px] mt-1 font-black" style={{ color: ACCENT_INK }}>
              Aucun incident sur les {report.windowDays} derniers jours
            </p>
          )}
        </div>
      </div>

      {/* Graphe daté, coloré par type */}
      <div>
        <div className="flex items-end gap-1 h-28 pt-4">
          {series.map((d) => {
            const today = d.date === new Date().toISOString().slice(0, 10);
            const parts = hasByKind
              ? KINDS.map((k) => ({ ...k, n: d.byKind?.[k.key] ?? 0 })).filter((p) => p.n > 0)
              : d.count > 0 ? [{ key: "all", label: "Incidents", color: RED, n: d.count }] : [];
            return (
              <div
                key={d.date}
                className="flex-1 h-full flex flex-col justify-end relative"
                title={`${dayLabel(d.date)} : ${d.count} incident(s)${parts.length ? " — " + parts.map((p) => `${p.label} ${p.n}`).join(", ") : ""}`}
              >
                {d.count > 0 && (
                  <span className="text-[10px] font-black text-slate-700 text-center mb-0.5">{d.count}</span>
                )}
                {d.count > 0 ? (
                  <div className="w-full rounded-sm overflow-hidden flex flex-col-reverse" style={{ height: `${Math.max((d.count / max) * 100, 8)}%` }}>
                    {parts.map((p) => (
                      <div key={p.key} style={{ height: `${(p.n / d.count) * 100}%`, backgroundColor: p.color }} />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-[3px] rounded-sm bg-slate-200" />
                )}
                {today && <span className="absolute -top-1 right-0 left-0 mx-auto w-1 h-1 rounded-full" style={{ backgroundColor: ACCENT_INK }} />}
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 mt-1.5">
          {series.map((d, i) => {
            const today = d.date === new Date().toISOString().slice(0, 10);
            const show = today || i % labelEvery === 0;
            return (
              <span key={d.date} className={`flex-1 text-center text-[10px] ${today ? "font-black text-slate-900" : "text-slate-400"}`}>
                {show ? (today ? "auj." : dayLabel(d.date)) : ""}
              </span>
            );
          })}
        </div>
        {hasByKind && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {KINDS.map((k) => (
              <span key={k.key} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: k.color }} />
                {k.label} <span className="font-bold text-slate-900">{totals[k.key]}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Chronologie : du … au …, et si c'est réglé */}
      {incidents.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Ce qui s&apos;est passé</p>
          <ul className="space-y-2.5">
            {shown.map((it) => {
              const st = statusOf(it.lastSeen);
              const k = KIND_BY_KEY[it.kind];
              const id = `${it.kind}|${it.signature}`;
              return (
                <li key={id} className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: st.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: `${k.color}22`, color: k.color }}>
                        {k.label}
                      </span>
                      <span className="text-[11px] font-black" style={{ color: st.ink }}>{st.label}</span>
                      <span className="text-[11px] text-slate-500">
                        {it.count}× · {span(it.firstSeen, it.lastSeen)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(open === id ? null : id)}
                      className={`text-left text-[12px] text-slate-700 mt-1 w-full ${open === id ? "font-mono break-words" : "truncate"}`}
                      title={open === id ? "Réduire" : "Voir le message complet"}
                    >
                      {it.sample}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
          {incidents.length > 6 && (
            <button type="button" onClick={() => setShowAll(!showAll)} className="mt-3 text-[11px] font-bold text-slate-500 hover:text-slate-900">
              {showAll ? "Réduire" : `Voir les ${incidents.length} incidents`}
            </button>
          )}
        </div>
      )}
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
      <div className="flex items-center gap-2 text-slate-400 text-sm py-10">
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
  const ai = diagnoseAi(report);
  const cronLate = report.cron.staleHours === null || report.cron.staleHours > 26;
  const cronMeta = (report.cron.last?.meta || {}) as Record<string, number | string>;

  return (
    <div className="space-y-6">
      {/* Verdict */}
      {/* Surface standard plutôt qu'un fond translucide maison : à 5 %
          d'opacité la teinte disparaissait sur la coquille sombre, et le texte
          — écrit dans les gris d'une carte claire — devenait illisible. La
          couleur de sévérité reste sur l'icône, le titre et le liseré. */}
      <div className={`${card} p-5 border-l-4`} style={{ borderLeftColor: sev.color }}>
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

      {ai && <AiCard ai={ai} />}

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

      <IncidentHistory report={report} />

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
