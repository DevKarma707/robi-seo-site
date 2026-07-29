// Generates src/lib/worldPaths.ts — a static {ISO_A2: svgPath} map so the admin
// world map ships as plain SVG with zero runtime dependency.
//
// Run again only when the geometry needs refreshing:
//   node scripts/gen-world-map.mjs
//
// Source: Natural Earth 1:110m admin-0 countries, public domain (CC0), via the
// natural-earth-vector repo. Requires network access.
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const SRC =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

export const WIDTH = 900;
export const HEIGHT = 460;

// Antarctica adds a third of the height and nobody sells invoicing software there.
const SKIP = new Set(["AQ"]);

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const res = await fetch(SRC);
if (!res.ok) throw new Error(`Téléchargement Natural Earth échoué: ${res.status}`);
const geo = await res.json();

const features = geo.features.filter((f) => {
  const code = f.properties.ISO_A2_EH || f.properties.ISO_A2;
  return code && code !== "-99" && !SKIP.has(code);
});

const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], {
  type: "FeatureCollection",
  features,
});
// 1 decimal is invisible at this size and roughly halves the payload.
const path = geoPath(projection).pointRadius(1);

const entries = [];
for (const f of features) {
  const code = f.properties.ISO_A2_EH || f.properties.ISO_A2;
  const d = path(f);
  if (!d) continue;
  const compact = d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10));
  entries.push([code, f.properties.NAME, compact]);
}
entries.sort((a, b) => a[0].localeCompare(b[0]));

const out = `// GÉNÉRÉ — ne pas éditer à la main. Voir scripts/gen-world-map.mjs
// Géométrie : Natural Earth 1:110m admin-0, domaine public (CC0).
export const MAP_WIDTH = ${WIDTH};
export const MAP_HEIGHT = ${HEIGHT};

/** Nom anglais court par code ISO 3166-1 alpha-2. */
export const COUNTRY_LABEL: Record<string, string> = {
${entries.map(([c, n]) => `  ${c}: ${JSON.stringify(n)},`).join("\n")}
};

/** Tracé SVG projeté (Natural Earth 1) par code ISO 3166-1 alpha-2. */
export const COUNTRY_PATH: Record<string, string> = {
${entries.map(([c, , d]) => `  ${c}: ${JSON.stringify(d)},`).join("\n")}
};
`;

const dest = join(root, "src/lib/worldPaths.ts");
writeFileSync(dest, out, "utf8");
console.log(`✓ ${entries.length} pays → src/lib/worldPaths.ts (${Math.round(out.length / 1024)} Ko)`);
