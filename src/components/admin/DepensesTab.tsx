"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle, Cpu, Info, Plus, RefreshCw, Trash2, Wallet,
} from "lucide-react";
import {
  fetchCostReport, saveCost, deleteCost,
  type CostReport, type DeclaredCost,
} from "@/lib/adminApi";
import { ACCENT_INK, btn, btnAccent, card, input, select, kpiLabel, kpiValue, sectionTitle } from "./ui";

/**
 * Dépenses — le pendant des revenus suivis par Pilotage.
 *
 * Deux natures, affichées comme telles parce qu'elles ne se connaissent pas
 * de la même façon : la consommation Gemini est mesurée à chaque appel, tout
 * le reste (Vercel, Pinecone, domaines…) n'est lisible par aucune API et se
 * saisit à la main. L'onglet le dit franchement — un total bas doit se lire
 * « il manque des factures », pas « on ne dépense presque rien ».
 */

const MONTH_LABEL = (m: string) => {
  const [y, mo] = m.split("-");
  const d = new Date(Number(y), Number(mo) - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
};

const eur = (n: number | null | undefined) =>
  typeof n === "number"
    ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n)
    : "—";

const compact = (n: number) =>
  new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const EMPTY_FORM = {
  label: "",
  amount: "",
  kind: "monthly" as DeclaredCost["kind"],
  from: thisMonth(),
  to: "",
};

export default function DepensesTab() {
  const [report, setReport] = useState<CostReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [price, setPrice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCostReport(6);
      setReport(data);
      setPrice(String(data.pricePerMillionTokens ?? ""));
    } catch (e: any) {
      setError(e?.message || "Rapport indisponible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const current = useMemo(() => report?.months?.[report.months.length - 1] ?? null, [report]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount.replace(",", "."));
    if (!form.label.trim() || !Number.isFinite(amount) || amount < 0) return;

    setSaving(true);
    try {
      await saveCost({
        label: form.label.trim(),
        amount,
        currency: "EUR",
        kind: form.kind,
        from: form.from,
        to: form.kind === "monthly" && form.to ? form.to : null,
      });
      setForm({ ...EMPTY_FORM, from: form.from });
      await load();
    } catch (e: any) {
      setError(e?.message || "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id?: string) => {
    if (!id) return;
    setSaving(true);
    try {
      await deleteCost(id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Suppression impossible.");
    } finally {
      setSaving(false);
    }
  };

  const savePrice = async () => {
    const value = Number(price.replace(",", "."));
    if (!Number.isFinite(value) || value < 0) return;
    setSaving(true);
    try {
      await saveCost({ pricePerMillionTokens: value });
      await load();
    } catch (e: any) {
      setError(e?.message || "Tarif non enregistré.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── En-tête ─────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className={sectionTitle}>Dépenses</h2>
          <p className="text-[12.5px] text-slate-500 mt-0.5">
            Ce que Robi coûte chaque mois, en face de ce qu&apos;il rapporte.
          </p>
        </div>
        <button type="button" onClick={() => void load()} className={btn} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {error && (
        <div className={`${card} p-4 flex items-start gap-2.5`}>
          <AlertCircle size={16} style={{ color: ACCENT_INK }} className="mt-0.5 shrink-0" />
          <p className="text-[13px] text-slate-700">{error}</p>
        </div>
      )}

      {/* ── KPI du mois ─────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${card} p-4`}>
          <div className={kpiLabel}>Total ce mois</div>
          <div className={`${kpiValue} mt-2`}>{eur(current?.total)}</div>
        </div>
        <div className={`${card} p-4`}>
          <div className={kpiLabel}>Dont IA (mesuré)</div>
          <div className={`${kpiValue} mt-2`}>{eur(current?.ai.cost)}</div>
          <div className="text-[11.5px] text-slate-500 mt-1.5">
            {current ? `${compact(current.ai.tokens)} tokens · ${compact(current.ai.calls)} appels` : "—"}
          </div>
        </div>
        <div className={`${card} p-4`}>
          <div className={kpiLabel}>Coût par utilisateur actif</div>
          <div className={`${kpiValue} mt-2`}>{eur(current?.costPerActiveUser)}</div>
          <div className="text-[11.5px] text-slate-500 mt-1.5">
            {current?.activeUsers ? `${current.activeUsers} actifs ce mois` : "aucun actif ce mois"}
          </div>
        </div>
      </div>

      {/* Sans cette phrase, un total bas se lit comme une bonne nouvelle. */}
      <div className={`${card} p-4 flex items-start gap-2.5`}>
        <Info size={15} style={{ color: ACCENT_INK }} className="mt-0.5 shrink-0" />
        <p className="text-[12.5px] text-slate-600 leading-relaxed">
          Seule la consommation IA est mesurée automatiquement. Vercel, Firebase, Pinecone,
          Supabase, les noms de domaine et le reste ne sont lisibles par aucune API :
          <strong className="text-slate-900"> ils n&apos;apparaissent que si vous les saisissez ci-dessous.</strong>
        </p>
      </div>

      {/* ── Historique mensuel ──────────────────────────── */}
      <div className={`${card} p-4`}>
        <h3 className={sectionTitle}>Les 6 derniers mois</h3>
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              <tr className="text-left text-slate-500 text-[11.5px] uppercase tracking-wide">
                <th className="py-2 pr-3 font-semibold">Mois</th>
                <th className="py-2 px-3 font-semibold text-right">IA</th>
                <th className="py-2 px-3 font-semibold text-right">Saisi</th>
                <th className="py-2 px-3 font-semibold text-right">Total</th>
                <th className="py-2 px-3 font-semibold text-right">Actifs</th>
                <th className="py-2 pl-3 font-semibold text-right">Par actif</th>
              </tr>
            </thead>
            <tbody>
              {(report?.months ?? []).map((m) => (
                <tr key={m.month} className="border-t border-slate-200">
                  <td className="py-2.5 pr-3 font-medium text-slate-900">{MONTH_LABEL(m.month)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{eur(m.ai.cost)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{eur(m.declared.total)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900">{eur(m.total)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{m.activeUsers || "—"}</td>
                  <td className="py-2.5 pl-3 text-right tabular-nums text-slate-700">{eur(m.costPerActiveUser)}</td>
                </tr>
              ))}
              {!loading && (report?.months ?? []).length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-slate-500">Aucune donnée pour l&apos;instant.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Saisie ──────────────────────────────────────── */}
      <div className={`${card} p-4`}>
        <h3 className={sectionTitle}>Ajouter une dépense</h3>
        <p className="text-[12.5px] text-slate-500 mt-0.5">
          Récurrente pour un abonnement, ponctuelle pour un achat unique comme un nom de domaine.
        </p>

        <form onSubmit={submit} className="grid gap-3 mt-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label htmlFor="cost-label" className={kpiLabel}>Libellé</label>
            <input
              id="cost-label"
              className={`${input} mt-1`}
              placeholder="Pinecone, nom de domaine…"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="cost-amount" className={kpiLabel}>Montant (€)</label>
            <input
              id="cost-amount"
              className={`${input} mt-1`}
              inputMode="decimal"
              placeholder="70"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="cost-kind" className={kpiLabel}>Type</label>
            <select
              id="cost-kind"
              className={`${select} mt-1 w-full`}
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as DeclaredCost["kind"] })}
            >
              <option value="monthly">Chaque mois</option>
              <option value="oneoff">Une seule fois</option>
            </select>
          </div>

          <div>
            <label htmlFor="cost-from" className={kpiLabel}>
              {form.kind === "monthly" ? "À partir de" : "Mois"}
            </label>
            <input
              id="cost-from"
              type="month"
              className={`${input} mt-1`}
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
            />
          </div>

          {form.kind === "monthly" && (
            <div>
              <label htmlFor="cost-to" className={kpiLabel}>Jusqu&apos;à (facultatif)</label>
              <input
                id="cost-to"
                type="month"
                className={`${input} mt-1`}
                value={form.to}
                onChange={(e) => setForm({ ...form, to: e.target.value })}
              />
            </div>
          )}

          <div className="flex items-end">
            <button type="submit" className={btnAccent} disabled={saving}>
              <Plus size={14} />
              Ajouter
            </button>
          </div>
        </form>
      </div>

      {/* ── Dépenses saisies ────────────────────────────── */}
      <div className={`${card} p-4`}>
        <h3 className={sectionTitle}>Dépenses saisies</h3>
        <div className="flex flex-col gap-2 mt-3">
          {(report?.declared ?? []).map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 py-2 border-t border-slate-200 first:border-t-0">
              <div className="min-w-0">
                <div className="font-medium text-slate-900 text-[13.5px] truncate">{c.label}</div>
                <div className="text-[11.5px] text-slate-500">
                  {c.kind === "monthly"
                    ? `Chaque mois depuis ${MONTH_LABEL(c.from)}${c.to ? ` jusqu'à ${MONTH_LABEL(c.to)}` : ""}`
                    : `Une fois en ${MONTH_LABEL(c.from)}`}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="tabular-nums font-semibold text-slate-900 text-[13.5px]">{eur(c.amount)}</span>
                <button
                  type="button"
                  onClick={() => void remove(c.id)}
                  className={btn}
                  disabled={saving}
                  aria-label={`Supprimer ${c.label}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {(report?.declared ?? []).length === 0 && (
            <p className="text-[13px] text-slate-500 py-2">
              Rien de saisi. Vos factures Vercel, Pinecone ou vos noms de domaine se déclarent ci-dessus.
            </p>
          )}
        </div>
      </div>

      {/* ── Tarif des tokens ────────────────────────────── */}
      <div className={`${card} p-4`}>
        <div className="flex items-start gap-2.5">
          <Cpu size={15} style={{ color: ACCENT_INK }} className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className={sectionTitle}>Tarif Gemini</h3>
            <p className="text-[12.5px] text-slate-500 mt-0.5">
              Prix par million de tokens, utilisé pour convertir la consommation en euros.
              À mettre à jour quand Google change ses tarifs ou quand Robi change de modèle.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <input
                id="token-price"
                className={`${input} max-w-[160px]`}
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-label="Prix par million de tokens"
              />
              <span className="text-[12.5px] text-slate-500">€ / million</span>
              <button type="button" onClick={() => void savePrice()} className={btn} disabled={saving}>
                <Wallet size={14} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
