"use client";

import { useEffect, useState } from "react";

/**
 * Compteur de places de l'offre de lancement, lu sur la fonction publique
 * de l'app (la même source que le compteur dans l'app et l'onglet Lancement
 * de l'admin). Ne rend rien tant que rien n'est chargé, ni si l'offre est
 * coupée : la page ne doit jamais afficher un chiffre inventé.
 */
const ENDPOINT = "https://europe-west1-robi-ai-system.cloudfunctions.net/getLaunchOffer";

export interface LaunchOffer {
  enabled: boolean;
  totalSeats: number;
  sold: number;
  remaining: number;
  deadline: string | null;
}

let cache: Promise<LaunchOffer | null> | null = null;
export const fetchLaunchOffer = (): Promise<LaunchOffer | null> => {
  if (!cache) {
    cache = fetch(ENDPOINT)
      .then((r) => (r.ok ? (r.json() as Promise<LaunchOffer>) : null))
      .catch(() => null);
  }
  return cache;
};

interface Props {
  locale: string;
  /** « {remaining} places restantes sur {total} » */
  remainingText: string;
  /** « jusqu'au {date} » — affiché seulement si une date limite est fixée */
  deadlineText?: string;
  className?: string;
  /** Rendu compact : une ligne, pour la pastille du hero. */
  compact?: boolean;
}

const fill = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

export function LaunchSeats({ locale, remainingText, deadlineText, className = "", compact }: Props) {
  const [offer, setOffer] = useState<LaunchOffer | null>(null);

  useEffect(() => {
    let alive = true;
    fetchLaunchOffer().then((o) => { if (alive) setOffer(o); });
    return () => { alive = false; };
  }, []);

  if (!offer || !offer.enabled || offer.totalSeats <= 0) return null;

  const nf = new Intl.NumberFormat(locale);
  const remaining = fill(remainingText, {
    remaining: nf.format(offer.remaining),
    total: nf.format(offer.totalSeats),
  });
  const deadline = offer.deadline && deadlineText
    ? fill(deadlineText, {
        date: new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(offer.deadline)),
      })
    : null;

  const pct = Math.min(100, Math.round((offer.sold / offer.totalSeats) * 100));

  if (compact) {
    return (
      <span className={className}>
        {" · "}{remaining}{deadline ? ` · ${deadline}` : ""}
      </span>
    );
  }

  return (
    <div className={`max-w-sm mx-auto ${className}`}>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-[#BEF221] transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-white/70">
        <span className="text-[#BEF221] font-bold">{remaining}</span>
        {deadline ? <span className="text-white/50"> · {deadline}</span> : null}
      </p>
    </div>
  );
}
