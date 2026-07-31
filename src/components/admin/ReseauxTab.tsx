"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, FileJson, RefreshCw, AlertTriangle, Check, Trash2,
  Pencil, X, Copy, Sparkles, ClipboardCopy,
} from "lucide-react";
import {
  subscribeToPosts, addPost, updatePost, updatePostText, deletePost, importPostsFromJson,
  monthGrid, MONTH_NAMES, CHANNEL_META, TYPE_META, STATUS_META, CHANNELS, TYPES,
  type SocialPost, type PostChannel, type PostStatus,
} from "@/lib/socialPosts";
import { ACCENT, btnGhost, btnPill, btnPrimary, card, focusRing, input, select, sectionTitle } from "./ui";

/** Brief à coller dans Claude Code pour fabriquer un mois de posts. */
const skillBrief = (year: number, month: number) =>
  [
    `/robi-social-media ${MONTH_NAMES[month]} ${year}`,
    "",
    `Génère le calendrier éditorial de ${MONTH_NAMES[month]} ${year} pour Robi.`,
    "Sors un tableau JSON prêt à importer dans l'onglet Réseaux de l'admin.",
    "",
    "Champs par post : date (AAAA-MM-JJ), channel (instagram|linkedin|tiktok),",
    "type (bold|feature|stats|testimonial|carrousel|mockup), caption, hashtags, visual.",
  ].join("\n");

const ReseauxTab: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [rows, setRows] = useState<SocialPost[]>([]);
  const [ready, setReady] = useState(false);
  const [channel, setChannel] = useState<PostChannel | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ id: string; caption: string; hashtags: string; visual: string } | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);
  const say = useCallback((kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 5000);
  }, []);

  useEffect(() => {
    const unsub = subscribeToPosts(
      (r) => { setRows(r); setReady(true); },
      (e) => { say("err", String(e)); setReady(true); }
    );
    return () => unsub();
  }, [say]);

  const cells = useMemo(() => monthGrid(year, month), [year, month]);

  const byDate = useMemo(() => {
    const m = new Map<string, SocialPost[]>();
    for (const p of rows) {
      if (channel !== "all" && p.channel !== channel) continue;
      const list = m.get(p.date) || [];
      list.push(p);
      m.set(p.date, list);
    }
    return m;
  }, [rows, channel]);

  const monthPosts = useMemo(
    () => cells.filter(Boolean).flatMap((d) => byDate.get(d as string) || []),
    [cells, byDate]
  );

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth());
    setOpenId(null);
  };

  const runImport = async () => {
    setBusy(true);
    try {
      const { imported, skipped, errors } = await importPostsFromJson(importText);
      const parts = [`${imported} post(s) importé(s)`];
      if (skipped) parts.push(`${skipped} doublon(s) ignoré(s)`);
      if (errors.length) parts.push(`${errors.length} rejeté(s)`);
      say(errors.length && !imported ? "err" : "ok", parts.join(" · "));
      if (errors.length) console.warn("[import réseaux]", errors);
      if (imported) { setImportText(""); setImportOpen(false); }
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!edit) return;
    setBusy(true);
    try {
      await updatePostText(edit.id, edit);
      setEdit(null);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const duplicate = async (p: SocialPost) => {
    try {
      // Champs optionnels recopiés seulement s'ils portent une valeur :
      // un `hashtags: undefined` ferait lever addDoc, le SDK n'étant pas
      // initialisé avec ignoreUndefinedProperties.
      const copy: Omit<SocialPost, "id"> = {
        date: p.date, channel: p.channel, type: p.type, caption: p.caption, status: "draft",
      };
      if (p.hashtags) copy.hashtags = p.hashtags;
      if (p.visual) copy.visual = p.visual;
      if (p.imageUrl) copy.imageUrl = p.imageUrl;
      await addPost(copy);
    } catch (e) {
      say("err", (e as Error).message);
    }
  };

  const copyText = async (p: SocialPost) => {
    try {
      await navigator.clipboard.writeText([p.caption, p.hashtags].filter(Boolean).join("\n\n"));
      say("ok", "Texte copié.");
    } catch {
      say("err", "Copie refusée par le navigateur.");
    }
  };

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(skillBrief(year, month));
      say("ok", "Brief copié — colle-le dans Claude Code.");
    } catch {
      say("err", "Copie refusée par le navigateur.");
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement du calendrier…
      </div>
    );
  }

  const counts = {
    total: monthPosts.length,
    ready: monthPosts.filter((p) => p.status === "ready").length,
    published: monthPosts.filter((p) => p.status === "published").length,
  };

  return (
    <div className="space-y-5">
      {/* Barre de mois */}
      <div className={`${card} p-4 flex flex-wrap items-center gap-3`}>
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} className={`${btnGhost} !px-2`} aria-label="Mois précédent">
            <ChevronLeft size={14} />
          </button>
          <p className="font-black text-white text-sm min-w-[150px] text-center capitalize">
            {MONTH_NAMES[month]} {year}
          </p>
          <button onClick={() => shift(1)} className={`${btnGhost} !px-2`} aria-label="Mois suivant">
            <ChevronRight size={14} />
          </button>
        </div>

        <span className="text-[11px] text-white/40">
          {counts.total} post{counts.total > 1 ? "s" : ""}
          {counts.ready > 0 && ` · ${counts.ready} prêt${counts.ready > 1 ? "s" : ""}`}
          {counts.published > 0 && ` · ${counts.published} publié${counts.published > 1 ? "s" : ""}`}
        </span>

        <select className={select} value={channel} onChange={(e) => setChannel(e.target.value as PostChannel | "all")}>
          <option value="all">Tous les réseaux</option>
          {CHANNELS.map((c) => <option key={c} value={c}>{CHANNEL_META[c].label}</option>)}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={copyBrief} className={btnGhost} title="Copier le brief du skill robi-social-media">
            <span className="flex items-center gap-1.5"><Sparkles size={12} /> Brief du mois</span>
          </button>
          <button onClick={() => setImportOpen((v) => !v)} className={btnPrimary}>
            <span className="flex items-center gap-1.5"><FileJson size={12} /> Importer du JSON</span>
          </button>
        </div>
      </div>

      {/* Import */}
      {importOpen && (
        <div className={`${card} p-5 space-y-3`}>
          <p className={sectionTitle}>Import JSON</p>
          <p className="text-[11px] text-white/40 leading-relaxed">
            Colle la sortie du skill <code className="text-[#BEF221]">robi-social-media</code>. Les posts déjà
            présents (même date, même réseau, même début de texte) sont ignorés — relancer le skill
            sur un mois déjà importé ne duplique rien.
          </p>
          <textarea
            className={`${input} min-h-[160px] font-mono text-[11px] leading-relaxed resize-y`}
            placeholder='[{"date":"2026-08-03","channel":"instagram","type":"bold","caption":"…"}]'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={runImport} disabled={busy || !importText.trim()} className={btnPrimary}>
              <span className="flex items-center gap-1"><Check size={11} /> Importer</span>
            </button>
            <button onClick={() => { setImportOpen(false); setImportText(""); }} className={btnGhost}>
              <span className="flex items-center gap-1"><X size={11} /> Annuler</span>
            </button>
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div className={`${card} p-3`}>
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
            <p key={d} className="text-[10px] font-black uppercase tracking-widest text-white/25 text-center py-1">{d}</p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, i) => {
            if (!date) return <div key={`x${i}`} className="min-h-[92px] rounded-xl bg-white/[0.01]" />;
            const posts = byDate.get(date) || [];
            const isToday = date === new Date().toISOString().slice(0, 10);
            return (
              <div
                key={date}
                className={`min-h-[92px] rounded-xl border p-1.5 transition-colors ${
                  isToday ? "border-[#BEF221]/40 bg-[#BEF221]/[0.04]" : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                <p className={`text-[10px] font-bold mb-1 px-0.5 ${isToday ? "text-[#BEF221]" : "text-white/30"}`}>
                  {date.slice(8)}
                </p>
                <div className="space-y-1">
                  {posts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setOpenId(openId === p.id ? null : p.id!)}
                      className={`w-full text-left rounded-lg px-1.5 py-1 transition-colors hover:bg-white/[0.08] ${focusRing}`}
                      style={{ backgroundColor: `${TYPE_META[p.type].color}1a` }}
                      title={p.caption}
                    >
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: CHANNEL_META[p.channel].color }} />
                        <span className="text-[9px] font-bold truncate text-white/80">{p.caption}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Détail */}
      {openId && (() => {
        const p = rows.find((r) => r.id === openId);
        if (!p) return null;
        // Capture en const : `edit` est un state, TypeScript perd sa narration
        // a l'interieur des callbacks onChange ci-dessous.
        const ed = edit && edit.id === p.id ? edit : null;
        return (
          <div className={`${card} p-5 space-y-3`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ backgroundColor: `${CHANNEL_META[p.channel].color}2a`, color: CHANNEL_META[p.channel].color }}>
                  {CHANNEL_META[p.channel].label}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{ backgroundColor: `${TYPE_META[p.type].color}2a`, color: TYPE_META[p.type].color }}>
                  {TYPE_META[p.type].label}
                </span>
                <span className="text-[11px] text-white/40">{p.date}</span>
              </div>
              <button onClick={() => setOpenId(null)} className={`${btnGhost} !px-2`} aria-label="Fermer">
                <X size={12} />
              </button>
            </div>

            {ed ? (
              <div className="space-y-2">
                <textarea
                  className={`${input} min-h-[110px] resize-y leading-relaxed`}
                  value={ed.caption}
                  autoFocus
                  onChange={(e) => setEdit({ ...ed, caption: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Escape") setEdit(null); }}
                />
                <input
                  className={input}
                  placeholder="#hashtags"
                  value={ed.hashtags}
                  onChange={(e) => setEdit({ ...ed, hashtags: e.target.value })}
                />
                <input
                  className={input}
                  placeholder="Consigne visuelle (sert au prompt Higgsfield)"
                  value={ed.visual}
                  onChange={(e) => setEdit({ ...ed, visual: e.target.value })}
                />
                <div className="flex gap-1.5">
                  <button onClick={saveEdit} disabled={busy || !ed.caption.trim()} className={btnPrimary}>
                    <span className="flex items-center gap-1"><Check size={11} /> Enregistrer</span>
                  </button>
                  <button onClick={() => setEdit(null)} className={btnGhost}>
                    <span className="flex items-center gap-1"><X size={11} /> Annuler</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-white/80 whitespace-pre-wrap leading-relaxed">{p.caption}</p>
                {p.hashtags && <p className="text-[12px] text-[#BEF221]/70">{p.hashtags}</p>}
                {p.visual && (
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    <span className="uppercase tracking-widest text-white/25">Visuel · </span>{p.visual}
                  </p>
                )}
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="rounded-xl max-h-64 border border-white/10" />
                )}
              </>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {(Object.keys(STATUS_META) as PostStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updatePost(p.id!, { status: s })}
                  className={`${btnPill} ${p.status === s ? "text-black" : "bg-white/10 text-white/60"}`}
                  style={p.status === s ? { backgroundColor: STATUS_META[s].color } : undefined}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
              {!ed && (
                <button
                  onClick={() => setEdit({ id: p.id!, caption: p.caption, hashtags: p.hashtags || "", visual: p.visual || "" })}
                  className={btnGhost}
                >
                  <span className="flex items-center gap-1"><Pencil size={11} /> Éditer</span>
                </button>
              )}
              <button onClick={() => copyText(p)} className={btnGhost}>
                <span className="flex items-center gap-1"><ClipboardCopy size={11} /> Copier</span>
              </button>
              <button onClick={() => duplicate(p)} className={btnGhost}>
                <span className="flex items-center gap-1"><Copy size={11} /> Dupliquer</span>
              </button>
              <button
                onClick={async () => {
                  if (!confirm("Supprimer ce post ?")) return;
                  await deletePost(p.id!);
                  setOpenId(null);
                }}
                className={`${btnPill} bg-red-500/15 text-red-400 hover:bg-red-500/25`}
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Légende des types */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        {TYPES.map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-[10px] text-white/35">
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: TYPE_META[t].color }} />
            {TYPE_META[t].label}
          </span>
        ))}
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

export default ReseauxTab;
