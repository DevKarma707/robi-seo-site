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
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6FA300] focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/** Anneau de focus sur fond sombre (sidebar, coquille). */
export const focusRingDark =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BEF221]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0425]";

/** Bouton secondaire (Recalculer, Réessayer, filtres…). */
export const btn = `inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 transition-colors hover:bg-slate-200 disabled:opacity-40 ${focusRing}`;

/** Bouton principal lime. */
export const btnAccent = `inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl bg-[#0D0630] text-[#BEF221] transition-opacity hover:opacity-90 disabled:opacity-40 ${focusRing}`;

/**
 * Petits boutons-pastilles des barres d'action (Kanban, Acquisition,
 * Influenceurs) : le trio shape/ghost/primary y était copié à l'identique.
 * `btnPill` ne porte que la forme — la couleur vient de la variante ou de
 * l'appelant, qui compose parfois son propre fond (état actif du Kanban).
 */
export const btnPill = `px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed ${focusRing}`;

export const btnGhost = `${btnPill} bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200`;
export const btnPrimary = `${btnPill} bg-[#0D0630] text-[#BEF221] hover:bg-[#18314F]`;

/**
 * Champs de formulaire. `fieldBase` était copié à l'identique dans
 * Influenceurs, Acquisition et Kanban — commentaire compris.
 *
 * `w-full` et `w-auto` ont la même spécificité : placer `w-auto` après
 * dans l'attribut class ne suffit pas, c'est l'ordre dans le CSS généré
 * qui tranche. D'où deux classes distinctes plutôt qu'une surcharge.
 */
const fieldBase =
  `px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm outline-none transition-colors focus:border-[#6FA300] focus:bg-white`;

export const input = `w-full ${fieldBase}`;
export const select = `w-auto ${fieldBase}`;

/** Titre de section à l'intérieur d'une carte. */
export const sectionTitle = "a-display text-[15px] font-bold tracking-tight text-slate-900";

/** Libellé de KPI, au-dessus du chiffre. */
export const kpiLabel = "text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400";

/**
 * Chiffre de KPI. `tabular-nums` fixe la largeur des chiffres : sans ça,
 * un compteur qui passe de 111 à 999 change de largeur et la carte
 * tremble à chaque rafraîchissement.
 */
export const kpiValue = "a-display font-extrabold text-[34px] leading-none tracking-tight tabular-nums a-figure";

export const ACCENT = "#BEF221";

/**
 * Lime lisible sur fond clair. `#BEF221` sur blanc tombe à ~1,3:1 de
 * contraste : illisible en texte, presque invisible en icône. On garde
 * ACCENT pour les aplats (barres, badges sur fond sombre) et cette encre
 * plus dense dès que la couleur porte du sens sur une carte blanche.
 */
export const ACCENT_INK = "#6FA300";
