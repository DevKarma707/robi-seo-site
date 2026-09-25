"use client";

import { useEffect, useState } from "react";

/**
 * Compteur de places de l'offre de lancement, lu sur la fonction publique
 * de l'app (la même source que le compteur dans l'app et l'onglet Lancement
 * de l'admin). Ne rend rien tant que rien n'est chargé, ni si l'offre est
 * coupée : la page ne doit jamais afficher un chiffre inventé.
 *
 * Depuis le 25/09/2026 l'offre se vend par tranches (59 € → 79 € → 99 €).
 * `tranche` dit laquelle est courante ; tant que la fonction n'est pas
 * redéployée, le champ manque et le compteur se comporte comme avant.
 */
const ENDPOINT = "https://europe-west1-robi-ai-system.cloudfunctions.net/getLaunchOffer";

export interface LaunchPrice { amount: number; currency: string }

export interface LaunchTranche {
  index: number;
  count: number;
  seats: number | null;
  sold: number;
  remaining: number | null;
  productId: string | null;
  price: LaunchPrice | null;
  nextPrice: LaunchPrice | null;
  isLast: boolean;
  purchasable: boolean;
  soldOut: boolean;
}

export interface LaunchOffer {
  enabled: boolean;
  totalSeats: number;
  sold: number;
  remaining: number;
  deadline: string | null;
  tranche?: LaunchTranche;
  lowestPrice30d?: LaunchPrice | null;
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

/** L'offre, une fois chargée ; `null` avant, ou si l'endpoint est muet. */
export const useLaunchOffer = (): LaunchOffer | null => {
  const [offer, setOffer] = useState<LaunchOffer | null>(null);
  useEffect(() => {
    let alive = true;
    fetchLaunchOffer().then((o) => { if (alive) setOffer(o); });
    return () => { alive = false; };
  }, []);
  return offer;
};

/** « 79 € » — sans décimales quand le montant est rond. */
export const formatLaunchPrice = (p: LaunchPrice | null | undefined, locale: string): string | null => {
  if (!p) return null;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency", currency: p.currency, maximumFractionDigits: Number.isInteger(p.amount) ? 0 : 2,
    }).format(p.amount);
  } catch {
    return `${p.amount} ${p.currency}`;
  }
};

interface Props {
  locale: string;
  /** « {remaining} places restantes sur {total} » */
  remainingText: string;
  /** « {remaining} places restantes à {price} » — pris quand la tranche est connue */
  trancheText?: string;
  /** « ensuite {price} » */
  nextText?: string;
  /** « jusqu'au {date} » — affiché seulement si une date limite est fixée */
  deadlineText?: string;
  className?: string;
  /** Rendu compact : une ligne, pour la pastille du hero. */
  compact?: boolean;
}

const fill = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

export function LaunchSeats({ locale, remainingText, trancheText, nextText, deadlineText, className = "", compact }: Props) {
  const offer = useLaunchOffer();

  if (!offer || !offer.enabled || offer.totalSeats <= 0) return null;

  const nf = new Intl.NumberFormat(locale);
  const tranche = offer.tranche;
  const prix = formatLaunchPrice(tranche?.price, locale);
  const suivant = formatLaunchPrice(tranche?.nextPrice, locale);

  // Avec des tranches, le chiffre qui compte est celui de la tranche : « il
  // reste 412 places à 59 € », pas « 912 sur 1 000 ».
  const remaining = tranche && tranche.remaining !== null && prix && trancheText
    ? fill(trancheText, { remaining: nf.format(tranche.remaining), price: prix })
    : fill(remainingText, { remaining: nf.format(offer.remaining), total: nf.format(offer.totalSeats) });
  const next = suivant && nextText ? fill(nextText, { price: suivant }) : null;
  const deadline = offer.deadline && deadlineText
    ? fill(deadlineText, {
        date: new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(offer.deadline)),
      })
    : null;

  const pct = tranche && tranche.seats
    ? Math.min(100, Math.round((tranche.sold / tranche.seats) * 100))
    : Math.min(100, Math.round((offer.sold / offer.totalSeats) * 100));

  if (compact) {
    return (
      <span className={className}>
        {" · "}{remaining}{next ? ` · ${next}` : ""}{deadline ? ` · ${deadline}` : ""}
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
        {next ? <span className="text-white/50"> · {next}</span> : null}
        {deadline ? <span className="text-white/50"> · {deadline}</span> : null}
      </p>
    </div>
  );
}
