"use client";

import { MeshGradient } from "@paper-design/shaders-react";

/**
 * Fond animé du héro : la même recette « Paper Shaders » que la page de
 * connexion de l'app (components/RobiShaderBackground.tsx dans ROBI_APP) —
 * deux nappes MeshGradient lentes, grain, voile Amethyst — un cran plus
 * sombre, à la demande de Ralph (25/09/2026), pour que le texte et les cartes
 * gardent tout leur contraste.
 *
 * Chargé à part (next/dynamic, ssr: false) : le héro s'affiche d'abord sur
 * l'Amethyst plein, le fond apparaît dès que WebGL est prêt. Mouvement coupé
 * si prefers-reduced-motion, rendu plafonné à 1080p.
 */
const NAPPE_UNE = ["#0D0630", "#18314F", "#BEF221", "#0D0630", "#384E77"];
const NAPPE_DEUX = ["#0D0630", "#BEF221", "#18314F", "#0D0630"];
const PIXELS_MAX = 1920 * 1080;

export default function HeroShaderBackground() {
  const calme = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-[#0D0630]" aria-hidden="true">
      <MeshGradient
        className="!absolute inset-0"
        width="100%"
        height="100%"
        colors={NAPPE_UNE}
        speed={calme ? 0 : 0.3}
        distortion={0.8}
        swirl={0.35}
        maxPixelCount={PIXELS_MAX}
        minPixelRatio={1}
      />
      <MeshGradient
        className="!absolute inset-0 opacity-60"
        width="100%"
        height="100%"
        colors={NAPPE_DEUX}
        speed={calme ? 0 : 0.2}
        distortion={1}
        swirl={0.6}
        grainOverlay={0.12}
        maxPixelCount={PIXELS_MAX}
        minPixelRatio={1}
      />
      {/* Voile Amethyst, plus appuyé que sur la page de connexion (0,22 → 0,34
          au centre, 0,62 → 0,74 sur les bords) : le lime reste une lueur. */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, rgba(13, 6, 48, 0.34) 0%, rgba(13, 6, 48, 0.74) 75%)" }}
      />
    </div>
  );
}
