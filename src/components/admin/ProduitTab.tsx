"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AlertTriangle, BugPlay, MousePointerClick, RefreshCw, TrendingDown } from "lucide-react";
import { fetchProduitReport, type ProduitReport } from "@/lib/adminApi";
import { ACCENT, btn, card } from "./ui";

const RED = "#f87171";

/** Le parcours en français. Les noms techniques ne se lisent pas d'un coup d'œil. */
const LABELS: Record<string, string> = {
  $pageview: "Pages vues (site)",
  cta_app_clicked: "Clics vers l'app",
  signup: "Inscriptions",
  first_document_created: "Premier document créé",
  pdf_downloaded: "PDF téléchargés",
  paywall_viewed: "Limite gratuite atteinte",
  checkout_started: "Paiement commencé",
  checkout_completed: "Paiement encaissé",
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";

function NotConfigured() {
  return (
    <div className={`${card} p-6`}>
      <div className="flex items-center gap-2 mb-3" style={{ color: RED }}>
        <AlertTriangle size={18} />
        <p className="text-xs font-black uppercase tracking-widest">Clé PostHog manquante</p>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Deux variables à ajouter sur le projet Vercel de ce site, en type <strong>Secret</strong> —
        cette clé-ci lit toutes les données du projet et ne doit jamais partir dans le navigateur.
      </p>
      <pre className="text-[12px] leading-relaxed p-4 rounded-xl bg-black/30 text-slate-300 overflow-x-auto">
{`POSTHOG_PERSONAL_API_KEY = phx_…
POSTHOG_PROJECT_ID       = 12345`}
      </pre>
      <p className="text-[12px] text-slate-500 mt-3">
        PostHog → Settings → Personal API keys (portée lecture), et l&apos;identifiant du projet
        dans Settings → Project.
      </p>
    </div>
  );
}

export default function ProduitTab() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<ProduitReport | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      setData(await fetchProduitReport(days));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Chargement impossible");
    } finally {
      setChargement(false);
    }
  }, [days]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const funnel = data?.funnel ?? [];
  // Référence de largeur : la première marche non vide. Se caler sur le max
  // écraserait tout le bas du tunnel contre zéro dès que les pages vues
  // dépassent les inscriptions de deux ordres de grandeur — ce qui est la
  // situation normale d'un site public.
  const base = funnel.find((f) => f.personnes > 0)?.personnes || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {[7, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`${btn} ${days === d ? "!text-black" : ""}`}
            style={days === d ? { backgroundColor: ACCENT } : undefined}
          >
            {d} jours
          </button>
        ))}
        <button onClick={() => void charger()} className={`${btn} ml-auto`} disabled={chargement}>
          <RefreshCw size={14} className={chargement ? "animate-spin" : ""} />
          Rafraîchir
        </button>
      </div>

      {erreur && (
        <div className={`${card} p-4 text-sm`} style={{ color: RED }}>
          {erreur}
        </div>
      )}

      {data && !data.configured && <NotConfigured />}

      {data?.configured && (
        <>
          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-5">
              <TrendingDown size={16} style={{ color: ACCENT }} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-900">
                Le tunnel, sur {data.days} jours
              </p>
            </div>
            <div className="space-y-3">
              {funnel.map((etape, i) => {
                const precedent = i > 0 ? funnel[i - 1].personnes : 0;
                const taux = precedent > 0 ? Math.round((etape.personnes / precedent) * 100) : null;
                return (
                  <div key={etape.event}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-slate-300 flex-1">
                        {LABELS[etape.event] || etape.event}
                      </span>
                      <span className="font-black text-lg text-white">{etape.personnes}</span>
                      {taux !== null && (
                        <span
                          className="text-[11px] font-bold w-12 text-right"
                          style={{ color: taux < 20 ? RED : ACCENT }}
                        >
                          {taux}%
                        </span>
                      )}
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (etape.personnes / base) * 100)}%`,
                          backgroundColor: ACCENT,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-4">
              Nombre de personnes distinctes, pas d&apos;événements. Le pourcentage compare chaque
              marche à la précédente.
            </p>
          </div>

          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <BugPlay size={16} style={{ color: data.erreurs?.length ? RED : ACCENT }} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-900">
                Bugs rencontrés
              </p>
              {!!data.erreurs?.length && (
                <span
                  className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${RED}22`, color: RED }}
                >
                  {data.erreurs.reduce((s, e) => s + e.total, 0)}
                </span>
              )}
            </div>
            {data.erreurs?.length ? (
              <div className="space-y-3">
                {data.erreurs.map((e, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="font-black text-sm mt-0.5 w-8 text-right" style={{ color: RED }}>
                      {e.total}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-200 truncate">{e.message}</p>
                      <p className="text-[11px] text-slate-500">
                        {e.type} · {e.personnes} personne{e.personnes > 1 ? "s" : ""} · dernier{" "}
                        {fmtDate(e.dernier)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucune erreur sur la période.</p>
            )}
          </div>

          <div className={`${card} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <MousePointerClick size={16} style={{ color: ACCENT }} />
              <p className="text-xs font-black uppercase tracking-widest text-slate-900">
                Pages qui envoient vers l&apos;app
              </p>
            </div>
            {data.cta?.length ? (
              <div className="space-y-2">
                {data.cta.map((c) => (
                  <div key={c.page} className="flex items-baseline gap-3">
                    <span className="font-black text-sm w-8 text-right" style={{ color: ACCENT }}>
                      {c.total}
                    </span>
                    <span className="text-[13px] text-slate-300 truncate">{c.page}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Aucun clic vers l&apos;app sur la période.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
