"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Bot, X } from "lucide-react";
import { useLaunchOffer, formatLaunchPrice, formatCurrentLaunchPrice } from "@/components/ui/LaunchSeats";
import styles from "./LaunchBar.module.css";

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
  /** « à vie » — le mot seul, dans le tampon */
  lifetimeWord?: string;
  /** « {d} j » · « {d}d » — les jours du chrono, dans la langue */
  days?: string;
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

/** « {remaining} places restantes » → le nombre dans un <mark>, le reste en texte. */
const withMark = (tpl: string, value: string, className: string): ReactNode => {
  const [avant, apres = ""] = tpl.split("{remaining}");
  return <>{avant}<mark className={`${className} bg-transparent text-inherit tabular-nums`}>{value}</mark>{apres}</>;
};

/** Le tampon rejoue sa séquence toutes les 7 s. */
const CYCLE_MS = 7000;

export function LaunchBar({ locale, copy, normal }: { locale: string; copy: LaunchBarCopy; normal: { amount: number; currency: string } }) {
  const offer = useLaunchOffer();
  const barRef = useRef<HTMLDivElement>(null);
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

  // Rejoue la séquence du tampon : on retire la classe, on force un reflow,
  // on la repose. Rien en mouvement réduit (le CSS affiche l'état final).
  const pret = !!offer?.tranche?.price;
  useEffect(() => {
    if (!pret || hidden) return;
    const el = barRef.current;
    if (!el) return;
    const rejouer = () => { el.classList.remove(styles.play); void el.offsetWidth; el.classList.add(styles.play); };
    rejouer();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(rejouer, CYCLE_MS);
    return () => window.clearInterval(id);
  }, [pret, hidden]);

  const tranche = offer?.tranche;
  if (hidden || !offer || !offer.enabled || !tranche || !tranche.purchasable) return null;
  const prix = formatCurrentLaunchPrice(tranche.price, locale);
  const suivant = formatLaunchPrice(tranche.nextPrice, locale);
  // Le prix barré n'a de sens que dans la même devise que le prix Polar :
  // « 59 € » à côté de « 129 £ » serait une comparaison fausse.
  const ancien = tranche.price && normal.currency === tranche.price.currency
    ? formatLaunchPrice({ amount: normal.amount, currency: normal.currency }, locale)
    : null;
  const motVie = copy.lifetimeWord || fill(copy.lifetime, { price: "" }).trim();
  const nf = new Intl.NumberFormat(locale);

  let chrono: string | null = null;
  if (chronoActif) {
    const s = Math.floor((deadline - now) / 1000);
    const j = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    chrono = `${j > 0 ? `${fill(copy.days || "{d} j", { d: String(j) })} ` : ""}${pad(h)}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }

  const fermer = () => {
    setHidden(true);
    try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch { /* sans conséquence */ }
  };

  return (
    <div ref={barRef} className={`${styles.bar} bg-[#BEF221] text-[#0D0630] overflow-hidden`}>
      {/* Tampon & marqueur : le prix est tamponné, l'ancien prix rayé d'un
          trait droit, les places surlignées — en boucle toutes les 7 s.
          Bouton à la taille de « Connexion », en négatif. */}
      <div className="max-w-7xl mx-auto h-11 lg:h-[60px] pl-5 pr-9 lg:pl-4 lg:pr-10 flex items-center justify-between md:justify-center gap-3 lg:gap-6 text-[13px] lg:text-[14.5px] whitespace-nowrap">
        <span className="hidden md:inline-flex items-center gap-2 font-semibold">
          <Bot className="w-[18px] h-[18px]" strokeWidth={2.2} aria-hidden="true" />
          {copy.badge}
        </span>
        <span className={styles.stampWrap} aria-label={fill(copy.lifetime, { price: prix })}>
          <span className={styles.ring} aria-hidden="true" />
          <span className={styles.ink} aria-hidden="true" />
          <span className={styles.ink} aria-hidden="true" />
          <span className={styles.ink} aria-hidden="true" />
          <span className={styles.stamp} aria-hidden="true"><b>{prix}</b><span>{motVie}</span></span>
        </span>
        {ancien && (
          <span className={`${styles.old} hidden sm:inline font-semibold`}>
            {ancien}
            <svg viewBox="0 0 70 30" preserveAspectRatio="none" aria-hidden="true"><path d="M4 15 L66 15" /></svg>
          </span>
        )}
        {tranche.remaining !== null && (
          <>
            <span className="hidden sm:inline font-semibold">{withMark(copy.seats, nf.format(tranche.remaining), styles.mark)}</span>
            <span className="sm:hidden font-semibold">{withMark(copy.seatsShort || "{remaining}", nf.format(tranche.remaining), styles.mark)}</span>
          </>
        )}
        {suivant && <span className="hidden xl:inline font-medium opacity-70">{fill(copy.next, { price: suivant })}</span>}
        {chrono && (
          <span className="hidden md:inline-flex items-baseline gap-1.5 font-medium">
            {copy.endsIn}
            <span className={`${styles.clock} tabular-nums font-extrabold tracking-tight text-[15px] lg:text-base`}>{chrono}</span>
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
