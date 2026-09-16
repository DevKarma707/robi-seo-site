"use client";

/**
 * Les détails qui bougent : chiffres qui comptent, courbes qui se dessinent.
 *
 * Tout respecte `prefers-reduced-motion` — côté JS ici, côté CSS dans
 * globals.css — et rien ne retarde l'affichage d'une donnée : un chiffre
 * animé part de sa valeur précédente, jamais d'un écran vide.
 */
import React, { useId, useLayoutEffect, useRef, useState } from "react";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** « 1 284 », « 41 % », « 4,2 » — le nombre en tête et ce qui le suit. */
const LEADING_NUMBER = /^(-?\d[\d\s  ]*?)([.,]\d+)?(\D[\s\S]*)?$/;

function parseLeading(text: string) {
  const m = LEADING_NUMBER.exec(text.trim());
  if (!m) return null;
  const int = m[1].replace(/[\s  ]/g, "");
  const dec = m[2] ?? "";
  return {
    n: Number(dec ? `${int}.${dec.slice(1)}` : int),
    decimals: dec ? dec.length - 1 : 0,
    sep: dec ? dec[0] : ",",
    rest: m[3] ?? "",
  };
}

/**
 * Chiffre de KPI qui compte jusqu'à sa valeur.
 *
 * Toute valeur qui ne commence pas par un nombre (« — », « J-14 ») est
 * rendue telle quelle. Le texte final est toujours celui fourni : l'anim
 * n'écrit que des étapes intermédiaires.
 */
export function CountUp({ value, duration = 900 }: { value: React.ReactNode; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const text = typeof value === "number" ? String(value) : typeof value === "string" ? value : null;

  useLayoutEffect(() => {
    const el = ref.current;
    const p = text === null ? null : parseLeading(text);
    if (!el || text === null || !p || !Number.isFinite(p.n)) return;
    if (reducedMotion() || from.current === p.n) {
      from.current = p.n;
      return;
    }
    const start = from.current;
    const target = p.n;
    const fmt = (x: number) => {
      const [i, d] = x.toFixed(p.decimals).split(".");
      const int = Math.abs(target) >= 1000 ? Number(i).toLocaleString("fr-FR") : i;
      return `${int}${d ? p.sep + d : ""}${p.rest}`;
    };

    let raf = 0;
    const t0 = performance.now();
    el.textContent = fmt(start);
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      el.textContent = fmt(start + (target - start) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) {
        raf = requestAnimationFrame(step);
      } else {
        el.textContent = text;
        // Mis à jour à la fin seulement : en mode strict, l'effet est joué
        // deux fois et le second doit encore animer.
        from.current = target;
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = text;
    };
  }, [text, duration]);

  if (text === null) return <>{value}</>;
  return <span ref={ref}>{text}</span>;
}

export interface CurvePoint {
  value: number;
  /** Libellé du point dans l'infobulle (une date, le plus souvent). */
  label: string;
  /** Pastille lime sur le point : un jour qui mérite d'être repéré. */
  mark?: boolean;
}

/** Catmull-Rom → Bézier, bornée pour ne jamais passer sous l'axe. */
function smoothPath(pts: [number, number][], maxY: number) {
  const clamp = (y: number) => Math.min(maxY, Math.max(0, y));
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = clamp(p1[1] + (p2[1] - p0[1]) / 6);
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = clamp(p2[1] - (p3[1] - p1[1]) / 6);
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/**
 * Courbe d'aire : remplace les histogrammes de visites et d'impressions.
 *
 * Tracée en pixels réels (largeur mesurée) plutôt qu'avec un viewBox étiré :
 * un tracé déformé épaissit les pentes et écrase les plateaux.
 */
export function AreaCurve({
  points,
  height = 140,
  format = (n: number) => n.toLocaleString("fr-FR"),
}: {
  points: CurvePoint[];
  height?: number;
  format?: (n: number) => string;
}) {
  const gradientId = `a-curve-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = 6;
  const max = Math.max(1, ...points.map((p) => p.value));
  const xy = points.map((p, i): [number, number] => [
    points.length > 1 ? (i / (points.length - 1)) * width : width / 2,
    height - pad - (p.value / max) * (height - pad * 2),
  ]);
  const step = points.length > 1 ? 100 / (points.length - 1) : 100;
  const last = xy[xy.length - 1];

  return (
    <div ref={box} className="a-curve" style={{ height }}>
      {width > 0 && points.length > 1 && (
        <>
          <svg width={width} height={height} className="absolute inset-0 overflow-visible" aria-hidden>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="a-curve-stop-top" />
                <stop offset="100%" className="a-curve-stop-bottom" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={0} x2={width} y1={height * f} y2={height * f} className="a-curve-grid" />
            ))}
            <path d={`${smoothPath(xy, height)} L${width},${height} L0,${height} Z`} fill={`url(#${gradientId})`} className="a-curve-area" />
            <path d={smoothPath(xy, height)} className="a-curve-line" pathLength={1} />
          </svg>

          {points.map((p, i) =>
            p.mark ? <span key={i} className="a-curve-mark" style={{ left: xy[i][0], top: xy[i][1] }} /> : null
          )}
          <span className="a-curve-end" style={{ left: last[0], top: last[1] }} />

          {points.map((p, i) => (
            <div key={i} className="a-curve-hit" style={{ left: `${(i / (points.length - 1)) * 100 - step / 2}%`, width: `${step}%` }}>
              <span className="a-curve-cursor" />
              <span className="a-curve-dot" style={{ top: xy[i][1] }} />
              <span className="a-curve-tip a-mono" style={{ top: xy[i][1] }}>
                {format(p.value)} · {p.label}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
