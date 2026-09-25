"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
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
    chrono = `${j > 0 ? `${j}j ` : ""}${pad(h)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }

  const fermer = () => {
    setHidden(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* sans conséquence */ }
  };

  return (
    <div className="relative border-b border-[#BEF221]/30 bg-[linear-gradient(90deg,#0D0630_0%,#1a1150_50%,#0D0630_100%)]">
      <div className="max-w-7xl mx-auto h-9 px-10 flex items-center justify-center gap-3 text-[12.5px] text-white whitespace-nowrap overflow-hidden">
        <span className="hidden sm:inline-block rounded-full bg-[#BEF221] text-[#0D0630] font-black text-[10px] tracking-wider uppercase px-2 py-0.5">
          {copy.badge}
        </span>
        <span className="truncate">
          <b className="text-[#BEF221]">{fill(copy.lifetime, { price: prix })}</b>{" "}
          <s className="text-white/40 hidden sm:inline">{normalPrice}</s>
          {tranche.remaining !== null && (
            <span className="text-white/80"> · {fill(copy.seats, { remaining: nf.format(tranche.remaining) })}</span>
          )}
          {suivant && <span className="text-white/60 hidden md:inline"> · {fill(copy.next, { price: suivant })}</span>}
        </span>
        {chrono && (
          <span className="hidden md:inline-flex items-center gap-1.5 text-white/60">
            {copy.endsIn}
            <span className="font-mono tabular-nums text-white bg-black/30 border border-white/10 rounded-md px-1.5 py-0.5">{chrono}</span>
          </span>
        )}
        <Link href={`/${locale}/#pricing`} className="rounded-full bg-[#BEF221] text-[#0D0630] font-black text-[11.5px] px-3 py-1 hover:opacity-90">
          {copy.cta}
        </Link>
      </div>
      <button onClick={fermer} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white" aria-label={copy.close}>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
