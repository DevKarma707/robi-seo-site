"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import { subscribeToCampaigns, budgetPrevu, AD_STATUS_META, type AdCampaign } from "@/lib/adCampaigns";
import { card, sectionTitle } from "./ui";
import { toast } from "./toast";

/**
 * Calendrier des campagnes (onglet Ads) : une barre par plan de campagne,
 * du jour de début au jour de fin, avec son budget. Lit les mêmes plans que
 * le bloc « Plans de campagne » (collection `adCampaigns`) : ce qui est prévu,
 * pas ce que Meta a dépensé — ça, c'est le classement des créas.
 *
 * Un plan sans budget (reporté, budget remis à 0) n'a rien à montrer ici.
 * Une idée datée et budgétée (le test Maroc avant d'être monté) apparaît en
 * pointillés : prévue, pas encore prête.
 */

const JOUR = 86_400_000;
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** AAAA-MM-JJ → jour UTC à minuit (les plans n'ont pas d'heure). */
const jourDe = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const isoDe = (t: number) => new Date(t).toISOString().slice(0, 10);
/** Aujourd'hui dans le fuseau de Ralph, en AAAA-MM-JJ. */
const aujourdhui = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

const court = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${d.getUTCDate()} ${MOIS[d.getUTCMonth()]}`;
};
const euros = (v: number) => `${Math.round(v).toLocaleString("fr-FR")} €`;

function styleBarre(c: AdCampaign): React.CSSProperties {
  switch (c.statut) {
    case "active":
      return { background: AD_STATUS_META.active.color, color: "#fff" };
    case "prete":
      return { background: "var(--color-accent)", color: "var(--a-on-accent)" };
    case "pause":
      return { background: AD_STATUS_META.pause.color, color: "#1f1300" };
    case "terminee":
      return { background: "transparent", border: "1.5px solid var(--a-line, #cbd5e1)" };
    default:
      return { background: "transparent", border: "1.5px dashed currentColor" };
  }
}

export default function CalendrierCampagnes() {
  const [plans, setPlans] = useState<AdCampaign[] | null>(null);

  useEffect(() => subscribeToCampaigns(setPlans, (e) => toast("err", String(e))), []);

  const vue = useMemo(() => {
    const today = aujourdhui();
    const lignes = (plans ?? [])
      .filter((c) => c.dateDebut && c.dateFin && (c.budgetJour || 0) > 0)
      .sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
    if (!lignes.length) return null;

    // Fenêtre : quelques jours avant aujourd'hui (ou le premier plan) jusqu'à la
    // dernière fin, au moins un mois devant, et jamais plus de 4 mois.
    const debut = Math.min(jourDe(today) - 3 * JOUR, ...lignes.map((c) => jourDe(c.dateDebut)));
    const finMax = Math.max(jourDe(today) + 30 * JOUR, ...lignes.map((c) => jourDe(c.dateFin!)));
    const fin = Math.min(finMax, debut + 120 * JOUR);
    const nb = Math.round((fin - debut) / JOUR) + 1;
    const col = (iso: string) => Math.round((jourDe(iso) - debut) / JOUR); // 0 = premier jour

    // Repères : le 1er de chaque mois, plus aujourd'hui.
    const reperes: { i: number; label: string; fort: boolean }[] = [];
    for (let i = 0; i < nb; i++) {
      const d = new Date(debut + i * JOUR);
      if (d.getUTCDate() === 1) reperes.push({ i, label: `1 ${MOIS[d.getUTCMonth()]}`, fort: true });
    }
    const iAuj = col(today);

    const visibles = lignes.filter((c) => col(c.dateFin!) >= 0 && col(c.dateDebut) < nb);
    const total = visibles.filter((c) => c.statut !== "terminee").reduce((s, c) => s + budgetPrevu(c), 0);
    return { lignes: visibles, nb, col, reperes, iAuj, total, debutIso: isoDe(debut) };
  }, [plans]);

  return (
    <div className={`${card} p-5 space-y-4`}>
      <div className="flex flex-wrap items-baseline gap-2">
        <h3 className={sectionTitle}><span className="flex items-center gap-1.5"><CalendarRange size={14} /> Calendrier des campagnes</span></h3>
        <span className="text-[11px] text-slate-400">
          {vue ? `${vue.lignes.length} campagne${vue.lignes.length > 1 ? "s" : ""} prévue${vue.lignes.length > 1 ? "s" : ""} · ${euros(vue.total)} de budget à venir` : ""}
        </span>
      </div>

      {plans === null ? (
        <p className="text-[13px] text-slate-500">Chargement…</p>
      ) : !vue ? (
        <p className="text-[13px] text-slate-500">Aucune campagne datée et budgétée. Ajoute des dates et un budget par jour dans « Plans de campagne ».</p>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <div
            className="grid items-center gap-y-2.5 relative"
            style={{ gridTemplateColumns: `180px repeat(${vue.nb}, minmax(9px, 1fr))`, minWidth: 180 + vue.nb * 9 }}
          >
            {/* repères de dates */}
            <div />
            {Array.from({ length: vue.nb }, (_, i) => {
              const r = vue.reperes.find((x) => x.i === i);
              const auj = i === vue.iAuj;
              return (
                <div key={i} className="a-mono text-[10.5px] whitespace-nowrap overflow-visible h-4" style={{ gridColumn: i + 2, gridRow: 1 }}>
                  {auj ? <span className="font-semibold text-slate-900">Aujourd&apos;hui</span> : r ? <span className="text-slate-500">{r.label}</span> : null}
                </div>
              );
            })}

            {vue.lignes.map((c, k) => {
              const row = k + 2;
              const a = Math.max(0, vue.col(c.dateDebut));
              const b = Math.min(vue.nb - 1, vue.col(c.dateFin!));
              const st = AD_STATUS_META[c.statut];
              return (
                <React.Fragment key={c.id ?? c.nom}>
                  <div className="pr-3 min-w-0" style={{ gridRow: row, gridColumn: 1 }}>
                    <p className="text-[12.5px] font-semibold text-slate-900 truncate" title={c.nom}>{c.nom}</p>
                    <p className="a-mono text-[11px] text-slate-500">{c.budgetJour} €/j · {st.label.toLowerCase()}</p>
                  </div>
                  <div
                    className="h-7 rounded-md flex items-center px-2 a-mono text-[11.5px] font-semibold whitespace-nowrap overflow-hidden text-slate-600"
                    style={{ gridRow: row, gridColumn: `${a + 2} / ${b + 3}`, ...styleBarre(c) }}
                    title={`${c.nom} · ${court(c.dateDebut)} → ${court(c.dateFin!)} · ${euros(budgetPrevu(c))}`}
                  >
                    {court(c.dateDebut)} → {court(c.dateFin!)} · {euros(budgetPrevu(c))}
                  </div>
                </React.Fragment>
              );
            })}

            {/* ligne d'aujourd'hui, par-dessus les barres */}
            {vue.iAuj >= 0 && vue.iAuj < vue.nb && (
              <div
                className="pointer-events-none self-stretch w-px justify-self-start"
                style={{ gridColumn: vue.iAuj + 2, gridRow: `1 / ${vue.lignes.length + 2}`, background: "var(--color-accent)", boxShadow: "0 0 0 0.5px var(--color-accent)" }}
                aria-hidden
              />
            )}
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        Plein = prête ou en cours · pointillés = idée pas encore montée · trait lime = aujourd&apos;hui. Les dates et budgets se changent dans « Plans de campagne » ci-dessous.
      </p>
    </div>
  );
}
