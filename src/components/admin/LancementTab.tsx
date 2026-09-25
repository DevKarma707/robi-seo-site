"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Rocket, RefreshCw, AlertTriangle, Save, Check, ShieldAlert, Plus, Trash2, Layers } from "lucide-react";
import {
  fetchLaunchConfig, saveLaunchConfig, computeDisplayedSold, type LaunchConfig, type LaunchTranche,
} from "@/lib/adminApi";
import { ACCENT, ACCENT_INK, btn, card, input as inputBase } from "./ui";

// Champ partagé + graisse : ici tous les champs portent une valeur de
// config (places, date limite), le gras les distingue du texte d'aide.
const input = `${inputBase} font-bold`;

const LancementTab: React.FC = () => {
  const [config, setConfig] = useState<LaunchConfig | null>(null);
  const [draft, setDraft] = useState<LaunchConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Brouillon des tranches, édité à part : une ligne par tranche, la
  // dernière peut être « ouverte » (places vides = sans limite).
  const [tranchesDraft, setTranchesDraft] = useState<{ seats: string; productId: string }[]>([]);
  const syncTranches = (c: LaunchConfig) =>
    setTranchesDraft((c.tranches || []).map((t) => ({ seats: t.seats === null ? "" : String(t.seats), productId: t.productId || "" })));

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await fetchLaunchConfig();
      setConfig(c);
      setDraft(c);
      syncTranches(c);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (patch: Partial<Omit<LaunchConfig, "realSold">>) => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const c = await saveLaunchConfig(patch);
      setConfig(c);
      setDraft(c);
      syncTranches(c);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !config) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement de l&apos;offre…
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className={`${card} p-5 space-y-2`}>
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle size={16} />
          <p className="font-black text-sm">Configuration indisponible</p>
        </div>
        <p className="text-xs text-slate-600">{error}</p>
        <button onClick={load} className={`${btn} mt-2`}>
          Réessayer
        </button>
      </div>
    );
  }

  if (!config || !draft) return null;

  const displayed = computeDisplayedSold(config);
  const remaining = Math.max(0, config.totalSeats - displayed);
  const padded = displayed > config.realSold;

  return (
    <div className="space-y-6">
      {/* État de l'offre */}
      <div className={`${card} p-5`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <Rocket size={15} style={{ color: ACCENT_INK }} />
            <p className="text-xs font-black uppercase tracking-widest text-slate-900">Offre de lancement</p>
          </div>
          <button
            onClick={() => save({ enabled: !config.enabled })}
            disabled={saving}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-40 ${
              config.enabled ? "bg-[var(--color-accent)] text-[var(--color-text-on-accent)]" : "bg-slate-100 text-slate-600"
            }`}
          >
            {config.enabled ? "Active" : "Désactivée"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Affiché sur le site</p>
            <p className="font-black text-3xl" style={{ color: ACCENT_INK }}>{displayed}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Ventes réelles</p>
            <p className="font-black text-3xl text-slate-900">{config.realSold}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Places restantes</p>
            <p className="font-black text-3xl text-slate-900">{remaining}</p>
          </div>
        </div>

        {!config.enabled && (
          <p className="text-[11px] text-slate-500 mt-4">
            L&apos;offre est retirée du site et de l&apos;app. Le compteur n&apos;est plus affiché.
          </p>
        )}
      </div>

      {/* Réglages */}
      <div className={`${card} p-5 space-y-5`}>
        <p className="text-xs font-black uppercase tracking-widest text-slate-900">Réglages</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Nombre total de places</label>
            <input
              type="number" min={1} className={input} value={draft.totalSeats}
              readOnly={(config.tranches?.length ?? 0) > 1}
              onChange={(e) => setDraft({ ...draft, totalSeats: Number(e.target.value) })}
            />
            {(config.tranches?.length ?? 0) > 1 && (
              <p className="text-[10px] text-slate-400 mt-1.5">Calculé depuis les tranches ci-dessous.</p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Date limite de l&apos;offre</label>
            <input
              type="date" className={input} value={draft.deadline?.slice(0, 10) || ""}
              onChange={(e) => setDraft({ ...draft, deadline: e.target.value || null })}
            />
            <p className="text-[10px] text-slate-400 mt-1.5">
              Le levier d&apos;urgence honnête : vraie date, vraie fin.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
              Chiffre de départ <span className="text-slate-400">(ajouté aux ventes réelles)</span>
            </label>
            <input
              type="number" min={0} className={input} value={draft.baseOffset}
              onChange={(e) => setDraft({ ...draft, baseOffset: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
              Forçage manuel <span className="text-slate-400">(vide = automatique)</span>
            </label>
            <input
              type="number" min={0} className={input}
              value={draft.manualOverride ?? ""}
              placeholder="automatique"
              onChange={(e) => setDraft({ ...draft, manualOverride: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Formule appliquée : <code className="text-[var(--admin-ink)]">forçage ?? (départ + ventes réelles)</code>,
          plafonné au nombre total de places. Le compteur avance donc tout seul à
          chaque vente.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => save({
              totalSeats: draft.totalSeats,
              baseOffset: draft.baseOffset,
              manualOverride: draft.manualOverride,
              deadline: draft.deadline,
            })}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-[var(--color-text-on-accent)] text-xs font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-40"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            Enregistrer
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: ACCENT_INK }}>
              <Check size={13} /> Enregistré
            </span>
          )}
          {error && <span className="text-[11px] text-red-600">{error}</span>}
        </div>
      </div>

      {/* Tranches */}
      <div className={`${card} p-5 space-y-4`}>
        <div className="flex items-center gap-2">
          <Layers size={15} style={{ color: ACCENT_INK }} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">Tranches de prix</p>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-[70ch]">
          Le Lifetime se vend par tranches : quand les places d&apos;une tranche sont vendues, la
          suivante devient courante et son prix s&apos;affiche partout (site, app). Chaque tranche
          est un <b>produit Polar</b> : crée-le dans Polar au bon prix, colle son identifiant ici.
          Une tranche sans produit n&apos;est pas vendable. Laisse les places vides sur la
          dernière pour qu&apos;elle reste ouverte ; sinon l&apos;offre s&apos;arrête quand tout est vendu.
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed max-w-[70ch]">
          Avec des tranches, le compteur suit <b>uniquement les ventes réelles</b> : le chiffre de
          départ et le forçage manuel sont ignorés. Un prix ne monte que sur de vraies ventes.
        </p>

        <div className="space-y-2">
          {tranchesDraft.map((t, i) => {
            const courante = config.tranche?.index === i;
            const prix = t.productId && config.tranchePrices ? config.tranchePrices[t.productId] : null;
            const derniere = i === tranchesDraft.length - 1;
            return (
              <div key={i} className={`grid grid-cols-[auto_1fr_2fr_auto_auto] items-center gap-2 rounded-xl border p-2 ${courante ? "border-[var(--color-accent)]" : "border-slate-200"}`}>
                <span className="text-[11px] font-black text-slate-500 w-14">
                  {courante ? "▶ " : ""}T{i + 1}
                </span>
                <input
                  id={`tranche-seats-${i}`}
                  type="number" min={1} className={input}
                  placeholder={derniere ? "ouverte" : "places"}
                  value={t.seats}
                  onChange={(e) => setTranchesDraft(tranchesDraft.map((x, j) => j === i ? { ...x, seats: e.target.value } : x))}
                />
                <input
                  id={`tranche-product-${i}`}
                  className={`${input} font-mono text-[11px]`}
                  placeholder="id produit Polar"
                  value={t.productId}
                  onChange={(e) => setTranchesDraft(tranchesDraft.map((x, j) => j === i ? { ...x, productId: e.target.value } : x))}
                />
                <span className="text-xs font-black text-slate-900 tabular-nums w-16 text-right">
                  {prix ? `${prix.amount} ${prix.currency === "EUR" ? "€" : prix.currency}` : t.productId ? "?" : "—"}
                </span>
                <button
                  onClick={() => setTranchesDraft(tranchesDraft.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600" title="Retirer la tranche"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {config.tranche && (
          <p className="text-[11px] text-slate-600">
            Tranche courante : <b>T{config.tranche.index + 1}</b> —{" "}
            {config.tranche.remaining === null ? "ouverte" : `${config.tranche.remaining} place(s) restante(s)`}
            {!config.tranche.purchasable && <span className="text-red-600 font-bold"> · non vendable ({config.tranche.soldOut ? "épuisée" : "produit Polar manquant"})</span>}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTranchesDraft([...tranchesDraft, { seats: "", productId: "" }])}
            className={`${btn} flex items-center gap-1.5`}
          >
            <Plus size={13} /> Ajouter une tranche
          </button>
          <button
            onClick={() => {
              const tranches: LaunchTranche[] = tranchesDraft.map((t) => ({
                seats: t.seats.trim() === "" ? null : Number(t.seats),
                productId: t.productId.trim() || null,
              }));
              save({ tranches });
            }}
            disabled={saving || tranchesDraft.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-[var(--color-text-on-accent)] text-xs font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-40"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            Enregistrer les tranches
          </button>
        </div>
      </div>

      {/* Garde-fou légal */}
      {padded && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <p className="font-black text-sm text-amber-600">
                Le compteur affiche {displayed} pour {config.realSold} vente{config.realSold > 1 ? "s" : ""} réelle{config.realSold > 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Annoncer plus de ventes qu&apos;il n&apos;y en a relève de la fausse rareté,
                visée par l&apos;annexe I de la directive européenne sur les pratiques
                commerciales déloyales et par l&apos;art. L121-2 du Code de la consommation.
                Tes clients sont des professionnels français : c&apos;est vérifiable et
                signalable. Le levier sans risque, c&apos;est la date limite ci-dessus.
              </p>
              <button
                onClick={() => save({ baseOffset: 0, manualOverride: null })}
                disabled={saving}
                className={`${btn} mt-1`}
              >
                Revenir au chiffre réel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LancementTab;
