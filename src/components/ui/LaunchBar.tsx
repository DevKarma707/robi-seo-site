"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bot, X } from "lucide-react";
import { useLaunchOffer, formatLaunchPrice } from "@/components/ui/LaunchSeats";

/**
 * La barre d'annonce de l'offre de lancement (version A), en haut de toutes
 * les pages du site, dans le header fixe.
 *
 * Tout ce qu'elle dit est vrai : prix et places de la tranche courante lus en
 * direct, palier suivant, et un chrono UNIQUEMENT si une vraie date limite
 * est fixée dans Admin › Lancement — un visiteur n'a pas de compte, donc pas
 * de fenêtre de bienvenue personnelle à décompter. Rien ne s'affiche tant que
 * l'offre n'est pas chargée, coupée ou invendable.
 */

export interface LaunchBarCopy {
  badge: string;
  /** « {price} à vie » */
  lifetime: string;
  /** « plus que {remaining} places à ce prix » */
  seats: string;
  /** « {remaining} places » — version courte pour mobile */
  seatsShort?: string;
  /** « puis {price} » */
  next: string;
  /** « fin dans » */
  endsIn: string;
  cta: string;
  close: string;
}

const fill = (tpl: string, vars: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
const pad = (n: number) => String(n).padStart(2, "0");
const DISMISS_KEY = "robi-launch-bar-hidden";

export function LaunchBar({ locale, copy, normalPrice }: { locale: string; copy: LaunchBarCopy; normalPrice: string }) {
  const offer = useLaunchOffer();
  const [hidden, setHidden] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try { if (sessionStorage.getItem(DISMISS_KEY) === "1") setHidden(true); } catch { /* stockage bloqué */ }
  }, []);

  const deadline = offer?.deadline ? Date.parse(offer.deadline) : NaN;
  const chronoActif = Number.isFinite(deadline) && deadline > now;
  useEffect(() => {
    if (!chronoActif) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [chronoActif]);

  const tranche = offer?.tranche;
  if (hidden || !offer || !offer.enabled || !tranche || !tranche.purchasable) return null;
  const prix = formatLaunchPrice(tranche.price, locale);
  if (!prix) return null;
  const suivant = formatLaunchPrice(tranche.nextPrice, locale);
  const nf = new Intl.NumberFormat(locale);

  let chrono: string | null = null;
  if (chronoActif) {
    const s = Math.floor((deadline - now) / 1000);
    const j = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    chrono = `${j > 0 ? `${j} j ` : ""}${pad(h)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }

  const fermer = () => {
    setHidden(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* sans conséquence */ }
  };

  return (
    <div className="relative bg-[#BEF221] text-[#0D0630]">
      {/* Barre lime, texte Amethyst : l'offre se lit d'un coup d'œil au-dessus
          du header sombre. Bouton à la même taille que « Connexion »
          (px-4 py-2 text-sm, rond), en négatif : Amethyst sur lime. */}
      <div className="max-w-7xl mx-auto h-10 lg:h-12 pl-4 pr-10 flex items-center justify-center gap-3 lg:gap-5 text-[13px] lg:text-[14.5px] whitespace-nowrap overflow-hidden">
        <span className="hidden md:inline-flex items-center gap-2 font-semibold">
          <Bot className="w-[18px] h-[18px]" strokeWidth={2.2} aria-hidden="true" />
          {copy.badge}
        </span>
        <span className="hidden md:block w-px h-4 bg-[#0D0630]/25" aria-hidden="true" />
        <span className="truncate">
          <b className="font-extrabold tracking-tight">{fill(copy.lifetime, { price: prix })}</b>{" "}
          <s className="opacity-50 font-medium hidden sm:inline">{normalPrice}</s>
          {tranche.remaining !== null && (
            <>
              <span className="font-medium hidden sm:inline"> · {fill(copy.seats, { remaining: nf.format(tranche.remaining) })}</span>
              <span className="font-medium sm:hidden"> · {fill(copy.seatsShort || "{remaining}", { remaining: nf.format(tranche.remaining) })}</span>
            </>
          )}
          {suivant && <span className="font-medium opacity-70 hidden lg:inline"> · {fill(copy.next, { price: suivant })}</span>}
        </span>
        {chrono && (
          <span className="hidden md:inline-flex items-center gap-2 font-medium">
            {copy.endsIn}
            <span className="tabular-nums font-bold tracking-tight">{chrono}</span>
          </span>
        )}
        <a
          href={`/${locale}/#pricing`}
          className="group inline-flex items-center gap-1.5 flex-none rounded-full bg-[#0D0630] text-[#BEF221] font-bold text-xs px-3 py-1.5 lg:text-sm lg:px-4 lg:py-2 hover:bg-[#1a1150] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D0630]"
        >
          {copy.cta}
          <ArrowRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </a>
      </div>
      <button onClick={fermer} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#0D0630]/50 hover:text-[#0D0630]" aria-label={copy.close}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
