"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Rocket, RefreshCw, AlertTriangle, Save, Check, ShieldAlert } from "lucide-react";
import {
  fetchLaunchConfig, saveLaunchConfig, computeDisplayedSold, type LaunchConfig,
} from "@/lib/adminApi";
import { ACCENT, btn, card, input as inputBase } from "./ui";

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const c = await fetchLaunchConfig();
      setConfig(c);
      setDraft(c);
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
      <div className="flex items-center gap-2 text-white/40 text-sm py-10">
        <RefreshCw size={16} className="animate-spin" /> Chargement de l&apos;offre…
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className={`${card} p-5 space-y-2`}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle size={16} />
          <p className="font-black text-sm">Configuration indisponible</p>
        </div>
        <p className="text-xs text-white/50">{error}</p>
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
            <Rocket size={15} style={{ color: ACCENT }} />
            <p className="text-xs font-black uppercase tracking-widest text-white">Offre de lancement</p>
          </div>
          <button
            onClick={() => save({ enabled: !config.enabled })}
            disabled={saving}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-40 ${
              config.enabled ? "bg-[#BEF221] text-black" : "bg-white/10 text-white/60"
            }`}
          >
            {config.enabled ? "Active" : "Désactivée"}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Affiché sur le site</p>
            <p className="font-black text-3xl" style={{ color: ACCENT }}>{displayed}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Ventes réelles</p>
            <p className="font-black text-3xl text-white">{config.realSold}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Places restantes</p>
            <p className="font-black text-3xl text-white">{remaining}</p>
          </div>
        </div>

        {!config.enabled && (
          <p className="text-[11px] text-white/40 mt-4">
            L&apos;offre est retirée du site et de l&apos;app. Le compteur n&apos;est plus affiché.
          </p>
        )}
      </div>

      {/* Réglages */}
      <div className={`${card} p-5 space-y-5`}>
        <p className="text-xs font-black uppercase tracking-widest text-white">Réglages</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-white/50 block mb-1.5">Nombre total de places</label>
            <input
              type="number" min={1} className={input} value={draft.totalSeats}
              onChange={(e) => setDraft({ ...draft, totalSeats: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 block mb-1.5">Date limite de l&apos;offre</label>
            <input
              type="date" className={input} value={draft.deadline?.slice(0, 10) || ""}
              onChange={(e) => setDraft({ ...draft, deadline: e.target.value || null })}
            />
            <p className="text-[10px] text-white/30 mt-1.5">
              Le levier d&apos;urgence honnête : vraie date, vraie fin.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 block mb-1.5">
              Chiffre de départ <span className="text-white/25">(ajouté aux ventes réelles)</span>
            </label>
            <input
              type="number" min={0} className={input} value={draft.baseOffset}
              onChange={(e) => setDraft({ ...draft, baseOffset: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-white/50 block mb-1.5">
              Forçage manuel <span className="text-white/25">(vide = automatique)</span>
            </label>
            <input
              type="number" min={0} className={input}
              value={draft.manualOverride ?? ""}
              placeholder="automatique"
              onChange={(e) => setDraft({ ...draft, manualOverride: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </div>
        </div>

        <p className="text-[11px] text-white/40 leading-relaxed">
          Formule appliquée : <code className="text-[#BEF221]">forçage ?? (départ + ventes réelles)</code>,
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BEF221] text-black text-xs font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-40"
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            Enregistrer
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: ACCENT }}>
              <Check size={13} /> Enregistré
            </span>
          )}
          {error && <span className="text-[11px] text-red-400">{error}</span>}
        </div>
      </div>

      {/* Garde-fou légal */}
      {padded && (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1.5">
              <p className="font-black text-sm text-amber-300">
                Le compteur affiche {displayed} pour {config.realSold} vente{config.realSold > 1 ? "s" : ""} réelle{config.realSold > 1 ? "s" : ""}
              </p>
              <p className="text-[11px] text-white/60 leading-relaxed">
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
