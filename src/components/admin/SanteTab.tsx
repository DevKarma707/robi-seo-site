"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, CreditCard, Mail, MonitorX,
  RefreshCw, Sparkles, XCircle,
} from "lucide-react";
import { fetchHealthReport, type HealthReport, type HealthSignature } from "@/lib/adminApi";
import { diagnoseAi, type AiDiagnosis } from "@/lib/aiHealth";
import { ACCENT, ACCENT_INK, btn, card } from "./ui";

const RED = "#f87171";
const AMBER = "#fbbf24";


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


type Level = "ok" | "warn" | "down" | "off";
const LEVEL: Record<Level, { color: string; ink: string; label: string }> = {
  ok: { color: ACCENT, ink: ACCENT_INK, label: "OK" },
  warn: { color: AMBER, ink: "#d97706", label: "À surveiller" },
  down: { color: RED, ink: RED, label: "En panne" },
  off: { color: "#94a3b8", ink: "#64748b", label: "Éteint" },
};
type Service = { key: string; name: string; icon: React.ReactNode; level: Level; status: string; detail: string };

/** Niveau d'après la dernière apparition : < 1 h en panne, < 24 h à surveiller, sinon réglé. */
const levelFromLast = (iso?: string | null): Level => {
  if (!iso) return "ok";
  const h = (Date.now() - Date.parse(iso)) / 3_600_000;
  return h < 1 ? "down" : h < 24 ? "warn" : "ok";
};
const newest = (sigs: HealthSignature[]) => sigs.map((s) => s.lastSeen).sort().pop() ?? null;
const PAY = /polar|stripe|checkout|portal|paiement|payment/i;

/**
 * Un service = une tuile : vert / orange / rouge / gris, une phrase, un chiffre.
 * Remplace le verdict générique (« À surveiller » + liste brute) et les 4
 * compteurs, qui ne disaient pas QUEL service allait mal.
 */
function buildServices(report: HealthReport): Service[] {
  const out: Service[] = [];

  const appLast = newest(report.clientErrors.top);
  const appLevel = report.clientErrors.total ? levelFromLast(appLast) : "ok";
  out.push({ key: "app", name: "Application", icon: <MonitorX size={14} />, level: appLevel,
    status: report.clientErrors.total ? (appLevel === "ok" ? "Réglé" : `${report.clientErrors.total} plantage(s)`) : "Aucun plantage",
    detail: report.clientErrors.total ? `${report.clientErrors.affectedUsers} compte(s) touché(s) · dernier ${relative(appLast)}` : `sur ${report.windowDays} j` });

  const aiLast = newest(report.aiFailures.top);
  const perf = report.aiPerformance;
  // Même règle que les autres tuiles (dernier échec < 1 h = en panne, < 24 h =
  // à surveiller), plus un taux d'échec anormal sur la période.
  let aiLevel: Level = report.aiFailures.total ? levelFromLast(aiLast) : "ok";
  if (aiLevel === "ok" && perf && (perf.failureRate ?? 0) > 10) aiLevel = "warn";
  out.push({ key: "ai", name: "Robi IA", icon: <Sparkles size={14} />, level: aiLevel,
    status: aiLevel === "ok" ? "Répond" : aiLevel === "down" ? "Indisponible" : "Instable",
    detail: perf ? `${perf.calls} appels · ${perf.failureRate ?? 0} % d'échecs${perf.latencyP50ApproxMs ? ` · ${Math.round(perf.latencyP50ApproxMs / 100) / 10} s en moyenne` : ""}` : `${report.aiFailures.total} échec(s) · dernier ${relative(aiLast)}` });

  const rate = report.emails.failureRate;
  const mailLevel: Level = rate === null ? "ok" : rate > 20 ? "down" : rate > 5 ? "warn" : "ok";
  out.push({ key: "mail", name: "E-mails", icon: <Mail size={14} />, level: mailLevel,
    status: rate === null ? "Pas encore mesuré" : `${rate} % d'échecs`,
    detail: report.emails.failed !== null ? `${report.emails.failed} refusé(s) sur ${(report.emails.sent ?? 0) + report.emails.failed}` : "index Firestore en cours" });

  const payErrors = Object.entries(report.functionErrors.bySource).filter(([k]) => PAY.test(k));
  const payCount = payErrors.reduce((n, [, v]) => n + v, 0);
  const payLast = newest(report.functionErrors.top.filter((sg) => PAY.test(`${sg.signature} ${sg.sample}`)));
  const payLevel: Level = payCount ? (levelFromLast(payLast) === "ok" ? "warn" : levelFromLast(payLast)) : "ok";
  out.push({ key: "pay", name: "Paiements", icon: <CreditCard size={14} />, level: payLevel,
    status: payCount ? `${payCount} erreur(s)` : "Aucune erreur",
    detail: payCount ? payErrors.map(([k, v]) => `${k} (${v})`).join(", ") : "Polar · Stripe · espace client" });

  const crons = report.crons ?? (report.cron.last ? [{ ...report.cron.last, staleHours: report.cron.staleHours ?? 999 }] : []);
  const rem = crons.find((c) => c.source === "runRemindersDaily");
  const remLevel: Level = !rem ? "down" : rem.staleHours > 48 ? "down" : rem.staleHours > 26 ? "warn" : "ok";
  const remMeta = (rem?.meta || {}) as Record<string, number | string>;
  out.push({ key: "rem", name: "Relances factures", icon: <Clock size={14} />, level: remLevel,
    status: !rem ? "Jamais passé" : remLevel === "ok" ? "À l'heure" : `En retard (${rem.staleHours} h)`,
    detail: rem ? `8 h chaque jour · dernier ${relative(rem.at)} · ${String(remMeta.sent ?? 0)} envoyée(s)` : "aucune trace sur la période" });

  const nur = crons.find((c) => c.source === "runNurtureDaily");
  const nurMeta = (nur?.meta || {}) as Record<string, number | string>;
  const nurOff = !nur || nurMeta.outcome === "disabled";
  const nurLevel: Level = nurOff ? "off" : nur!.staleHours > 26 ? "warn" : String(nurMeta.outcome) === "partial" ? "warn" : "ok";
  out.push({ key: "nur", name: "Relances inscrits", icon: <Mail size={14} />, level: nurLevel,
    status: nurOff ? "Éteintes" : nurLevel === "ok" ? "Actives" : "À vérifier",
    detail: nurOff ? "J+1 / J+2 / J+7 — Admin › Lancement" : `10 h chaque jour · ${String(nurMeta.sent ?? 0)} envoyé(s) au dernier passage` });

  return out;
}

export function ServicesBoard({ report, days, setDays }: { report: HealthReport; days: number; setDays: (d: number) => void }) {
  const services = buildServices(report);
  const bad = services.filter((sv) => sv.level === "down" || sv.level === "warn");
  const worst: Level = services.some((sv) => sv.level === "down") ? "down" : bad.length ? "warn" : "ok";
  const down = services.filter((sv) => sv.level === "down").map((sv) => sv.name);
  const warn = services.filter((sv) => sv.level === "warn").map((sv) => sv.name);
  const head = worst === "ok"
    ? "Tout fonctionne"
    : [down.length ? `En panne : ${down.join(", ")}` : "", warn.length ? `À surveiller : ${warn.join(", ")}` : ""].filter(Boolean).join(" · ");
  return (
    <div className={`${card} p-5 space-y-4 border-l-4`} style={{ borderLeftColor: LEVEL[worst].color }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span style={{ color: LEVEL[worst].ink }} className="mt-0.5">{worst === "ok" ? <CheckCircle2 size={18} /> : worst === "down" ? <XCircle size={18} /> : <AlertTriangle size={18} />}</span>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-900">État des services</p>
            <p className="font-black text-[15px] mt-1" style={{ color: LEVEL[worst].ink }}>{head}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {[7, 30].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${days === d ? "bg-slate-200 text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
              {d} j
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {services.map((sv) => {
          const L = LEVEL[sv.level];
          return (
            <div key={sv.key} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: L.color }} />
                {sv.icon}
                <p className="text-[11px] font-bold uppercase tracking-wider truncate">{sv.name}</p>
              </div>
              <p className={`font-black text-[15px] mt-2 ${sv.level === "ok" ? "text-slate-900" : ""}`} style={sv.level === "ok" ? undefined : { color: L.ink }}>{sv.status}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{sv.detail}</p>
            </div>
          );
        })}
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

  const ai = diagnoseAi(report);

  return (
    <div className="space-y-6">
      <ServicesBoard report={report} days={days} setDays={setDays} />

      {/* Détail de l'IA seulement quand elle a un souci : sinon la tuile suffit. */}
      {ai && ai.status !== "ok" && <AiCard ai={ai} />}

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
