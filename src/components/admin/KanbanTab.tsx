"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ListChecks, Plus, Trash2, AlertTriangle, Check, Bot, User, Download, RefreshCw,
  Search, Pencil, X, FolderInput, Sparkles, ClipboardCopy, Terminal, Code2,
} from "lucide-react";
import {
  subscribeToTasks, addTask, updateTask, updateTaskText, deleteTask, moveTask, seedTasks,
  isAutomatable, setAutomatable, buildBrief, buildDeepLink, buildVSCodeLink, repoOf,
  COLUMNS, COLUMN_META, CATEGORIES, CATEGORY_META, EFFORT_LABEL,
  type LaunchTask, type TaskColumn, type TaskCategory, type TaskOwner, type TaskEffort,
} from "@/lib/launchTasks";
import { runnerAvailable, runTask, getToken, setToken } from "@/lib/taskRunner";
import { ACCENT, ACCENT_INK, btnGhost, btnPill, btnPrimary, card, focusRing, input, select } from "./ui";

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
  const [search, setSearch] = useState("");
  const [autoOnly, setAutoOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  /** Tâche en cours d'édition, avec son brouillon titre/détail. */
  const [edit, setEdit] = useState<{ id: string; title: string; detail: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToTasks(
      (r) => { setRows(r); setReady(true); },
      (e) => { setFlash({ kind: "err", text: String(e) }); setReady(true); }
    );
    return () => unsub();
  }, []);

  // Le timer était posé sans être nettoyé : quitter l'onglet pendant qu'un
  // message est affiché déclenchait un setState sur composant démonté.
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  const say = useCallback((kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 4000);
  }, []);

  /** Les déplacements par bouton n'étaient ni attendus ni attrapés : quand
   *  Firestore refusait l'écriture, la carte ne bougeait pas sans un mot. */
  const move = useCallback(async (t: LaunchTask, c: TaskColumn) => {
    try {
      await moveTask(t, c, null, null);
    } catch (e) {
      say("err", (e as Error).message);
    }
  }, [say]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((t) =>
      (category === "all" || t.category === category) &&
      (owner === "all" || t.owner === owner) &&
      (!autoOnly || isAutomatable(t)) &&
      (!q || t.title.toLowerCase().includes(q) || (t.detail || "").toLowerCase().includes(q))
    );
  }, [rows, category, owner, autoOnly, search]);

  /** Ce que Claude peut prendre tout de suite : automatisable, pas encore
   *  fait, et pas en attente d'une action de Ralph. */
  const claudeCandidates = useMemo(
    () => rows
      .filter((t) => isAutomatable(t) && t.column !== "done" && !t.blockedBy)
      .sort((a, b) => a.priority - b.priority || a.order - b.order),
    [rows]
  );
  const claudeReady = claudeCandidates.length;
  const nextForClaude = useMemo(() => claudeCandidates.slice(0, 3), [claudeCandidates]);

  /** Tâches qui déclarent une dépendance mais traînent hors de « Bloqué ».
   *  Les tableaux créés avant le rangement automatique en ont ~10. */
  const misplacedBlocked = useMemo(
    () => rows.filter((t) => t.blockedBy && t.column === "todo"),
    [rows]
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

  /** Le titre et le détail n'étaient modifiables nulle part : corriger une
   *  faute imposait de supprimer la tâche et de la ressaisir, en perdant
   *  le détail, la priorité et l'historique. */
  const saveEdit = async () => {
    if (!edit) return;
    const title = edit.title.trim();
    if (!title) return;
    setBusy(true);
    try {
      await updateTaskText(edit.id, title, edit.detail);
      setEdit(null);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  /** Le runner ne tourne que sur le Mac de Ralph : ailleurs la sonde échoue
   *  et le bouton « Ouvrir une fenêtre » reste masqué, sans message d'erreur. */
  const [hasRunner, setHasRunner] = useState(false);
  useEffect(() => { runnerAvailable().then(setHasRunner); }, []);

  const runInWindow = async (t: LaunchTask) => {
    if (!getToken()) {
      const entered = window.prompt(
        "Jeton du runner local — affiché au démarrage de `node scripts/robi-task-runner.mjs`. Il n'est demandé qu'une fois."
      );
      if (!entered?.trim()) return;
      setToken(entered);
    }
    setBusy(true);
    try {
      await runTask(repoOf(t.category), buildBrief(t));
      say("ok", "Fenêtre ouverte — la tâche démarre.");
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const copyBrief = async (t: LaunchTask) => {
    try {
      await navigator.clipboard.writeText(buildBrief(t));
      say("ok", "Brief copié — colle-le dans une session Claude Code.");
    } catch {
      // Safari refuse l'écriture presse-papier hors geste utilisateur direct,
      // et le contexte non sécurisé n'expose pas l'API du tout.
      say("err", "Copie refusée par le navigateur.");
    }
  };

  const tidyBlocked = async () => {
    setBusy(true);
    try {
      for (const t of misplacedBlocked) await moveTask(t, "blocked", null, null);
      say("ok", `${misplacedBlocked.length} tâche(s) rangée(s) dans Bloqué.`);
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
      <div className="flex items-center gap-2 text-white/50 text-sm py-10">
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
            <ListChecks size={15} style={{ color: ACCENT_INK }} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-900">Avancement du lancement</p>
          </div>
          <p className="text-sm font-black text-slate-900">
            {progress.done}<span className="text-slate-400">/{progress.total}</span>
            <span className="ml-2 text-[11px] font-bold" style={{ color: ACCENT_INK }}>{progress.pct}%</span>
          </p>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress.pct}%`, backgroundColor: ACCENT }} />
        </div>

        {(nextForRalph.length > 0 || nextForClaude.length > 0) && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {nextForRalph.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">
                  Ce qui n&apos;attend que toi
                </p>
                <div className="space-y-1">
                  {nextForRalph.map((t) => (
                    <p key={t.id} className="text-[12px] text-slate-700 flex items-start gap-2">
                      <span className="mt-[6px] w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[t.priority] }} />
                      {t.title}
                      <span className="text-slate-400">· {EFFORT_LABEL[t.effort]}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
            {nextForClaude.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest mb-1.5 flex items-center gap-1" style={{ color: `${ACCENT}99` }}>
                  <Sparkles size={10} /> Ce que je peux prendre
                </p>
                <div className="space-y-1">
                  {nextForClaude.map((t) => (
                    <p key={t.id} className="text-[12px] text-slate-700 flex items-start gap-2">
                      <span className="mt-[6px] w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[t.priority] }} />
                      {t.title}
                      <span className="text-slate-400">· {EFFORT_LABEL[t.effort]}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
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
        <div className="relative min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            className={`${input} pl-8`}
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setAutoOnly((v) => !v)}
          aria-pressed={autoOnly}
          className={`${btnPill} ${autoOnly ? "bg-[#BEF221] text-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          title="N'afficher que les tâches que Claude peut mener seul"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} /> Automatisable
            <span className={autoOnly ? "text-black/50" : "text-slate-400"}>{claudeReady}</span>
          </span>
        </button>
        {misplacedBlocked.length > 0 && (
          <button onClick={tidyBlocked} disabled={busy} className={btnGhost} title="Déplacer vers la colonne Bloqué">
            <span className="flex items-center gap-1.5">
              <FolderInput size={12} /> Ranger {misplacedBlocked.length} bloquée{misplacedBlocked.length > 1 ? "s" : ""}
            </span>
          </button>
        )}
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
                dragOver === c
                  ? "border-[#BEF221]/40 bg-[#BEF221]/[0.05] shadow-[inset_0_1px_0_rgba(190,242,33,0.15)]"
                  : "border-slate-200 bg-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLUMN_META[c].color }} />
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">{COLUMN_META[c].label}</p>
                <span className="ml-auto text-[11px] font-black text-slate-400">{items.length}</span>
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
                    // Le glisser-déposer HTML5 ne répond ni au clavier ni au
                    // tactile : sans ça, une carte n'était pas ouvrable
                    // autrement qu'à la souris.
                    role="button"
                    tabIndex={0}
                    aria-expanded={openId === t.id}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenId(openId === t.id ? null : t.id!);
                      }
                    }}
                    className={`rounded-xl border p-3 cursor-grab active:cursor-grabbing transition-all ${focusRing} ${
                      dragId === t.id ? "opacity-40" : "hover:bg-slate-50"
                    } ${t.column === "done" ? "border-slate-200 bg-slate-50 opacity-70" : "border-slate-200 bg-slate-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PRIORITY_COLOR[t.priority] }} />
                      <p className={`text-[12px] font-semibold leading-snug flex-1 ${t.column === "done" ? "text-slate-500 line-through" : "text-slate-900"}`}>
                        {t.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 pl-3.5 flex-wrap">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={{ backgroundColor: `${CATEGORY_META[t.category].color}1f`, color: CATEGORY_META[t.category].color }}>
                        {CATEGORY_META[t.category].label}
                      </span>
                      <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                        {t.owner === "claude" ? <Bot size={9} /> : <User size={9} />}
                        {t.owner === "claude" ? "Claude" : "Ralph"}
                      </span>
                      <span className="text-[9px] text-slate-400">{EFFORT_LABEL[t.effort]}</span>
                      {isAutomatable(t) && t.column !== "done" && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                          style={{ backgroundColor: `${ACCENT}1f`, color: ACCENT }}
                          title="Claude peut la mener seul"
                        >
                          <Sparkles size={8} /> AUTO
                        </span>
                      )}
                    </div>

                    {t.blockedBy && t.column !== "done" && (
                      <p className="text-[10px] text-amber-600 mt-1.5 pl-3.5 flex items-start gap-1">
                        <AlertTriangle size={9} className="mt-[3px] flex-shrink-0" />
                        Dépend de : {t.blockedBy}
                      </p>
                    )}

                    {openId === t.id && (
                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5" onClick={(e) => e.stopPropagation()}>
                        {edit?.id === t.id ? (
                          <div className="space-y-2">
                            <input
                              className={input}
                              value={edit.title}
                              autoFocus
                              onChange={(e) => setEdit({ ...edit, title: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") setEdit(null);
                              }}
                            />
                            <textarea
                              className={`${input} min-h-[70px] resize-y leading-relaxed`}
                              placeholder="Détail (optionnel)"
                              value={edit.detail}
                              onChange={(e) => setEdit({ ...edit, detail: e.target.value })}
                              onKeyDown={(e) => { if (e.key === "Escape") setEdit(null); }}
                            />
                            <div className="flex gap-1.5">
                              <button onClick={saveEdit} disabled={busy || !edit.title.trim()} className={btnPrimary}>
                                <span className="flex items-center gap-1"><Check size={11} /> Enregistrer</span>
                              </button>
                              <button onClick={() => setEdit(null)} className={btnGhost}>
                                <span className="flex items-center gap-1"><X size={11} /> Annuler</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {t.detail && <p className="text-[11px] text-slate-600 leading-relaxed">{t.detail}</p>}
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => setEdit({ id: t.id!, title: t.title, detail: t.detail || "" })}
                                className={btnGhost}
                              >
                                <span className="flex items-center gap-1"><Pencil size={11} /> Éditer</span>
                              </button>
                              {isAutomatable(t) && (
                                <>
                                  {hasRunner ? (
                                    // Avec le runner : une nouvelle fenêtre VS Code sur le bon
                                    // dépôt, puis le panneau Claude dedans.
                                    <button onClick={() => runInWindow(t)} disabled={busy} className={btnPrimary} title="Ouvre une fenêtre VS Code sur le bon dépôt, avec le panneau Claude sur la tâche">
                                      <span className="flex items-center gap-1"><Code2 size={11} /> Ouvrir dans VS Code</span>
                                    </button>
                                  ) : (
                                    // Sans runner : le panneau s'ouvre dans la fenêtre VS Code
                                    // déjà active, faute de paramètre de dossier dans l'URI.
                                    <a
                                      href={buildVSCodeLink(t)}
                                      className={btnPrimary}
                                      title="Ouvre le panneau Claude dans la fenêtre VS Code active"
                                    >
                                      <span className="flex items-center gap-1"><Code2 size={11} /> Ouvrir dans VS Code</span>
                                    </a>
                                  )}
                                  <a href={buildDeepLink(t)} className={btnGhost} title="Ouvrir plutôt dans Claude Desktop">
                                    <span className="flex items-center gap-1"><Terminal size={11} /> Desktop</span>
                                  </a>
                                  <button onClick={() => copyBrief(t)} className={btnGhost} title="Copier le brief, si tu es sur une autre machine">
                                    <span className="flex items-center gap-1"><ClipboardCopy size={11} /> Copier le brief</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                        <div className="flex flex-wrap gap-1.5">
                          {COLUMNS.filter((x) => x !== t.column).map((x) => (
                            <button key={x} onClick={() => move(t, x)} className={btnGhost}>
                              → {COLUMN_META[x].label}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {([1, 2, 3] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => updateTask(t.id!, { priority: p })}
                              className={`${btnPill} ${t.priority === p ? "text-black" : "bg-slate-100 text-slate-600"}`}
                              style={t.priority === p ? { backgroundColor: PRIORITY_COLOR[p] } : undefined}
                            >
                              P{p}
                            </button>
                          ))}
                          {(["S", "M", "L"] as TaskEffort[]).map((e) => (
                            <button
                              key={e}
                              onClick={() => updateTask(t.id!, { effort: e })}
                              className={`${btnPill} ${t.effort === e ? "bg-slate-200 text-slate-900" : "bg-slate-100 text-slate-600"}`}
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
                            onClick={() => setAutomatable(t.id!, !isAutomatable(t))}
                            className={`${btnPill} ${isAutomatable(t) ? "bg-[#BEF221]/20 text-[#6FA300]" : "bg-slate-100 text-slate-600"}`}
                            title="Claude peut-il la mener seul ?"
                          >
                            <span className="flex items-center gap-1"><Sparkles size={11} /> Auto</span>
                          </button>
                          <button
                            onClick={async () => { if (confirm("Supprimer cette tâche ?")) { await deleteTask(t.id!); setOpenId(null); } }}
                            className={`${btnPill} bg-red-500/15 text-red-600 hover:bg-red-500/25`}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="text-[11px] text-slate-400 px-1 py-3">
                    {search.trim() || category !== "all" || owner !== "all"
                      ? "Rien ne correspond au filtre."
                      : "Glisse une tâche ici."}
                  </p>
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
