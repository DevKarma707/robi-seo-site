"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X, Check, Megaphone } from "lucide-react";
import {
  subscribeToCampaigns, addCampaign, updateCampaign, deleteCampaign,
  subscribeToMarkets, saveMarket, resumerParMarche, budgetPrevu, coutPar, ctr,
  PLATFORM_META, OBJECTIF_META, AD_STATUS_META, AD_PLATFORMS, AD_OBJECTIFS, AD_STATUTS,
  MARKET_STATUT_META,
  type AdCampaign, type MarketConfig, type MarketStatut, type AdPlatform, type AdObjective, type AdStatus,
} from "@/lib/adCampaigns";
import { MARKETS, MARKET_META, marketOf, type MarketId } from "@/lib/markets";
import type { SocialPost } from "@/lib/socialPosts";
import { btnGhost, btnPill, btnPrimary, card, focusRing, input, select, sectionTitle } from "./ui";
import { toast } from "./toast";

/**
 * Vue « Campagnes » de l'onglet Réseaux : les marchés et les ads.
 *
 * Deux blocs. En haut, un panneau par marché — le compte, l'état, ce qui a
 * été publié et dépensé — pour répondre d'un regard à « où en est-on par
 * pays ? ». En dessous, les campagnes publicitaires, une ligne chacune,
 * avec leurs résultats saisis à la main.
 *
 * Pas d'API publicitaire branchée : c'est un choix. Un tableau qu'on met à
 * jour le lundi suffit à décider où remettre du budget, et il ne tombe pas
 * en panne quand Meta change une permission.
 */

const eur = (n?: number | null) =>
  n === null || n === undefined ? "—" : `${Math.round(n).toLocaleString("fr-FR")} €`;
const eur2 = (n?: number | null) =>
  n === null || n === undefined ? "—" : `${n.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €`;
const pct = (n?: number | null) =>
  n === null || n === undefined ? "—" : `${(n * 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} %`;
const num = (n?: number) => (n === undefined ? "—" : n.toLocaleString("fr-FR"));

const aujourdhui = () => new Date().toISOString().slice(0, 10);

/** Ce que le formulaire manipule : des chaînes, converties à l'enregistrement. */
interface Brouillon {
  nom: string; market: MarketId; platform: AdPlatform; objectif: AdObjective; statut: AdStatus;
  budgetJour: string; dateDebut: string; dateFin: string; hook: string; creative: string; landing: string;
  audience: string; notes: string; depense: string; impressions: string; clics: string; inscriptions: string; ventes: string;
}

const vide = (market: MarketId): Brouillon => ({
  nom: "", market, platform: "meta", objectif: "inscriptions", statut: "idee",
  budgetJour: "10", dateDebut: aujourdhui(), dateFin: "", hook: "", creative: "", landing: "",
  audience: "", notes: "", depense: "", impressions: "", clics: "", inscriptions: "", ventes: "",
});

const depuis = (c: AdCampaign): Brouillon => ({
  nom: c.nom, market: c.market, platform: c.platform, objectif: c.objectif, statut: c.statut,
  budgetJour: String(c.budgetJour ?? ""), dateDebut: c.dateDebut, dateFin: c.dateFin ?? "",
  hook: c.hook ?? "", creative: c.creative ?? "", landing: c.landing ?? "", audience: c.audience ?? "",
  notes: c.notes ?? "", depense: c.depense?.toString() ?? "", impressions: c.impressions?.toString() ?? "",
  clics: c.clics?.toString() ?? "", inscriptions: c.inscriptions?.toString() ?? "", ventes: c.ventes?.toString() ?? "",
});

const nombre = (s: string): number | undefined => {
  const v = Number(String(s).replace(",", ".").trim());
  return s.trim() === "" || Number.isNaN(v) ? undefined : v;
};

const versCampagne = (b: Brouillon): Omit<AdCampaign, "id"> | string => {
  if (!b.nom.trim()) return "Un nom est requis — l'angle testé, par exemple « 22h47 · artisans »." ;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.dateDebut)) return "Date de début au format AAAA-MM-JJ.";
  if (b.dateFin && !/^\d{4}-\d{2}-\d{2}$/.test(b.dateFin)) return "Date de fin au format AAAA-MM-JJ.";
  if (b.dateFin && b.dateFin < b.dateDebut) return "La fin est avant le début.";
  const budgetJour = nombre(b.budgetJour);
  if (budgetJour === undefined || budgetJour < 0) return "Budget quotidien invalide.";
  const chiffres = nombre(b.depense) !== undefined || nombre(b.clics) !== undefined || nombre(b.inscriptions) !== undefined;
  return {
    nom: b.nom.trim(), market: b.market, platform: b.platform, objectif: b.objectif, statut: b.statut,
    budgetJour, dateDebut: b.dateDebut,
    dateFin: b.dateFin || undefined,
    hook: b.hook.trim() || undefined, creative: b.creative.trim() || undefined, landing: b.landing.trim() || undefined,
    audience: b.audience.trim() || undefined, notes: b.notes.trim() || undefined,
    depense: nombre(b.depense), impressions: nombre(b.impressions), clics: nombre(b.clics),
    inscriptions: nombre(b.inscriptions), ventes: nombre(b.ventes),
    resultatsAu: chiffres ? aujourdhui() : undefined,
  };
};

/**
 * Déclaré hors du composant : défini à l'intérieur, React le verrait comme un
 * nouveau type à chaque rendu et démonterait le champ à chaque frappe — le
 * curseur sauterait hors de l'input au premier caractère.
 */
const Champ = ({ label, children, large }: { label: string; children: React.ReactNode; large?: boolean }) => (
  <label className={`block ${large ? "sm:col-span-2" : ""}`}>
    <span className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</span>
    {children}
  </label>
);

const CampagnesBlock: React.FC<{ marche: MarketId | "all"; posts: SocialPost[] }> = ({ marche, posts }) => {
  const [rows, setRows] = useState<AdCampaign[]>([]);
  const [configs, setConfigs] = useState<MarketConfig[]>([]);
  const [edit, setEdit] = useState<{ id: string | null; b: Brouillon } | null>(null);
  const [busy, setBusy] = useState(false);
  const [suppressionArmee, setSuppressionArmee] = useState<string | null>(null);

  useEffect(() => {
    const u1 = subscribeToCampaigns(setRows, (e) => toast("err", String(e)));
    const u2 = subscribeToMarkets(setConfigs, (e) => toast("err", String(e)));
    return () => { u1(); u2(); };
  }, []);

  const configDe = (id: MarketId): MarketConfig =>
    configs.find((c) => c.id === id) ?? { id, statut: id === "fr" ? "actif" : "plus-tard" };

  const resume = useMemo(() => resumerParMarche(rows), [rows]);
  const visibles = useMemo(
    () => rows.filter((c) => marche === "all" || c.market === marche),
    [rows, marche]
  );
  const marchesAffiches = MARKETS.filter((m) => marche === "all" || m.id === marche);

  const enregistrer = async () => {
    if (!edit) return;
    const c = versCampagne(edit.b);
    if (typeof c === "string") { toast("err", c); return; }
    setBusy(true);
    try {
      if (edit.id) await updateCampaign(edit.id, c);
      else await addCampaign(c);
      setEdit(null);
      toast("ok", edit.id ? "Campagne mise à jour." : "Campagne créée.");
    } catch (e) {
      toast("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const supprimer = async (id: string) => {
    if (suppressionArmee !== id) { setSuppressionArmee(id); return; }
    try {
      await deleteCampaign(id);
      setSuppressionArmee(null);
      if (edit?.id === id) setEdit(null);
    } catch (e) {
      toast("err", (e as Error).message);
    }
  };

  const changerStatut = async (c: AdCampaign, statut: AdStatus) => {
    try { await updateCampaign(c.id!, { statut }); } catch (e) { toast("err", (e as Error).message); }
  };

  return (
    <div className="space-y-5">
      {/* ── Marchés ── */}
      <div className={`grid gap-3 ${marchesAffiches.length > 1 ? "md:grid-cols-2 xl:grid-cols-4" : ""}`}>
        {marchesAffiches.map((m) => {
          const cfg = configDe(m.id);
          const r = resume.find((x) => x.market === m.id)!;
          const ps = posts.filter((p) => marketOf(p) === m.id);
          const publies = ps.filter((p) => p.status === "published").length;
          const prets = ps.filter((p) => p.status === "ready").length;
          const brouillons = ps.filter((p) => p.status === "draft").length;
          const st = MARKET_STATUT_META[cfg.statut];
          return (
            <MarcheCarte
              key={`${m.id}-${cfg.updatedAt?.toMillis?.() ?? 0}`}
              market={m.id} cfg={cfg} statutColor={st.color}
              stats={{ publies, prets, brouillons, actives: r.actives, depense: r.depense, inscriptions: r.inscriptions, cpa: r.cpa, budgetPrevu: r.budgetPrevu }}
            />
          );
        })}
      </div>

      {/* ── Campagnes ── */}
      <div className={`${card} p-5 space-y-4`}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={sectionTitle}><span className="flex items-center gap-1.5"><Megaphone size={14} /> Campagnes ads</span></h3>
          <span className="text-[11px] text-slate-400">
            {visibles.length ? `${visibles.length} campagne${visibles.length > 1 ? "s" : ""}` : "aucune campagne"}
            {marche !== "all" ? ` · ${MARKET_META[marche].drapeau} ${MARKET_META[marche].label}` : ""}
          </span>
          <button
            onClick={() => setEdit({ id: null, b: vide(marche === "all" ? "fr" : marche) })}
            className={`${btnPrimary} ml-auto`}
          >
            <span className="flex items-center gap-1.5"><Plus size={12} /> Nouvelle campagne</span>
          </button>
        </div>

        {edit && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Champ label="Nom (l'angle testé)" large>
                <input className={input} value={edit.b.nom} autoFocus placeholder="22h47 · artisans · vidéo"
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, nom: e.target.value } })} />
              </Champ>
              <Champ label="Marché">
                <select className={`${select} w-full`} value={edit.b.market}
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, market: e.target.value as MarketId } })}>
                  {MARKETS.map((m) => <option key={m.id} value={m.id}>{m.drapeau} {m.label}</option>)}
                </select>
              </Champ>
              <Champ label="Plateforme">
                <select className={`${select} w-full`} value={edit.b.platform}
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, platform: e.target.value as AdPlatform } })}>
                  {AD_PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_META[p].label}</option>)}
                </select>
              </Champ>
              <Champ label="Objectif">
                <select className={`${select} w-full`} value={edit.b.objectif}
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, objectif: e.target.value as AdObjective } })}>
                  {AD_OBJECTIFS.map((o) => <option key={o} value={o}>{OBJECTIF_META[o].label}</option>)}
                </select>
              </Champ>
              <Champ label="Statut">
                <select className={`${select} w-full`} value={edit.b.statut}
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, statut: e.target.value as AdStatus } })}>
                  {AD_STATUTS.map((s) => <option key={s} value={s}>{AD_STATUS_META[s].label}</option>)}
                </select>
              </Champ>
              <Champ label="Budget / jour (€)">
                <input className={input} inputMode="decimal" value={edit.b.budgetJour}
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, budgetJour: e.target.value } })} />
              </Champ>
              <Champ label="Début">
                <input className={input} type="date" value={edit.b.dateDebut}
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, dateDebut: e.target.value } })} />
              </Champ>
              <Champ label="Fin">
                <input className={input} type="date" value={edit.b.dateFin}
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, dateFin: e.target.value } })} />
              </Champ>
              <Champ label="Accroche (hook)" large>
                <input className={input} value={edit.b.hook} placeholder="Première seconde de la vidéo / titre du visuel"
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, hook: e.target.value } })} />
              </Champ>
              <Champ label="Audience" large>
                <input className={input} value={edit.b.audience} placeholder="FR · 25-55 · intérêts artisanat, auto-entrepreneur"
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, audience: e.target.value } })} />
              </Champ>
              <Champ label="Visuel / vidéo (URL)" large>
                <input className={input} value={edit.b.creative} placeholder="https://…"
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, creative: e.target.value } })} />
              </Champ>
              <Champ label="Page d'atterrissage (avec UTM)" large>
                <input className={input} value={edit.b.landing} placeholder="https://robi-app.com/?utm_source=meta&utm_campaign=…"
                  onChange={(e) => setEdit({ ...edit, b: { ...edit.b, landing: e.target.value } })} />
              </Champ>
            </div>

            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 mb-1">Résultats (à recopier du gestionnaire de pubs)</p>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
                {([["depense", "Dépensé (€)"], ["impressions", "Impressions"], ["clics", "Clics"], ["inscriptions", "Inscriptions"], ["ventes", "Ventes"]] as const).map(([k, label]) => (
                  <Champ key={k} label={label}>
                    <input className={input} inputMode="decimal" value={edit.b[k]}
                      onChange={(e) => setEdit({ ...edit, b: { ...edit.b, [k]: e.target.value } })} />
                  </Champ>
                ))}
              </div>
            </div>

            <Champ label="Notes" large>
              <textarea className={`${input} min-h-[60px] resize-y`} value={edit.b.notes}
                onChange={(e) => setEdit({ ...edit, b: { ...edit.b, notes: e.target.value } })} />
            </Champ>

            <div className="flex items-center gap-2">
              <button onClick={enregistrer} disabled={busy} className={btnPrimary}>
                <span className="flex items-center gap-1.5"><Check size={12} /> {edit.id ? "Enregistrer" : "Créer"}</span>
              </button>
              <button onClick={() => setEdit(null)} className={btnGhost}>
                <span className="flex items-center gap-1.5"><X size={12} /> Annuler</span>
              </button>
            </div>
          </div>
        )}

        {visibles.length === 0 ? (
          <p className="text-[12.5px] text-slate-500">
            Aucune campagne pour l&apos;instant. Une campagne = un marché, une plateforme, un angle. Les résultats se saisissent à la main, une fois par semaine.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[12px] min-w-[900px]">
              <thead>
                <tr className="text-left text-[10.5px] uppercase tracking-wider text-slate-400">
                  <th className="px-2 py-1.5 font-bold">Marché</th>
                  <th className="px-2 py-1.5 font-bold">Campagne</th>
                  <th className="px-2 py-1.5 font-bold">Statut</th>
                  <th className="px-2 py-1.5 font-bold">Période</th>
                  <th className="px-2 py-1.5 font-bold text-right">Budget/j</th>
                  <th className="px-2 py-1.5 font-bold text-right">Prévu</th>
                  <th className="px-2 py-1.5 font-bold text-right">Dépensé</th>
                  <th className="px-2 py-1.5 font-bold text-right">CTR</th>
                  <th className="px-2 py-1.5 font-bold text-right">Clics</th>
                  <th className="px-2 py-1.5 font-bold text-right">Inscr.</th>
                  <th className="px-2 py-1.5 font-bold text-right">CPA</th>
                  <th className="px-2 py-1.5 font-bold text-right">Ventes</th>
                  <th className="px-2 py-1.5" />
                </tr>
              </thead>
              <tbody>
                {visibles.map((c) => {
                  const m = MARKET_META[c.market];
                  const st = AD_STATUS_META[c.statut];
                  return (
                    <tr key={c.id} className={`border-t border-slate-100 ${edit?.id === c.id ? "bg-slate-50" : "hover:bg-slate-50/60"}`}>
                      <td className="px-2 py-2 whitespace-nowrap" title={m.label}>{m.drapeau} <span className="text-slate-500">{m.id.toUpperCase()}</span></td>
                      <td className="px-2 py-2 min-w-[200px]">
                        <button onClick={() => setEdit({ id: c.id!, b: depuis(c) })} className={`text-left ${focusRing} rounded`}>
                          <span className="block font-semibold text-slate-800">{c.nom}</span>
                          <span className="block text-[11px] text-slate-500">
                            <span style={{ color: PLATFORM_META[c.platform].color }} className="font-bold">{PLATFORM_META[c.platform].label}</span>
                            {" · "}{OBJECTIF_META[c.objectif].label}
                            {c.hook ? <> · <em>« {c.hook} »</em></> : null}
                          </span>
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={c.statut}
                          onChange={(e) => changerStatut(c, e.target.value as AdStatus)}
                          className={`${btnPill} !py-1 !px-2 border`}
                          style={{ color: st.color, borderColor: `${st.color}66` }}
                          title="Changer le statut"
                        >
                          {AD_STATUTS.map((s) => <option key={s} value={s}>{AD_STATUS_META[s].label}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-slate-600 tabular-nums">
                        {c.dateDebut.slice(5)}{c.dateFin ? ` → ${c.dateFin.slice(5)}` : " → ∞"}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">{eur(c.budgetJour)}</td>
                      <td className="px-2 py-2 text-right tabular-nums text-slate-500">{c.dateFin ? eur(budgetPrevu(c)) : "—"}</td>
                      <td className="px-2 py-2 text-right tabular-nums font-semibold">{eur(c.depense)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{pct(ctr(c.impressions, c.clics))}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{num(c.clics)}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{num(c.inscriptions)}</td>
                      <td className="px-2 py-2 text-right tabular-nums font-semibold">{eur2(coutPar(c.depense, c.inscriptions))}</td>
                      <td className="px-2 py-2 text-right tabular-nums">{num(c.ventes)}</td>
                      <td className="px-2 py-2 text-right whitespace-nowrap">
                        <button
                          onClick={() => supprimer(c.id!)}
                          onBlur={() => setSuppressionArmee((s) => (s === c.id ? null : s))}
                          className={`${btnGhost} !px-2 ${suppressionArmee === c.id ? "!text-red-600 !border-red-300" : ""}`}
                          title={suppressionArmee === c.id ? "Cliquer encore pour supprimer" : "Supprimer"}
                        >
                          <span className="flex items-center gap-1"><Trash2 size={11} />{suppressionArmee === c.id ? " Sûr ?" : ""}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200 text-[11.5px] font-bold text-slate-700">
                  <td className="px-2 py-2" colSpan={5}>Total</td>
                  <td className="px-2 py-2 text-right tabular-nums">{eur(visibles.filter((c) => c.statut !== "terminee").reduce((s, c) => s + budgetPrevu(c), 0))}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{eur(visibles.reduce((s, c) => s + (c.depense || 0), 0))}</td>
                  <td className="px-2 py-2" />
                  <td className="px-2 py-2 text-right tabular-nums">{num(visibles.reduce((s, c) => s + (c.clics || 0), 0))}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{num(visibles.reduce((s, c) => s + (c.inscriptions || 0), 0))}</td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {eur2(coutPar(visibles.reduce((s, c) => s + (c.depense || 0), 0), visibles.reduce((s, c) => s + (c.inscriptions || 0), 0)))}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">{num(visibles.reduce((s, c) => s + (c.ventes || 0), 0))}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * La carte d'un marché. Les champs se sauvent en quittant le champ : un
 * handle ou une date changent une fois par mois, un bouton « Enregistrer »
 * serait un geste de plus pour rien.
 */
const MarcheCarte = ({
  market, cfg, statutColor, stats,
}: {
  market: MarketId;
  cfg: MarketConfig;
  statutColor: string;
  stats: { publies: number; prets: number; brouillons: number; actives: number; depense: number; inscriptions: number; cpa: number | null; budgetPrevu: number };
}) => {
  const m = MARKET_META[market];
  // État local initialisé depuis la config ; la carte est remontée par sa
  // `key` (voir l'appelant) quand la config change côté serveur, ce qui
  // évite un effet qui recopierait les props dans l'état.
  const [local, setLocal] = useState({ instagram: cfg.instagram ?? "", tiktok: cfg.tiktok ?? "", lancement: cfg.lancement ?? "", pays: cfg.pays ?? m.pays.join(", "), notes: cfg.notes ?? "" });

  const sauver = async (patch: Partial<MarketConfig>) => {
    try { await saveMarket(market, patch); } catch (e) { toast("err", (e as Error).message); }
  };
  const champ = "w-full bg-transparent border-b border-dashed border-slate-300 focus:border-slate-500 focus:outline-none text-[12px] text-slate-800 py-0.5";

  return (
    <div className={`${card} p-4 space-y-3`}>
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none">{m.drapeau}</span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-slate-900 leading-tight">{m.label}</p>
          <p className="text-[11px] text-slate-500">{m.langue} · « {m.adresse} » · {m.devise}</p>
        </div>
        <select
          value={cfg.statut}
          onChange={(e) => sauver({ statut: e.target.value as MarketStatut })}
          className={`${btnPill} ml-auto !py-1 !px-2 border text-[11px]`}
          style={{ color: statutColor, borderColor: `${statutColor}66` }}
        >
          {(Object.keys(MARKET_STATUT_META) as MarketStatut[]).map((s) => <option key={s} value={s}>{MARKET_STATUT_META[s].label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        {([
          ["Publiés", stats.publies], ["Prêts", stats.prets], ["Brouillons", stats.brouillons],
        ] as const).map(([l, v]) => (
          <div key={l} className="rounded-lg bg-slate-50 py-1.5">
            <p className="text-[15px] font-black tabular-nums text-slate-900 leading-none">{v}</p>
            <p className="text-[9.5px] uppercase tracking-wider text-slate-400 mt-0.5">{l}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 py-1.5">
          <p className="text-[15px] font-black tabular-nums text-slate-900 leading-none">{stats.actives}</p>
          <p className="text-[9.5px] uppercase tracking-wider text-slate-400 mt-0.5">Ads actives</p>
        </div>
        <div className="rounded-lg bg-slate-50 py-1.5">
          <p className="text-[15px] font-black tabular-nums text-slate-900 leading-none">{eur(stats.depense)}</p>
          <p className="text-[9.5px] uppercase tracking-wider text-slate-400 mt-0.5">Dépensé</p>
        </div>
        <div className="rounded-lg bg-slate-50 py-1.5">
          <p className="text-[15px] font-black tabular-nums text-slate-900 leading-none">{eur2(stats.cpa)}</p>
          <p className="text-[9.5px] uppercase tracking-wider text-slate-400 mt-0.5">CPA</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {([
          ["instagram", "Instagram", "@compte"],
          ["tiktok", "TikTok", "@compte"],
          ["lancement", "Lancement", "AAAA-MM"],
          ["pays", "Pays ads", "FR, BE, CH"],
        ] as const).map(([k, label, ph]) => (
          <label key={k} className="flex items-baseline gap-2">
            <span className="w-16 flex-none text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
            <input
              className={champ}
              placeholder={ph}
              value={local[k]}
              onChange={(e) => setLocal({ ...local, [k]: e.target.value })}
              onBlur={() => { if (local[k] !== (cfg[k] ?? (k === "pays" ? m.pays.join(", ") : ""))) void sauver({ [k]: local[k].trim() }); }}
            />
          </label>
        ))}
        <textarea
          className={`${champ} resize-y min-h-[34px] text-[11.5px] text-slate-600`}
          placeholder="Notes : ce qui bloque, ce qui est décidé…"
          value={local.notes}
          onChange={(e) => setLocal({ ...local, notes: e.target.value })}
          onBlur={() => { if (local.notes !== (cfg.notes ?? "")) void sauver({ notes: local.notes.trim() }); }}
        />
      </div>
    </div>
  );
};

export default CampagnesBlock;
