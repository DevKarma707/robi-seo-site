"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Plus, FileJson, Trash2, ArrowUp, ArrowDown, Minus, ChevronUp, ChevronDown,
  ExternalLink, Search, RefreshCw, X, Sparkles, Flag,
} from "lucide-react";
import {
  SEO_STATUSES, addSeoKeyword, updateSeoKeyword, deleteSeoKeyword, importSeoKeywordsFromJson,
  statusFromPosition, syncKeywordsFromReport, untrackedQueries,
  type SeoKeyword, type SeoStatus,
} from "@/lib/seoKeywords";
import { subscribeToSeoReports, type GscReport } from "@/lib/searchConsole";
import seed from "../../../content/seo/seo-keywords-seed.json";
import { btn, btnAccent, card, input, kpiLabel, kpiValue, sectionTitle, select, ACCENT_INK } from "./ui";

// ─── Métadonnées d'affichage ─────────────────────────────────────────
const STATUS_META: Record<SeoStatus, { label: string; cls: string }> = {
  "a-travailler":   { label: "À travailler",   cls: "bg-slate-100 text-slate-600 border-slate-200" },
  "contenu-publie": { label: "Contenu publié", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  "page-1":         { label: "Page 1",         cls: "bg-amber-50 text-amber-700 border-amber-200" },
  "top-3":          { label: "Top 3",          cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const EXAMPLE_JSON = `[
  {
    "keyword": "facture ia",
    "segment": "Veine IA · FR",
    "market": "France",
    "targetUrl": "/fr/facture-ai",
    "goal": 3,
    "notes": "Variante « IA » ajoutée au title le 14/09",
    "nextAction": "Mesurer à l'export d'octobre"
  },
  { "query": "invoice ai", "position": 16.1, "impressions": 240, "clicks": 0 }
]`;

type SortKey = "keyword" | "position" | "impressions" | "segment" | "status";

const fmtPos = (n: number) => String(n).replace(".", ",");
const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function Badge({ status }: { status: SeoStatus }) {
  const m = STATUS_META[status];
  return <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${m.cls}`}>{m.label}</span>;
}

/** Position + flèche d'évolution (un chiffre plus petit est meilleur). */
function PositionCell({ k }: { k: SeoKeyword }) {
  if (typeof k.position !== "number") return <span className="text-sm text-slate-400">—</span>;
  const delta = typeof k.previousPosition === "number" ? Math.round((k.previousPosition - k.position) * 10) / 10 : null;
  const reached = typeof k.goal === "number" && k.position <= k.goal;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-sm font-black tabular-nums ${k.position <= 3 ? "text-emerald-600" : k.position <= 10 ? "text-amber-600" : "text-slate-900"}`}>
        {fmtPos(k.position)}
      </span>
      {delta !== null && Math.abs(delta) >= 0.3 && (
        <span className={`inline-flex items-center text-[10px] font-bold ${delta > 0 ? "text-emerald-600" : "text-red-600"}`}>
          {delta > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{fmtPos(Math.abs(delta))}
        </span>
      )}
      {delta !== null && Math.abs(delta) < 0.3 && <Minus size={10} className="text-slate-400" />}
      {reached && <span title="Objectif atteint"><Flag size={11} className="text-emerald-600" /></span>}
    </div>
  );
}

// ─── Onglet ──────────────────────────────────────────────────────────
const SeoTab: React.FC<{ keywords: SeoKeyword[] }> = ({ keywords }) => {
  const [reports, setReports] = useState<GscReport[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [editing, setEditing] = useState<SeoKeyword | null>(null);
  const [creating, setCreating] = useState<Partial<SeoKeyword> | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [segFilter, setSegFilter] = useState<string | null>(null);
  const [marketFilter, setMarketFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<SeoStatus | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: "position", asc: true });

  useEffect(() => subscribeToSeoReports(setReports), []);
  const latest = reports[0];

  const say = (text: string) => { setFlash(text); setTimeout(() => setFlash(null), 8000); };

  const stats = useMemo(() => {
    const ranked = keywords.filter((k) => typeof k.position === "number");
    return {
      total: keywords.length,
      page1: ranked.filter((k) => (k.position as number) <= 10).length,
      top3: ranked.filter((k) => (k.position as number) <= 3).length,
      goals: keywords.filter((k) => typeof k.position === "number" && typeof k.goal === "number" && k.position <= k.goal).length,
      clicks: keywords.reduce((s, k) => s + (k.clicks ?? 0), 0),
    };
  }, [keywords]);

  const segments = useMemo(
    () => Array.from(new Set(keywords.map((k) => k.segment).filter(Boolean) as string[])).sort(),
    [keywords]
  );

  const markets = useMemo(
    () => Array.from(new Set(keywords.map((k) => k.market).filter(Boolean) as string[])).sort(),
    [keywords]
  );

  const pendingSync = latest ? keywords.filter((k) => k.lastReportId !== latest.id).length : 0;
  const suggestions = useMemo(() => untrackedQueries(latest, keywords).slice(0, 12), [latest, keywords]);

  const rows = useMemo(() => {
    let out = keywords;
    if (segFilter) out = out.filter((k) => k.segment === segFilter);
    if (marketFilter) out = out.filter((k) => k.market === marketFilter);
    if (statusFilter) out = out.filter((k) => k.status === statusFilter);
    const dir = sort.asc ? 1 : -1;
    return [...out].sort((a, b) => {
      switch (sort.key) {
        case "position": {
          // Les non classés restent en bas quel que soit le sens du tri.
          const pa = typeof a.position === "number" ? a.position : Infinity;
          const pb = typeof b.position === "number" ? b.position : Infinity;
          if (pa === pb) return a.keyword.localeCompare(b.keyword);
          if (pa === Infinity) return 1;
          if (pb === Infinity) return -1;
          return (pa - pb) * dir;
        }
        case "impressions": return ((a.impressions ?? -1) - (b.impressions ?? -1)) * dir;
        case "status": return (SEO_STATUSES.indexOf(a.status) - SEO_STATUSES.indexOf(b.status)) * dir;
        case "segment": return (a.segment || "").localeCompare(b.segment || "") * dir;
        default: return a.keyword.localeCompare(b.keyword) * dir;
      }
    });
  }, [keywords, segFilter, marketFilter, statusFilter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, asc: !s.asc } : { key, asc: key !== "impressions" }));

  const SortBtn = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-slate-900">
      {children}
      {sort.key !== k ? <ChevronDown size={11} className="opacity-20" /> : sort.asc ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
    </button>
  );

  const runSync = async () => {
    if (!latest) return;
    setBusy(true);
    try {
      const r = await syncKeywordsFromReport(latest, keywords);
      say(`✅ Export du ${fmtDate(latest.periodEnd)} : ${r.updated} position${r.updated > 1 ? "s" : ""} mise${r.updated > 1 ? "s" : ""} à jour · ${r.absent} absent${r.absent > 1 ? "s" : ""} de l'export${r.already ? ` · ${r.already} déjà à jour` : ""}`);
    } catch (e) {
      say(`❌ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const loadSeed = async () => {
    setBusy(true);
    try {
      const r = await importSeoKeywordsFromJson(JSON.stringify(seed));
      say(`✅ Liste de départ chargée : ${r.imported} mots-clés ajoutés${r.updated ? ` · ${r.updated} mis à jour` : ""}`);
    } catch (e) {
      say(`❌ ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const filterBtn = (active: boolean) =>
    `px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${active ? "bg-[var(--color-primary)] text-[var(--color-accent)]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`;

  const th = "p-3 font-bold";

  return (
    <div className="space-y-5">
      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Mots-clés suivis", value: stats.total },
          { label: "En page 1", value: stats.page1 },
          { label: "Top 3", value: stats.top3 },
          { label: "Objectifs atteints", value: `${stats.goals}/${keywords.filter((k) => typeof k.goal === "number").length}` },
          { label: "Clics captés", value: stats.clicks },
        ].map((s) => (
          <div key={s.label} className={`${card} p-4`}>
            <p className={kpiLabel}>{s.label}</p>
            <p className={`${kpiValue} mt-2 text-slate-900`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Actions ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Posé sur la coquille sombre, pas sur une carte : même encre que le sous-titre de page. */}
        <p className="flex-1 min-w-[220px] text-xs text-white/60">
          {latest
            ? <>Dernier export Search Console : <strong className="text-white/90">{fmtDate(latest.periodStart)} → {fmtDate(latest.periodEnd)}</strong>{pendingSync > 0 && keywords.length > 0 ? ` · ${pendingSync} mot${pendingSync > 1 ? "s" : ""}-clé${pendingSync > 1 ? "s" : ""} à synchroniser` : ""}</>
            : "Aucun export Search Console : importe le ZIP dans l'onglet Analytics pour synchroniser les positions."}
        </p>
        <button onClick={loadSeed} disabled={busy} className={keywords.length === 0 ? btnAccent : btn}
          title="Ajoute les mots-clés manquants de la stratégie et complète les champs vides (marché, objectif…), sans rien écraser">
          <Sparkles size={14} /> {keywords.length === 0 ? "Charger la liste de départ" : "Compléter avec la liste de départ"}
        </button>
        <button onClick={runSync} disabled={busy || !latest || keywords.length === 0 || pendingSync === 0} className={btn}
          title="Met à jour positions, impressions et clics depuis le dernier export importé dans Analytics">
          <RefreshCw size={13} className={busy ? "animate-spin" : ""} /> Synchroniser avec Search Console
        </button>
        <button onClick={() => setShowImport(true)} className={btn}>
          <FileJson size={13} /> Importer JSON
        </button>
        <button onClick={() => setCreating({})} className={btnAccent}>
          <Plus size={14} /> Nouveau mot-clé
        </button>
      </div>

      {flash && (
        <div className={`text-sm px-4 py-3 rounded-xl border ${flash.startsWith("❌") ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
          {flash}
        </div>
      )}

      {/* ── Filtres ────────────────────────────────────────── */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setSegFilter(null); setStatusFilter(null); setMarketFilter(""); }} className={filterBtn(!segFilter && !statusFilter && !marketFilter)}>Tout</button>
          {markets.length > 1 && (
            <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className={`${select} !py-1.5 text-xs font-bold`} aria-label="Marché">
              <option value="">Tous les marchés</option>
              {markets.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          {segments.map((s) => (
            <button key={s} onClick={() => setSegFilter(segFilter === s ? null : s)} className={filterBtn(segFilter === s)}>{s}</button>
          ))}
          <span className="w-px my-1 bg-slate-200" />
          {SEO_STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? null : s)} className={filterBtn(statusFilter === s)}>{STATUS_META[s].label}</button>
          ))}
        </div>
      )}

      {/* ── Vide ───────────────────────────────────────────── */}
      {keywords.length === 0 && (
        <div className={`${card} p-10 text-center`}>
          <Search size={24} className="mx-auto mb-3 text-slate-400" />
          <p className={sectionTitle}>Aucun mot-clé suivi</p>
          <p className="text-xs max-w-md mx-auto mt-2 text-slate-500">
            « Charger la liste de départ » ajoute les 28 mots-clés de la stratégie (veine facture IA, Factur-X, guides, métiers)
            avec les positions de l&apos;export Search Console de septembre 2026.
          </p>
        </div>
      )}

      {/* ── Tableau ────────────────────────────────────────── */}
      {keywords.length > 0 && (
        <div className={`${card} overflow-x-auto`}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider border-b border-slate-100 text-slate-400">
                <th className={th}><SortBtn k="keyword">Mot-clé</SortBtn></th>
                <th className={`${th} hidden md:table-cell`}><SortBtn k="segment">Segment</SortBtn></th>
                <th className={th}><SortBtn k="position">Position</SortBtn></th>
                <th className={`${th} hidden sm:table-cell`}>Objectif</th>
                <th className={`${th} hidden lg:table-cell`}><SortBtn k="impressions">Imp. · clics</SortBtn></th>
                <th className={`${th} hidden xl:table-cell`}>Page cible</th>
                <th className={th}><SortBtn k="status">Statut</SortBtn></th>
                <th className={`${th} w-10`} />
              </tr>
            </thead>
            <tbody>
              {rows.map((k) => (
                <tr key={k.id} onClick={() => setEditing(k)} className="border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50">
                  <td className="p-3 max-w-[340px]">
                    <span className="text-sm font-semibold text-slate-900">{k.keyword}</span>
                    {k.nextAction
                      ? <p className="text-[11px] mt-0.5 line-clamp-1 font-semibold" style={{ color: ACCENT_INK }}>→ {k.nextAction}</p>
                      : k.notes && <p className="text-[11px] mt-0.5 line-clamp-1 text-slate-400">{k.notes}</p>}
                  </td>
                  <td className="p-3 hidden md:table-cell text-xs text-slate-500 whitespace-nowrap">
                    {k.segment || "—"}
                    {k.market && <span className="block text-[10px] text-slate-400">{k.market}</span>}
                  </td>
                  <td className="p-3"><PositionCell k={k} /></td>
                  <td className="p-3 hidden sm:table-cell text-xs text-slate-500 whitespace-nowrap">
                    {typeof k.goal === "number" ? (k.goal <= 3 ? `Top ${k.goal}` : k.goal === 10 ? "Page 1" : `≤ ${k.goal}`) : "—"}
                  </td>
                  <td className="p-3 hidden lg:table-cell text-xs text-slate-500 tabular-nums whitespace-nowrap">
                    {k.impressions != null ? `${k.impressions.toLocaleString("fr-FR")} · ${k.clicks ?? 0}` : "—"}
                  </td>
                  <td className="p-3 hidden xl:table-cell">
                    {k.targetUrl
                      ? <a href={k.targetUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs hover:underline max-w-[260px]" style={{ color: ACCENT_INK }}>
                          <span className="truncate">{k.targetUrl}</span><ExternalLink size={10} className="flex-shrink-0" />
                        </a>
                      : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="p-3"><Badge status={k.status} /></td>
                  <td className="p-3">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (k.id && confirm(`Retirer « ${k.keyword} » du suivi ?`)) await deleteSeoKeyword(k.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-slate-100 transition-colors"
                      aria-label="Retirer du suivi"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="text-center text-xs py-6 text-slate-400">Aucun mot-clé ne correspond à ce filtre.</p>}
        </div>
      )}

      {/* ── Opportunités : requêtes non suivies ────────────── */}
      {keywords.length > 0 && suggestions.length > 0 && (
        <div className={`${card} p-5`}>
          <p className={sectionTitle}>Requêtes non suivies</p>
          <p className="text-xs text-slate-500 mt-1 mb-3">
            Tu apparais déjà sur ces requêtes (10 impressions ou plus dans le dernier export), sans les suivre. Bruit « Robi Axiata » exclu.
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((q) => (
              <button key={q.key} onClick={() => setCreating({ keyword: q.key, position: Math.round(q.position * 10) / 10, impressions: q.impressions, clicks: q.clicks, lastReportId: latest?.id, lastCheckedAt: latest?.periodEnd })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs text-slate-700 hover:border-slate-400 transition-colors">
                <Plus size={11} /> {q.key}
                <span className="text-slate-400 tabular-nums">pos {fmtPos(Math.round(q.position * 10) / 10)} · {q.impressions} imp</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {showImport && <ImportModal onClose={() => setShowImport(false)} onResult={say} />}
      {(creating || editing) && (
        <EditModal row={editing} draft={creating} onClose={() => { setCreating(null); setEditing(null); }} />
      )}
    </div>
  );
};

// ─── Modale ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-white border-slate-200" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-white border-slate-200">
          <h2 className="font-black text-lg text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">{children}</div>
        <div className="sticky bottom-0 flex justify-end gap-2 px-6 py-4 border-t bg-white border-slate-200">{footer}</div>
      </div>
    </div>
  );
}

const label = "block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1";

function ImportModal({ onClose, onResult }: { onClose: () => void; onResult: (m: string) => void }) {
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await importSeoKeywordsFromJson(raw);
      const parts: string[] = [];
      if (r.imported) parts.push(`${r.imported} ajouté${r.imported > 1 ? "s" : ""}`);
      if (r.updated) parts.push(`${r.updated} mis à jour`);
      if (r.skipped) parts.push(`${r.skipped} inchangé${r.skipped > 1 ? "s" : ""}`);
      onResult(`✅ ${parts.join(" · ") || "Rien à importer."}`);
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Importer des mots-clés (JSON)" onClose={onClose} footer={<>
      <button onClick={() => setRaw(EXAMPLE_JSON)} className={`${btn} mr-auto`}>Insérer un exemple</button>
      <button onClick={onClose} className={btn}>Fermer</button>
      <button onClick={run} disabled={busy || !raw.trim()} className={btnAccent}><FileJson size={13} /> {busy ? "Import…" : "Importer"}</button>
    </>}>
      <p className="text-xs text-slate-500">
        Saisie (<code>keyword</code>, <code>segment</code>, <code>market</code>, <code>targetUrl</code>, <code>goal</code>, <code>notes</code>, <code>nextAction</code>)
        ou lignes Search Console (<code>query</code> + <code>position</code>). Un mot-clé déjà suivi n&apos;est pas dupliqué :
        sa position est mise à jour et l&apos;ancienne sert à calculer l&apos;évolution.
      </p>
      <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={14} spellCheck={false} placeholder={EXAMPLE_JSON}
        className={`${input} font-mono text-[11px] leading-relaxed`} />
      {err && <p className="text-xs font-semibold text-red-600">❌ {err}</p>}
    </Modal>
  );
}

function EditModal({ row, draft, onClose }: { row: SeoKeyword | null; draft: Partial<SeoKeyword> | null; onClose: () => void }) {
  const base = row ?? draft ?? {};
  const [data, setData] = useState({
    keyword: base.keyword ?? "",
    segment: base.segment ?? "",
    market: base.market ?? "",
    targetUrl: base.targetUrl ?? "",
    position: base.position != null ? String(base.position) : "",
    goal: base.goal != null ? String(base.goal) : "",
    status: base.status ?? ("a-travailler" as SeoStatus),
    notes: base.notes ?? "",
    nextAction: base.nextAction ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));

  const save = async () => {
    if (!data.keyword.trim()) return setErr("Le mot-clé est obligatoire.");
    setBusy(true); setErr(null);
    try {
      const pos = data.position.trim() === "" ? null : Number(data.position.replace(",", "."));
      if (pos !== null && !Number.isFinite(pos)) throw new Error("Position invalide.");
      const goal = data.goal.trim() === "" ? undefined : Number(data.goal);
      if (goal !== undefined && !Number.isFinite(goal)) throw new Error("Objectif invalide.");

      const payload: Partial<SeoKeyword> = {
        keyword: data.keyword.trim(),
        position: pos,
        status: data.status,
        segment: data.segment.trim(),
        market: data.market.trim(),
        targetUrl: data.targetUrl.trim(),
        notes: data.notes.trim(),
        nextAction: data.nextAction.trim(),
        ...(goal !== undefined ? { goal } : {}),
      };

      if (row?.id) {
        // La position a bougé à la main → on garde l'ancienne pour l'évolution.
        if (pos !== null && row.position !== pos) {
          payload.previousPosition = row.position ?? null;
          payload.lastCheckedAt = new Date().toISOString().slice(0, 10);
        }
        await updateSeoKeyword(row.id, payload);
      } else {
        await addSeoKeyword({
          ...draft,
          ...payload,
          previousPosition: null,
          status: statusFromPosition(pos, data.status),
          ...(pos !== null && !draft?.lastCheckedAt ? { lastCheckedAt: new Date().toISOString().slice(0, 10) } : {}),
        } as Omit<SeoKeyword, "id">);
      }
      onClose();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={row ? "Modifier le mot-clé" : "Nouveau mot-clé"} onClose={onClose} footer={<>
      <button onClick={onClose} className={btn}>Annuler</button>
      <button onClick={save} disabled={busy || !data.keyword.trim()} className={btnAccent}>{busy ? "Enregistrement…" : row ? "Enregistrer" : "Ajouter"}</button>
    </>}>
      <div>
        <label className={label}>Mot-clé *</label>
        <input value={data.keyword} onChange={(e) => set({ keyword: e.target.value })} placeholder="facture ia" className={input} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Segment</label>
          <input value={data.segment} onChange={(e) => set({ segment: e.target.value })} placeholder="Veine IA · FR" className={input} />
        </div>
        <div>
          <label className={label}>Statut</label>
          <select value={data.status} onChange={(e) => set({ status: e.target.value as SeoStatus })} className={`${select} w-full`}>
            {SEO_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Marché</label>
          <input value={data.market} onChange={(e) => set({ market: e.target.value })} placeholder="France" className={input} />
        </div>
        <div>
          <label className={label}>Page cible</label>
          <input value={data.targetUrl} onChange={(e) => set({ targetUrl: e.target.value })} placeholder="/fr/facture-ai" className={input} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Position actuelle</label>
          <input type="text" inputMode="decimal" value={data.position} onChange={(e) => set({ position: e.target.value })} placeholder="—" className={input} />
        </div>
        <div>
          <label className={label}>Objectif (position visée)</label>
          <select value={data.goal} onChange={(e) => set({ goal: e.target.value })} className={`${select} w-full`}>
            <option value="">—</option>
            <option value="1">1re place</option>
            <option value="3">Top 3</option>
            <option value="5">Top 5</option>
            <option value="10">Page 1</option>
          </select>
        </div>
      </div>
      <div>
        <label className={label}>Prochaine action</label>
        <input value={data.nextAction} onChange={(e) => set({ nextAction: e.target.value })} placeholder="Publier l'article, obtenir un backlink…" className={input} />
      </div>
      <div>
        <label className={label}>Notes</label>
        <textarea value={data.notes} onChange={(e) => set({ notes: e.target.value })} rows={3}
          placeholder="Concurrents à battre, ce qui a été fait, observations…" className={input} />
      </div>
      {row?.lastCheckedAt && (
        <p className="text-[11px] text-slate-400">
          Dernier relevé : {fmtDate(row.lastCheckedAt)}
          {typeof row.previousPosition === "number" && ` · position précédente : ${fmtPos(row.previousPosition)}`}
        </p>
      )}
      {err && <p className="text-xs font-semibold text-red-600">❌ {err}</p>}
    </Modal>
  );
}

export default SeoTab;
