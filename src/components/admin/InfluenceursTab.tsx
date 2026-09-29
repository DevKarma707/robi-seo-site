"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Megaphone, Plus, RefreshCw, AlertTriangle, Trash2, ExternalLink, Ticket, Copy, Link2, Download, Zap, Ban, Wallet, Mail,
} from "lucide-react";
import {
  subscribeToInfluencers, addInfluencer, updateInfluencer, deleteInfluencer,
  subscribeToPayouts, addPayout, deletePayout, partnerLink, commissionsCsv,
  suggestPromoCode, perfOf, euros,
  PLATFORM_META, PLATFORMS, STATUS_META, INFLUENCER_PIPELINE,
  type Influencer, type InfluencerPlatform, type InfluencerStatus, type AttributionStats, type Payout,
} from "@/lib/influencers";
import { fetchAttributionStats, createInfluencerCode, disableInfluencerCode, sendInfluencerWelcome } from "@/lib/adminApi";
import { ACCENT, ACCENT_INK, btnGhost, btnPill, btnPrimary, card, input } from "./ui";
import { toast } from "./toast";

const EMPTY: Omit<Influencer, "id"> = {
  name: "", platform: "instagram", status: "prospect", discountPct: 20, commissionPct: 20,
};

const today = () => new Date().toISOString().slice(0, 10);

const copy = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast("ok", `${label} copié.`);
  } catch {
    toast("err", "Copie impossible, sélectionne le texte à la main.");
  }
};

const InfluenceursTab: React.FC = () => {
  const [rows, setRows] = useState<Influencer[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<AttributionStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<Influencer, "id"> | null>(null);
  const [busy, setBusy] = useState(false);
  const [activating, setActivating] = useState(false);
  const [payoutDraft, setPayoutDraft] = useState<{ amount: string; paidAt: string; period: string; method: Payout["method"]; note: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToInfluencers(setRows, (e) => toast("err", String(e)));
    const unsubPayouts = subscribeToPayouts(setPayouts, (e) => toast("err", String(e)));
    fetchAttributionStats()
      .then(setStats)
      .catch((e) => setStatsError((e as Error).message));
    return () => { unsub(); unsubPayouts(); };
  }, []);

  const say = toast;

  const selected = rows.find((r) => r.id === selectedId) || null;

  const totals = useMemo(() => {
    let sales = 0, net = 0, commission = 0, paid = 0, remaining = 0, signups = 0, clicks = 0, unmatched = 0;
    for (const inf of rows) {
      const p = perfOf(inf, stats, payouts);
      sales += p.sales;
      net += p.netAmount;
      commission += p.commissionDue;
      paid += p.paid;
      remaining += p.remaining;
      signups += p.signups;
      clicks += inf.clicks || 0;
      if (inf.status === "actif" && (inf.promoCode || inf.polarDiscountId) && !p.matched) unmatched++;
    }
    return { sales, net, commission, paid, remaining, signups, clicks, unmatched };
  }, [rows, stats, payouts]);

  /** Ventes attribuées à un code qu'aucune fiche ne revendique. */
  const orphans = useMemo(() => {
    if (!stats) return [];
    return stats.byCode.filter((r) => {
      if (r.sales === 0) return false;
      return !rows.some(
        (inf) =>
          (inf.polarDiscountId && inf.polarDiscountId === r.discountId) ||
          (inf.promoCode && r.code && inf.promoCode.toUpperCase() === r.code.toUpperCase())
      );
    });
  }, [stats, rows]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of rows) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [rows]);

  const save = async () => {
    if (!draft?.name.trim()) return say("err", "Le nom est obligatoire.");
    setBusy(true);
    try {
      const clean = Object.fromEntries(
        Object.entries(draft).filter(([, v]) => v !== undefined && v !== "")
      ) as Omit<Influencer, "id">;
      await addInfluencer(clean);
      setDraft(null);
      say("ok", "Influenceur ajouté. Ouvre la fiche puis « Activer le code » pour créer le code Polar.");
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const patch = async (id: string, p: Partial<Influencer>) => {
    try {
      await updateInfluencer(id, p);
    } catch (e) {
      say("err", (e as Error).message);
    }
  };

  /** Crée le code chez Polar depuis la fiche, puis passe le partenaire en actif. */
  const activate = async (inf: Influencer) => {
    const code = (inf.promoCode || suggestPromoCode(inf.name, inf.discountPct ?? 20)).toUpperCase();
    const discountPct = Number(inf.discountPct || 0);
    if (!discountPct) return say("err", "Renseigne la remise client avant d'activer.");
    setActivating(true);
    try {
      const res = await createInfluencerCode({
        name: inf.name, code, discountPct,
        commissionPct: inf.commissionPct, influencerId: inf.id,
      });
      await updateInfluencer(inf.id!, {
        promoCode: res.code,
        polarDiscountId: res.discountId,
        discountPct: res.discountPct,
        status: "actif",
        ...(inf.signedAt ? {} : { signedAt: today() }),
      });
      say("ok", res.existed ? `Code ${res.code} déjà chez Polar, rattaché.` : `Code ${res.code} créé chez Polar.`);
      if (inf.email) {
        const w = await sendInfluencerWelcome(inf.id!).catch(() => ({ sent: false }));
        say(w.sent ? "ok" : "err", w.sent ? `Mail de bienvenue envoyé à ${inf.email}.` : "Mail de bienvenue non envoyé (SMTP ?). Bouton « Renvoyer » sur la fiche.");
      }
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setActivating(false);
    }
  };

  const disable = async (inf: Influencer) => {
    if (!inf.promoCode) return;
    if (!confirm(`Désactiver le code ${inf.promoCode} ? Il ne fonctionnera plus au paiement.`)) return;
    setActivating(true);
    try {
      await disableInfluencerCode(inf.promoCode);
      await updateInfluencer(inf.id!, { status: "inactif" });
      say("ok", `Code ${inf.promoCode} désactivé.`);
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setActivating(false);
    }
  };

  const savePayout = async () => {
    if (!selected || !payoutDraft) return;
    const amount = Math.round(Number(String(payoutDraft.amount).replace(",", ".")) * 100);
    if (!amount || amount <= 0) return say("err", "Montant invalide.");
    if (!payoutDraft.paidAt) return say("err", "Date requise.");
    setBusy(true);
    try {
      await addPayout({
        influencerId: selected.id!,
        amount,
        paidAt: payoutDraft.paidAt,
        ...(payoutDraft.period ? { period: payoutDraft.period } : {}),
        ...(payoutDraft.method ? { method: payoutDraft.method } : {}),
        ...(payoutDraft.note ? { note: payoutDraft.note } : {}),
      });
      setPayoutDraft(null);
      say("ok", "Versement enregistré.");
    } catch (e) {
      say("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const exportCsv = () => {
    const blob = new Blob([commissionsCsv(rows, stats, payouts)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commissions-robi-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Bandeau explicatif */}
      <div className={`${card} p-5`}>
        <div className="flex items-start gap-2.5">
          <Ticket size={16} style={{ color: ACCENT_INK }} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-1.5">
            <p className="font-black text-sm text-slate-900">Comment ça marche</p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tu crées la fiche, tu cliques « Activer le code » : le code promo est créé chez Polar
              et le partenaire reçoit son lien <span className="font-mono">robi-app.com/r/CODE</span>.
              Le lien compte les clics, mémorise le code 90 jours, compte l&apos;inscription, et applique
              la remise tout seul au paiement — le client peut aussi taper le code à la main.
              <br />
              Les ventes remboursées sont exclues. « Reste à verser » = commission générée − versements
              enregistrés ici. Polar ne paie pas les partenaires : c&apos;est toi, chaque mois.
            </p>
          </div>
        </div>
      </div>

      {statsError && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-600">
            Ventes attribuées indisponibles : {statsError}. Les fiches restent modifiables.
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-500">Clics</p>
          <span className="font-black text-3xl text-slate-900">{totals.clicks}</span>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-500">Inscriptions</p>
          <span className="font-black text-3xl text-slate-900">{totals.signups}</span>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-500">Ventes</p>
          <span className="font-black text-3xl text-slate-900">{totals.sales}</span>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-500">CA net généré</p>
          <span className="font-black text-3xl" style={{ color: ACCENT_INK }}>{euros(totals.net)}</span>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-500">Reste à verser</p>
          <span className="font-black text-3xl text-slate-900">{euros(totals.remaining)}</span>
          <p className="text-[11px] mt-1 text-slate-500">{euros(totals.paid)} déjà versés</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-500">Partenaires actifs</p>
          <span className="font-black text-3xl text-slate-900">{counts.actif || 0}</span>
          <p className="text-[11px] mt-1 text-slate-500">{rows.length} fiche(s) au total</p>
        </div>
      </div>

      {/* Alertes de cohérence */}
      {totals.unmatched > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-600">
            <span className="text-amber-600 font-bold">{totals.unmatched} partenaire(s) actif(s) sans aucune vente ni inscription rattachée.</span>{" "}
            Soit le code n&apos;a pas encore servi, soit il n&apos;a pas été activé ici (bouton « Activer le code » sur la fiche).
          </p>
        </div>
      )}
      {orphans.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-amber-600 font-bold mb-1">
                Des ventes utilisent un code qu&apos;aucune fiche ne revendique
              </p>
              <div className="space-y-0.5">
                {orphans.map((o) => (
                  <p key={o.discountId} className="text-[11px] text-slate-600 font-mono">
                    {o.code || o.discountId} · {o.sales} vente(s) · {euros(o.netAmount)}
                  </p>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                Crée la fiche correspondante pour que la commission soit calculée.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline */}
      <div className="flex flex-wrap items-center gap-2">
        {INFLUENCER_PIPELINE.map((s) => (
          <div key={s} className={`${card} px-3 py-2 flex items-center gap-2`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_META[s].color }} />
            <span className="text-[11px] text-slate-600">{STATUS_META[s].label}</span>
            <span className="text-[13px] font-black text-slate-900">{counts[s] || 0}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCsv} className={btnGhost} disabled={rows.length === 0} title="Export CSV des commissions">
            <span className="flex items-center gap-1.5"><Download size={12} /> CSV commissions</span>
          </button>
          <button onClick={() => setDraft({ ...EMPTY })} className={btnPrimary}>
            <span className="flex items-center gap-1.5"><Plus size={12} /> Nouvel influenceur</span>
          </button>
        </div>
      </div>

      {/* Formulaire de création */}
      {draft && (
        <div className={`${card} p-5 space-y-4`}>
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">Nouvel influenceur</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Nom *</label>
              <input
                className={input} value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Marie Dupont"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Pseudo</label>
              <input className={input} value={draft.handle || ""} onChange={(e) => setDraft({ ...draft, handle: e.target.value })} placeholder="@mariedupont" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Plateforme</label>
              <select className={input} value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value as InfluencerPlatform })}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_META[p].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Abonnés</label>
              <input type="number" className={input} value={draft.audience ?? ""} onChange={(e) => setDraft({ ...draft, audience: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Email</label>
              <input className={input} value={draft.email || ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Lien</label>
              <input className={input} value={draft.url || ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="instagram.com/…" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Remise client (%)</label>
              <input type="number" className={input} value={draft.discountPct ?? ""} onChange={(e) => setDraft({ ...draft, discountPct: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Commission (%)</label>
              <input type="number" className={input} value={draft.commissionPct ?? ""} onChange={(e) => setDraft({ ...draft, commissionPct: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Code promo</label>
              <div className="flex gap-1.5">
                <input className={input} value={draft.promoCode || ""} onChange={(e) => setDraft({ ...draft, promoCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} placeholder="MARIE20" />
                <button
                  onClick={() => setDraft({ ...draft, promoCode: suggestPromoCode(draft.name, draft.discountPct ?? 20) })}
                  className={btnGhost}
                  title="Proposer un code"
                >
                  ⚡
                </button>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            Le code est créé chez Polar à l&apos;activation, depuis la fiche. Laisse vide pour un code proposé automatiquement.
          </p>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={busy} className={btnPrimary}>Enregistrer</button>
            <button onClick={() => setDraft(null)} className={btnGhost}>Annuler</button>
          </div>
        </div>
      )}

      {/* Liste */}
      {rows.length === 0 ? (
        <div className={`${card} p-8 text-center`}>
          <Megaphone size={24} className="mx-auto mb-3 text-slate-400" />
          <p className="text-sm text-slate-600">Aucun influenceur pour l&apos;instant.</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Tu peux aussi les prospecter depuis l&apos;onglet Acquisition (segment « Influenceurs »)
            puis convertir la fiche ici.
          </p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  {["Influenceur", "Code", "Clics", "Inscrits", "Ventes", "CA net", "À verser", "Statut"].map((h) => (
                    <th key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((inf) => {
                  const p = perfOf(inf, stats, payouts);
                  return (
                    <tr
                      key={inf.id}
                      onClick={() => { setSelectedId(selectedId === inf.id ? null : inf.id!); setPayoutDraft(null); }}
                      className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PLATFORM_META[inf.platform].color }} />
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-slate-900 truncate">{inf.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {[inf.handle, PLATFORM_META[inf.platform].label, inf.audience ? `${inf.audience.toLocaleString("fr-FR")} abonnés` : null].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {inf.promoCode ? (
                          <code className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>{inf.promoCode}</code>
                        ) : <span className="text-[11px] text-slate-400">—</span>}
                        {inf.promoCode && !inf.polarDiscountId && (
                          <span className="ml-1.5 text-[10px] text-amber-600 font-bold" title="Pas encore créé chez Polar">non activé</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-bold text-slate-700">{inf.clicks || 0}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-slate-700">{p.signups}</td>
                      <td className="px-4 py-3 text-[13px] font-black text-slate-900">
                        {p.sales}
                        {p.refunded > 0 && <span className="text-[10px] text-red-600 font-bold ml-1">−{p.refunded}</span>}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-bold text-slate-700">{euros(p.netAmount)}</td>
                      <td className="px-4 py-3 text-[13px] font-black" style={{ color: p.remaining > 0 ? ACCENT_INK : "#94a3b8" }}>
                        {euros(p.remaining)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap" style={{ backgroundColor: `${STATUS_META[inf.status].color}1f`, color: STATUS_META[inf.status].color }}>
                          {STATUS_META[inf.status].label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Détail */}
      {selected && (() => {
        const p = perfOf(selected, stats, payouts);
        const link = selected.promoCode ? partnerLink(selected.promoCode) : null;
        const active = Boolean(selected.polarDiscountId);
        const myPayouts = payouts.filter((x) => x.influencerId === selected.id);
        return (
          <div className={`${card} p-5 space-y-4`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-black text-lg text-slate-900 truncate">{selected.name}</p>
                <p className="text-[11px] text-slate-500">
                  {[selected.handle, PLATFORM_META[selected.platform].label, selected.email].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {selected.url && (
                  <a href={selected.url.startsWith("http") ? selected.url : `https://${selected.url}`} target="_blank" rel="noopener noreferrer" className={btnGhost}>
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  onClick={async () => { if (confirm(`Supprimer ${selected.name} ?`)) { await deleteInfluencer(selected.id!); setSelectedId(null); } }}
                  className={`${btnPill} bg-red-500/15 text-red-600 hover:bg-red-500/25`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            {/* Code & lien : le cœur du programme */}
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: `${ACCENT}12` }}>
              {active && link ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link2 size={14} style={{ color: ACCENT_INK }} />
                    <code className="text-[13px] font-bold text-slate-900">{link}</code>
                    <button onClick={() => copy(link, "Lien")} className={btnGhost} title="Copier le lien">
                      <span className="flex items-center gap-1.5"><Copy size={12} /> Lien</span>
                    </button>
                    <button onClick={() => copy(selected.promoCode!, "Code")} className={btnGhost} title="Copier le code">
                      <span className="flex items-center gap-1.5"><Copy size={12} /> Code {selected.promoCode}</span>
                    </button>
                    {selected.email && (
                      <button
                        onClick={async () => { const w = await sendInfluencerWelcome(selected.id!).catch(() => ({ sent: false })); say(w.sent ? "ok" : "err", w.sent ? "Mail de bienvenue envoyé." : "Envoi impossible."); }}
                        className={btnGhost}
                        title={selected.welcomeSentAt ? "Déjà envoyé, renvoyer" : "Envoyer le mail de bienvenue"}
                      >
                        <span className="flex items-center gap-1.5"><Mail size={12} /> {selected.welcomeSentAt ? "Renvoyer" : "Mail de bienvenue"}</span>
                      </button>
                    )}
                    <button onClick={() => disable(selected)} disabled={activating} className={`${btnPill} ml-auto text-red-600 hover:bg-red-500/10`} title="Désactiver le code chez Polar">
                      <span className="flex items-center gap-1.5"><Ban size={12} /> Désactiver</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    À donner au partenaire : ce lien en bio ou en story, ou le code <b>{selected.promoCode}</b> à l&apos;oral.
                    Remise client {selected.discountPct ?? "—"} %, commission {selected.commissionPct ?? "—"} % du net encaissé.
                  </p>
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-[11px] text-slate-600">
                    Code proposé : <code className="font-bold text-slate-900">{(selected.promoCode || suggestPromoCode(selected.name, selected.discountPct ?? 20)).toUpperCase()}</code>
                    {" · "}remise {selected.discountPct ?? 0} %, commission {selected.commissionPct ?? 0} %.
                    Modifie ci-dessous si besoin, puis active.
                  </div>
                  <button onClick={() => activate(selected)} disabled={activating} className={`${btnPrimary} ml-auto`}>
                    <span className="flex items-center gap-1.5"><Zap size={12} /> {activating ? "Création chez Polar…" : "Activer le code"}</span>
                  </button>
                </div>
              )}
            </div>

            {(selected.source === "site" || selected.payoutMethod || selected.country) && (
              <p className="text-[11px] text-slate-600">
                {[
                  selected.source === "site" ? "Inscrit via /partenaires" : null,
                  selected.country ? `Pays ${selected.country}` : null,
                  selected.language ? `Mails en ${selected.language}` : null,
                  selected.payoutMethod ? `Paiement ${selected.payoutMethod}${selected.payoutDetails ? ` · ${selected.payoutDetails}` : ""}` : "Moyen de paiement non renseigné",
                ].filter(Boolean).join(" · ")}
              </p>
            )}

            {/* Statut */}
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(STATUS_META) as InfluencerStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => patch(selected.id!, { status: s, ...(s === "actif" && !selected.signedAt ? { signedAt: today() } : {}) })}
                  className={`${btnPill} ${selected.status === s ? "text-black" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  style={selected.status === s ? { backgroundColor: STATUS_META[s].color } : undefined}
                >
                  {STATUS_META[s].label}
                </button>
              ))}
            </div>

            {/* Réglages du partenariat */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Code promo</label>
                <input
                  className={input}
                  defaultValue={selected.promoCode || ""}
                  disabled={active}
                  title={active ? "Désactive le code pour en créer un autre" : undefined}
                  onBlur={(e) => patch(selected.id!, { promoCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").trim() || undefined })}
                  placeholder="MARIE20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Id discount Polar</label>
                <input
                  className={input}
                  defaultValue={selected.polarDiscountId || ""}
                  onBlur={(e) => patch(selected.id!, { polarDiscountId: e.target.value.trim() || undefined })}
                  placeholder="rempli à l'activation"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Remise client (%)</label>
                <input type="number" className={input} defaultValue={selected.discountPct ?? ""} disabled={active} onBlur={(e) => patch(selected.id!, { discountPct: Number(e.target.value) || undefined })} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Commission (%)</label>
                <input type="number" className={input} defaultValue={selected.commissionPct ?? ""} onBlur={(e) => patch(selected.id!, { commissionPct: Number(e.target.value) || undefined })} />
              </div>
            </div>

            {/* Performance */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                ["Clics", String(selected.clicks || 0)],
                ["Inscrits", String(p.signups)],
                ["Ventes", `${p.sales}${p.refunded ? ` (−${p.refunded})` : ""}`],
                ["CA net", euros(p.netAmount)],
                ["Commission générée", euros(p.commissionDue)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">{label}</p>
                  <p className="text-xl font-black text-slate-900">{value}</p>
                </div>
              ))}
              <div className="rounded-xl p-3" style={{ backgroundColor: `${ACCENT}12` }}>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-0.5">Reste à verser</p>
                <p className="text-xl font-black" style={{ color: ACCENT_INK }}>{euros(p.remaining)}</p>
                <p className="text-[10px] text-slate-500">{euros(p.paid)} versés</p>
              </div>
            </div>

            {/* Versements */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><Wallet size={12} /> Versements</p>
                {!payoutDraft && (
                  <button
                    onClick={() => setPayoutDraft({ amount: (p.remaining / 100).toFixed(2), paidAt: today(), period: "", method: "virement", note: "" })}
                    className={btnGhost}
                  >
                    <span className="flex items-center gap-1.5"><Plus size={12} /> Enregistrer un versement</span>
                  </button>
                )}
              </div>
              {payoutDraft && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end rounded-xl bg-slate-50 p-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Montant (€)</label>
                    <input className={input} value={payoutDraft.amount} onChange={(e) => setPayoutDraft({ ...payoutDraft, amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Date</label>
                    <input type="date" className={input} value={payoutDraft.paidAt} onChange={(e) => setPayoutDraft({ ...payoutDraft, paidAt: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Période</label>
                    <input className={input} value={payoutDraft.period} onChange={(e) => setPayoutDraft({ ...payoutDraft, period: e.target.value })} placeholder="septembre 2026" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Moyen</label>
                    <select className={input} value={payoutDraft.method} onChange={(e) => setPayoutDraft({ ...payoutDraft, method: e.target.value as Payout["method"] })}>
                      <option value="virement">Virement</option>
                      <option value="paypal">PayPal</option>
                      <option value="wise">Wise</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={savePayout} disabled={busy} className={btnPrimary}>Valider</button>
                    <button onClick={() => setPayoutDraft(null)} className={btnGhost}>Annuler</button>
                  </div>
                </div>
              )}
              {myPayouts.length === 0 ? (
                <p className="text-[11px] text-slate-400">Aucun versement enregistré.</p>
              ) : (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
                  {myPayouts.map((x) => (
                    <div key={x.id} className="flex items-center gap-3 px-3 py-2 text-[11px]">
                      <span className="font-mono text-slate-500">{x.paidAt}</span>
                      <span className="font-black text-slate-900">{euros(x.amount)}</span>
                      <span className="text-slate-500 truncate">{[x.method, x.period, x.note].filter(Boolean).join(" · ")}</span>
                      <button
                        onClick={async () => { if (confirm("Supprimer ce versement ?")) await deletePayout(x.id!); }}
                        className="ml-auto text-slate-400 hover:text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Notes</label>
              <textarea
                className={`${input} h-20`}
                defaultValue={selected.notes || ""}
                onBlur={(e) => patch(selected.id!, { notes: e.target.value })}
                placeholder="Conditions négociées, dates de publication, retours…"
              />
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-400">
          {stats ? `Attribution calculée ${new Date(stats.computedAt).toLocaleString("fr-FR")}` : "Attribution non chargée"}
        </p>
        <button
          onClick={() => fetchAttributionStats().then(setStats).catch((e) => setStatsError((e as Error).message))}
          className={btnGhost}
        >
          <span className="flex items-center gap-1.5"><RefreshCw size={12} /> Actualiser les ventes</span>
        </button>
      </div>
    </div>
  );
};

export default InfluenceursTab;
