/**
 * Socle commun des modules de l'accueil (refonte du 01/10/2026, esprit
 * « page produit Apple ») : un seul style de titre, un seul rythme vertical,
 * une seule histoire de démo (celle du héros : src/lib/i18n/heroDevice.ts).
 */
export const SECTION = "py-16 md:py-24 lg:py-32";
export const H2 = "text-[28px] md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.08] [text-wrap:balance]";
export const LEAD = "text-base md:text-lg lg:text-xl leading-relaxed";
/** Carte « verre sombre » : la surface des visuels produit. */
export const GLASS = "rounded-[28px] border border-white/10 bg-[#0D0630] shadow-[0_30px_80px_rgba(13,6,48,0.30)]";

/** Montant dans la devise du pays (`demo` = getHeroDeviceCopy(locale)). */
export function money(demo: { locale: string; currency: string }, amount: number, decimals = 2) {
  return new Intl.NumberFormat(demo.locale, { style: "currency", currency: demo.currency, minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(amount);
}
export function today(locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "2-digit" }).format(new Date());
}
export function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
