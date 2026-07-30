"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Target, Send, Copy, Mail, Check, AlertTriangle, Upload, Search,
  ArrowRight, Ban, ExternalLink, Trash2, RefreshCw,
} from "lucide-react";
import {
  subscribeToProspects, subscribeToUnsubscribes, updateProspect, deleteProspect,
  advanceProspect, importProspectsFromJson, makeUnsubToken, resolveTemplate,
  renderTemplate, stepOf, relativeDay, todayStr,
  SEGMENT_META, SEGMENTS, STATUS_META, PIPELINE, SEQUENCE,
  type Prospect, type ProspectSegment, type ProspectStatus,
} from "@/lib/prospects";
import { fetchOutreachStatus, sendOutreachEmail, type OutreachStatus } from "@/lib/adminApi";

const ACCENT = "#BEF221";
const card = "rounded-2xl border bg-white/[0.03] border-white/8";
const input =
  "w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm outline-none focus:border-[#BEF221]/40";

const btn = "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed";
const btnGhost = `${btn} bg-white/10 text-white hover:bg-white/20`;
const btnPrimary = `${btn} bg-[#BEF221] text-black hover:opacity-90`;

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
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  useEffect(() => {
    const a = subscribeToProspects(setRows, (e) => setFlash({ kind: "err", text: String(e) }));
    const b = subscribeToUnsubscribes(setOptedOut);
    fetchOutreachStatus().then(setSmtp).catch(() => setSmtp({ configured: false, from: null, host: null }));
    return () => { a(); b(); };
  }, []);

  const say = (kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    setTimeout(() => setFlash(null), 5000);
  };

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

  // ── Message courant du prospect sélectionné ──
  const message = useMemo(() => {
    if (!selected) return null;
    const step = stepOf(selected);
    const tpl = resolveTemplate(selected, step.templateKey);
    if (!tpl) return null;
    return {
      step,
      subject: renderTemplate(tpl.subject, selected),
      body: renderTemplate(tpl.body, selected),
    };
  }, [selected]);

  const isOptedOut = (p: Prospect) => !!p.unsubToken && optedOut.has(p.unsubToken);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      say("ok", "Message copié.");
    } catch {
      window.prompt("Copie ce message :", text);
    }
  };

  const send = useCallback(async () => {
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

      await updateProspect(selected.id, { lastEmailAt: new Date().toISOString() }, selected);
      await advanceProspect(selected, `Envoyé : ${message.step.label}`);
      say("ok", `Envoyé à ${selected.email}.`);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [selected, message, optedOut]);

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
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <p className="font-black text-sm text-amber-300">Envoi direct désactivé</p>
              <p className="text-[11px] text-white/60 leading-relaxed">
                Aucun SMTP de prospection n&apos;est configuré. C&apos;est volontaire : envoyer
                du démarchage par le SMTP qui délivre les factures de tes clients met leur
                délivrabilité en jeu — si ce serveur est marqué comme spam,{" "}
                <span className="text-white/80">les factures de tes clients cessent d&apos;arriver</span>.
                <br /><br />
                Configure <code className="text-[#BEF221]">SMTP_OUTREACH_HOST / _PORT / _USER / _PASS / _FROM</code>{" "}
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
            className={`${card} p-3 text-left transition-all hover:bg-white/[0.06] ${status === s ? "ring-1 ring-[#BEF221]/40" : ""}`}
          >
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: STATUS_META[s].color }}>
              {STATUS_META[s].label}
            </p>
            <span className="font-black text-2xl text-white">{counts[s] || 0}</span>
          </button>
        ))}
      </div>

      {/* Aujourd'hui */}
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-2 mb-4">
          <Target size={15} style={{ color: ACCENT }} />
          <p className="text-xs font-black uppercase tracking-widest text-white">À faire aujourd&apos;hui</p>
          {today.length > 0 && (
            <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-[#BEF221] text-black">{today.length}</span>
          )}
        </div>
        {today.length === 0 ? (
          <p className="text-xs text-white/40">Rien à relancer aujourd&apos;hui.</p>
        ) : (
          <div className="space-y-2">
            {today.slice(0, 12).map((p) => {
              const rel = relativeDay(p.nextActionDate);
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id!)}
                  className="w-full flex items-center gap-3 text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SEGMENT_META[p.segment].color }} />
                  <span className="text-[13px] font-bold text-white truncate flex-1">{p.company}</span>
                  <span className="text-[11px] text-white/40 truncate hidden sm:block">{stepOf(p).label}</span>
                  <span className={`text-[11px] font-bold ${rel.late ? "text-amber-300" : "text-white/40"}`}>{rel.label}</span>
                  <ArrowRight size={13} className="text-white/30 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            className={`${input} pl-9`}
            placeholder="Chercher une société, un contact, une ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className={`${input} w-auto`} value={segment} onChange={(e) => setSegment(e.target.value as ProspectSegment | "all")}>
          <option value="all">Tous les segments</option>
          {SEGMENTS.map((s) => <option key={s} value={s}>{SEGMENT_META[s].label}</option>)}
        </select>
        <select className={`${input} w-auto`} value={status} onChange={(e) => setStatus(e.target.value as ProspectStatus | "open")}>
          <option value="open">En cours</option>
          {(Object.keys(STATUS_META) as ProspectStatus[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
        <button onClick={() => setShowImport((v) => !v)} className={btnGhost}>
          <span className="flex items-center gap-1.5"><Upload size={12} /> Importer JSON</span>
        </button>
      </div>

      {/* Import */}
      {showImport && (
        <div className={`${card} p-5 space-y-3`}>
          <p className="text-xs font-black uppercase tracking-widest text-white">Import JSON</p>
          <p className="text-[11px] text-white/40">
            Même schéma que la skill d&apos;acquisition. Les doublons d&apos;email sont ignorés.
            Champ obligatoire : <code className="text-[#BEF221]">company</code>.
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
            <p className="text-xs text-white/40 p-4">Aucun prospect ne correspond.</p>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id!)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all ${selectedId === p.id ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: SEGMENT_META[p.segment].color }} />
                  <span className="text-[13px] font-bold text-white truncate flex-1">{p.company}</span>
                  {isOptedOut(p) && <Ban size={12} className="text-red-400 flex-shrink-0" />}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${STATUS_META[p.status].color}1f`, color: STATUS_META[p.status].color }}>
                    {STATUS_META[p.status].label}
                  </span>
                </div>
                <p className="text-[11px] text-white/40 truncate mt-0.5 pl-3.5">
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
                <p className="font-black text-lg text-white truncate">{selected.company}</p>
                <p className="text-[11px] text-white/40">
                  {[selected.contactName, selected.role, selected.city].filter(Boolean).join(" · ") || "—"}
                </p>
                <p className="text-[11px] text-white/30 mt-0.5">{SEGMENT_META[selected.segment].label} · {SEGMENT_META[selected.segment].hint}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {selected.website && (
                  <a href={selected.website.startsWith("http") ? selected.website : `https://${selected.website}`} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={async () => { if (confirm(`Supprimer ${selected.company} ?`)) { await deleteProspect(selected.id!); setSelectedId(null); } }}
                  className={`${btn} bg-red-500/15 text-red-400 hover:bg-red-500/25`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {isOptedOut(selected) && (
              <div className="rounded-xl border border-red-400/25 bg-red-400/[0.07] px-3 py-2 flex items-center gap-2">
                <Ban size={13} className="text-red-400 flex-shrink-0" />
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
                  className={`${btn} ${selected.status === s ? "text-black" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
                  style={selected.status === s ? { backgroundColor: STATUS_META[s].color } : undefined}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>

            {/* Séquence */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">
                Étape {(selected.seqStep ?? 0) + 1} / {SEQUENCE.length} · {stepOf(selected).label}
              </p>
              <div className="flex gap-1">
                {SEQUENCE.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full" style={{ backgroundColor: i <= (selected.seqStep ?? 0) ? ACCENT : "rgba(255,255,255,0.12)" }} />
                ))}
              </div>
            </div>

            {/* Message */}
            {message ? (
              <div className="space-y-2">
                {message.subject && (
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Objet</p>
                    <p className="text-[13px] font-bold text-white">{message.subject}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Message</p>
                  <pre className="text-[12px] text-white/75 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto bg-white/[0.03] rounded-xl p-3">
                    {message.body}
                  </pre>
                </div>
                <p className="text-[10px] text-white/30">
                  Un lien de désinscription est ajouté automatiquement à l&apos;envoi.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button onClick={() => copy(`${message.subject}\n\n${message.body}`)} className={btnGhost}>
                    <span className="flex items-center gap-1.5"><Copy size={12} /> Copier</span>
                  </button>
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`}
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
                  <button onClick={() => advanceProspect(selected, "Marqué manuellement")} disabled={busy} className={btnGhost}>
                    <span className="flex items-center gap-1.5"><Check size={12} /> Marquer fait</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/40">Aucun modèle pour cette étape.</p>
            )}

            {/* Historique */}
            {(selected.touches?.length ?? 0) > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5">Historique</p>
                <div className="space-y-1">
                  {[...selected.touches!].reverse().slice(0, 6).map((t, i) => (
                    <p key={i} className="text-[11px] text-white/50">
                      <span className="text-white/70">{t.date}</span> · {t.channel}{t.note ? ` — ${t.note}` : ""}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {selected.notes && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Notes</p>
                <p className="text-[11px] text-white/60 whitespace-pre-wrap">{selected.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`${card} p-5 flex items-center justify-center min-h-[200px]`}>
            <p className="text-xs text-white/30">Sélectionne un prospect pour voir son message.</p>
          </div>
        )}
      </div>

      {flash && (
        <div
          className="fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl text-[12px] font-bold z-50"
          style={{
            backgroundColor: flash.kind === "ok" ? ACCENT : "#f87171",
            color: flash.kind === "ok" ? "#000" : "#fff",
          }}
        >
          {flash.text}
        </div>
      )}
    </div>
  );
};

export default AcquisitionTab;
