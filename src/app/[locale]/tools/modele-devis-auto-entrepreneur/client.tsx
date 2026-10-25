"use client";

import { useState } from "react";

/**
 * Le modèle de devis rempli, à l'écran, avec la bascule « sans TVA
 * (franchise) / avec TVA 20 % ». Les pastilles ① à ⑧ renvoient à la liste des
 * mentions obligatoires juste en dessous. Données fictives (SIREN compris).
 */

const LINES = [
  { label: "Création du logo (3 propositions, 2 allers-retours)", qty: 1, unit: 800 },
  { label: "Charte graphique (couleurs, typographies, usages)", qty: 1, unit: 400 },
  { label: "Déclinaisons réseaux sociaux", qty: 3, unit: 60 },
];

const eur = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v).replace(/[  ]/g, " ");

function Mark({ n }: { n: number }) {
  return (
    <span className="mr-1.5 inline-grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-[#BEF221] text-[11px] font-black text-[#0D0630] align-middle" aria-hidden="true">
      {n}
    </span>
  );
}

export function DevisModele() {
  const [franchise, setFranchise] = useState(true);
  const totalHT = LINES.reduce((s, l) => s + l.qty * l.unit, 0);
  const tva = franchise ? 0 : Math.round(totalHT * 20) / 100;

  return (
    <div>
      <div className="mb-5 flex justify-center">
        <div className="inline-flex rounded-full bg-gray-100 p-1" role="group" aria-label="Régime de TVA du modèle">
          {[
            { on: true, label: "Sans TVA (franchise)" },
            { on: false, label: "Avec TVA 20 %" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={franchise === o.on}
              onClick={() => setFranchise(o.on)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${franchise === o.on ? "bg-[#0D0630] text-white" : "text-gray-500 hover:text-[#0D0630]"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <article className="mx-auto max-w-3xl rounded-[24px] border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-[0_30px_80px_rgba(13,6,48,0.12)] md:p-10 md:text-[15px]" aria-label="Modèle de devis auto-entrepreneur rempli">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div>
            <p className="font-bold text-[#0D0630]"><Mark n={2} />Marie Dupont — EI</p>
            <p>Graphiste indépendante</p>
            <p>12 rue des Lilas, 69003 Lyon</p>
            <p>SIREN 123 456 789</p>
            <p>marie@exemple.fr · 06 00 00 00 00</p>
          </div>
          <div className="md:text-right">
            <p className="text-2xl font-black tracking-tight text-[#0D0630]"><Mark n={1} />DEVIS n° D-2026-031</p>
            <p>Émis le 13/10/2026</p>
            <p><Mark n={4} />Valable 30 jours</p>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400"><Mark n={3} />Client</p>
          <p className="mt-1 font-bold text-[#0D0630]">Studio Belmont SARL</p>
          <p>8 quai Saint-Antoine, 69002 Lyon</p>
        </div>

        <p className="mt-6"><Mark n={5} /><strong className="text-[#0D0630]">Prestation :</strong> création d&apos;une identité visuelle. Début prévu le 3 novembre 2026, livraison sous 3 semaines.</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead>
              <tr className="border-b-2 border-gray-200 text-xs uppercase tracking-wider text-gray-400">
                <th className="py-2 pr-2 font-semibold"><Mark n={6} />Désignation</th>
                <th className="py-2 text-right font-semibold">Qté</th>
                <th className="py-2 text-right font-semibold">Prix unit. HT</th>
                <th className="py-2 text-right font-semibold">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {LINES.map((l) => (
                <tr key={l.label} className="border-b border-gray-100 align-top">
                  <td className="py-2.5 pr-2">{l.label}</td>
                  <td className="py-2.5 text-right tabular-nums">{l.qty}</td>
                  <td className="py-2.5 text-right tabular-nums">{eur(l.unit)}</td>
                  <td className="py-2.5 text-right tabular-nums">{eur(l.qty * l.unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 ml-auto max-w-xs space-y-1.5">
          <div className="flex justify-between gap-4"><dt>Total HT</dt><dd className="tabular-nums">{eur(totalHT)}</dd></div>
          {franchise ? (
            <div className="flex justify-between gap-4"><dt><Mark n={7} />TVA</dt><dd>—</dd></div>
          ) : (
            <div className="flex justify-between gap-4"><dt><Mark n={7} />TVA 20 %</dt><dd className="tabular-nums">{eur(tva)}</dd></div>
          )}
          <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 text-base font-black text-[#0D0630]">
            <dt>{franchise ? "Net à payer" : "Total TTC"}</dt><dd className="tabular-nums">{eur(totalHT + tva)}</dd>
          </div>
        </dl>
        {franchise && <p className="mt-2 text-right text-xs italic text-gray-500">TVA non applicable, art. 293 B du CGI</p>}

        <div className="mt-6 space-y-1">
          <p><Mark n={8} /><strong className="text-[#0D0630]">Conditions :</strong> acompte de 30 % ({eur(Math.round((totalHT + tva) * 30) / 100)}) à la signature, solde à la livraison, par virement.</p>
          <p className="text-xs text-gray-500">En cas de retard de paiement : pénalités au taux de 3 fois le taux d&apos;intérêt légal et indemnité forfaitaire de 40 € pour frais de recouvrement (clients professionnels).</p>
        </div>

        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-4">
          <p className="font-bold text-[#0D0630]">Bon pour accord</p>
          <p className="text-gray-500">Date, signature du client et mention manuscrite « Devis reçu avant l&apos;exécution des travaux, bon pour accord ».</p>
        </div>
      </article>
    </div>
  );
}
