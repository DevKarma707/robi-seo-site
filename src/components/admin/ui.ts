/**
 * Primitives visuelles de l'admin.
 *
 * La classe `card` était copiée-collée à l'identique dans les 8 onglets :
 * changer le rayon ou l'opacité d'une surface demandait 8 éditions et
 * les valeurs avaient déjà commencé à diverger (BlogTab n'avait pas le
 * même point de départ). Une seule source ici.
 *
 * Échelle de rayons volontairement courte — au-delà de trois valeurs,
 * l'œil ne lit plus une hiérarchie mais du bruit :
 *   surfaces (cartes, panneaux)  → rounded-2xl
 *   contrôles (boutons, inputs)  → rounded-xl
 *   marqueurs (badges, pastilles)→ rounded-full
 */

/**
 * Surface standard : toute carte de l'admin part de là.
 *
 * Le rendu vient de `.a-card` (globals.css) plutôt que de classes Tailwind :
 * un dégradé, un liseré interne et une ombre portée ne s'expriment pas
 * proprement en utilitaires, et c'est ce trio qui donne le relief qui
 * manquait — auparavant tout partageait un unique blanc à 3 %.
 */
export const card = "a-card";

/** Surface cliquable : même base + réaction au survol. */
export const cardInteractive = `${card} a-card-hover`;

/**
 * Anneau de focus clavier. L'admin n'en avait aucun : naviguer à la
 * tabulation ne montrait rien. L'offset sur le fond de page évite que
 * l'anneau bave sur la bordure de la carte.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BEF221]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0425]";

/** Bouton secondaire (Recalculer, Réessayer, filtres…). */
export const btn = `inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 text-white transition-colors hover:bg-white/[0.18] disabled:opacity-40 disabled:hover:bg-white/10 ${focusRing}`;

/** Bouton principal lime. */
export const btnAccent = `inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl bg-[#BEF221] text-black transition-opacity hover:opacity-90 disabled:opacity-40 ${focusRing}`;

/**
 * Petits boutons-pastilles des barres d'action (Kanban, Acquisition,
 * Influenceurs) : le trio shape/ghost/primary y était copié à l'identique.
 * `btnPill` ne porte que la forme — la couleur vient de la variante ou de
 * l'appelant, qui compose parfois son propre fond (état actif du Kanban).
 */
export const btnPill = `px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed ${focusRing}`;

export const btnGhost = `${btnPill} bg-white/10 text-white hover:bg-white/20`;
export const btnPrimary = `${btnPill} bg-[#BEF221] text-black hover:opacity-90`;

/**
 * Champs de formulaire. `fieldBase` était copié à l'identique dans
 * Influenceurs, Acquisition et Kanban — commentaire compris.
 *
 * `w-full` et `w-auto` ont la même spécificité : placer `w-auto` après
 * dans l'attribut class ne suffit pas, c'est l'ordre dans le CSS généré
 * qui tranche. D'où deux classes distinctes plutôt qu'une surcharge.
 */
const fieldBase =
  `px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm outline-none transition-colors focus:border-[#BEF221]/40 focus:bg-white/[0.08]`;

export const input = `w-full ${fieldBase}`;
export const select = `w-auto ${fieldBase}`;

/** Titre de section à l'intérieur d'une carte. */
export const sectionTitle = "text-[13px] font-bold tracking-tight text-white/90";

/** Libellé de KPI, au-dessus du chiffre. */
export const kpiLabel = "text-[10px] font-bold uppercase tracking-[0.14em] text-white/35";

/**
 * Chiffre de KPI. `tabular-nums` fixe la largeur des chiffres : sans ça,
 * un compteur qui passe de 111 à 999 change de largeur et la carte
 * tremble à chaque rafraîchissement.
 */
export const kpiValue = "font-black text-[34px] leading-none tracking-tight tabular-nums a-figure";

export const ACCENT = "#BEF221";
