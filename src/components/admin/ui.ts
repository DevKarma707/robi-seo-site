/**
 * Primitives visuelles de l'admin.
 *
 * La classe `card` était copiée-collée à l'identique dans les 8 onglets :
 * changer le rayon ou l'opacité d'une surface demandait 8 éditions et
 * les valeurs avaient déjà commencé à diverger (BlogTab n'avait pas le
 * même point de départ). Une seule source ici.
 *
 * Refonte de septembre 2026 : l'admin existe en clair et en sombre. Aucune
 * primitive ne pose de couleur propre à un mode — les `slate-*` sont
 * redéfinis par `.a-root` (globals.css), si bien que `text-slate-900` est
 * une encre sombre en clair et une encre claire en sombre.
 *
 * Échelle de rayons volontairement courte — au-delà de trois valeurs,
 * l'œil ne lit plus une hiérarchie mais du bruit :
 *   surfaces (cartes, panneaux)  → 12 px
 *   contrôles (boutons, inputs)  → rounded-lg
 *   marqueurs (badges, pastilles)→ rounded-full
 */

/**
 * Surface standard : toute carte de l'admin part de là.
 *
 * Plus d'ombre portée ni de dégradé : en clair un filet fin sur blanc, en
 * sombre une couche d'Amethyst un ton au-dessus du fond. C'est l'empilement
 * d'effets qui donnait l'air « template ».
 */
export const card = "a-card";

/** Surface cliquable : même base + réaction au survol. */
export const cardInteractive = `${card} a-card-hover`;

/**
 * Anneau de focus clavier. L'offset prend la couleur du fond de page, pour
 * que l'anneau ne bave pas sur la bordure de la carte, dans les deux modes.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--a-bg)]";

/**
 * Ancien anneau « sur fond sombre ». La sidebar suit désormais le mode : un
 * seul anneau suffit. Gardé en alias pour les appelants existants.
 */
export const focusRingDark = focusRing;

/** Retour tactile commun à tous les boutons. */
const press = "transition-[background-color,border-color,color,transform,filter] duration-150 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100";

/** Bouton secondaire (Recalculer, Réessayer, filtres…) : contour. */
export const btn = `inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-3 py-1.5 rounded-lg text-slate-700 border border-slate-200 hover:bg-slate-900/[0.04] hover:border-slate-300 ${press} ${focusRing}`;

/** Bouton principal : lime plein. Un par zone, sinon il ne guide plus. */
export const btnAccent = `inline-flex items-center gap-1.5 text-[12.5px] font-bold px-3.5 py-2 rounded-lg bg-[var(--color-accent)] text-[var(--a-on-accent)] hover:brightness-[1.05] ${press} ${focusRing}`;

/**
 * Petits boutons des barres d'action (Kanban, Acquisition, Influenceurs).
 * `btnPill` ne porte que la forme — la couleur vient de la variante ou de
 * l'appelant, qui compose parfois son propre fond (état actif du Kanban).
 * Fini les MAJUSCULES très grasses : elles criaient toutes en même temps.
 */
export const btnPill = `px-3 py-1.5 rounded-lg text-[12px] font-semibold disabled:cursor-not-allowed ${press} ${focusRing}`;

export const btnGhost = `${btnPill} text-slate-600 border border-slate-200 hover:bg-slate-900/[0.04] hover:text-slate-900`;
export const btnPrimary = `${btnPill} bg-[var(--color-accent)] text-[var(--a-on-accent)] hover:brightness-[1.05]`;

/**
 * Champs de formulaire. `fieldBase` était copié à l'identique dans
 * Influenceurs, Acquisition et Kanban — commentaire compris.
 *
 * `w-full` et `w-auto` ont la même spécificité : placer `w-auto` après
 * dans l'attribut class ne suffit pas, c'est l'ordre dans le CSS généré
 * qui tranche. D'où deux classes distinctes plutôt qu'une surcharge.
 */
const fieldBase =
  `px-3 py-2 rounded-lg bg-[var(--a-surface)] border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-[border-color,box-shadow] focus:border-[var(--admin-ink)] focus:ring-[3px] focus:ring-[var(--admin-ink)]/15`;

export const input = `w-full ${fieldBase}`;
export const select = `w-auto ${fieldBase}`;

/** Titre de section à l'intérieur d'une carte. */
export const sectionTitle = "text-[14.5px] font-bold tracking-[-0.01em] text-slate-900";

/** Libellé de KPI, au-dessus du chiffre. */
export const kpiLabel = "text-[12px] font-medium text-slate-500";

/**
 * Chiffre de KPI, en JetBrains Mono. `tabular-nums` fixe la largeur des
 * chiffres : sans ça, un compteur qui passe de 111 à 999 change de largeur
 * et la carte tremble à chaque rafraîchissement.
 */
export const kpiValue = "a-figure text-[30px] leading-none tracking-[-0.04em] tabular-nums";

export const ACCENT = "var(--color-accent)";

/**
 * Accent lisible sur la surface courante. En clair, `#BEF221` sur blanc
 * tombe à ~1,3:1 : on l'assombrit. En sombre, l'accent brut est lisible et
 * `.a-root` le reprend tel quel. ACCENT reste pour les aplats.
 */
export const ACCENT_INK = "var(--admin-ink)";
