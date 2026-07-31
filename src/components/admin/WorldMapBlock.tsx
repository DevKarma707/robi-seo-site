"use client";

import React, { useMemo, useState } from "react";
import { Map as MapIcon } from "lucide-react";
import { COUNTRY_PATH, COUNTRY_LABEL, MAP_WIDTH, MAP_HEIGHT } from "@/lib/worldPaths";

const ACCENT = "#BEF221";
/** Lime lisible sur carte blanche — voir ui.ts. */
const ACCENT_INK = "#6FA300";

/**
 * The 16 countries Robi actually supports — mirrors COUNTRIES_CONFIG in the
 * app's utils/taxLabel.ts (tax labels, legal mentions, locales). Keep the two
 * in sync: a country here that the app can't invoice for is a broken promise.
 */
export const TARGET_COUNTRIES = [
  "AE", "AU", "BE", "CA", "CH", "CI", "ES", "FR",
  "GB", "IE", "LU", "MA", "NL", "PT", "SN", "US",
] as const;

const TARGET_SET = new Set<string>(TARGET_COUNTRIES);

/** French names for the target countries; elsewhere we fall back to Natural Earth's. */
const FR_LABEL: Record<string, string> = {
  AE: "Émirats arabes unis", AU: "Australie", BE: "Belgique", CA: "Canada",
  CH: "Suisse", CI: "Côte d'Ivoire", ES: "Espagne", FR: "France",
  GB: "Royaume-Uni", IE: "Irlande", LU: "Luxembourg", MA: "Maroc",
  NL: "Pays-Bas", PT: "Portugal", SN: "Sénégal", US: "États-Unis",
};

const label = (code: string) => FR_LABEL[code] || COUNTRY_LABEL[code] || code;

type Props = {
  /** Signups per country, ISO alpha-2 (lower or upper case). "—" = not filled in. */
  countries: { code: string; count: number }[];
};

const WorldMapBlock: React.FC<Props> = ({ countries }) => {
  const [hover, setHover] = useState<string | null>(null);

  const { counts, unknown, max, activeTargets, silentTargets, offTarget } = useMemo(() => {
    const counts: Record<string, number> = {};
    let unknown = 0;
    for (const { code, count } of countries) {
      if (!code || code === "—") { unknown += count; continue; }
      counts[code.toUpperCase()] = (counts[code.toUpperCase()] || 0) + count;
    }
    const active = Object.keys(counts);
    return {
      counts,
      unknown,
      max: Math.max(1, ...Object.values(counts)),
      activeTargets: active.filter((c) => TARGET_SET.has(c)),
      silentTargets: TARGET_COUNTRIES.filter((c) => !counts[c]),
      offTarget: active.filter((c) => !TARGET_SET.has(c)),
    };
  }, [countries]);

  const styleFor = (code: string) => {
    const n = counts[code] || 0;
    if (n > 0) {
      // Active: solid lime, intensity by volume.
      const t = 0.4 + 0.6 * (n / max);
      return { fill: ACCENT, fillOpacity: t, stroke: ACCENT, strokeOpacity: 1, width: 0.5 };
    }
    if (TARGET_SET.has(code)) {
      // Targeted but silent: hollow with a clearly readable lime outline. This
      // is the state that has to stand out — it's the map's whole point.
      return { fill: ACCENT, fillOpacity: 0.13, stroke: ACCENT, strokeOpacity: 0.85, width: 0.9 };
    }
    return { fill: "#ffffff", fillOpacity: 0.045, stroke: "#ffffff", strokeOpacity: 0.07, width: 0.4 };
  };

  const hovered = hover
    ? { code: hover, count: counts[hover] || 0, target: TARGET_SET.has(hover) }
    : null;

  return (
    <div className="rounded-2xl border bg-slate-50 border-slate-200 p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <MapIcon size={15} style={{ color: ACCENT_INK }} />
          <p className="text-xs font-black uppercase tracking-widest text-slate-900">Couverture monde</p>
        </div>
        <div className="text-right">
          <p className="font-black text-2xl" style={{ color: ACCENT_INK }}>
            {activeTargets.length}<span className="text-slate-400 text-base">/{TARGET_COUNTRIES.length}</span>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-slate-500">pays cibles actifs</p>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="w-full h-auto"
          role="img"
          aria-label="Carte du monde des pays couverts par Robi"
        >
          {Object.entries(COUNTRY_PATH).map(([code, d]) => {
            const s = styleFor(code);
            const isHover = hover === code;
            return (
              <path
                key={code}
                d={d}
                fill={s.fill}
                fillOpacity={isHover ? Math.min(1, s.fillOpacity + 0.25) : s.fillOpacity}
                stroke={s.stroke}
                strokeOpacity={s.strokeOpacity}
                strokeWidth={isHover ? 1.4 : s.width}
                onMouseEnter={() => setHover(code)}
                onMouseLeave={() => setHover((h) => (h === code ? null : h))}
                style={{ cursor: "default", transition: "fill-opacity 150ms" }}
              />
            );
          })}
        </svg>

        {hovered && (
          <div className="absolute top-0 left-0 pointer-events-none rounded-xl px-3 py-2 bg-[#0A0425]/95 border border-slate-200 shadow-xl">
            <p className="text-xs font-black text-slate-900">{label(hovered.code)}</p>
            <p className="text-[11px] text-slate-600">
              {hovered.count > 0
                ? `${hovered.count} inscrit${hovered.count > 1 ? "s" : ""}`
                : hovered.target ? "pays cible · aucun inscrit" : "hors cible"}
            </p>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[11px]">
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: ACCENT }} /> Actif (inscrits)
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded-sm border" style={{ borderColor: ACCENT, backgroundColor: `${ACCENT}12` }} /> Ciblé, aucun inscrit
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <span className="w-3 h-3 rounded-sm bg-slate-50 border border-slate-200" /> Hors cible
        </span>
      </div>

      {/* Lecture */}
      <div className="mt-4 space-y-1.5 text-[11px] leading-relaxed">
        {silentTargets.length > 0 && (
          <p className="text-slate-600">
            <span className="text-slate-700 font-bold">Cibles encore muettes ({silentTargets.length})</span> ·{" "}
            {silentTargets.map(label).join(", ")}.
          </p>
        )}
        {offTarget.length > 0 && (
          <p className="text-amber-600">
            <span className="font-bold">Inscrits hors pays supportés</span> ·{" "}
            {offTarget.map(label).join(", ")} — la TVA et les mentions légales ne sont pas
            gérées pour ces pays.
          </p>
        )}
        {unknown > 0 && (
          <p className="text-slate-500">
            {unknown} compte{unknown > 1 ? "s" : ""} sans pays renseigné, donc absent
            {unknown > 1 ? "s" : ""} de la carte. Le pays conditionne la TVA et le
            Factur-X : c&apos;est le champ à rendre obligatoire à l&apos;inscription.
          </p>
        )}
      </div>
    </div>
  );
};

export default WorldMapBlock;
