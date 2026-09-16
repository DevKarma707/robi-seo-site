"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Check, Pencil, X, ShieldAlert, AlertTriangle, Compass, Bot, User, ChevronDown } from "lucide-react";
import { auth } from "@/lib/firebase";
import {
  subscribeToPassation, savePassation, addPassationNote,
  EMPTY_PASSATION, type Passation,
} from "@/lib/passation";
import { ACCENT_INK, btnGhost, btnPrimary, card, input } from "./ui";
import { toast } from "./toast";

/**
 * Bloc « Passation » de l'onglet Tâches : la mémoire du lancement, que tout
 * agent lit avant d'agir (`npx tsx scripts/kanban.ts`) et signe après.
 */
const PassationBlock: React.FC = () => {
  const [p, setP] = useState<Passation>(EMPTY_PASSATION);
  const [ready, setReady] = useState(false);
  const [edit, setEdit] = useState<Pick<Passation, "etat" | "nePasToucher" | "attention"> | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [allJournal, setAllJournal] = useState(false);
  /** Replié par défaut : c'est la mémoire des agents, Ralph n'en a besoin qu'à l'occasion. */
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToPassation(
      (v) => { setP(v); setReady(true); },
      (e) => { toast("err", e.message); setReady(true); },
    );
    return () => unsub();
  }, []);

  const me = () => auth?.currentUser?.email?.split("@")[0] ?? "ralph";

  const save = async () => {
    if (!edit) return;
    setBusy(true);
    try {
      await savePassation(edit, me());
      setEdit(null);
      toast("ok", "Passation enregistrée.");
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const sign = async () => {
    const text = note.trim();
    if (!text) return;
    setBusy(true);
    try {
      await addPassationNote(p, me(), text);
      setNote("");
      toast("ok", "Ajouté au journal.");
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  const sections: { key: keyof Pick<Passation, "etat" | "nePasToucher" | "attention">; label: string; icon: React.ReactNode; empty: string }[] = [
    { key: "etat", label: "Où on en est", icon: <Compass size={11} />, empty: "Pas encore écrit." },
    { key: "nePasToucher", label: "Ne pas toucher", icon: <ShieldAlert size={11} />, empty: "Rien d'interdit pour l'instant." },
    { key: "attention", label: "Attention", icon: <AlertTriangle size={11} />, empty: "Aucun piège recensé." },
  ];

  const journal = allJournal ? p.journal : p.journal.slice(0, 5);

  const last = p.journal[0];

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${card} w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <BookOpen size={13} style={{ color: ACCENT_INK }} />
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Passation</span>
          <span className="text-[11px] text-slate-400 truncate">
            pour les agents · {last ? `dernière signature ${last.date.slice(0, 10)} (${last.agent})` : "vide"}
          </span>
        </span>
        <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
      </button>
    );
  }

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between gap-4 mb-3">
        <button type="button" onClick={() => { if (!edit) setOpen(false); }} className="flex items-center gap-2 text-left">
          <BookOpen size={15} style={{ color: ACCENT_INK }} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">Passation</p>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            — lue par tout agent avant d&apos;agir · <code className="a-figure text-[10.5px]">npx tsx scripts/kanban.ts</code>
          </span>
          {!edit && <ChevronDown size={14} className="text-slate-400 rotate-180" />}
        </button>
        {edit ? (
          <div className="flex items-center gap-1.5">
            <button className={btnGhost} onClick={() => setEdit(null)} disabled={busy}><X size={12} /></button>
            <button className={btnPrimary} onClick={save} disabled={busy}><Check size={12} className="inline mr-1" />Enregistrer</button>
          </div>
        ) : (
          <button className={btnGhost} onClick={() => setEdit({ etat: p.etat, nePasToucher: p.nePasToucher, attention: p.attention })}>
            <Pencil size={12} className="inline mr-1" />Modifier
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div key={s.key}>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1">
              {s.icon} {s.label}
            </p>
            {edit ? (
              <textarea
                className={`${input} min-h-[120px] text-[12.5px] leading-relaxed`}
                value={edit[s.key]}
                onChange={(e) => setEdit({ ...edit, [s.key]: e.target.value })}
              />
            ) : (
              <p className="text-[12px] leading-relaxed text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto pr-1">
                {p[s.key] || <span className="text-slate-400">{s.empty}</span>}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">Journal des interventions</p>
        <div className="flex gap-2 mb-3">
          <input
            className={input}
            placeholder="Ce que tu viens de faire, en une ligne…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void sign(); }}
          />
          <button className={btnPrimary} onClick={sign} disabled={busy || !note.trim()}>Signer</button>
        </div>
        {journal.length === 0 ? (
          <p className="text-[12px] text-slate-400">Personne n&apos;a encore signé.</p>
        ) : (
          <div className="space-y-1.5">
            {journal.map((e, i) => (
              <p key={`${e.date}-${i}`} className="text-[12px] text-slate-700 flex items-start gap-2">
                <span className="a-figure text-[10.5px] text-slate-400 whitespace-nowrap mt-[2px]">
                  {e.date.slice(0, 10)}
                </span>
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-500 whitespace-nowrap mt-[2px]">
                  {e.agent === "ralph" ? <User size={10} /> : <Bot size={10} />}{e.agent}
                </span>
                <span className="whitespace-pre-wrap">{e.note}</span>
              </p>
            ))}
            {p.journal.length > 5 && (
              <button className="text-[11px] text-slate-500 hover:text-slate-900 underline" onClick={() => setAllJournal(!allJournal)}>
                {allJournal ? "Réduire" : `Voir les ${p.journal.length - 5} autres`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassationBlock;
