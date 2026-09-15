/**
 * Vérification de la grille éditoriale, hors navigateur.
 *
 *   npx tsx scripts/checkEditorialGrid.ts
 *
 * Ce que ça protège : la redondance ne se voit qu'après coup, quand le compte
 * est déjà monotone. Personne ne remarque « tiens, le quatrième artisan
 * débordé du mois » au moment d'écrire.
 */
import {
  diagnostiquer, proposerCases, PERSONAS, PILIERS, ANGLES,
  ECART_PERSONA, ECART_ANGLE,
} from "../src/lib/editorialGrid";
import type { SocialPost } from "../src/lib/socialPosts";

let ok = 0;
let ko = 0;
const t = (nom: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "✅" : "❌"} ${nom}${cond ? "" : "  →  " + detail}`);
  if (cond) ok++;
  else ko++;
};

let jour = 0;
const post = (p: Partial<SocialPost> = {}): SocialPost => ({
  id: `p${++jour}`,
  date: `2026-09-${String(jour).padStart(2, "0")}`,
  channel: "instagram",
  type: "bold",
  caption: "texte",
  status: "published",
  ...p,
});

// ── Les axes ───────────────────────────────────────────────────────────────
t("les parts des piliers font 100 %",
  Math.abs(PILIERS.reduce((s, p) => s + p.part, 0) - 1) < 1e-9);
t("aucun identifiant en double",
  [PERSONAS, PILIERS, ANGLES].every((xs) => new Set(xs.map((x) => x.id)).size === xs.length));
t("l'espace dépasse 500 cases",
  PERSONAS.length * PILIERS.length * ANGLES.length > 500);

// ── Diagnostic ─────────────────────────────────────────────────────────────
t("historique vide → tous les piliers en retard",
  diagnostiquer([]).piliersEnRetard.length === PILIERS.length);

const dixSituations = Array.from({ length: 10 }, () =>
  post({ pilier: "situation", persona: "menuisier", angle: "temps-perdu" })
);
t("dix posts du même pilier → les quatre autres sont en retard",
  diagnostiquer(dixSituations).piliersEnRetard.length === 4);
t("un pilier surreprésenté n'est pas listé en retard",
  !diagnostiquer(dixSituations).piliersEnRetard.some((p) => p.id === "situation"));

t(`le persona des ${ECART_PERSONA} derniers posts est interdit`,
  diagnostiquer(dixSituations).interdits.personas.includes("menuisier"));
t(`l'angle des ${ECART_ANGLE} derniers posts est interdit`,
  diagnostiquer(dixSituations).interdits.angles.includes("temps-perdu"));

t("un persona utilisé il y a longtemps n'est plus interdit", (() => {
  const vieux = [
    post({ persona: "menuisier", angle: "temps-perdu" }),
    ...Array.from({ length: 6 }, () => post({ persona: "graphiste", angle: "liberte" })),
  ];
  return !diagnostiquer(vieux).interdits.personas.includes("menuisier");
})());

t("jamais servi passe devant servi il y a longtemps", (() => {
  const d = diagnostiquer([post({ persona: "menuisier", angle: "temps-perdu" })]);
  // « menuisier » a servi, donc il ne peut pas être en tête des froids.
  return d.personasFroids[0] !== "menuisier" && d.personasFroids.at(-1) === "menuisier";
})());

t("les posts sont classés par date, pas par ordre du tableau", (() => {
  const a = post({ date: "2026-09-20", persona: "kine", angle: "legitimite" });
  const b = post({ date: "2026-09-01", persona: "plombier", angle: "liberte" });
  // b est le plus ancien : c'est « kine » qui doit être frais, pas « plombier ».
  const d = diagnostiquer([a, b]);
  return d.interdits.personas.includes("kine");
})());

// ── Propositions ───────────────────────────────────────────────────────────
t("propose exactement le nombre demandé", proposerCases([], 12).length === 12);

t("aucune proposition ne reprend une case trop récente", (() => {
  const d = diagnostiquer(dixSituations);
  const props = proposerCases(dixSituations, 12);
  return props.every(
    (c) => !d.interdits.personas.includes(c.persona!) && !d.interdits.angles.includes(c.angle)
  );
})());

t("deux propositions consécutives changent d'angle", (() => {
  const props = proposerCases([], 12);
  return props.every((c, i) => i === 0 || c.angle !== props[i - 1].angle);
})());

t("deux propositions consécutives changent de persona", (() => {
  const props = proposerCases([], 12).filter((c) => c.persona);
  return props.every((c, i) => i === 0 || c.persona !== props[i - 1].persona);
})());

t("le statement ne porte pas de persona : c'est une punchline plein écran",
  proposerCases([], 12).every((c) => c.pilier !== "statement" || c.persona === undefined));

t("déterministe : deux appels identiques donnent la même liste",
  JSON.stringify(proposerCases(dixSituations, 8)) === JSON.stringify(proposerCases(dixSituations, 8)));

t("l'historique change les propositions — sinon la mémoire ne sert à rien",
  JSON.stringify(proposerCases([], 8)) !== JSON.stringify(proposerCases(dixSituations, 8)));

t("le pilier le plus en retard sort en premier", (() => {
  const d = diagnostiquer(dixSituations);
  return proposerCases(dixSituations, 3)[0].pilier === d.piliersEnRetard[0].id;
})());

t("toutes les propositions sont des identifiants valides", (() => {
  const props = proposerCases(dixSituations, 12);
  return props.every(
    (c) =>
      PILIERS.some((x) => x.id === c.pilier) &&
      ANGLES.some((x) => x.id === c.angle) &&
      (!c.persona || PERSONAS.some((x) => x.id === c.persona))
  );
})());

t("posts sans case renseignée → ne fait pas planter le diagnostic", (() => {
  const d = diagnostiquer([post(), post(), post()]);
  return d.renseignes === 0 && d.interdits.personas.length === 0;
})());

console.log(`\n${ko === 0 ? "✅ TOUT PASSE" : "❌ ÉCHECS"} — ${ok} ok, ${ko} ko\n`);
process.exit(ko ? 1 : 0);
