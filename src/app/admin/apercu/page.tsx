"use client";

/**
 * Banc d'essai visuel de l'admin — **développement uniquement**.
 *
 * L'admin réel est derrière un Google sign-in : impossible d'itérer sur son
 * apparence sans s'y connecter. Cette page rejoue la coquille et les briques
 * représentatives (KPI, colonne kanban, ligne de liste, case de calendrier)
 * avec des données en dur, en réutilisant les primitives de `ui.ts`.
 *
 * Elle n'a donc de valeur que tant qu'elle utilise les MÊMES primitives que
 * les vrais onglets : ce qu'on améliore ici se propage, ce qu'on y écrit en
 * dur ne prouve rien.
 *
 * `notFound()` en production : la route n'existe pas sur robi-app.com.
 */
import React from "react";
import { notFound } from "next/navigation";
import {
  Gauge, ListChecks, CalendarDays, FolderOpen, HeartPulse, Target,
  Megaphone, BarChart2, FileText, Rocket, ArrowUpRight, LogOut, Filter, Globe,
} from "lucide-react";
import { Lancement, Revenu, Alertes } from "@/components/admin/PilotageTab";
import WorldMapBlock from "@/components/admin/WorldMapBlock";
import ThemePicker from "@/components/admin/ThemePicker";
import { ACCENT, btn, btnAccent, btnGhost, btnPill, btnPrimary, card, focusRing, kpiLabel, kpiValue, sectionTitle } from "@/components/admin/ui";
import ModeToggle from "@/components/admin/ModeToggle";
import { Toaster, toast } from "@/components/admin/toast";
import { AreaCurve, CountUp } from "@/components/admin/motion";

const NAV = [
  { label: "Pilotage", icon: <Gauge size={17} />, active: true },
  { label: "Tâches", icon: <ListChecks size={17} /> },
  { label: "Réseaux", icon: <CalendarDays size={17} /> },
  { label: "Fichiers", icon: <FolderOpen size={17} /> },
  { label: "Santé", icon: <HeartPulse size={17} /> },
  { label: "Acquisition", icon: <Target size={17} /> },
  { label: "Influenceurs", icon: <Megaphone size={17} /> },
  { label: "Analytics", icon: <BarChart2 size={17} /> },
  { label: "Blog", icon: <FileText size={17} />, badge: 3 },
  { label: "Lancement", icon: <Rocket size={17} /> },
];

const KPIS = [
  { label: "Inscrits (total)", value: "19", sub: "+4 sur 7 j" },
  { label: "Inscrits · 30 j", value: "12" },
  { label: "Actifs · 7 j", value: "7", sub: "11 sur 30 j" },
  { label: "Ventes réelles", value: "3", sub: "5 comptes Pro au total", accent: true },
];

/** Cas réel du Pilotage : la valeur peut être un nœud, pas une chaîne. */
const KPI_NODE = { label: "Factures / Devis", node: true };

const FUNNEL = [
  { label: "Visites site · 30 j", value: 1240, rate: null as number | null },
  { label: "Inscriptions · 30 j", value: 12, rate: 1.0 },
  { label: "Comptes activés", value: 8, rate: 66.7 },
  { label: "Ventes réelles", value: 3, rate: 37.5 },
];

const COUNTRIES = [
  { name: "France", count: 11 }, { name: "Maroc", count: 4 },
  { name: "Belgique", count: 2 }, { name: "Suisse", count: 1 },
];

export default function ApercuAdmin() {
  if (process.env.NODE_ENV === "production") notFound();

  const navItem = "text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-900/[0.04]";
  const navActive = "a-nav-active text-slate-900 font-semibold";
  const CURVE = [18, 22, 19, 31, 27, 24, 38, 35, 29, 44, 41, 37, 52, 58].map((value, i) => ({
    value,
    label: `${i + 2} sept.`,
    mark: i % 4 === 1,
  }));

  return (
    <div className="a-root a-shell min-h-screen flex">
      <aside className="a-sidebar w-[232px] flex-shrink-0 flex flex-col h-screen sticky top-0">
        <div className="px-5 h-[68px] flex items-center gap-3 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Robi AI" className="w-8 h-8" />
          <div>
            <p className="text-[14px] font-bold tracking-[-0.01em] text-slate-900 leading-none">Robi AI</p>
            <p className="a-mono text-[10px] uppercase tracking-[0.14em] text-slate-400 mt-1">Admin</p>
          </div>
        </div>
        <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto">
          {NAV.map((t) => (
            <button
              key={t.label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-colors ${focusRing} ${t.active ? navActive : navItem}`}
            >
              {t.icon}
              <span className="flex-1 text-left">{t.label}</span>
              {t.badge ? (
                <span className="a-mono min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--color-accent)] text-[var(--a-on-accent)] text-[10.5px] font-medium flex items-center justify-center">{t.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200 space-y-0.5">
          <ModeToggle />
          <ThemePicker />
          <span className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] ${navItem}`}>
            <ArrowUpRight size={16} strokeWidth={1.75} /><span>Voir le site</span>
          </span>
          <span className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium text-slate-500">
            <LogOut size={16} strokeWidth={1.75} /><span>Déconnexion</span>
          </span>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] px-6 py-8 md:px-10">
          <header className="a-rise mb-8 pb-6 border-b border-slate-200">
            <h1 className="text-[28px] font-bold leading-none tracking-[-0.03em] text-slate-900">Pilotage</h1>
            <p className="text-[13.5px] mt-2.5 text-slate-500">Inscriptions, activation, usage et funnel — agrégats uniquement</p>
          </header>

          <div className="a-tab-enter">
          <div className="space-y-6">
            {/* Les vrais composants du Pilotage, nourris de données factices. */}
            <Lancement
              config={{ enabled: true, totalSeats: 1000, realSold: 3, baseOffset: 40, manualOverride: null, deadline: "2026-09-30" }}
              days={61}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Revenu stats={{ revenue: { oneShot: 177, mrr: 14, total: 191 }, byPlan: { lifetime: 3, monthly: 1 } }} />
              <Alertes
                health={{
                  windowDays: 7, severity: "warn",
                  problems: ["3 emails de relance en échec sur les 7 derniers jours", "Le cron de relances n'a pas tourné depuis 31 h"],
                  emails: { sent: 12, failed: 3, failureRate: 25 },
                  clientErrors: { total: 0, affectedUsers: 0, top: [] },
                  aiFailures: { total: 0, top: [] }, emailErrors: { total: 3, top: [] },
                  functionErrors: { total: 0, bySource: {}, top: [] },
                  cron: { last: null, staleHours: 31 }, daily: [], truncated: false, computedAt: "",
                }}
                error={null}
              />
            </div>

            {/* Vrai composant : la carte a été redessinée pour le fond clair. */}
            <WorldMapBlock countries={[{ code: "fr", count: 11 }, { code: "ma", count: 4 }, { code: "be", count: 2 }, { code: "us", count: 1 }, { code: "—", count: 3 }]} />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {KPIS.map((k) => (
                <div key={k.label} className={`${card} a-card-hover a-kpi p-4`}>
                  <p className={`${kpiLabel} mb-2`}>{k.label}</p>
                  <span className={`${kpiValue} ${k.accent ? "a-figure-accent" : ""}`}><CountUp value={k.value} /></span>
                  {k.sub && <p className="text-[11px] mt-2 text-slate-500">{k.sub}</p>}
                </div>
              ))}
              <div className={`${card} a-card-hover a-kpi p-4`}>
                <p className={`${kpiLabel} mb-2`}>{KPI_NODE.label}</p>
                <span className={kpiValue}><span className="text-slate-400 text-xl">index en cours</span></span>
              </div>
            </div>

            <div className={`${card} p-5`}>
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <p className={`${sectionTitle} flex-1`}>Visiteurs · 14 jours</p>
                <button className={btnAccent} onClick={() => toast("ok", "12 emails de bienvenue envoyés aux nouveaux inscrits")}>Tester un toast</button>
                <button className={btn} onClick={() => toast("err", "Envoi impossible : la clé Resend est absente.")}>Tester une erreur</button>
              </div>
              <AreaCurve points={CURVE} height={150} />
            </div>

            <div className={`${card} p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <Filter size={15} style={{ color: ACCENT }} />
                <p className={sectionTitle}>Funnel</p>
              </div>
              <div className="space-y-3">
                {FUNNEL.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-[11px] w-52 text-slate-600">{s.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="a-bar h-full rounded-full" style={{ width: `${s.rate === null ? 100 : s.rate}%` }} />
                    </div>
                    <span className="text-sm font-black w-12 text-right text-slate-900 tabular-nums">{s.value}</span>
                    <span className="text-[11px] w-16 text-right font-bold" style={{ color: s.rate === null ? "transparent" : s.rate < 10 ? "#f87171" : "var(--admin-ink)" }}>
                      {s.rate === null ? "—" : `${s.rate}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className={`${card} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={15} style={{ color: ACCENT }} />
                  <p className={sectionTitle}>Répartition par pays</p>
                </div>
                <div className="space-y-2.5">
                  {COUNTRIES.map((c) => (
                    <div key={c.name} className="flex items-center gap-3">
                      <span className="text-[11px] w-28 truncate text-slate-600">{c.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="a-bar h-full rounded-full" style={{ width: `${(c.count / 11) * 100}%` }} />
                      </div>
                      <span className="text-xs font-black w-6 text-right text-slate-900 tabular-nums">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${card} p-5`}>
                <p className={`${sectionTitle} mb-4`}>Boutons & états</p>
                <div className="flex flex-wrap gap-2">
                  <button className={btnPrimary}>Bouton principal</button>
                  <button className={btn}>Secondaire</button>
                  <button className={btnGhost}>Ghost</button>
                  <button className={btnPill} style={{ backgroundColor: "#f87171", color: "#000" }}>P1</button>
                  <button className={`${btnPill} bg-slate-100 text-slate-600`}>P2</button>
                </div>
                <div className="mt-5 space-y-2">
                  {["Cocher subscription.active dans Polar", "Faire un achat réel à 59 €"].map((t) => (
                    <div key={t} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start gap-2">
                        <span className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#f87171]" />
                        <p className="text-[12px] font-semibold leading-snug flex-1 text-slate-900">{t}</p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 pl-3.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ backgroundColor: "#BEF2211f", color: ACCENT }}>Paiement</span>
                        <span className="text-[9px] text-slate-500">Ralph</span>
                        <span className="text-[9px] text-slate-400">&lt; 30 min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
