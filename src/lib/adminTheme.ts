/**
 * Application du thème de couleurs dans l'admin.
 *
 * Reprend le mécanisme de l'app (contexts/ThemeContext.tsx) : les couleurs du
 * thème sont posées en variables CSS sur <html>, et tout le reste s'y réfère.
 * L'admin n'a donc plus une seule couleur en dur.
 *
 * Deux variables sont dérivées ici et n'existent pas côté app, parce que
 * l'admin pose des cartes CLAIRES sur une coquille sombre — un cas que l'app
 * n'a pas :
 *
 *  --admin-ink   accent assombri jusqu'à passer le seuil AA (4,5:1) sur blanc.
 *                Le taux de mélange est dicté par le pire cas mesuré, le canari
 *                du thème « Noir & Canari » : à 62 % d'accent il ne donnait que
 *                2,3:1. L'accent brut
 *                convient aux aplats mais pas au texte : le lime #BEF221 sur
 *                blanc tombe à ~1,3:1, et le canari du thème « Noir & Canari »
 *                est pire encore.
 *  --admin-shell fond de page, dérivé du primaire pour rester dans la famille
 *                du thème sans virer au noir.
 */
import { THEMES, type ThemeName } from "./themes";

const STORAGE_KEY = "robi_admin_theme";
export const DEFAULT_THEME: ThemeName = "blue-lime";

export const getStoredTheme = (): ThemeName => {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const v = localStorage.getItem(STORAGE_KEY);
  return v && v in THEMES ? (v as ThemeName) : DEFAULT_THEME;
};

/**
 * Petit store pour useSyncExternalStore : le thème vit dans localStorage,
 * donc hors de React. Le lire par ce biais évite l'écart d'hydratation (le
 * serveur ne connaît pas localStorage) sans passer par un setState dans un
 * effet, qui déclencherait un rendu en cascade.
 */
const listeners = new Set<() => void>();
export const subscribeTheme = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};
export const getServerTheme = (): ThemeName => DEFAULT_THEME;

const hexToRgb = (hex: string): string => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/**
 * Pose les variables CSS. **N'écrit rien** : au premier rendu, React part du
 * snapshot serveur (thème par défaut) avant de lire localStorage. Si cette
 * fonction persistait, elle écraserait le choix mémorisé à chaque
 * chargement — c'est exactement ce qui arrivait.
 */
export const applyTheme = (name: ThemeName) => {
  const theme = THEMES[name] ?? THEMES[DEFAULT_THEME];
  const r = document.documentElement.style;

  r.setProperty("--color-primary", theme.colors.primary);
  r.setProperty("--color-secondary", theme.colors.secondary);
  r.setProperty("--color-accent", theme.colors.accent);
  r.setProperty("--color-success", theme.colors.success);
  r.setProperty("--color-warning", theme.colors.warning);
  r.setProperty("--color-error", theme.colors.error);
  r.setProperty("--color-bg-main", theme.colors.bgMain);
  r.setProperty("--color-text-on-primary", theme.colors.textOnPrimary);
  r.setProperty("--color-text-on-accent", theme.colors.textOnAccent);
  r.setProperty("--color-text-main", theme.colors.textMain);
  r.setProperty("--color-primary-rgb", hexToRgb(theme.colors.primary));
  r.setProperty("--color-accent-rgb", hexToRgb(theme.colors.accent));

  // Dérivées propres à l'admin — voir l'en-tête. color-mix évite d'avoir à
  // maintenir une couleur d'encre par thème à la main.
  r.setProperty("--admin-ink", `color-mix(in srgb, ${theme.colors.accent} 34%, #0A1408)`);
  r.setProperty("--admin-shell", `color-mix(in srgb, ${theme.colors.primary} 88%, #000)`);

};

/** Choix explicite de l'utilisateur : lui seul persiste et notifie. */
export const selectTheme = (name: ThemeName) => {
  localStorage.setItem(STORAGE_KEY, name);
  applyTheme(name);
  listeners.forEach((cb) => cb());
};
