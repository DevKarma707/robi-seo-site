/**
 * Vérification du rapprochement visuels ↔ posts.
 *
 *   npx tsx scripts/checkRapprochement.ts
 *
 * Ce que ça protège : un rapprochement qui se trompe attache le mauvais visuel
 * à un post, et personne ne le voit avant la publication — le texte parle d'un
 * plombier, l'image montre une restauratrice.
 */
import { rapprocher, identifiantDepuisNom } from "../src/lib/rapprochementVisuels";
import type { SocialPost } from "../src/lib/socialPosts";

let ok = 0, ko = 0;
const t = (nom: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "✅" : "❌"} ${nom}${cond ? "" : "  →  " + detail}`);
  cond ? ok++ : ko++;
};

const post = (externalId?: string, p: Partial<SocialPost> = {}): SocialPost => ({
  id: externalId ?? "sans-id",
  externalId,
  date: "2026-09-16",
  channel: "instagram",
  type: "bold",
  caption: "texte",
  status: "draft",
  ...p,
});
const f = (name: string) => ({ name, url: `https://m.test/${name}` });

// ── Lecture du nom ─────────────────────────────────────────────────────────
t("nom simple → identifiant",
  identifiantDepuisNom("robi_post_2026-09-plombier-ig.jpg")?.externalId === "2026-09-plombier-ig");
t("suffixe de slide → même identifiant, slide lue", (() => {
  const r = identifiantDepuisNom("robi_post_2026-09-facturx-ig_02.jpg");
  return r?.externalId === "2026-09-facturx-ig" && r.slide === 2;
})());
t("png et webp acceptés",
  !!identifiantDepuisNom("robi_post_a.png") && !!identifiantDepuisNom("robi_post_a.webp"));
t("fichier hors convention → ignoré", identifiantDepuisNom("photo-vacances.jpg") === null);
t("pdf ignoré", identifiantDepuisNom("robi_post_a.pdf") === null);
t("un identifiant contenant un souligné n'est pas tronqué",
  identifiantDepuisNom("robi_post_mon_post_ig.jpg")?.externalId === "mon_post_ig");

// ── Rapprochement ──────────────────────────────────────────────────────────
t("post et visuel de même identifiant → attaché", (() => {
  const r = rapprocher([post("a")], [f("robi_post_a.jpg")]);
  return r.attacher.length === 1 && r.attacher[0].url.endsWith("robi_post_a.jpg");
})());

t("post sans visuel → signalé, pas attaché", (() => {
  const r = rapprocher([post("a")], [f("robi_post_b.jpg")]);
  return r.attacher.length === 0 && r.sansVisuel.length === 1;
})());

t("visuel sans post → orphelin, signe d'un identifiant changé", (() => {
  const r = rapprocher([post("a")], [f("robi_post_a.jpg"), f("robi_post_zz.jpg")]);
  return r.orphelins.length === 1 && r.orphelins[0] === "zz";
})());

t("un visuel déjà attaché n'est pas écrasé", (() => {
  const r = rapprocher([post("a", { imageUrl: "https://choisi.test/x.jpg" })], [f("robi_post_a.jpg")]);
  return r.attacher.length === 0;
})());

t("… sauf si on le demande explicitement", (() => {
  const r = rapprocher([post("a", { imageUrl: "https://choisi.test/x.jpg" })], [f("robi_post_a.jpg")], true);
  return r.attacher.length === 1;
})());

t("un post déjà servi ne rend pas son visuel orphelin", (() => {
  const r = rapprocher([post("a", { imageUrl: "https://choisi.test/x.jpg" })], [f("robi_post_a.jpg")]);
  return r.orphelins.length === 0;
})());

t("carrousel : la slide 1 est retenue, pas la dernière trouvée", (() => {
  const r = rapprocher([post("a")], [f("robi_post_a_03.jpg"), f("robi_post_a_01.jpg"), f("robi_post_a_02.jpg")]);
  return r.attacher[0].url.endsWith("robi_post_a_01.jpg");
})());

t("post sans externalId → jamais attaché au hasard", (() => {
  const r = rapprocher([post(undefined)], [f("robi_post_a.jpg")]);
  return r.attacher.length === 0 && r.sansVisuel.length === 1;
})());

t("médiathèque pleine de fichiers hors convention → aucun faux rapprochement", (() => {
  const r = rapprocher([post("a")], [f("IMG_4821.jpg"), f("logo.png"), f("capture.webp")]);
  return r.attacher.length === 0 && r.orphelins.length === 0;
})());

t("dix posts, dix visuels → dix attachements", (() => {
  const ids = Array.from({ length: 10 }, (_, i) => `p${i}`);
  const r = rapprocher(ids.map((i) => post(i)), ids.map((i) => f(`robi_post_${i}.jpg`)));
  return r.attacher.length === 10 && r.sansVisuel.length === 0 && r.orphelins.length === 0;
})());

// ── URL périmée après un ré-envoi ──────────────────────────────────────────
// Firebase régénère le jeton de l'URL à chaque envoi : le même fichier
// redéposé a une nouvelle URL, et l'ancienne cesse de répondre.
const urlAvec = (chemin: string, jeton: string) =>
  `https://firebasestorage.googleapis.com/v0/b/x.appspot.com/o/${encodeURIComponent(chemin)}?alt=media&token=${jeton}`;
const fStock = (name: string, chemin: string, jeton: string) =>
  ({ name, url: urlAvec(chemin, jeton), path: chemin });

t("même fichier ré-envoyé → l'URL périmée est rafraîchie", (() => {
  const chemin = "partage/reseaux/robi_post_a.jpg";
  const r = rapprocher(
    [post("a", { imageUrl: urlAvec(chemin, "ancien") })],
    [fStock("robi_post_a.jpg", chemin, "nouveau")]
  );
  return r.attacher.length === 1 && r.attacher[0].url.includes("token=nouveau");
})());

t("URL inchangée → aucune écriture inutile", (() => {
  const chemin = "partage/reseaux/robi_post_a.jpg";
  const r = rapprocher(
    [post("a", { imageUrl: urlAvec(chemin, "meme") })],
    [fStock("robi_post_a.jpg", chemin, "meme")]
  );
  return r.attacher.length === 0;
})());

t("image choisie à la main ailleurs → jamais remplacée", (() => {
  const r = rapprocher(
    [post("a", { imageUrl: urlAvec("partage/reseaux/autre.jpg", "t") })],
    [fStock("robi_post_a.jpg", "partage/reseaux/robi_post_a.jpg", "t")]
  );
  return r.attacher.length === 0;
})());

t("URL hors Firebase déjà posée → laissée telle quelle", (() => {
  const r = rapprocher(
    [post("a", { imageUrl: "https://cdn.externe.test/visuel.jpg" })],
    [fStock("robi_post_a.jpg", "partage/reseaux/robi_post_a.jpg", "t")]
  );
  return r.attacher.length === 0;
})());

console.log(`\n${ko === 0 ? "✅ TOUT PASSE" : "❌ ÉCHECS"} — ${ok} ok, ${ko} ko\n`);
process.exit(ko ? 1 : 0);
