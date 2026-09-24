/**
 * Le brief du mois pour la skill robi-social-media, en ligne de commande.
 *
 *   npx tsx scripts/socialBrief.ts                 → octobre courant, marché fr
 *   npx tsx scripts/socialBrief.ts 2026-10 fr      → mois et marché explicites
 *   npx tsx scripts/socialBrief.ts 2026-10 fr --json   → l'historique brut (imageUrl compris)
 *
 * Pourquoi : le bouton « Copier le brief du mois » de l'admin met le brief
 * dans le presse-papiers de Ralph, pas dans la session Claude Code. Une
 * session qui démarre sans Ralph devant l'écran n'avait donc aucun moyen de
 * savoir ce qui a déjà été publié — et refaisait les mêmes angles. Ce script
 * lit la même collection avec la même grille (editorialGrid.ts) et sort le
 * même brief, sans passer par un humain.
 *
 * Authentification : FIREBASE_SERVICE_ACCOUNT dans .env.local, comme
 * scripts/kanban.ts. Lecture seule.
 */
import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  ANGLES, PERSONAS, PILIERS, ECART_ANGLE, ECART_PERSONA,
  diagnostiquer, proposerCases, libelleAngle, libellePersona, libellePilier,
} from "../src/lib/editorialGrid";
import { MARKET_META, marketOf, type MarketId } from "../src/lib/markets";
import type { SocialPost } from "../src/lib/socialPosts";

const loadEnv = () => {
  const f = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
};
loadEnv();

const RAW = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!RAW) {
  console.error("FIREBASE_SERVICE_ACCOUNT manquant dans .env.local.");
  process.exit(1);
}
const sa = JSON.parse(RAW) as { private_key?: string };
if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
const app = getApps()[0] ?? initializeApp({ credential: cert(sa as never) });
const db = getFirestore(app);

const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const json = process.argv.includes("--json");
const now = new Date();
const [yStr, mStr] = (args[0] ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`).split("-");
const year = Number(yStr);
const month = Number(mStr) - 1; // 0-based, comme dans ReseauxTab
const market = (args[1] ?? "fr") as MarketId;
if (!MARKET_META[market]) {
  console.error(`Marché inconnu : ${market}`);
  process.exit(1);
}

const main = async () => {
  const snap = await db.collection("socialPosts").orderBy("date").get();
  const history = snap.docs.map((d) => ({ id: d.id, ...(d.data() as SocialPost) }));

  if (json) {
    console.log(JSON.stringify(history.filter((p) => marketOf(p) === market), null, 2));
    return;
  }

  const m = MARKET_META[market];
  const passe = history.filter(
    (p) => marketOf(p) === market && (p.status !== "draft" || p.date < `${year}-${String(month + 1).padStart(2, "0")}`)
  );
  const digest = passe.slice(-60).map((p) => {
    const hook = p.caption.split("\n").find((l) => l.trim()) ?? "";
    const boite = [p.pilier, p.persona, p.angle].filter(Boolean).join("/") || "case non renseignée";
    return `- ${p.date} · ${p.channel} · ${p.type} · ${p.status} · ${boite} — « ${hook.slice(0, 80)} »`;
  });
  const diag = diagnostiquer(passe);
  const cases = proposerCases(passe, 12);

  const lignes = [
    `/robi-social-media ${MONTH_NAMES[month]} ${year} --marche ${market}`,
    "",
    `Marché ${m.drapeau} ${m.label} · langue ${m.langue} · adresse « ${m.adresse} » · devise ${m.devise} · pays ${m.pays.join(", ")}.`,
    market === "fr"
      ? "Factur-X et l'obligation du 1er septembre 2026 sont des arguments FRANÇAIS : à garder."
      : "Factur-X ne concerne PAS ce marché : ne le cite pas.",
    "",
    "── GRILLE ──",
    "  pilier  : " + PILIERS.map((x) => x.id).join(" | "),
    "  persona : " + PERSONAS.map((x) => x.id).join(" | "),
    "  angle   : " + ANGLES.map((x) => x.id).join(" | "),
    `Espacement : même persona à ≥ ${ECART_PERSONA} posts, même angle à ≥ ${ECART_ANGLE}.`,
    "",
    diag.piliersEnRetard.length
      ? "Piliers en retard : " + diag.piliersEnRetard.map((x) => `${x.id} (${Math.round(x.observe * 100)} % vs ${Math.round(x.cible * 100)} %)`).join(", ")
      : "Mélange des piliers conforme.",
    diag.interdits.personas.length || diag.interdits.angles.length
      ? "TROP RÉCENTS : " + [...diag.interdits.personas, ...diag.interdits.angles].join(", ")
      : "Aucune case trop récente.",
    "",
    "Cases libres proposées :",
    ...cases.map((c, i) => `  ${i + 1}. ${libellePilier(c.pilier)} · ${libellePersona(c.persona)} · ${libelleAngle(c.angle)}   → "pilier":"${c.pilier}"${c.persona ? `, "persona":"${c.persona}"` : ""}, "angle":"${c.angle}"`),
    "",
    digest.length ? `Déjà écrit (${digest.length} posts) :` : "Aucun post existant.",
    ...digest,
  ];
  console.log(lignes.join("\n"));
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
