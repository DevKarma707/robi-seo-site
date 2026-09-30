"use client";

import React, { useMemo, useState } from "react";
import type { CostMonth, CostSector } from "@/lib/adminApi";
import { card, kpiLabel, sectionTitle } from "./ui";

/**
 * Camembert des dépenses par secteur (30/09/2026).
 *
 * Quatre secteurs, toujours dans le même ordre et avec la même couleur :
 * une dépense ne change jamais de teinte d'un mois à l'autre. Les couleurs
 * sont des variables CSS (`--sec-*` dans globals.css) pour que le mode
 * sombre ait ses propres teintes, validées contre le fond Amethyst.
 *
 * L'IA mesurée va dans Fonctionnement, les pubs Meta dans Marketing, les
 * dépenses saisies dans le secteur qu'on leur a donné — ou, pour les
 * anciennes qui n'en ont pas, celui que le libellé laisse deviner.
 */

export const SECTORS: { key: CostSector; label: string; hint: string; color: string }[] = [
  { key: "fonctionnement", label: "Fonctionnement", hint: "IA, serveurs, hébergement, domaines", color: "var(--sec-fonctionnement)" },
  { key: "marketing", label: "Marketing", hint: "pubs Meta, Blotato, réseaux", color: "var(--sec-marketing)" },
  { key: "outils", label: "Outils", hint: "logiciels de travail", color: "var(--sec-outils)" },
  { key: "autre", label: "Autre", hint: "le reste", color: "var(--sec-autre)" },
];

const MARKETING = /\b(ads?|pubs?|meta|facebook|instagram|tiktok|blotato|influen|sponsor|marketing|google ads)\b/i;
const FONCTIONNEMENT = /\b(vercel|firebase|gemini|google cloud|gcp|pinecone|supabase|domaine|domain|hostinger|serveur|server|h[ée]bergement|resend|brevo|polar|elevenlabs|openai|anthropic)\b/i;
const OUTILS = /\b(figma|notion|canva|adobe|github|claude|chatgpt|higgsfield|capcut|logiciel)\b/i;

/** Secteur deviné d'après le libellé, pour les dépenses saisies avant le 30/09. */
export const guessSector = (label: string): CostSector =>
  MARKETING.test(label) ? "marketing"
    : FONCTIONNEMENT.test(label) ? "fonctionnement"
      : OUTILS.test(label) ? "outils"
        : "autre";

const eur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: n >= 100 ? 0 : 2 }).format(n);

const sumBySector = (months: CostMonth[], adsOk: boolean) => {
  const out: Record<CostSector, number> = { fonctionnement: 0, marketing: 0, outils: 0, autre: 0 };
  for (const m of months) {
    out.fonctionnement += m.ai.cost || 0;
    if (adsOk) out.marketing += m.ads?.spend || 0;
    for (const it of m.declared.items) {
      out[it.category ?? guessSector(it.label)] += it.amount || 0;
    }
  }
  return out;
};

const R = 64;
const STROKE = 22;
const C = 2 * Math.PI * R;
const GAP = 2;

export default function SecteursDonut({ months, adsOk }: { months: CostMonth[]; adsOk: boolean }) {
  const [range, setRange] = useState<"month" | "all">("month");
  const [hover, setHover] = useState<CostSector | null>(null);

  const scope = range === "month" ? months.slice(-1) : months;
  const totals = useMemo(() => sumBySector(scope, adsOk), [scope, adsOk]);
  const total = SECTORS.reduce((s, x) => s + totals[x.key], 0);

  // Arcs posés bout à bout, en partant de midi, un espace de 2 px entre chacun.
  const arcs = SECTORS.filter((s) => totals[s.key] > 0).reduce<
    (typeof SECTORS[number] & { len: number; offset: number })[]
  >((acc, s) => {
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.len + GAP : 0;
    const len = (totals[s.key] / total) * C;
    return [...acc, { ...s, len: Math.max(len - GAP, 0.5), offset }];
  }, []);

  const focus = hover ? SECTORS.find((s) => s.key === hover)! : null;
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

  return (
    <div className={`${card} p-4`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className={sectionTitle}>Par secteur</h3>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            {range === "month" ? "Ce mois-ci" : `Cumul des ${months.length} derniers mois`}
          </p>
        </div>
        <div role="group" aria-label="Période" className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-900/[0.05]">
          {([["month", "Ce mois"], ["all", `${months.length} mois`]] as const).map(([k, l]) => (
            <button
              key={k}
              type="button"
              onClick={() => setRange(k)}
              aria-pressed={range === k}
              className={`h-7 px-3 rounded-md text-[12px] font-semibold transition-colors ${
                range === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5 mt-4">
        <svg
          viewBox="0 0 180 180"
          className="w-[180px] h-[180px] shrink-0"
          role="img"
          aria-label={`Dépenses par secteur : ${SECTORS.map((s) => `${s.label} ${eur(totals[s.key])}`).join(", ")}`}
        >
          <circle cx="90" cy="90" r={R} fill="none" stroke="var(--color-slate-100)" strokeWidth={STROKE} />
          <g transform="rotate(-90 90 90)">
            {arcs.map((a) => (
              <circle
                key={a.key}
                cx="90" cy="90" r={R}
                fill="none"
                stroke={a.color}
                strokeWidth={hover === a.key ? STROKE + 6 : STROKE}
                strokeDasharray={`${a.len} ${C - a.len}`}
                strokeDashoffset={-a.offset}
                opacity={hover && hover !== a.key ? 0.35 : 1}
                style={{ transition: "stroke-width .15s, opacity .15s", cursor: "default" }}
                onMouseEnter={() => setHover(a.key)}
                onMouseLeave={() => setHover(null)}
              >
                <title>{`${a.label} · ${eur(totals[a.key])} · ${pct(totals[a.key])} %`}</title>
              </circle>
            ))}
          </g>
          <text x="90" y="84" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 11, fontWeight: 600 }}>
            {focus ? focus.label : "Total"}
          </text>
          <text x="90" y="104" textAnchor="middle" className="fill-slate-900" style={{ fontSize: 19, fontWeight: 800 }}>
            {total > 0 ? eur(focus ? totals[focus.key] : total) : "0 €"}
          </text>
          {focus && (
            <text x="90" y="120" textAnchor="middle" className="fill-slate-500" style={{ fontSize: 10.5, fontWeight: 600 }}>
              {pct(totals[focus.key])} %
            </text>
          )}
        </svg>

        <ul className="flex-1 min-w-0 w-full flex flex-col gap-1">
          {SECTORS.map((s) => (
            <li
              key={s.key}
              onMouseEnter={() => setHover(s.key)}
              onMouseLeave={() => setHover(null)}
              className={`flex items-center gap-3 px-2.5 py-2 rounded-lg transition-colors ${
                hover === s.key ? "bg-slate-900/[0.05]" : ""
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-slate-900">{s.label}</div>
                <div className="text-[11.5px] text-slate-500 truncate">{s.hint}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-bold text-slate-900 tabular-nums">{eur(totals[s.key])}</div>
                <div className={`${kpiLabel} tabular-nums`}>{pct(totals[s.key])} %</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
