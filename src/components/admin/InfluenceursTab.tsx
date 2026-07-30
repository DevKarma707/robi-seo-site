"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Megaphone, Plus, RefreshCw, AlertTriangle, Trash2, ExternalLink, Ticket, Check,
} from "lucide-react";
import {
  subscribeToInfluencers, addInfluencer, updateInfluencer, deleteInfluencer,
  suggestPromoCode, perfOf, euros,
  PLATFORM_META, PLATFORMS, STATUS_META, INFLUENCER_PIPELINE,
  type Influencer, type InfluencerPlatform, type InfluencerStatus, type AttributionStats,
} from "@/lib/influencers";
import { fetchAttributionStats } from "@/lib/adminApi";

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

const EMPTY: Omit<Influencer, "id"> = {
  name: "", platform: "instagram", status: "prospect", discountPct: 20, commissionPct: 20,
};

const InfluenceursTab: React.FC = () => {
  const [rows, setRows] = useState<Influencer[]>([]);
  const [stats, setStats] = useState<AttributionStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<Influencer, "id"> | null>(null);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToInfluencers(setRows, (e) => setFlash({ kind: "err", text: String(e) }));
    fetchAttributionStats()
      .then(setStats)
      .catch((e) => setStatsError((e as Error).message));
    return () => unsub();
  }, []);

  const say = (kind: "ok" | "err", text: string) => {
    setFlash({ kind, text });
    setTimeout(() => setFlash(null), 4000);
  };

  const selected = rows.find((r) => r.id === selectedId) || null;

  const totals = useMemo(() => {
    let sales = 0, net = 0, commission = 0, unmatched = 0;
    for (const inf of rows) {
      const p = perfOf(inf, stats);
      sales += p.sales;
      net += p.netAmount;
      commission += p.commissionDue;
      if (inf.status === "actif" && (inf.promoCode || inf.polarDiscountId) && !p.matched) unmatched++;
    }
    return { sales, net, commission, unmatched };
  }, [rows, stats]);

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
      say("ok", "Influenceur ajouté.");
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

  return (
    <div className="space-y-6">
      {/* Bandeau explicatif */}
      <div className={`${card} p-5`}>
        <div className="flex items-start gap-2.5">
          <Ticket size={16} style={{ color: ACCENT }} className="mt-0.5 flex-shrink-0" />
          <div className="space-y-1.5">
            <p className="font-black text-sm text-white">Comment l&apos;attribution fonctionne</p>
            <p className="text-[11px] text-white/55 leading-relaxed">
              Tu crées un code promo dans Polar (Products → Discounts), tu le colles ici, et
              chaque achat effectué avec ce code est automatiquement rattaché à l&apos;influenceur
              par le webhook. Aucune plateforme d&apos;affiliation, aucun abonnement à payer.
              <br />
              Les ventes remboursées sont exclues du calcul de commission — donc le montant
              affiché est celui que tu dois réellement.
            </p>
          </div>
        </div>
      </div>

      {statsError && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-white/60">
            Ventes attribuées indisponibles : {statsError}. Les fiches restent modifiables.
          </p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/40">Ventes attribuées</p>
          <span className="font-black text-3xl text-white">{totals.sales}</span>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/40">CA net généré</p>
          <span className="font-black text-3xl" style={{ color: ACCENT }}>{euros(totals.net)}</span>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/40">Commissions dues</p>
          <span className="font-black text-3xl text-white">{euros(totals.commission)}</span>
        </div>
        <div className={`${card} p-4`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-white/40">Partenaires actifs</p>
          <span className="font-black text-3xl text-white">{counts.actif || 0}</span>
          <p className="text-[11px] mt-1 text-white/40">{rows.length} fiche(s) au total</p>
        </div>
      </div>

      {/* Alertes de cohérence */}
      {totals.unmatched > 0 && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-white/60">
            <span className="text-amber-300 font-bold">{totals.unmatched} partenaire(s) actif(s) sans aucune vente rattachée.</span>{" "}
            Soit le code n&apos;a pas encore servi, soit il ne correspond pas à celui de Polar —
            vérifie l&apos;orthographe exacte ou colle l&apos;id du discount.
          </p>
        </div>
      )}
      {orphans.length > 0 && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-amber-300 font-bold mb-1">
                Des ventes utilisent un code qu&apos;aucune fiche ne revendique
              </p>
              <div className="space-y-0.5">
                {orphans.map((o) => (
                  <p key={o.discountId} className="text-[11px] text-white/60 font-mono">
                    {o.code || o.discountId} · {o.sales} vente(s) · {euros(o.netAmount)}
                  </p>
                ))}
              </div>
              <p className="text-[10px] text-white/35 mt-1.5">
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
            <span className="text-[11px] text-white/60">{STATUS_META[s].label}</span>
            <span className="text-[13px] font-black text-white">{counts[s] || 0}</span>
          </div>
        ))}
        <button onClick={() => setDraft({ ...EMPTY })} className={`${btnPrimary} ml-auto`}>
          <span className="flex items-center gap-1.5"><Plus size={12} /> Nouvel influenceur</span>
        </button>
      </div>

      {/* Formulaire de création */}
      {draft && (
        <div className={`${card} p-5 space-y-4`}>
          <p className="text-xs font-black uppercase tracking-widest text-white">Nouvel influenceur</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Nom *</label>
              <input
                className={input} value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Marie Dupont"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Pseudo</label>
              <input className={input} value={draft.handle || ""} onChange={(e) => setDraft({ ...draft, handle: e.target.value })} placeholder="@mariedupont" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Plateforme</label>
              <select className={input} value={draft.platform} onChange={(e) => setDraft({ ...draft, platform: e.target.value as InfluencerPlatform })}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_META[p].label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Abonnés</label>
              <input type="number" className={input} value={draft.audience ?? ""} onChange={(e) => setDraft({ ...draft, audience: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Email</label>
              <input className={input} value={draft.email || ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Lien</label>
              <input className={input} value={draft.url || ""} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="instagram.com/…" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Remise client (%)</label>
              <input type="number" className={input} value={draft.discountPct ?? ""} onChange={(e) => setDraft({ ...draft, discountPct: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Commission (%)</label>
              <input type="number" className={input} value={draft.commissionPct ?? ""} onChange={(e) => setDraft({ ...draft, commissionPct: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Code promo</label>
              <div className="flex gap-1.5">
                <input className={input} value={draft.promoCode || ""} onChange={(e) => setDraft({ ...draft, promoCode: e.target.value.toUpperCase() })} placeholder="MARIE20" />
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
          <p className="text-[10px] text-white/30">
            Le code doit exister à l&apos;identique dans Polar (Products → Discounts) pour que
            l&apos;attribution fonctionne.
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
          <Megaphone size={24} className="mx-auto mb-3 text-white/20" />
          <p className="text-sm text-white/50">Aucun influenceur pour l&apos;instant.</p>
          <p className="text-[11px] text-white/30 mt-1">
            Tu peux aussi les prospecter depuis l&apos;onglet Acquisition (segment « Influenceurs »)
            puis convertir la fiche ici.
          </p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {["Influenceur", "Code", "Ventes", "CA net", "Commission", "Statut"].map((h) => (
                    <th key={h} className="text-[10px] font-bold uppercase tracking-widest text-white/40 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((inf) => {
                  const p = perfOf(inf, stats);
                  return (
                    <tr
                      key={inf.id}
                      onClick={() => setSelectedId(selectedId === inf.id ? null : inf.id!)}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PLATFORM_META[inf.platform].color }} />
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-white truncate">{inf.name}</p>
                            <p className="text-[10px] text-white/35 truncate">
                              {[inf.handle, PLATFORM_META[inf.platform].label, inf.audience ? `${inf.audience.toLocaleString("fr-FR")} abonnés` : null].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {inf.promoCode ? (
                          <code className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}>{inf.promoCode}</code>
                        ) : <span className="text-[11px] text-white/25">—</span>}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-black text-white">
                        {p.sales}
                        {p.refunded > 0 && <span className="text-[10px] text-red-400 font-bold ml-1">−{p.refunded}</span>}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-bold text-white/80">{euros(p.netAmount)}</td>
                      <td className="px-4 py-3 text-[13px] font-black" style={{ color: p.commissionDue > 0 ? ACCENT : "rgba(255,255,255,0.25)" }}>
                        {euros(p.commissionDue)}
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
      {selected && (
        <div className={`${card} p-5 space-y-4`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-black text-lg text-white truncate">{selected.name}</p>
              <p className="text-[11px] text-white/40">
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
                className={`${btn} bg-red-500/15 text-red-400 hover:bg-red-500/25`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Statut */}
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(STATUS_META) as InfluencerStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => patch(selected.id!, { status: s, ...(s === "actif" && !selected.signedAt ? { signedAt: new Date().toISOString().slice(0, 10) } : {}) })}
                className={`${btn} ${selected.status === s ? "text-black" : "bg-white/10 text-white/60 hover:bg-white/20"}`}
                style={selected.status === s ? { backgroundColor: STATUS_META[s].color } : undefined}
              >
                {STATUS_META[s].label}
              </button>
            ))}
          </div>

          {/* Réglages du partenariat */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Code promo</label>
              <input
                className={input}
                defaultValue={selected.promoCode || ""}
                onBlur={(e) => patch(selected.id!, { promoCode: e.target.value.toUpperCase().trim() || undefined })}
                placeholder="MARIE20"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Id discount Polar</label>
              <input
                className={input}
                defaultValue={selected.polarDiscountId || ""}
                onBlur={(e) => patch(selected.id!, { polarDiscountId: e.target.value.trim() || undefined })}
                placeholder="optionnel, plus fiable"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Remise client (%)</label>
              <input type="number" className={input} defaultValue={selected.discountPct ?? ""} onBlur={(e) => patch(selected.id!, { discountPct: Number(e.target.value) || undefined })} />
            </div>
            <div>
              <label className="text-[11px] font-bold text-white/50 block mb-1.5">Commission (%)</label>
              <input type="number" className={input} defaultValue={selected.commissionPct ?? ""} onBlur={(e) => patch(selected.id!, { commissionPct: Number(e.target.value) || undefined })} />
            </div>
          </div>

          {/* Performance */}
          {(() => {
            const p = perfOf(selected, stats);
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Ventes</p>
                  <p className="text-xl font-black text-white">{p.sales}</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">Remboursées</p>
                  <p className="text-xl font-black text-white">{p.refunded}</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">CA net</p>
                  <p className="text-xl font-black text-white">{euros(p.netAmount)}</p>
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: `${ACCENT}12` }}>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-0.5">À verser</p>
                  <p className="text-xl font-black" style={{ color: ACCENT }}>{euros(p.commissionDue)}</p>
                </div>
              </div>
            );
          })()}

          <div>
            <label className="text-[11px] font-bold text-white/50 block mb-1.5">Notes</label>
            <textarea
              className={`${input} h-20`}
              defaultValue={selected.notes || ""}
              onBlur={(e) => patch(selected.id!, { notes: e.target.value })}
              placeholder="Conditions négociées, dates de publication, retours…"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-[10px] text-white/25">
          {stats ? `Attribution calculée ${new Date(stats.computedAt).toLocaleString("fr-FR")}` : "Attribution non chargée"}
        </p>
        <button
          onClick={() => fetchAttributionStats().then(setStats).catch((e) => setStatsError((e as Error).message))}
          className={btnGhost}
        >
          <span className="flex items-center gap-1.5"><RefreshCw size={12} /> Actualiser les ventes</span>
        </button>
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

export default InfluenceursTab;
