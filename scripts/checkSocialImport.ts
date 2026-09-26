/**
 * Vérification de la logique d'import des posts sociaux, hors navigateur.
 *
 * Ce dépôt n'a pas de suite de tests, et l'import est l'endroit où une erreur
 * coûte le plus cher : un post écrasé, un doublon publié, une ligne perdue en
 * silence. Tout ce qui est décidable sans Firestore est décidé dans
 * `socialImport.ts` — et vérifié ici.
 *
 *   npx tsx scripts/checkSocialImport.ts
 *
 * N'atteint ni Firestore ni Blotato : la transaction et l'écriture réelle
 * restent non couvertes, et c'est écrit tel quel dans la PR.
 */
import {
  parseSocialImport,
  validateImportPost,
  planSocialImport,
  type ExistingPost,
  type ImportPost,
} from "../src/lib/socialImport";

let ok = 0;
let ko = 0;
const t = (nom: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "✅" : "❌"} ${nom}${cond ? "" : "  →  " + detail}`);
  if (cond) ok++;
  else ko++;
};

const BASE = {
  externalId: "2026-09-paye-ig",
  date: "2026-09-20",
  channel: "instagram",
  type: "bold",
  caption: "Payé. Sans relancer.",
};

const valide = (o: unknown): ImportPost => {
  const r = validateImportPost(o, 0);
  if (!r.ok) throw new Error(`fixture invalide : ${r.error}`);
  return r.post;
};

// ── Lecture du JSON ───────────────────────────────────────────────────
console.log("\n— Lecture du JSON —");
t("JSON invalide rejeté", !parseSocialImport("{pas du json").ok);
t("JSON vide rejeté", !parseSocialImport("null").ok);
t("tableau vide rejeté", !parseSocialImport("[]").ok);
t("objet seul accepté comme lot de 1", (() => {
  const r = parseSocialImport(JSON.stringify(BASE));
  return r.ok && r.items.length === 1;
})());

// ── Validation ligne à ligne ──────────────────────────────────────────
console.log("\n— Validation —");
const rejette = (o: unknown, attendu: string) => {
  const r = validateImportPost(o, 0);
  return !r.ok && r.error.toLowerCase().includes(attendu.toLowerCase());
};
t("élément null rejeté", rejette(null, "vide"));
t("tableau imbriqué rejeté", rejette([1], "tableau"));
t("externalId absent rejeté", rejette({ ...BASE, externalId: "" }, "externalId"));
t("externalId avec espace rejeté", rejette({ ...BASE, externalId: "a b" }, "invalide"));
t("externalId avec slash rejeté", rejette({ ...BASE, externalId: "a/b" }, "invalide"));
t("externalId de 121 caractères rejeté", rejette({ ...BASE, externalId: "a".repeat(121) }, "invalide"));
t("externalId de 120 caractères accepté", validateImportPost({ ...BASE, externalId: "a".repeat(120) }, 0).ok);
t("date absente rejetée", rejette({ ...BASE, date: "" }, "date"));
t("date inexistante (2026-02-30) rejetée", rejette({ ...BASE, date: "2026-02-30" }, "date"));
t("caption vide rejetée", rejette({ ...BASE, caption: "   " }, "caption"));
t("réseau inconnu REJETÉ, pas remplacé", rejette({ ...BASE, channel: "twitter" }, "twitter"));
t("type inconnu rejeté", rejette({ ...BASE, type: "gif" }, "type"));
t("imageUrl en http rejetée", rejette({ ...BASE, imageUrl: "http://x/i.png" }, "https"));
t("imageUrl chemin local rejetée", rejette({ ...BASE, imageUrl: "reseaux/post.png" }, "https"));
t("imageUrl https acceptée", (() => {
  const r = validateImportPost({ ...BASE, imageUrl: "https://x/i.png" }, 0);
  return r.ok && r.post.imageUrl === "https://x/i.png";
})());
t("champ facultatif vide non propagé", (() => {
  const r = validateImportPost({ ...BASE, hashtags: "   " }, 0);
  return r.ok && r.post.hashtags === undefined;
})());
t("statut « ready » du JSON NON appliqué", (() => {
  const r = validateImportPost({ ...BASE, status: "ready" }, 0);
  return r.ok && r.post.status === "draft" && r.post.statusIgnored === "ready";
})());
t("date passée ACCEPTÉE (rattrapage d'historique)", validateImportPost({ ...BASE, date: "2020-01-15" }, 0).ok);

// ── Décisions ─────────────────────────────────────────────────────────
console.log("\n— Décisions —");
const enBase = (o: Partial<ExistingPost> = {}): ExistingPost => ({
  id: "doc1",
  externalId: BASE.externalId,
  date: BASE.date,
  channel: "instagram",
  type: "bold",
  caption: BASE.caption,
  status: "draft",
  ...o,
});

t("post neuf → création", planSocialImport([valide(BASE)], []).actions[0].action === "create");

const avecImage = planSocialImport([valide({ ...BASE, imageUrl: "https://x/i.png" })], [enBase()]).actions[0];
t("réimport avec image → enrichissement", avecImage.action === "enrich" && (avecImage as { patch: ImportPost }).patch.imageUrl === "https://x/i.png", JSON.stringify(avecImage));

t("réimport identique → ignoré, aucune écriture", (() => {
  const a = planSocialImport([valide(BASE)], [enBase()]).actions[0];
  return a.action === "skip" && a.reason === "identique";
})());

for (const statut of ["ready", "published"] as const) {
  const a = planSocialImport([valide({ ...BASE, caption: "Texte réécrit" })], [enBase({ status: statut })]).actions[0];
  t(
    `post « ${statut} » protégé`,
    a.action === "skip" && a.reason.includes("protégé"),
    JSON.stringify(a)
  );
}

t("deux légendes au même début restent distinctes", (() => {
  const debut = "Tu envoies la facture et tu attends trois semaines";
  const a = valide({ ...BASE, externalId: "post-a", caption: `${debut} — angle A.` });
  const b = valide({ ...BASE, externalId: "post-b", caption: `${debut} — angle B.` });
  const r = planSocialImport([a, b], []);
  return r.actions.filter((x) => x.action === "create").length === 2;
})());

t("double import simulé → aucun doublon", (() => {
  const p = valide(BASE);
  const premier = planSocialImport([p], []);
  const cree = premier.actions[0];
  if (cree.action !== "create") return false;
  // Le second passe sur une base contenant déjà le post créé.
  const second = planSocialImport([p], [enBase()]);
  return second.actions[0].action === "skip";
})());

t("même externalId deux fois dans le lot → signalé", (() => {
  const r = planSocialImport([valide(BASE), valide(BASE)], []);
  return r.errors.length === 1 && r.actions[1].action === "skip";
})());

t("id ancien introuvable → aucun document créé", (() => {
  const r = planSocialImport([valide({ ...BASE, id: "inconnu" })], [enBase()]);
  return r.actions[0].action === "skip" && r.errors[0].includes("inconnu");
})());

t("id ancien existant → enrichissement ciblé", (() => {
  const ancien = enBase({ id: "vieux", externalId: undefined, caption: "Ancien texte" });
  const a = planSocialImport([valide({ ...BASE, id: "vieux" })], [ancien]).actions[0];
  return a.action === "enrich" && a.id === "vieux" && (a as { patch: ImportPost }).patch.externalId === BASE.externalId;
})());

t("statut « publishing » refusé : il appartient à la file, pas au fichier", (() => {
  const r = validateImportPost({ ...BASE, status: "publishing" }, 1);
  return !r.ok && r.error.includes("statut inconnu");
})());

// ── Propositions de textes (A/B) ───────────────────────────────────────────
t("deux textes proposés : le premier devient caption si elle manque", (() => {
  const { caption: _c, ...sans } = BASE;
  void _c;
  const r = validateImportPost({ ...sans, captionPropositions: ["Texte A", "Texte B"] }, 1);
  return r.ok && r.post.caption === "Texte A" && r.post.captionPropositions?.length === 2;
})());

t("caption donnée + propositions : caption gardée, propositions portées", (() => {
  const r = validateImportPost({ ...BASE, captionPropositions: ["Texte A", "Texte B"] }, 1);
  return r.ok && r.post.caption === BASE.caption && r.post.captionPropositions?.[1] === "Texte B";
})());

t("propositions de textes qui ne sont pas un tableau → refusé", (() => {
  const r = validateImportPost({ ...BASE, captionPropositions: "Texte A" }, 1);
  return !r.ok && r.error.includes("tableau");
})());

t("réimport avec des propositions nouvelles → enrichit sans toucher au texte retenu", (() => {
  const existing = [{ id: "x", externalId: BASE.externalId, date: BASE.date, channel: "instagram" as const, caption: "Choisi à la main", status: "draft" as const }];
  const { actions } = planSocialImport([valide({ ...BASE, caption: "Choisi à la main", captionPropositions: ["A", "B"] })], existing);
  const a = actions[0];
  return a.action === "enrich" && a.patch.captionPropositions?.length === 2 && a.patch.caption === undefined;
})());

// ── Propositions de visuels ────────────────────────────────────────────────
t("propositions https acceptées", (() => {
  const r = validateImportPost({ ...BASE, imagePropositions: ["https://a.test/1.jpg", "https://a.test/2.jpg"] }, 1);
  return r.ok && r.post.imagePropositions?.length === 2;
})());

t("une proposition en http fait rejeter le lot", (() => {
  const r = validateImportPost({ ...BASE, imagePropositions: ["https://a.test/1.jpg", "http://a.test/2.jpg"] }, 1);
  return !r.ok && r.error.includes("https");
})());

t("propositions qui ne sont pas un tableau → refusé", (() => {
  const r = validateImportPost({ ...BASE, imagePropositions: "https://a.test/1.jpg" }, 1);
  return !r.ok && r.error.includes("tableau");
})());

t("doublons retirés : deux vignettes identiques rendraient le choix illisible", (() => {
  const r = validateImportPost({ ...BASE, imagePropositions: ["https://a.test/1.jpg", "https://a.test/1.jpg"] }, 1);
  return r.ok && r.post.imagePropositions?.length === 1;
})());

t("propositions identiques au réimport → aucune écriture", (() => {
  const props = ["https://a.test/1.jpg", "https://a.test/2.jpg"];
  const ancien = enBase({ imagePropositions: props });
  const a = planSocialImport([valide({ ...BASE, imagePropositions: props })], [ancien]).actions[0];
  return a.action === "skip";
})());

t("propositions changées au réimport → enrichissement", (() => {
  const ancien = enBase({ imagePropositions: ["https://a.test/1.jpg"] });
  const a = planSocialImport(
    [valide({ ...BASE, imagePropositions: ["https://a.test/1.jpg", "https://a.test/2.jpg"] })],
    [ancien]
  ).actions[0];
  return a.action === "enrich" && (a as { patch: ImportPost }).patch.imagePropositions?.length === 2;
})());

// ── Marchés ───────────────────────────────────────────────────────────
console.log("\n— Marchés —");

t("sans marché → aucun champ posé (l'historique reste français par défaut)", (() => {
  const r = validateImportPost(BASE, 0);
  return r.ok && r.post.market === undefined;
})());

t("marché connu → porté", (() => {
  const r = validateImportPost({ ...BASE, market: "en" }, 0);
  return r.ok && r.post.market === "en";
})());

t("marché inconnu → refusé, pas remplacé", (() => {
  const r = validateImportPost({ ...BASE, market: "de" }, 0);
  return !r.ok && r.error.includes("marché inconnu");
})());

t("changement de marché au réimport → enrichissement", (() => {
  const ancien = enBase({});
  const a = planSocialImport([valide({ ...BASE, market: "es" })], [ancien]).actions[0];
  return a.action === "enrich" && (a as { patch: ImportPost }).patch.market === "es";
})());

console.log(`\n${ko === 0 ? "✅ TOUT PASSE" : "❌ ÉCHECS"} — ${ok} ok, ${ko} ko\n`);
process.exit(ko ? 1 : 0);
