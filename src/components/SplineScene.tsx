"use client";

import Spline from "@splinetool/react-spline";
import { Suspense } from "react";

interface SplineSceneProps {
  scene: string;
  className?: string;
}

/**
 * Composant SplineScene
 * Intégration optimisée pour les animations Spline 3D.
 * Utilise le chargement différé (Suspense) pour de meilleures performances.
 */
export default function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div className={`w-full h-full min-h-[500px] relative ${className}`}>
      <Suspense fallback={
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/10 animate-pulse rounded-xl">
          <p className="text-sm text-gray-500">Chargement de l'univers 3D...</p>
        </div>
      }>
        <Spline 
          scene={scene} 
          onLoad={() => console.log("Spline scene loaded")}
          onError={() => console.log("Spline loading error")}
        />
      </Suspense>
    </div>
  );
}
