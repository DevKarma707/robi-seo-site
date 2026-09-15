"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, FileJson, RefreshCw, AlertTriangle, Check, Trash2,
  Pencil, X, Copy, Sparkles, ClipboardCopy, ImagePlus, Loader2, Send, ShieldCheck,
} from "lucide-react";
import { listSharedFiles, isImage, type SharedFile } from "@/lib/sharedFiles";
import {
  subscribeToPosts, addPost, updatePost, updatePostText, deletePost, importPostsFromJson,
  monthGrid, MONTH_NAMES, CHANNEL_META, TYPE_META, STATUS_META, STATUTS_MANUELS, CHANNELS, TYPES,
  type SocialPost, type PostChannel,
} from "@/lib/socialPosts";
import { verifierAvantProgrammation, estProgrammable, type Verdict } from "@/lib/publicationCheck";
import { ACCENT, btnGhost, btnPill, btnPrimary, card, focusRing, input, select, sectionTitle } from "./ui";

/**
 * Brief à coller dans Claude Code pour fabriquer un mois de posts.
 *
 * Il embarque l'historique des posts existants (publiés, prêts, brouillons)
 * pour qu'une session Claude Code — qui démarre toujours vide — sache ce qui
 * a déjà été dit et attaque des angles neufs. La ligne éditoriale, elle,
 * vit dans le dépôt de l'app (branding/EDITORIAL_LINE.md) : c'est le skill
 * qui la lit, le brief se contente de la rappeler.
 */
const skillBrief = (year: number, month: number, history: SocialPost[]) => {
  const digest = history
    .filter((p) => p.status !== "draft" || p.date < `${year}-${String(month + 1).padStart(2, "0")}`)
    .slice(-60)
    .map((p) => {
      const hook = p.caption.split("\n").find((l) => l.trim()) ?? "";
      return `- ${p.date} · ${p.channel} · ${p.type} · ${p.status} — « ${hook.slice(0, 90)} »`;
    });

  return [
    `/robi-social-media ${MONTH_NAMES[month]} ${year}`,
    "",
    `Génère le calendrier éditorial de ${MONTH_NAMES[month]} ${year} pour Robi.`,
    "Lis d'abord branding/EDITORIAL_LINE.md (ligne éditoriale) et branding/BRAND_KIT.md dans ~/Desktop/ROBI_V1_READY.",
    "Sors un tableau JSON prêt à importer dans l'onglet Réseaux de l'admin.",
    "",
    "Champs OBLIGATOIRES par post : externalId, date (AAAA-MM-JJ),",
    "channel (instagram|linkedin|tiktok),",
    "type (bold|feature|stats|testimonial|carrousel|mockup), caption.",
    "Facultatifs : hashtags, visual, imageUrl (en https:// uniquement).",
    "",
    "externalId est l'identité du post : lettres, chiffres, tiret et souligné,",
    "120 caractères maximum. Il doit rester IDENTIQUE si tu réémets le même",
    "post plus tard — c'est lui qui permet d'y rattacher le visuel une fois",
    "produit, au lieu d'en créer un second. Convention : AAAA-MM-sujet-reseau,",
    "par exemple 2026-09-facturx-obligatoire-ig.",
    "",
    "N'émets pas de statut : un import crée toujours un brouillon, le passage",
    "en « prêt » se fait après relecture dans l'admin.",
    "",
    digest.length
      ? `Déjà écrit (${digest.length} posts) — ne répète ni ces accroches ni ces angles, propose du neuf :`
      : "Aucun post existant : c'est le premier mois.",
    ...digest,
  ].join("\n");
};

const ReseauxTab: React.FC = () => {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [rows, setRows] = useState<SocialPost[]>([]);
  const [ready, setReady] = useState(false);
  const [channel, setChannel] = useState<PostChannel | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ id: string; caption: string; hashtags: string; visual: string; imageUrl: string } | null>(null);
  // Le sélecteur s'ouvre pour un post donné : la médiathèque n'est chargée
  // qu'à ce moment-là, jamais à l'affichage du calendrier.
  const [picker, setPicker] = useState<boolean>(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  /**
   * Posts soumis à vérification avant de passer « prêt ».
   *
   * Passer un post en « prêt » ouvre la porte de la publication automatique :
   * plus personne ne le relira avant qu'il ne soit dans le feed. Le clic
   * n'écrit donc plus directement — il ouvre cet écran.
   */
  const [aVerifier, setAVerifier] = useState<SocialPost[] | null>(null);

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

  const jourDuJour = useMemo(() => new Date().toISOString().slice(0, 10), []);

  /** Les brouillons du mois affiché, dans l'ordre du calendrier. */
  const brouillonsDuMois = useMemo(
    () => monthPosts.filter((p) => p.status === "draft"),
    [monthPosts]
  );

  /**
   * Bascule en « prêt » les posts validés à l'écran de vérification.
   *
   * L'écriture est séquentielle et tolère l'échec unitaire : si un post
   * échoue, les autres passent quand même, et le compte rendu dit lesquels.
   * Tout annuler sur une erreur réseau ferait perdre une relecture entière.
   */
  const programmer = async (posts: SocialPost[]) => {
    setBusy(true);
    let faits = 0;
    const echecs: string[] = [];
    for (const post of posts) {
      try {
        await updatePost(post.id!, { status: "ready", publishError: null, publishAttempts: 0 });
        faits++;
      } catch (e) {
        echecs.push(`${post.date} · ${CHANNEL_META[post.channel].label} : ${(e as Error).message}`);
      }
    }
    setBusy(false);
    setAVerifier(null);
    if (echecs.length) say("err", `${faits} programmé(s), ${echecs.length} en échec — ${echecs[0]}`);
    else say("ok", faits === 1 ? "Post programmé." : `${faits} posts programmés.`);
  };

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month + delta, 1));
    setYear(d.getUTCFullYear());
    setMonth(d.getUTCMonth());
    setOpenId(null);
  };

  const runImport = async () => {
    setBusy(true);
    try {
      const { imported, updated, skipped, errors } = await importPostsFromJson(importText);
      const parts = [`${imported} post(s) importé(s)`];
      if (updated) parts.push(`${updated} complété(s)`);
      if (skipped) parts.push(`${skipped} inchangé(s)`);
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
      await navigator.clipboard.writeText(skillBrief(year, month, rows));
      say("ok", "Brief copié — colle-le dans Claude Code.");
    } catch {
      say("err", "Copie refusée par le navigateur.");
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-white/50 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement du calendrier…
      </div>
    );
  }

  const counts = {
    total: monthPosts.length,
    ready: monthPosts.filter((p) => p.status === "ready").length,
    published: monthPosts.filter((p) => p.status === "published").length,
    enCours: monthPosts.filter((p) => p.status === "publishing").length,
    enErreur: monthPosts.filter((p) => !!p.publishError).length,
  };

  return (
    <div className="space-y-5">
      {/* Barre de mois */}
      <div className={`${card} p-4 flex flex-wrap items-center gap-3`}>
        <div className="flex items-center gap-1">
          <button onClick={() => shift(-1)} className={`${btnGhost} !px-2`} aria-label="Mois précédent">
            <ChevronLeft size={14} />
          </button>
          <p className="font-black text-slate-900 text-sm min-w-[150px] text-center capitalize">
            {MONTH_NAMES[month]} {year}
          </p>
          <button onClick={() => shift(1)} className={`${btnGhost} !px-2`} aria-label="Mois suivant">
            <ChevronRight size={14} />
          </button>
        </div>

        <span className="text-[11px] text-slate-500">
          {counts.total} post{counts.total > 1 ? "s" : ""}
          {counts.ready > 0 && ` · ${counts.ready} prêt${counts.ready > 1 ? "s" : ""}`}
          {counts.published > 0 && ` · ${counts.published} publié${counts.published > 1 ? "s" : ""}`}
          {counts.enCours > 0 && ` · ${counts.enCours} en cours d'envoi`}
        </span>

        {counts.enErreur > 0 && (
          <span
            className="text-[11px] font-bold flex items-center gap-1"
            style={{ color: "#f87171" }}
          >
            <AlertTriangle size={12} />
            {counts.enErreur} en échec
          </span>
        )}

        {brouillonsDuMois.length > 0 && (
          <button
            onClick={() => setAVerifier(brouillonsDuMois)}
            className={btnPrimary}
            title="Vérifier puis programmer tous les brouillons du mois"
          >
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} /> Vérifier {brouillonsDuMois.length} brouillon
              {brouillonsDuMois.length > 1 ? "s" : ""}
            </span>
          </button>
        )}

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
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Colle la sortie du skill <code className="text-[var(--admin-ink)]">robi-social-media</code>. Les posts déjà
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
            <p key={d} className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center py-1">{d}</p>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((date, i) => {
            if (!date) return <div key={`x${i}`} className="min-h-[92px] rounded-xl bg-slate-50" />;
            const posts = byDate.get(date) || [];
            const isToday = date === new Date().toISOString().slice(0, 10);
            return (
              <div
                key={date}
                className={`min-h-[92px] rounded-xl border p-1.5 transition-colors ${
                  isToday
                    ? "border-[var(--color-accent)]/40 bg-[var(--color-accent)]/[0.06] shadow-[inset_0_1px_0_rgba(190,242,33,0.18)]"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                }`}
              >
                <p className={`text-[10px] font-bold mb-1 px-0.5 ${isToday ? "text-[var(--admin-ink)]" : "text-slate-400"}`}>
                  {date.slice(8)}
                </p>
                <div className="space-y-1">
                  {posts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setOpenId(openId === p.id ? null : p.id!)}
                      className={`w-full text-left rounded-lg px-1.5 py-1 transition-colors hover:bg-slate-50 ${focusRing}`}
                      style={{ backgroundColor: `${TYPE_META[p.type].color}1a` }}
                      title={p.caption}
                    >
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: CHANNEL_META[p.channel].color }} />
                        <span className="text-[9px] font-bold truncate text-slate-700">{p.caption}</span>
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
                <span className="text-[11px] text-slate-500">{p.date}</span>
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
                {/* Le visuel attaché. Sans ce bloc, imageUrl ne pouvait être
                    rempli par personne : le champ existait, s'affichait, mais
                    aucun écran ne permettait de le poser. Les images déposées
                    dans Fichiers restaient donc inutilisables pour un post. */}
                <div className="flex items-center gap-2">
                  {ed.imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ed.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover border border-slate-200" />
                      <button onClick={() => setPicker(true)} className={btnGhost}>Changer</button>
                      <button onClick={() => setEdit({ ...ed, imageUrl: "" })} className={btnGhost}>Retirer</button>
                    </>
                  ) : (
                    <button onClick={() => setPicker(true)} className={btnGhost}>
                      <span className="flex items-center gap-1"><ImagePlus size={11} /> Choisir un visuel</span>
                    </button>
                  )}
                </div>

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
                <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">{p.caption}</p>
                {p.hashtags && <p className="text-[12px] text-[var(--admin-ink)]/70">{p.hashtags}</p>}
                {p.visual && (
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <span className="uppercase tracking-widest text-slate-400">Visuel · </span>{p.visual}
                  </p>
                )}
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="rounded-xl max-h-64 border border-slate-200" />
                )}
                <SuiviPublication post={p} />
              </>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {/* « Envoi en cours » n'est pas proposé : seule la file le pose. */}
              {STATUTS_MANUELS.map((s) => (
                <button
                  key={s}
                  disabled={p.status === "publishing"}
                  onClick={() =>
                    // « Prêt » passe par l'écran de vérification : c'est le
                    // dernier moment où quelqu'un regarde avant le feed.
                    s === "ready" ? setAVerifier([p]) : updatePost(p.id!, { status: s })
                  }
                  className={`${btnPill} ${p.status === s ? "text-black" : "bg-slate-100 text-slate-600"}`}
                  style={p.status === s ? { backgroundColor: STATUS_META[s].color } : undefined}
                  title={p.status === "publishing" ? "Envoi en cours — impossible de changer le statut" : undefined}
                >
                  {s === "ready" ? "Programmer…" : STATUS_META[s].label}
                </button>
              ))}
              {!ed && (
                <button
                  onClick={() => setEdit({ id: p.id!, caption: p.caption, hashtags: p.hashtags || "", visual: p.visual || "", imageUrl: p.imageUrl || "" })}
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
                className={`${btnPill} bg-red-500/15 text-red-600 hover:bg-red-500/25`}
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
          <span key={t} className="flex items-center gap-1.5 text-[10px] text-slate-500">
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
      {aVerifier && (
        <EcranVerification
          posts={aVerifier}
          voisins={rows}
          jourDuJour={jourDuJour}
          busy={busy}
          onClose={() => setAVerifier(null)}
          onConfirm={programmer}
        />
      )}
      {picker && edit && (
        <Mediatheque
          onClose={() => setPicker(false)}
          onPick={(url) => { setEdit({ ...edit, imageUrl: url }); setPicker(false); }}
        />
      )}

    </div>
  );
};

/**
 * Sélecteur de visuel, alimenté par la médiathèque de l'onglet Fichiers —
 * elle-même synchronisée depuis ~/Desktop/ROBI_PARTAGE.
 *
 * Les images sont listées à l'ouverture seulement : le calendrier affiche
 * souvent trente posts, et charger le bucket pour chacun serait payé à chaque
 * changement de mois pour un écran qu'on n'ouvre presque jamais.
 */
const Mediatheque = ({ onClose, onPick }: { onClose: () => void; onPick: (url: string) => void }) => {
  const [fichiers, setFichiers] = useState<SharedFile[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    listSharedFiles()
      .then((tous) => setFichiers(tous.filter(isImage)))
      .catch((e) => setErreur((e as Error).message));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className={`${card} w-full max-w-3xl max-h-[80vh] overflow-auto p-5`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-900 flex-1">
            Choisir un visuel
          </p>
          <button onClick={onClose} className={btnGhost}>
            <span className="flex items-center gap-1"><X size={11} /> Fermer</span>
          </button>
        </div>

        {erreur && <p className="text-[13px]" style={{ color: "#f87171" }}>{erreur}</p>}

        {!fichiers && !erreur && (
          <p className="text-[13px] text-slate-500 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Lecture de la médiathèque…
          </p>
        )}

        {fichiers?.length === 0 && (
          <p className="text-[13px] text-slate-500">
            Aucune image dans la médiathèque. Dépose-les dans l&apos;onglet Fichiers, ou dans
            <code className="mx-1">~/Desktop/ROBI_PARTAGE</code> si la synchronisation est active.
          </p>
        )}

        {!!fichiers?.length && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {fichiers.map((f) => (
              <button
                key={f.path}
                onClick={() => onPick(f.url)}
                className={`rounded-xl overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity ${focusRing}`}
                title={f.path}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.url} alt={f.name} className="w-full h-28 object-cover" />
                <span className="block text-[10px] text-slate-500 truncate px-1.5 py-1">{f.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Ce que la file a fait du post au dernier passage.
 *
 * Sans ça, un échec de publication est invisible : le post reste « prêt »,
 * l'admin l'affiche comme les autres, et on découvre des semaines plus tard
 * qu'il n'est jamais parti.
 */
const SuiviPublication = ({ post }: { post: SocialPost }) => {
  if (post.status === "publishing") {
    return (
      <p className="text-[11px] flex items-center gap-1.5" style={{ color: "#fbbf24" }}>
        <Loader2 size={12} className="animate-spin" />
        Envoi en cours depuis {post.claimedAt ? new Date(post.claimedAt).toLocaleTimeString("fr-FR") : "peu"}.
        Le statut se débloque tout seul si l&apos;envoi ne répond plus.
      </p>
    );
  }

  return (
    <>
      {post.publishedUrl && (
        <a
          href={post.publishedUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="text-[11px] font-bold underline"
          style={{ color: "#10B981" }}
        >
          Voir le post publié
        </a>
      )}
      {post.publishError && (
        <p className="text-[11px] leading-relaxed" style={{ color: "#f87171" }}>
          <span className="font-bold">Dernier envoi en échec</span>
          {post.publishAttempts ? ` (${post.publishAttempts} essai${post.publishAttempts > 1 ? "s" : ""})` : ""} :{" "}
          {post.publishError}
        </p>
      )}
    </>
  );
};

/** Une ligne de l'écran de vérification : le post, et ce qui cloche. */
const LigneVerification = ({ post, verdict }: { post: SocialPost; verdict: Verdict }) => {
  const bloque = !estProgrammable(verdict);
  return (
    <li
      className="rounded-xl border p-3 flex gap-3"
      style={{ borderColor: bloque ? "#f8717155" : "#e2e8f0", backgroundColor: bloque ? "#f871710d" : undefined }}
    >
      {post.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
          <ImagePlus size={16} className="text-slate-400" />
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: CHANNEL_META[post.channel].color }}>
          {CHANNEL_META[post.channel].label} · {post.date} · {TYPE_META[post.type].label}
        </p>
        {/* Le texte en entier, pas un extrait : c'est ce qui part. */}
        <p className="text-[12px] text-slate-700 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
        {post.hashtags && <p className="text-[11px] text-slate-400">{post.hashtags}</p>}

        {verdict.blocages.map((b) => (
          <p key={b} className="text-[11px] font-bold flex items-start gap-1" style={{ color: "#f87171" }}>
            <X size={12} className="mt-0.5 shrink-0" /> {b}
          </p>
        ))}
        {verdict.avertissements.map((a) => (
          <p key={a} className="text-[11px] flex items-start gap-1" style={{ color: "#b45309" }}>
            <AlertTriangle size={12} className="mt-0.5 shrink-0" /> {a}
          </p>
        ))}
      </div>
    </li>
  );
};

/**
 * Dernier écran avant la publication automatique.
 *
 * Il montre exactement ce qui partira — texte entier et visuel, pas un
 * résumé — parce qu'après validation plus personne ne regardera. Les posts
 * bloqués sont affichés mais exclus de l'envoi : les cacher laisserait croire
 * qu'ils sont programmés.
 */
const EcranVerification = ({
  posts, voisins, jourDuJour, busy, onClose, onConfirm,
}: {
  posts: SocialPost[];
  voisins: SocialPost[];
  jourDuJour: string;
  busy: boolean;
  onClose: () => void;
  onConfirm: (posts: SocialPost[]) => void;
}) => {
  const examens = useMemo(
    () => posts.map((post) => ({ post, verdict: verifierAvantProgrammation(post, voisins, jourDuJour) })),
    [posts, voisins, jourDuJour]
  );
  const partants = examens.filter((e) => estProgrammable(e.verdict)).map((e) => e.post);
  const bloques = examens.length - partants.length;
  const alertes = examens.filter((e) => estProgrammable(e.verdict) && e.verdict.avertissements.length).length;

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-6" onClick={onClose}>
      <div className={`${card} w-full max-w-2xl max-h-[85vh] flex flex-col p-5`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-black uppercase tracking-widest text-slate-900 flex-1">
            Vérifier avant programmation
          </p>
          <button onClick={onClose} className={btnGhost}>
            <span className="flex items-center gap-1"><X size={11} /> Annuler</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
          Une fois programmé, le post part tout seul à sa date, sans nouvelle relecture.
          C&apos;est le dernier écran où tu peux encore le retenir.
        </p>

        <ul className="space-y-2 overflow-auto flex-1 -mx-1 px-1">
          {examens.map(({ post, verdict }) => (
            <LigneVerification key={post.id} post={post} verdict={verdict} />
          ))}
        </ul>

        <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 mt-3">
          <span className="text-[11px] text-slate-500 flex-1 min-w-[180px]">
            {partants.length} post{partants.length > 1 ? "s" : ""} prêt{partants.length > 1 ? "s" : ""} à programmer
            {bloques > 0 && ` · ${bloques} bloqué${bloques > 1 ? "s" : ""}, à corriger d'abord`}
            {alertes > 0 && ` · ${alertes} à relire`}
          </span>
          <button
            onClick={() => onConfirm(partants)}
            disabled={busy || partants.length === 0}
            className={btnPrimary}
          >
            <span className="flex items-center gap-1">
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              Programmer {partants.length > 0 ? partants.length : ""}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReseauxTab;
