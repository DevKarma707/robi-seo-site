"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ListChecks, Plus, Trash2, AlertTriangle, Check, Bot, User, Download, RefreshCw,
} from "lucide-react";
import {
  subscribeToTasks, addTask, updateTask, deleteTask, moveTask, seedTasks,
  COLUMNS, COLUMN_META, CATEGORIES, CATEGORY_META, EFFORT_LABEL,
  type LaunchTask, type TaskColumn, type TaskCategory, type TaskOwner, type TaskEffort,
} from "@/lib/launchTasks";

const ACCENT = "#BEF221";
const card = "rounded-2xl border bg-white/[0.03] border-white/8";
// `w-full` et `w-auto` ont la même spécificité : mettre `w-auto` après dans
// l'attribut class ne suffit pas, c'est l'ordre dans le CSS généré qui tranche.
// D'où deux classes distinctes plutôt qu'une surcharge.
const fieldBase =
  "px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm outline-none focus:border-[#BEF221]/40";
const input = `w-full ${fieldBase}`;
const select = `w-auto ${fieldBase}`;
const btn = "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed";
const btnGhost = `${btn} bg-white/10 text-white hover:bg-white/20`;
const btnPrimary = `${btn} bg-[#BEF221] text-black hover:opacity-90`;

const PRIORITY_COLOR: Record<number, string> = { 1: "#f87171", 2: "#fbbf24", 3: "#64748b" };

const KanbanTab: React.FC = () => {
  const [rows, setRows] = useState<LaunchTask[]>([]);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<TaskCategory | "all">("all");
  const [owner, setOwner] = useState<TaskOwner | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskColumn | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToTasks(
      (r) => { setRows(r); setReady(true); },
      (e) => { setFlash({ kind: "err", text: String(e) }); setReady(true); }
    );
    return () => unsub();
  }, []);

  const say = (kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    setTimeout(() => setFlash(null), 4000);
  };

  const visible = useMemo(
    () => rows.filter((t) => (category === "all" || t.category === category) && (owner === "all" || t.owner === owner)),
    [rows, category, owner]
  );

  const byColumn = (c: TaskColumn) => visible.filter((t) => t.column === c);

  const progress = useMemo(() => {
    const done = rows.filter((t) => t.column === "done").length;
    return { done, total: rows.length, pct: rows.length ? Math.round((done / rows.length) * 100) : 0 };
  }, [rows]);

  /** Ce sur quoi Ralph est réellement bloquant, tri d'abord par priorité. */
  const nextForRalph = useMemo(
    () => rows
      .filter((t) => t.owner === "ralph" && t.column === "todo" && !t.blockedBy)
      .sort((a, b) => a.priority - b.priority || a.order - b.order)
      .slice(0, 3),
    [rows]
  );

  const drop = async (column: TaskColumn, beforeId?: string) => {
    const task = rows.find((t) => t.id === dragId);
    setDragId(null);
    setDragOver(null);
    if (!task) return;

    const inCol = rows.filter((t) => t.column === column && t.id !== task.id).sort((a, b) => a.order - b.order);
    const idx = beforeId ? inCol.findIndex((t) => t.id === beforeId) : inCol.length;
    const after = idx >= 0 && beforeId ? inCol[idx] : null;
    const before = idx > 0 ? inCol[idx - 1] : (beforeId ? null : inCol[inCol.length - 1] ?? null);

    try {
      await moveTask(task, column, before, after);
    } catch (e) {
      say("err", (e as Error).message);
    }
  };

  const quickAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    setBusy(true);
    try {
      await addTask({
        title,
        column: "todo",
        category: category === "all" ? "lancement" : category,
        owner: owner === "all" ? "ralph" : owner,
        effort: "M",
        priority: 2,
        order: 2000 + rows.length,
      });
      setNewTitle("");
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const loadBacklog = async () => {
    setBusy(true);
    try {
      const r = await seedTasks();
      say(r.skipped ? "err" : "ok", r.skipped
        ? "Des tâches existent déjà — le backlog n'a pas été rechargé."
        : `${r.created} tâches chargées.`);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement du tableau…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Avancement */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <ListChecks size={15} style={{ color: ACCENT }} />
            <p className="text-xs font-black uppercase tracking-widest text-white">Avancement du lancement</p>
          </div>
          <p className="text-sm font-black text-white">
            {progress.done}<span className="text-white/30">/{progress.total}</span>
            <span className="ml-2 text-[11px] font-bold" style={{ color: ACCENT }}>{progress.pct}%</span>
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress.pct}%`, backgroundColor: ACCENT }} />
        </div>

        {nextForRalph.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
              Ce qui n&apos;attend que toi
            </p>
            <div className="space-y-1">
              {nextForRalph.map((t) => (
                <p key={t.id} className="text-[12px] text-white/70 flex items-start gap-2">
                  <span className="mt-[6px] w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[t.priority] }} />
                  {t.title}
                  <span className="text-white/25">· {EFFORT_LABEL[t.effort]}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex-1 min-w-[220px] max-w-sm flex gap-1.5">
          <input
            className={input}
            placeholder="Ajouter une tâche…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") quickAdd(); }}
          />
          <button onClick={quickAdd} disabled={busy || !newTitle.trim()} className={btnPrimary}>
            <Plus size={12} />
          </button>
        </div>
        <select className={select} value={category} onChange={(e) => setCategory(e.target.value as TaskCategory | "all")}>
          <option value="all">Toutes les catégories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}
        </select>
        <select className={select} value={owner} onChange={(e) => setOwner(e.target.value as TaskOwner | "all")}>
          <option value="all">Tout le monde</option>
          <option value="ralph">Ralph</option>
          <option value="claude">Claude</option>
        </select>
        {rows.length === 0 && (
          <button onClick={loadBacklog} disabled={busy} className={btnPrimary}>
            <span className="flex items-center gap-1.5"><Download size={12} /> Charger le backlog de lancement</span>
          </button>
        )}
      </div>

      {/* Colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((c) => {
          const items = byColumn(c);
          return (
            <div
              key={c}
              onDragOver={(e) => { e.preventDefault(); setDragOver(c); }}
              onDragLeave={() => setDragOver((d) => (d === c ? null : d))}
              onDrop={(e) => { e.preventDefault(); drop(c); }}
              className={`rounded-2xl border p-3 transition-colors min-h-[200px] ${
                dragOver === c ? "border-[#BEF221]/40 bg-[#BEF221]/[0.04]" : "border-white/8 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLUMN_META[c].color }} />
                <p className="text-[11px] font-black uppercase tracking-widest text-white">{COLUMN_META[c].label}</p>
                <span className="ml-auto text-[11px] font-black text-white/30">{items.length}</span>
              </div>

              <div className="space-y-2">
                {items.map((t) => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id!)}
                    onDragEnd={() => { setDragId(null); setDragOver(null); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); drop(c, t.id!); }}
                    onClick={() => setOpenId(openId === t.id ? null : t.id!)}
                    className={`rounded-xl border p-3 cursor-grab active:cursor-grabbing transition-all ${
                      dragId === t.id ? "opacity-40" : "hover:bg-white/[0.06]"
                    } ${t.column === "done" ? "border-white/[0.06] bg-white/[0.02]" : "border-white/10 bg-white/[0.04]"}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[t.priority] }} />
                      <p className={`text-[12px] font-semibold leading-snug flex-1 ${t.column === "done" ? "text-white/40 line-through" : "text-white"}`}>
                        {t.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 pl-3.5 flex-wrap">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={{ backgroundColor: `${CATEGORY_META[t.category].color}1f`, color: CATEGORY_META[t.category].color }}>
                        {CATEGORY_META[t.category].label}
                      </span>
                      <span className="text-[9px] text-white/35 flex items-center gap-0.5">
                        {t.owner === "claude" ? <Bot size={9} /> : <User size={9} />}
                        {t.owner === "claude" ? "Claude" : "Ralph"}
                      </span>
                      <span className="text-[9px] text-white/25">{EFFORT_LABEL[t.effort]}</span>
                    </div>

                    {t.blockedBy && t.column !== "done" && (
                      <p className="text-[10px] text-amber-300/80 mt-1.5 pl-3.5 flex items-start gap-1">
                        <AlertTriangle size={9} className="mt-[3px] flex-shrink-0" />
                        Dépend de : {t.blockedBy}
                      </p>
                    )}

                    {openId === t.id && (
                      <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-2.5" onClick={(e) => e.stopPropagation()}>
                        {t.detail && <p className="text-[11px] text-white/55 leading-relaxed">{t.detail}</p>}
                        <div className="flex flex-wrap gap-1.5">
                          {COLUMNS.filter((x) => x !== t.column).map((x) => (
                            <button key={x} onClick={() => moveTask(t, x, null, null)} className={btnGhost}>
                              → {COLUMN_META[x].label}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {([1, 2, 3] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => updateTask(t.id!, { priority: p })}
                              className={`${btn} ${t.priority === p ? "text-black" : "bg-white/10 text-white/60"}`}
                              style={t.priority === p ? { backgroundColor: PRIORITY_COLOR[p] } : undefined}
                            >
                              P{p}
                            </button>
                          ))}
                          {(["S", "M", "L"] as TaskEffort[]).map((e) => (
                            <button
                              key={e}
                              onClick={() => updateTask(t.id!, { effort: e })}
                              className={`${btn} ${t.effort === e ? "bg-white/25 text-white" : "bg-white/10 text-white/60"}`}
                            >
                              {e}
                            </button>
                          ))}
                          <button
                            onClick={() => updateTask(t.id!, { owner: t.owner === "ralph" ? "claude" : "ralph" })}
                            className={btnGhost}
                          >
                            → {t.owner === "ralph" ? "Claude" : "Ralph"}
                          </button>
                          <button
                            onClick={async () => { if (confirm("Supprimer cette tâche ?")) { await deleteTask(t.id!); setOpenId(null); } }}
                            className={`${btn} bg-red-500/15 text-red-400 hover:bg-red-500/25`}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="text-[11px] text-white/20 px-1 py-3">Glisse une tâche ici.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {flash && (
        <div
          className="fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl text-[12px] font-bold z-50 flex items-center gap-2"
          style={{ backgroundColor: flash.kind === "ok" ? ACCENT : "#f87171", color: flash.kind === "ok" ? "#000" : "#fff" }}
        >
          {flash.kind === "ok" ? <Check size={13} /> : <AlertTriangle size={13} />}
          {flash.text}
        </div>
      )}
    </div>
  );
};

export default KanbanTab;
