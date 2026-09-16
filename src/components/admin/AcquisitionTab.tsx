"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Target, Send, Copy, Mail, Check, AlertTriangle, Upload, Search,
  ArrowRight, Ban, ExternalLink, Trash2, RefreshCw, Megaphone,
 BookOpen, Zap, BarChart3 } from "lucide-react";
import {
  subscribeToProspects, subscribeToUnsubscribes, updateProspect, deleteProspect,
  advanceProspect, angleStats, clearDrafts, DELIVERY_META, importProspectsFromJson, makeUnsubToken, resolveTemplate,
  renderTemplate, stepOf, relativeDay, todayStr, statusLabel, sequenceFor,
  SEGMENT_META, SEGMENTS, STATUS_META, PIPELINE,
  type Prospect, type ProspectSegment, type ProspectStatus,
} from "@/lib/prospects";
import { checkReplies, fetchOutreachStatus, sendOutreachEmail, type OutreachStatus } from "@/lib/adminApi";
import { addInfluencer, suggestPromoCode } from "@/lib/influencers";
import { ACCENT, ACCENT_INK, btnGhost, btnPill, btnPrimary, card, input, select } from "./ui";
import { toast } from "./toast";

const EXAMPLE_JSON = `[
  {
    "company": "Atelier Dubois",
    "contactName": "Marc Dubois",
    "role": "Gérant",
    "email": "contact@atelier-dubois.fr",
    "city": "Lyon",
    "segment": "artisan",
    "priority": 1,
    "source": "Pages Jaunes",
    "notes": "Menuiserie, 3 salariés"
  }
]`;

const AcquisitionTab: React.FC = () => {
  const [rows, setRows] = useState<Prospect[]>([]);
  const [optedOut, setOptedOut] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [segment, setSegment] = useState<ProspectSegment | "all">("all");
  const [status, setStatus] = useState<ProspectStatus | "open">("open");
  const [search, setSearch] = useState("");
  const [smtp, setSmtp] = useState<OutreachStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    const a = subscribeToProspects(setRows, (e) => toast("err", String(e)));
    const b = subscribeToUnsubscribes(setOptedOut);
    fetchOutreachStatus().then(setSmtp).catch(() => setSmtp({ configured: false, from: null, host: null }));
    return () => { a(); b(); };
  }, []);

  const say = toast;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((p) => {
      if (segment !== "all" && p.segment !== segment) return false;
      if (status === "open" ? !STATUS_META[p.status].open : p.status !== status) return false;
      if (q && ![p.company, p.contactName, p.email, p.city].some((f) => (f || "").toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, segment, status, search]);

  const today = useMemo(
    () => rows
      .filter((p) => STATUS_META[p.status].open && p.nextActionDate && p.nextActionDate <= todayStr())
      .sort((a, b) => (a.nextActionDate || "").localeCompare(b.nextActionDate || "")),
    [rows]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of rows) c[p.status] = (c[p.status] || 0) + 1;
    return c;
  }, [rows]);

  const selected = rows.find((p) => p.id === selectedId) || null;
  const angles = useMemo(() => angleStats(rows), [rows]);

  // ── Message courant du prospect sélectionné ──
  const message = useMemo(() => {
    if (!selected) return null;
    const step = stepOf(selected);
    // Un brouillon rédigé pour cette fiche prime sur le modèle générique.
    // Sans choix explicite, la variante recommandée s'applique.
    const drafts = selected.drafts;
    if (drafts?.variants?.length) {
      const key = selected.chosenDraft || drafts.recommended;
      const d = drafts.variants.find((v) => v.key === key) || drafts.variants[0];
      return { step, subject: d.subject, body: d.body, draft: d };
    }
    const tpl = resolveTemplate(selected, step.templateKey);
    if (!tpl) return null;
    return {
      step,
      subject: renderTemplate(tpl.subject, selected),
      body: renderTemplate(tpl.body, selected),
      draft: null as null | { key: "A" | "B"; angle: string },
    };
  }, [selected]);

  // Retouches faites à la main dans le panneau, avant envoi. Liées à la fiche
  // ET à la variante : changer de fiche ou de brouillon repart du texte
  // proposé, une retouche ne se retrouve jamais sur le mauvais prospect.
  // La clé ne contient pas l'id de fiche : les retouches sont rangées sur la
  // fiche elle-même (`edits`), et survivent au changement de fiche ou à un
  // rechargement.
  const editKey = message ? `${message.draft?.key ?? message.step.templateKey}:${selected?.seqStep ?? 0}` : "";
  const [edit, setEdit] = useState<{ id: string; key: string; subject: string; body: string } | null>(null);
  const saved = selected?.edits?.[editKey];
  const final = message
    ? edit && edit.id === selected?.id && edit.key === editKey
      ? { ...message, subject: edit.subject, body: edit.body }
      : saved
        ? { ...message, subject: saved.subject, body: saved.body }
        : message
    : null;
  const edited = !!final && !!message && (final.subject !== message.subject || final.body !== message.body);
  const setField = (field: "subject" | "body", value: string) =>
    message && selected?.id &&
    setEdit({ id: selected.id, key: editKey, subject: final?.subject ?? message.subject, body: final?.body ?? message.body, [field]: value });

  // Sauvegarde différée de la retouche sur la fiche (800 ms après la
  // dernière frappe) — sans ça une retouche non envoyée se perdait.
  useEffect(() => {
    if (!edit || !message) return;
    const p = rows.find((r) => r.id === edit.id);
    if (!p) return;
    const t = setTimeout(() => {
      const untouched = edit.subject === message.subject && edit.body === message.body;
      const next = { ...(p.edits || {}) };
      if (untouched) delete next[edit.key];
      else next[edit.key] = { subject: edit.subject, body: edit.body };
      updateProspect(edit.id, { edits: next }, p).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit]);

  const resetEdit = () => {
    if (!selected?.id) return;
    setEdit(null);
    if (selected.edits?.[editKey]) {
      const next = { ...selected.edits };
      delete next[editKey];
      updateProspect(selected.id, { edits: next }, selected);
    }
  };

  const isOptedOut = (p: Prospect) => !!p.unsubToken && optedOut.has(p.unsubToken);

  // ── Mode Revue : enchaîner les fiches prêtes (brouillons A/B) au clavier ──
  const [review, setReview] = useState(false);
  const queue = useMemo(
    () => rows.filter((p) => p.drafts?.variants?.length && p.email && STATUS_META[p.status].open && !isOptedOut(p))
      .sort((a, b) => (a.priority ?? 2) - (b.priority ?? 2)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, optedOut]
  );
  const queuePos = queue.findIndex((p) => p.id === selectedId);
  const goNext = () => {
    const next = queue.find((p, i) => i > queuePos) || queue.find((p) => p.id !== selectedId);
    if (next) setSelectedId(next.id!);
    else { setReview(false); say("ok", "Revue terminée — plus de fiche prête."); }
  };
  const goPrev = () => { if (queuePos > 0) setSelectedId(queue[queuePos - 1].id!); };
  const startReview = () => {
    if (!queue.length) return say("err", "Aucune fiche prête. Lance /robi-outreach <segment> d'abord.");
    setReview(true);
    setSelectedId(queue[0].id!);
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      say("ok", "Message copié.");
    } catch {
      window.prompt("Copie ce message :", text);
    }
  };

  const send = useCallback(async () => {
    const message = final;
    if (!selected?.id || !selected.email || !message) return;
    if (isOptedOut(selected)) return say("err", "Ce contact s'est désinscrit.");

    setBusy(true);
    try {
      // Le jeton est émis une seule fois et ne change jamais : il figure dans
      // les emails déjà partis.
      const unsubToken = selected.unsubToken || makeUnsubToken();
      if (!selected.unsubToken) await updateProspect(selected.id, { unsubToken }, selected);

      await sendOutreachEmail({
        to: selected.email,
        subject: message.subject,
        text: message.body,
        unsubToken,
      });

      await updateProspect(selected.id, {
        lastEmailAt: new Date().toISOString(),
        // « sent » = accepté par Brevo. Le webhook Brevo affine ensuite :
        // livré, ouvert, rebond, spam.
        delivery: { status: "sent", at: new Date().toISOString() },
      }, selected);
      // L'angle envoyé est tracé sur la touche : c'est ce qui permet de savoir,
      // plus tard, lequel obtient des réponses. Les brouillons consommés sont
      // effacés pour que la prochaine étape reparte sur un texte neuf.
      const angle = message.draft ? ` · angle:${message.draft.angle} (${message.draft.key})` : "";
      await advanceProspect(selected, `Envoyé : ${message.step.label}${angle}`, {
        subject: message.subject,
        body: message.body,
      });
      if (message.draft) await clearDrafts(selected.id);
      if (selected.edits && Object.keys(selected.edits).length) await updateProspect(selected.id, { edits: {} }, selected);
      setEdit(null);
      say("ok", `Envoyé à ${selected.email}.`);
      // En mode Revue, on enchaîne sur la fiche suivante sans un clic.
      if (review) goNext();
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [selected, final, optedOut, review, queuePos, queue]);

  // Raccourcis du mode Revue. Ignorés quand on tape dans un champ, sauf
  // ⌘/Ctrl+Entrée qui envoie depuis n'importe où.
  useEffect(() => {
    if (!review) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); if (!busy) send(); return; }
      if (typing) return;
      if (!selected?.id) return;
      const k = e.key.toLowerCase();
      if (k === "a" || k === "b") { e.preventDefault(); if (selected.drafts) updateProspect(selected.id, { chosenDraft: k.toUpperCase() as "A" | "B" }, selected); }
      else if (k === "arrowright" || k === "j" || k === "s") { e.preventDefault(); goNext(); }
      else if (k === "arrowleft" || k === "k") { e.preventDefault(); goPrev(); }
      else if (k === "escape") { setReview(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [review, selected, busy, send, queuePos, queue]);


  /**
   * Bascule une fiche prospect vers le programme influenceurs. Le prospect est
   * conservé et marqué client : son historique de relances reste consultable.
   */
  const toInfluencer = async () => {
    if (!selected?.id) return;
    setBusy(true);
    try {
      await addInfluencer({
        name: selected.contactName || selected.company,
        platform: "instagram",
        status: "negociation",
        email: selected.email,
        url: selected.website || selected.linkedin,
        discountPct: 20,
        commissionPct: 20,
        promoCode: suggestPromoCode(selected.contactName || selected.company, 20),
        prospectId: selected.id,
        notes: `Converti depuis l'acquisition${selected.notes ? ` — ${selected.notes}` : ""}`,
        contactedAt: todayStr(),
      });
      await updateProspect(selected.id, { status: "interested" }, selected);
      say("ok", "Fiche créée dans l'onglet Influenceurs — code promo à créer dans Polar.");
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const runImport = async () => {
    setBusy(true);
    try {
      const r = await importProspectsFromJson(importText);
      say("ok", `${r.imported} importé(s), ${r.skipped} doublon(s) ignoré(s).${r.errors.length ? ` ${r.errors.length} erreur(s).` : ""}`);
      if (r.errors.length) console.warn("[import]", r.errors);
      setImportText("");
      setShowImport(false);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avertissement SMTP */}
      {smtp && !smtp.configured && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <p className="font-black text-sm text-amber-600">Envoi direct désactivé</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Aucun SMTP de prospection n&apos;est configuré. C&apos;est volontaire : envoyer
                du démarchage par le SMTP qui délivre les factures de tes clients met leur
                délivrabilité en jeu — si ce serveur est marqué comme spam,{" "}
                <span className="text-slate-700">les factures de tes clients cessent d&apos;arriver</span>.
                <br /><br />
                Configure <code className="text-[var(--admin-ink)]">SMTP_OUTREACH_HOST / _PORT / _USER / _PASS / _FROM</code>{" "}
                sur un sous-domaine dédié (par ex. <code>mail.robi-app.com</code>) avec ses propres
                SPF, DKIM et DMARC. En attendant, « Copier » et « Ouvrir dans le mail » fonctionnent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs pipeline */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {PIPELINE.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`${card} p-3 text-left transition-all hover:bg-slate-50 ${status === s ? "ring-1 ring-[#BEF221]/40" : ""}`}
          >
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: STATUS_META[s].color }}>
              {statusLabel(s, segment)}
            </p>
            <span className="font-black text-2xl text-slate-900">{counts[s] || 0}</span>
          </button>
        ))}
      </div>

      {/* Résultats par angle */}
      {angles.length > 0 && (
        <details className={`${card} p-5`}>
          <summary className="cursor-pointer flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
            <BarChart3 size={15} style={{ color: ACCENT_INK }} /> Résultats par angle
            <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-slate-500">{angles.reduce((n, a) => n + a.sent, 0)} envois tracés</span>
          </summary>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-[12px]" style={{ fontVariantNumeric: "tabular-nums" }}>
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="text-left font-semibold pb-2">Angle</th>
                  <th className="text-right font-semibold pb-2">Envoyés</th>
                  <th className="text-right font-semibold pb-2">Ouverts</th>
                  <th className="text-right font-semibold pb-2">Réponses</th>
                  <th className="text-right font-semibold pb-2">Intéressés</th>
                  <th className="text-right font-semibold pb-2">Inscrits</th>
                  <th className="text-right font-semibold pb-2">Taux réponse</th>
                </tr>
              </thead>
              <tbody>
                {angles.map((a) => (
                  <tr key={a.angle} className="border-t border-slate-100">
                    <td className="py-1.5 font-mono font-semibold text-slate-900">{a.angle}</td>
                    <td className="py-1.5 text-right text-slate-700">{a.sent}</td>
                    <td className="py-1.5 text-right text-slate-700">{a.opened}</td>
                    <td className="py-1.5 text-right text-slate-700">{a.replied}</td>
                    <td className="py-1.5 text-right text-slate-700">{a.interested}</td>
                    <td className="py-1.5 text-right text-slate-700">{a.signup}</td>
                    <td className="py-1.5 text-right font-bold" style={{ color: a.sent >= 10 ? ACCENT_INK : "#94a3b8" }} title={a.sent < 10 ? "Moins de 10 envois : pas encore significatif" : undefined}>
                      {a.sent ? `${Math.round((100 * a.replied) / a.sent)} %` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-slate-400 mt-2">L&apos;issue est attribuée au dernier angle envoyé. En dessous de 10 envois, le taux est indicatif.</p>
          </div>
        </details>
      )}

      {/* Aujourd'hui */}
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <Target size={15} style={{ color: ACCENT_INK }} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">À faire aujourd&apos;hui</p>
          {today.length > 0 && (
            <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-[var(--color-text-on-accent)]">{today.length}</span>
          )}
        </div>
        {today.length === 0 ? (
          <p className="text-xs text-slate-500">Rien à relancer aujourd&apos;hui.</p>
        ) : (
          <div className="space-y-2">
            {today.slice(0, 12).map((p) => {
              const rel = relativeDay(p.nextActionDate);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id!)}
                  className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SEGMENT_META[p.segment].color }} />
                  <span className="text-[13px] font-bold text-slate-900 truncate flex-1">{p.company}</span>
                  <span className="text-[11px] text-slate-500 truncate hidden sm:block">{stepOf(p).label}</span>
                  <span className={`text-[11px] font-bold ${rel.late ? "text-amber-600" : "text-slate-500"}`}>{rel.label}</span>
                  <ArrowRight size={13} className="text-slate-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className={`${input} pl-9`}
            placeholder="Chercher une société, un contact, une ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={select} value={segment} onChange={(e) => setSegment(e.target.value as ProspectSegment | "all")}>
          <option value="all">Tous les segments</option>
          {SEGMENTS.map((s) => <option key={s} value={s}>{SEGMENT_META[s].label}</option>)}
        </select>
        <select className={select} value={status} onChange={(e) => setStatus(e.target.value as ProspectStatus | "open")}>
          <option value="open">En cours</option>
          {(Object.keys(STATUS_META) as ProspectStatus[]).map((s) => <option key={s} value={s}>{statusLabel(s, segment)}</option>)}
        </select>
        <button
          onClick={review ? () => setReview(false) : startReview}
          className={review ? btnPrimary : btnGhost}
          title="Enchaîner les fiches prêtes au clavier : A / B, ⌘+Entrée pour envoyer, → suivante"
        >
          <span className="flex items-center gap-1.5"><Zap size={12} /> {review ? `Revue ${queuePos + 1} / ${queue.length}` : `Revue A/B${queue.length ? ` (${queue.length})` : ""}`}</span>
        </button>
        <a
          href="https://claude.ai/artifact/NkMT6tt4Det1LwVby5svii"
          target="_blank"
          rel="noopener noreferrer"
          className={btnGhost}
          title="Mode d'emploi : trouver, écrire, envoyer — pas à pas"
        >
          <span className="flex items-center gap-1.5"><BookOpen size={12} /> Tuto</span>
        </a>
        <button onClick={() => setShowImport((v) => !v)} className={btnGhost}>
          <span className="flex items-center gap-1.5"><Upload size={12} /> Importer JSON</span>
        </button>
        <button
          onClick={async () => {
            setBusy(true);
            try {
              const r = await checkReplies();
              say("ok", r.replied.length ? `${r.replied.length} réponse(s) : ${r.replied.join(", ")}` : `Aucune nouvelle réponse (${r.senders} expéditeurs sur ${r.days} j).`);
            } catch (e) {
              say("err", (e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className={btnGhost}
          title="Lit la boîte de réponse et marque « intéressé » ceux qui ont répondu"
        >
          <span className="flex items-center gap-1.5"><Mail size={12} /> Vérifier les réponses</span>
        </button>
      </div>

      {/* Import */}
      {showImport && (
        <div className={`${card} p-5 space-y-3`}>
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">Import JSON</p>
          <p className="text-[11px] text-slate-500">
            Même schéma que la skill d&apos;acquisition. Les doublons d&apos;email sont ignorés.
            Champ obligatoire : <code className="text-[var(--admin-ink)]">company</code>.
          </p>
          <textarea
            className={`${input} font-mono text-[11px] h-40`}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={EXAMPLE_JSON}
          />
          <div className="flex items-center gap-2">
            <button onClick={runImport} disabled={busy || !importText.trim()} className={btnPrimary}>Importer</button>
            <button onClick={() => setImportText(EXAMPLE_JSON)} className={btnGhost}>Charger un exemple</button>
          </div>
        </div>
      )}

      {/* Liste + détail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* Liste */}
        <div className={`${card} p-2 max-h-[560px] overflow-y-auto`}>
          {filtered.length === 0 ? (
            <p className="text-xs text-slate-500 p-4">Aucun prospect ne correspond.</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id!)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${selectedId === p.id ? "bg-slate-50" : "hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SEGMENT_META[p.segment].color }} />
                  <span className="text-[13px] font-bold text-slate-900 truncate flex-1">{p.company}</span>
                  {p.delivery && ["hard_bounce", "spam", "blocked"].includes(p.delivery.status) && (
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-red-500" title={DELIVERY_META[p.delivery.status].label} />
                  )}
                  {p.drafts?.variants?.length ? (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: ACCENT, color: ACCENT_INK }} title="Brouillons A/B prêts">
                      A/B
                    </span>
                  ) : null}
                  {isOptedOut(p) && <Ban size={12} className="text-red-600 flex-shrink-0" />}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${STATUS_META[p.status].color}1f`, color: STATUS_META[p.status].color }}>
                    {statusLabel(p.status, p.segment)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 pl-3.5">
                  {[p.contactName, p.city, p.email].filter(Boolean).join(" · ") || "—"}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Détail */}
        {selected ? (
          <div className={`${card} p-5 space-y-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-black text-lg text-slate-900 truncate">{selected.company}</p>
                <p className="text-[11px] text-slate-500">
                  {[selected.contactName, selected.role, selected.city].filter(Boolean).join(" · ") || "—"}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{SEGMENT_META[selected.segment].label} · {SEGMENT_META[selected.segment].hint}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {selected.website && (
                  <a href={selected.website.startsWith("http") ? selected.website : `https://${selected.website}`} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={async () => { if (confirm(`Supprimer ${selected.company} ?`)) { await deleteProspect(selected.id!); setSelectedId(null); } }}
                  className={`${btnPill} bg-red-500/15 text-red-600 hover:bg-red-500/25`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {isOptedOut(selected) && (
              <div className="rounded-xl border border-red-400/25 bg-red-400/[0.07] px-3 py-2 flex items-center gap-2">
                <Ban size={13} className="text-red-600 flex-shrink-0" />
                <p className="text-[11px] text-red-300">
                  Ce contact s&apos;est désinscrit. Tout envoi est bloqué — et doit le rester.
                </p>
              </div>
            )}

            {/* Statut */}
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(STATUS_META) as ProspectStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => updateProspect(selected.id!, { status: s }, selected)}
                  className={`${btnPill} ${selected.status === s ? "text-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  style={selected.status === s ? { backgroundColor: STATUS_META[s].color } : undefined}
                >
                  {statusLabel(s, selected.segment)}
                </button>
              ))}
            </div>

            {/* Séquence */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-2">
                <span>Étape {(selected.seqStep ?? 0) + 1} / {sequenceFor(selected.segment).length} · {stepOf(selected).label}</span>
                {selected.delivery && (
                  <span
                    className="normal-case tracking-normal font-bold px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: `${DELIVERY_META[selected.delivery.status].color}1f`, color: DELIVERY_META[selected.delivery.status].color }}
                    title={`${selected.delivery.at.slice(0, 16).replace("T", " ")}${selected.delivery.reason ? ` — ${selected.delivery.reason}` : ""}`}
                  >
                    {DELIVERY_META[selected.delivery.status].label}
                  </span>
                )}
              </p>
              <div className="flex gap-1">
                {sequenceFor(selected.segment).map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full" style={{ backgroundColor: i <= (selected.seqStep ?? 0) ? ACCENT : "rgba(255,255,255,0.12)" }} />
                ))}
              </div>
            </div>

            {review && (
              <div className="rounded-xl px-3 py-2 text-[11px] flex flex-wrap gap-x-4 gap-y-1" style={{ backgroundColor: `${ACCENT}22`, color: ACCENT_INK }}>
                <span><kbd className="font-mono font-bold">A</kbd> / <kbd className="font-mono font-bold">B</kbd> variante</span>
                <span><kbd className="font-mono font-bold">⌘⏎</kbd> envoyer</span>
                <span><kbd className="font-mono font-bold">→</kbd> passer</span>
                <span><kbd className="font-mono font-bold">←</kbd> précédente</span>
                <span><kbd className="font-mono font-bold">Échap</kbd> quitter</span>
              </div>
            )}

            {/* Brouillons A / B rédigés par la skill */}
            {selected.drafts?.variants?.length ? (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Brouillons</p>
                <div className="grid grid-cols-2 gap-2">
                  {selected.drafts.variants.map((v) => {
                    const active = (selected.chosenDraft || selected.drafts!.recommended) === v.key;
                    const reco = selected.drafts!.recommended === v.key;
                    return (
                      <button
                        key={v.key}
                        onClick={() => updateProspect(selected.id!, { chosenDraft: v.key }, selected)}
                        className={`text-left rounded-xl border p-2.5 transition ${active ? "border-transparent" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                        style={active ? { backgroundColor: ACCENT, color: ACCENT_INK } : undefined}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold">Variante {v.key}</span>
                          {reco && (
                            <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full ${active ? "bg-black/10" : "bg-slate-900 text-[var(--a-bg)]"}`}>
                              Recommandé
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-1 font-medium ${active ? "" : "text-slate-800"}`}>{v.subject}</p>
                        <p className={`text-[10px] mt-0.5 ${active ? "opacity-70" : "text-slate-400"}`}>angle : {v.angle}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">{selected.drafts.reason}</p>
              </div>
            ) : null}

            {/* Message — modifiable sur place, c'est ce texte qui part */}
            {message && final ? (
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Objet</p>
                  <input
                    id="outreach-subject"
                    className={`${input} font-bold`}
                    value={final.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Message</p>
                    {edited && (
                      <button onClick={resetEdit} className="text-[10px] text-slate-500 hover:text-slate-900 underline">
                        Revenir au texte proposé
                      </button>
                    )}
                  </div>
                  <textarea
                    id="outreach-body"
                    className={`${input} text-[12px] leading-relaxed min-h-[16rem] resize-y font-sans`}
                    value={final.body}
                    onChange={(e) => setField("body", e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Un lien de désinscription est ajouté automatiquement à l&apos;envoi.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button onClick={() => copy(`${final.subject}\n\n${final.body}`)} className={btnGhost}>
                    <span className="flex items-center gap-1.5"><Copy size={12} /> Copier</span>
                  </button>
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}?subject=${encodeURIComponent(final.subject)}&body=${encodeURIComponent(final.body)}`}
                      className={btnGhost}
                    >
                      <span className="flex items-center gap-1.5"><Mail size={12} /> Ouvrir dans le mail</span>
                    </a>
                  )}
                  <button
                    onClick={send}
                    disabled={busy || !selected.email || !smtp?.configured || isOptedOut(selected)}
                    className={btnPrimary}
                    title={!smtp?.configured ? "SMTP de prospection non configuré" : undefined}
                  >
                    <span className="flex items-center gap-1.5">
                      {busy ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />} Envoyer
                    </span>
                  </button>
                  <button onClick={() => advanceProspect(selected, `Fait à la main : ${stepOf(selected).label}`)} disabled={busy} className={btnGhost}>
                    <span className="flex items-center gap-1.5"><Check size={12} /> Marquer fait</span>
                  </button>
                  {selected.segment === "influenceur" && (
                    <button onClick={toInfluencer} disabled={busy} className={btnGhost}>
                      <span className="flex items-center gap-1.5"><Megaphone size={12} /> Convertir en influenceur</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Aucun modèle pour cette étape.</p>
            )}

            {/* Historique */}
            {(selected.touches?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1.5">Historique</p>
                <div className="space-y-1">
                  {[...selected.touches!].reverse().slice(0, 6).map((t, i) => (
                    <div key={i} className="text-[11px] text-slate-600">
                      <p>
                        <span className="text-slate-700">{t.date}</span> · {t.channel}{t.note ? ` — ${t.note}` : ""}
                      </p>
                      {t.body && (
                        <details className="mt-1 ml-2">
                          <summary className="cursor-pointer text-slate-500 hover:text-slate-700">Voir le mail envoyé</summary>
                          <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                            {t.subject && <p className="text-slate-700 font-medium mb-1.5">{t.subject}</p>}
                            <pre className="whitespace-pre-wrap font-sans text-slate-600 leading-relaxed">{t.body}</pre>
                          </div>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.notes && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Notes</p>
                <p className="text-[11px] text-slate-600 whitespace-pre-wrap">{selected.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`${card} p-5 flex items-center justify-center min-h-[200px]`}>
            <p className="text-xs text-slate-400">Sélectionne un prospect pour voir son message.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcquisitionTab;
