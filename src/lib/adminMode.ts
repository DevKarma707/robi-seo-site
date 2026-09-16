/**
 * Mode clair / sombre de l'admin.
 *
 * Indépendant du thème de couleurs (adminTheme.ts) : le thème choisit
 * l'accent et le primaire, le mode choisit le fond. Les deux se combinent.
 *
 * Le mode est posé en attribut sur <html> — et non en state React — pour
 * que le script de `layout.tsx` puisse l'appliquer avant le premier rendu.
 * Sans ça, un admin en sombre s'affichait une fraction de seconde en clair
 * à chaque chargement.
 *
 * Tant que rien n'a été choisi, on suit le réglage du système.
 */
export type AdminMode = "light" | "dark";

const KEY = "robi_admin_mode";
const ATTR = "data-admin-mode";
const QUERY = "(prefers-color-scheme: dark)";

const stored = (): AdminMode | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
};

export const getMode = (): AdminMode =>
  stored() ?? (window.matchMedia(QUERY).matches ? "dark" : "light");

export const getServerMode = (): AdminMode => "light";

const apply = () => document.documentElement.setAttribute(ATTR, getMode());

const listeners = new Set<() => void>();

export const subscribeMode = (cb: () => void) => {
  listeners.add(cb);
  // Sans choix mémorisé, basculer le Mac en sombre doit suivre en direct.
  const mq = window.matchMedia(QUERY);
  const onSystem = () => { apply(); cb(); };
  mq.addEventListener("change", onSystem);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", onSystem);
  };
};

export const setMode = (mode: AdminMode) => {
  try { localStorage.setItem(KEY, mode); } catch { /* navigation privée */ }
  // La classe n'active les transitions de couleur que pendant la bascule :
  // les laisser en permanence ferait traîner chaque survol.
  const root = document.documentElement;
  root.classList.add("a-mode-switching");
  apply();
  listeners.forEach((cb) => cb());
  window.setTimeout(() => root.classList.remove("a-mode-switching"), 400);
};

/** Script inline exécuté avant la peinture, voir l'en-tête. */
export const MODE_SCRIPT = `(function(){try{var m=localStorage.getItem("${KEY}");if(m!=="light"&&m!=="dark"){m=matchMedia("${QUERY}").matches?"dark":"light"}document.documentElement.setAttribute("${ATTR}",m)}catch(e){}})();`;
