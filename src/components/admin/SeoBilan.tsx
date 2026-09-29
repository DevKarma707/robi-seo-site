"use client";
/**
 * « Ce que dit Search Console » — le bilan du dernier export, lisible en
 * 5 secondes : où on va (verdict), 4 chiffres, la courbe par semaine, puis ce
 * qui monte, ce qui bloque, et les pages bien placées que personne ne clique.
 *
 * Avant (29/09) la page SEO ne montrait que la liste des mots-clés : les
 * vraies nouvelles de l'export (impressions ×5 depuis juillet, position 10 → 7,
 * « facture ia » qui gagne une place par export) n'apparaissaient nulle part.
 * Tout est calculé à partir des exports importés — rien n'est saisi à la main.
 */
import React, { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Minus, MousePointerClick, ChevronDown } from "lucide-react";
import type { GscReport, GscRow, GscDay } from "@/lib/searchConsole";
import { ACCENT_INK, card, kpiLabel, sectionTitle } from "./ui";
import { AreaCurve } from "./motion";

const RED = "#f87171";
const AMBER = "#d97706";

const f1 = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const fInt = (n: number) => Math.round(n).toLocaleString("fr-FR");
const dm = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
const shortPath = (url: string) => url.replace(/^https?:\/\/[^/]+/, "") || "/";

type Week = { start: string; clicks: number; impressions: number; position: number; full: boolean };

/** Regroupe en semaines (un export jour par jour est ramené à la semaine). */
function toWeeks(r: GscReport): Week[] {
  const withPos = (pts: GscDay[]) => {
    const imp = pts.reduce((s, d) => s + d.impressions, 0);
    return {
      clicks: pts.reduce((s, d) => s + d.clicks, 0),
      impressions: imp,
      position: imp ? pts.reduce((s, d) => s + d.position * d.impressions, 0) / imp : 0,
    };
  };
  const endMs = Date.parse(`${r.periodEnd}T12:00:00`);
  if (r.granularity === "week") {
    return r.daily.map((d) => ({
      start: d.date, clicks: d.clicks, impressions: d.impressions, position: d.position,
      full: (endMs - Date.parse(`${d.date}T12:00:00`)) / 86_400_000 >= 6,
    }));
  }
  const groups = new Map<string, GscDay[]>();
  for (const d of r.daily) {
    const t = new Date(`${d.date}T12:00:00`);
    t.setDate(t.getDate() - ((t.getDay() + 6) % 7)); // lundi
    const k = t.toISOString().slice(0, 10);
    groups.set(k, [...(groups.get(k) || []), d]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
    .map(([start, pts]) => ({ start, ...withPos(pts), full: pts.length >= 7 }));
}

type Move = { row: GscRow; before: number; after: number };

function Delta({ before, after, lowerIsBetter = true }: { before: number; after: number; lowerIsBetter?: boolean }) {
  const diff = lowerIsBetter ? before - after : after - before;
  const color = Math.abs(diff) < 0.3 ? "#94a3b8" : diff > 0 ? ACCENT_INK : RED;
  return <span className="font-black tabular-nums" style={{ color }}>{f1(before)} → {f1(after)}</span>;
}

export default function SeoBilan({ reports }: { reports: GscReport[] }) {
  const [open, setOpen] = useState(true);
  const latest = reports[0];
  const prev = reports.find((r) => r.id !== latest?.id && r.periodEnd < (latest?.periodEnd ?? ""));

  const b = useMemo(() => {
    if (!latest) return null;
    const weeks = toWeeks(latest).filter((w) => w.full);
    if (weeks.length < 2) return null;
    const first = weeks[0], last = weeks[weeks.length - 1];
    const recent = weeks.slice(-4);
    const clicksPerWeek = recent.reduce((s, w) => s + w.clicks, 0) / recent.length;
    const ratio = first.impressions ? last.impressions / first.impressions : 0;
    const posGain = first.position - last.position;
    const trend: "up" | "down" | "flat" = ratio >= 1.25 || posGain >= 1 ? "up" : ratio <= 0.8 || posGain <= -1 ? "down" : "flat";

    // Ce qui bouge entre les deux derniers exports (requêtes vues au moins 30 fois).
    const moves: Move[] = [];
    if (prev) {
      const before = new Map(prev.queries.map((q) => [q.key.toLowerCase(), q.position]));
      for (const q of latest.queries) {
        const p = before.get(q.key.toLowerCase());
        if (p !== undefined && q.impressions >= 30) moves.push({ row: q, before: p, after: q.position });
      }
    }
    const up = moves.filter((m) => m.before - m.after >= 0.15).sort((a, c) => (c.before - c.after) - (a.before - a.after)).slice(0, 4);
    const down = moves.filter((m) => m.after - m.before >= 1).sort((a, c) => (c.after - c.before) - (a.after - a.before)).slice(0, 3);
    const stuck = moves.filter((m) => Math.abs(m.before - m.after) < 0.3 && m.after > 10 && m.row.impressions >= 50)
      .sort((a, c) => c.row.impressions - a.row.impressions).slice(0, 3);
    // Bien placées mais personne ne clique : le titre affiché dans Google est à revoir.
    const noClick = latest.queries.filter((q) => q.position <= 10 && q.impressions >= 30 && q.clicks === 0)
      .sort((a, c) => c.impressions - a.impressions).slice(0, 4);
    const totalClicks = latest.totals.clicks || 1;
    const topPage = [...latest.pages].sort((a, c) => c.clicks - a.clicks)[0];
    const dev = (k: RegExp) => latest.devices.find((d) => k.test(d.key.toLowerCase()));
    return { weeks, first, last, clicksPerWeek, ratio, posGain, trend, up, down, stuck, noClick, topPage, totalClicks,
      mobile: dev(/mobile/), desktop: dev(/ordinateur|desktop|computer/) };
  }, [latest, prev]);

  if (!latest || !b) return null;

  const verdict = b.trend === "up"
    ? { icon: <TrendingUp size={18} />, color: ACCENT_INK, text: "Le site progresse dans Google" }
    : b.trend === "down"
      ? { icon: <TrendingDown size={18} />, color: RED, text: "Le site recule dans Google" }
      : { icon: <Minus size={18} />, color: AMBER, text: "Le site est stable dans Google" };
  const unit = latest.granularity === "month" ? "mois" : "semaine";
  const ratioTxt = b.ratio >= 1.95 ? `×${fInt(b.ratio)}` : `${b.ratio >= 1 ? "+" : ""}${fInt((b.ratio - 1) * 100)} %`;

  const tiles = [
    { label: `Impressions / ${unit}`, main: fInt(b.last.impressions), sub: `${fInt(b.first.impressions)} le ${dm(b.first.start)} · ${ratioTxt}`, good: b.ratio >= 1 },
    { label: "Position moyenne", main: f1(b.last.position), sub: `${f1(b.first.position)} le ${dm(b.first.start)} (plus bas = mieux)`, good: b.posGain >= 0 },
    { label: `Clics / ${unit}`, main: fInt(b.clicksPerWeek), sub: `moyenne des 4 dernières · ${fInt(latest.totals.clicks)} au total`, good: true },
    b.topPage
      ? { label: "Page qui rapporte", main: shortPath(b.topPage.key), sub: `${fInt(b.topPage.clicks)} clics sur ${fInt(latest.totals.clicks)} (${fInt((b.topPage.clicks / b.totalClicks) * 100)} %)`, good: true }
      : null,
  ].filter(Boolean) as { label: string; main: string; sub: string; good: boolean }[];

  return (
    <div className={`${card} p-5 space-y-5`}>
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-start gap-3 text-left">
        <span className="mt-0.5" style={{ color: verdict.color }}>{verdict.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={sectionTitle}>Ce que dit Search Console</p>
          <p className="text-[14px] mt-1">
            <span className="font-black" style={{ color: verdict.color }}>{verdict.text}</span>
            <span className="text-slate-600">
              {" "}— {ratioTxt} d&apos;impressions par {unit} depuis le {dm(b.first.start)}, position {f1(b.first.position)} → {f1(b.last.position)}.
            </span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Export du {dm(latest.periodStart)} au {dm(latest.periodEnd)}{prev ? `, comparé à celui du ${dm(prev.periodEnd)}` : ""}.
          </p>
        </div>
        <ChevronDown size={16} className={`text-slate-400 mt-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {tiles.map((t) => (
              <div key={t.label} className="rounded-xl border border-slate-200 p-3.5">
                <p className={kpiLabel}>{t.label}</p>
                <p className="text-2xl font-black text-slate-900 mt-1.5 truncate" title={t.main}>{t.main}</p>
                <p className="text-[11px] mt-0.5" style={{ color: t.good ? ACCENT_INK : RED }}>{t.sub}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Impressions par {unit}</p>
            <AreaCurve
              height={110}
              format={fInt}
              points={b.weeks.map((w) => ({
                value: w.impressions,
                label: `${unit === "semaine" ? "Semaine du " : ""}${dm(w.start)} · ${w.clicks} clic${w.clicks > 1 ? "s" : ""} · position ${f1(w.position)}`,
                mark: w.clicks >= 10,
              }))}
            />
            <p className="text-[11px] text-slate-400 mt-1.5">Pastille lime = au moins 10 clics dans la {unit}.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: ACCENT_INK }}>Ce qui monte</p>
              {b.up.length === 0 ? <p className="text-[12px] text-slate-500">{prev ? "Rien de notable depuis l'export précédent." : "Visible dès le 2e export."}</p> : (
                <ul className="space-y-1.5">
                  {b.up.map((m) => (
                    <li key={m.row.key} className="text-[12px] flex justify-between gap-2">
                      <span className="text-slate-700 truncate">{m.row.key}</span>
                      <Delta before={m.before} after={m.after} />
                    </li>
                  ))}
                </ul>
              )}
              {b.down.length > 0 && (
                <ul className="space-y-1.5 mt-2">
                  {b.down.map((m) => (
                    <li key={m.row.key} className="text-[12px] flex justify-between gap-2">
                      <span className="text-slate-700 truncate">{m.row.key}</span>
                      <Delta before={m.before} after={m.after} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: AMBER }}>Ce qui bloque (page 2)</p>
              {b.stuck.length === 0 ? <p className="text-[12px] text-slate-500">{prev ? "Aucune requête importante immobile en page 2." : "Visible dès le 2e export."}</p> : (
                <ul className="space-y-1.5">
                  {b.stuck.map((m) => (
                    <li key={m.row.key} className="text-[12px]">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-700 truncate">{m.row.key}</span>
                        <span className="font-black tabular-nums" style={{ color: AMBER }}>{f1(m.after)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{fInt(m.row.impressions)} impressions · {m.row.clicks} clic{m.row.clicks > 1 ? "s" : ""} · ne bouge pas</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: RED }}>
                <MousePointerClick size={12} /> En page 1, personne ne clique
              </p>
              {b.noClick.length === 0 ? <p className="text-[12px] text-slate-500">Toutes les requêtes bien placées génèrent des clics.</p> : (
                <ul className="space-y-1.5">
                  {b.noClick.map((q) => (
                    <li key={q.key} className="text-[12px]">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-700 truncate">{q.key}</span>
                        <span className="font-black tabular-nums text-slate-900">{f1(q.position)}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{fInt(q.impressions)} impressions · 0 clic → titre à revoir</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {b.mobile && b.desktop && (
            <p className="text-[12px] text-slate-600 border-t border-slate-200 pt-3">
              <span className="font-bold text-slate-900">Mobile</span> position {f1(b.mobile.position)} · {fInt(b.mobile.clicks)} clics
              <span className="text-slate-400"> — </span>
              <span className="font-bold text-slate-900">Ordinateur</span> position {f1(b.desktop.position)} · {fInt(b.desktop.clicks)} clics
            </p>
          )}
        </>
      )}
    </div>
  );
}
