"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Upload, Trash2, Minus, Target, RefreshCw, ArrowUp, ArrowDown } from "lucide-react";
import {
  subscribeToSeoReports, saveSeoReport, deleteSeoReport, parseGscFiles, findRow,
  WATCHED_QUERIES, isForeignBrandNoise, type GscReport, type GscRow,
} from "@/lib/searchConsole";
import { btn, btnAccent, card, input, kpiLabel, kpiValue, sectionTitle, select, ACCENT_INK } from "./ui";
import { toast } from "./toast";
import { AreaCurve, CountUp } from "./motion";

type Dim = "queries" | "pages" | "countries";

const DIM_LABEL: Record<Dim, string> = { queries: "Requêtes", pages: "Pages", countries: "Pays" };

const fmtInt = (n: number) => Math.round(n).toLocaleString("fr-FR");
const fmtDec = (n: number) => n.toFixed(1).replace(".", ",");
const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
const shortKey = (dim: Dim, key: string) => (dim === "pages" ? key.replace(/^https?:\/\/(www\.)?robi-app\.com/, "") || "/" : key);

/** Variation en % d'un volume (clics, impressions). */
function VolumeDelta({ cur, prev }: { cur: number; prev?: number }) {
  if (prev === undefined) return null;
  if (prev === 0) return cur > 0 ? <span className="text-[11px] font-bold text-emerald-600">nouveau</span> : null;
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return <span className="text-[11px] font-bold text-slate-400 flex items-center gap-0.5"><Minus size={11} />stable</span>;
  const up = pct > 0;
  return (
    <span className={`text-[11px] font-bold flex items-center gap-0.5 ${up ? "text-emerald-600" : "text-red-600"}`}>
      {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{up ? "+" : ""}{pct} %
    </span>
  );
}

/** Variation de position : un chiffre plus petit est meilleur. */
function PositionDelta({ cur, prev, compact = false }: { cur?: number; prev?: number; compact?: boolean }) {
  if (cur === undefined) return <span className="text-[11px] text-slate-400">—</span>;
  if (prev === undefined) return <span className="text-[10px] font-bold text-emerald-600">{compact ? "new" : "nouvelle"}</span>;
  const gained = prev - cur;
  if (Math.abs(gained) < 0.3) return <span className="text-[11px] font-bold text-slate-400">=</span>;
  const good = gained > 0;
  return (
    <span className={`text-[11px] font-bold flex items-center gap-0.5 ${good ? "text-emerald-600" : "text-red-600"}`}>
      {good ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{fmtDec(Math.abs(gained))}
    </span>
  );
}

const SearchConsoleBlock: React.FC = () => {
  const [reports, setReports] = useState<GscReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dim, setDim] = useState<Dim>("queries");
  const [hideNoise, setHideNoise] = useState(true);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(
    () => subscribeToSeoReports(setReports, (e) => toast("err", String(e))),
    []
  );

  const say = toast;

  const currentIndex = Math.max(0, reports.findIndex((r) => r.id === selectedId));
  const current = reports[currentIndex];
  const previous = reports[currentIndex + 1];

  const importFiles = async (list: FileList | File[] | null) => {
    const files = list ? Array.from(list) : [];
    if (!files.length) return;
    setBusy(true);
    try {
      const report = await parseGscFiles(files);
      const id = await saveSeoReport(report);
      setSelectedId(id);
      say("ok", `Export du ${fmtDate(report.periodStart)} au ${fmtDate(report.periodEnd)} importé.`);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const rows = useMemo(() => {
    if (!current) return [] as GscRow[];
    const q = search.trim().toLowerCase();
    return (current[dim] || []).filter((r) => {
      if (dim === "queries" && hideNoise && isForeignBrandNoise(r.key)) return false;
      if (q && !r.key.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [current, dim, hideNoise, search]);

  const noise = useMemo(() => {
    if (!current) return { impressions: 0, count: 0 };
    const n = current.queries.filter((r) => isForeignBrandNoise(r.key));
    return { impressions: n.reduce((s, r) => s + r.impressions, 0), count: n.length };
  }, [current]);

  const visible = showAll ? rows.slice(0, 200) : rows.slice(0, 15);

  return (
    <div className="space-y-6">
      {/* En-tête + import */}
      <div
        className={`${card} p-5 transition-all ${dragging ? "ring-2 ring-[var(--admin-ink)]" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); importFiles(e.dataTransfer.files); }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <p className={sectionTitle}>Search Console</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dépose ici le ZIP de Search Console → Performances → Exporter. Une photo est gardée par export, comparée à la précédente.
            </p>
          </div>
          {reports.length > 0 && (
            <select className={select} value={current?.id || ""} onChange={(e) => setSelectedId(e.target.value)}>
              {reports.map((r) => (
                <option key={r.id} value={r.id}>
                  {fmtDate(r.periodStart)} → {fmtDate(r.periodEnd)}{r.rangeLabel ? ` · ${r.rangeLabel}` : ""}
                </option>
              ))}
            </select>
          )}
          <button onClick={() => fileRef.current?.click()} disabled={busy} className={btnAccent}>
            {busy ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
            {busy ? "Import…" : "Importer un export"}
          </button>
          {current && (
            <button
              onClick={async () => {
                if (!current.id || !confirm("Supprimer cette photo Search Console ?")) return;
                await deleteSeoReport(current.id);
                setSelectedId(null);
              }}
              className={btn}
              title="Supprimer cet export"
            >
              <Trash2 size={13} />
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".zip,.csv"
            multiple
            className="hidden"
            onChange={(e) => importFiles(e.target.files)}
          />
        </div>
      </div>

      {!current ? (
        <div className={`${card} p-8 text-center`}>
          <p className="text-sm font-bold text-slate-700">Aucun export importé pour l&apos;instant.</p>
          <p className="text-[12px] text-slate-500 mt-1">
            Search Console → Performances → Exporter → Télécharger le fichier ZIP, puis dépose-le ci-dessus.
          </p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Clics", value: fmtInt(current.totals.clicks), delta: <VolumeDelta cur={current.totals.clicks} prev={previous?.totals.clicks} /> },
              { label: "Impressions", value: fmtInt(current.totals.impressions), delta: <VolumeDelta cur={current.totals.impressions} prev={previous?.totals.impressions} /> },
              { label: "CTR", value: `${fmtDec(current.totals.ctr)} %`, delta: null },
              { label: "Position moyenne", value: fmtDec(current.totals.position), delta: previous ? <PositionDelta cur={current.totals.position} prev={previous.totals.position} /> : null },
            ].map((k) => (
              <div key={k.label} className={`${card} p-4`}>
                <p className={kpiLabel}>{k.label}</p>
                <div className="flex items-end gap-2 mt-1.5">
                  <span className={kpiValue}><CountUp value={k.value} /></span>
                  <span className="mb-1">{k.delta}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 -mt-3">
            {previous
              ? `Comparé à l'export du ${fmtDate(previous.periodStart)} au ${fmtDate(previous.periodEnd)}.`
              : "Premier export : les variations apparaîtront au prochain import."}
          </p>

          {/* Impressions par jour */}
          <div className={`${card} p-5`}>
            <p className={`${sectionTitle} mb-4`}>Impressions par jour</p>
            <AreaCurve
              height={130}
              format={fmtInt}
              points={current.daily.map((d) => ({
                value: d.impressions,
                label: `${fmtDate(d.date)} · ${d.clicks} clic${d.clicks > 1 ? "s" : ""}`,
                mark: d.clicks > 0,
              }))}
            />
            <p className="text-[11px] text-slate-400 mt-3">Pastille lime = au moins un clic ce jour-là. Survole la courbe pour le détail.</p>
          </div>

          {/* Requêtes suivies */}
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <Target size={15} style={{ color: ACCENT_INK }} />
              <p className={sectionTitle}>Requêtes suivies</p>
              <span className="text-[11px] text-slate-400 ml-auto hidden sm:block">↑ = places gagnées depuis l&apos;export précédent</span>
            </div>
            <div className="divide-y divide-slate-100">
              {WATCHED_QUERIES.map((w) => {
                const cur = findRow(current.queries, w.query);
                const prev = findRow(previous?.queries, w.query);
                return (
                  <div key={w.query} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 truncate">{w.query}</p>
                      <p className="text-[10px] text-slate-400">{w.note}</p>
                    </div>
                    {cur ? (
                      <>
                        <span className="text-[11px] text-slate-500 w-20 text-right tabular-nums">{fmtInt(cur.impressions)} imp.</span>
                        <span className="text-[11px] text-slate-500 w-14 text-right tabular-nums">{cur.clicks} clic{cur.clicks > 1 ? "s" : ""}</span>
                        <span className="text-[13px] font-black text-slate-900 w-12 text-right tabular-nums">{fmtDec(cur.position)}</span>
                        <span className="w-12 flex justify-end"><PositionDelta cur={cur.position} prev={prev?.position} compact /></span>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400">absente de l&apos;export</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Détail requêtes / pages / pays */}
          <div className={`${card} p-5 space-y-4`}>
            <div className="flex flex-wrap items-center gap-2">
              {(Object.keys(DIM_LABEL) as Dim[]).map((d) => (
                <button
                  key={d}
                  onClick={() => { setDim(d); setShowAll(false); }}
                  className={`${btn} ${dim === d ? "!bg-[var(--color-primary)] !text-[var(--color-accent)] !border-transparent" : ""}`}
                >
                  {DIM_LABEL[d]}
                </button>
              ))}
              <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className={`${input} pl-8 py-1.5 text-[12px]`} placeholder="Filtrer…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            {dim === "queries" && noise.count > 0 && (
              <label className="flex items-center gap-2 text-[11px] text-slate-500 cursor-pointer">
                <input type="checkbox" checked={hideNoise} onChange={(e) => setHideNoise(e.target.checked)} />
                Masquer « robi » de l&apos;opérateur télécom Robi Axiata ({noise.count} requêtes, {fmtInt(noise.impressions)} impressions — pas des prospects)
              </label>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-wider text-slate-400">
                    <th className="py-2 pr-3 font-bold">{DIM_LABEL[dim]}</th>
                    <th className="py-2 px-2 font-bold text-right">Clics</th>
                    <th className="py-2 px-2 font-bold text-right">Impr.</th>
                    <th className="py-2 px-2 font-bold text-right">CTR</th>
                    <th className="py-2 px-2 font-bold text-right">Position</th>
                    <th className="py-2 pl-2 font-bold text-right">Évol.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((r) => {
                    const prev = findRow(previous?.[dim], r.key);
                    return (
                      <tr key={r.key}>
                        <td className="py-2 pr-3 text-slate-900 font-semibold max-w-[320px] truncate" title={r.key}>{shortKey(dim, r.key)}</td>
                        <td className="py-2 px-2 text-right tabular-nums text-slate-900 font-bold">{r.clicks}</td>
                        <td className="py-2 px-2 text-right tabular-nums text-slate-600">{fmtInt(r.impressions)}</td>
                        <td className="py-2 px-2 text-right tabular-nums text-slate-500">{fmtDec(r.ctr)} %</td>
                        <td className="py-2 px-2 text-right tabular-nums text-slate-900">{fmtDec(r.position)}</td>
                        <td className="py-2 pl-2"><span className="flex justify-end">{previous ? <PositionDelta cur={r.position} prev={prev?.position} compact /> : null}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {rows.length === 0 && <p className="text-[12px] text-slate-500 py-4">Rien ne correspond.</p>}
            </div>

            {rows.length > 15 && (
              <button onClick={() => setShowAll((v) => !v)} className={btn}>
                {showAll ? "Réduire" : `Voir ${Math.min(rows.length, 200) - 15} de plus`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchConsoleBlock;
