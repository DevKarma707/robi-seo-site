/**
 * Vérification des règles de la file de publication, hors Firestore.
 *
 *   npx tsx scripts/checkSocialQueue.ts
 *
 * Ce sont précisément les cas qu'on ne sait pas provoquer à la main en
 * production — rappel rejoué, réservation expirée reprise par une autre
 * exécution, deux passages qui se chevauchent — et dont l'échec se voit
 * publiquement : le même post deux fois dans le feed.
 *
 * N'atteint ni Firestore ni Blotato. La transaction elle-même reste non
 * couverte ici ; c'est la route qui la porte.
 */
import {
  estReservable,
  reservationPerimee,
  patchReservation,
  reglerPublication,
  manqueVisuel,
  jour,
  DUREE_RESERVATION_MS,
  ECHECS_AVANT_ABANDON,
  type PostEnFile,
} from "../src/lib/socialQueue";

let ok = 0;
let ko = 0;
const t = (nom: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "✅" : "❌"} ${nom}${cond ? "" : "  →  " + detail}`);
  if (cond) ok++;
  else ko++;
};

const MAINTENANT = new Date("2026-09-15T12:00:00.000Z");
const AUJOURDHUI = jour(MAINTENANT);
const post = (p: Partial<PostEnFile> = {}): PostEnFile => ({
  id: "p1",
  date: AUJOURDHUI,
  status: "ready",
  imageUrl: "https://exemple.test/v.jpg",
  ...p,
});
const ilYA = (ms: number) => new Date(MAINTENANT.getTime() - ms).toISOString();

// ── Qui sort de la file ────────────────────────────────────────────────────
t("post prêt et dû → réservable", estReservable(post(), MAINTENANT));
t("programmé chez Blotato → jamais réservable (il publie lui-même)",
  !estReservable(post({ scheduledVia: "blotato" }), MAINTENANT));
t("post prêt daté demain → pas réservable",
  !estReservable(post({ date: "2026-09-16" }), MAINTENANT));
t("post en retard → réservable, pas oublié",
  estReservable(post({ date: "2026-09-01" }), MAINTENANT));
t("brouillon → jamais réservable, même dû",
  !estReservable(post({ status: "draft" }), MAINTENANT));
t("déjà publié → pas réservable",
  !estReservable(post({ status: "published" }), MAINTENANT));

// ── Le cœur : deux passages ne peuvent pas prendre le même post ────────────
t("réservation fraîche → invisible pour le passage suivant",
  !estReservable(
    post({ status: "publishing", claimId: "A", claimedAt: ilYA(60_000) }),
    MAINTENANT
  ));
t("réservation juste avant l'échéance → toujours invisible",
  !estReservable(
    post({ status: "publishing", claimId: "A", claimedAt: ilYA(DUREE_RESERVATION_MS - 1000) }),
    MAINTENANT
  ));
t("réservation périmée → reprise possible, pas de post gelé",
  estReservable(
    post({ status: "publishing", claimId: "A", claimedAt: ilYA(DUREE_RESERVATION_MS + 1000) }),
    MAINTENANT
  ));
t("réservation sans horodatage → traitée comme périmée",
  reservationPerimee(post({ status: "publishing", claimId: "A" }), MAINTENANT));
t("horodatage illisible → périmé plutôt que gelé pour toujours",
  reservationPerimee(
    post({ status: "publishing", claimId: "A", claimedAt: "n'importe quoi" }),
    MAINTENANT
  ));

const pr = patchReservation("A", MAINTENANT);
t("réserver écrit le statut, l'identifiant et l'heure",
  pr.status === "publishing" && pr.claimId === "A" && pr.claimedAt === MAINTENANT.toISOString());

// ── Le règlement : un seul rappel compte ───────────────────────────────────
const reserve = post({ status: "publishing", claimId: "A", claimedAt: ilYA(30_000) });

t("succès annoncé par le bon détenteur → publié", (() => {
  const r = reglerPublication(reserve, "A", true, { url: "https://x.test/1" }, MAINTENANT);
  return r.accepte && r.patch?.status === "published" && r.patch?.publishedUrl === "https://x.test/1";
})());

t("succès avec une réservation étrangère → refusé, rien n'est écrit", (() => {
  const r = reglerPublication(reserve, "B", true, {}, MAINTENANT);
  return !r.accepte && r.motif === "reservation_perdue";
})());

t("rappel sur un post non réservé → refusé", (() => {
  const r = reglerPublication(post(), "A", true, {}, MAINTENANT);
  return !r.accepte && r.motif === "reservation_inconnue";
})());

t("rappel rejoué sur un post déjà publié → sans effet, mais pas une erreur", (() => {
  const r = reglerPublication(post({ status: "published" }), "A", true, {}, MAINTENANT);
  return r.accepte && r.patch === null;
})());

t("réservation libérée après succès → le post ne peut plus être réglé deux fois", (() => {
  const apres = post({
    status: "published",
    claimId: (reglerPublication(reserve, "A", true, {}, MAINTENANT) as { patch: Record<string, unknown> })
      .patch.claimId as null,
  });
  const rejeu = reglerPublication(apres, "A", false, { erreur: "timeout" }, MAINTENANT);
  return rejeu.accepte && rejeu.patch === null && apres.claimId === null;
})());

// ── Les échecs ─────────────────────────────────────────────────────────────
t("échec isolé → repasse prêt, réessayé au tour suivant", (() => {
  const r = reglerPublication(reserve, "A", false, { erreur: "réseau coupé" }, MAINTENANT);
  return r.accepte && r.patch?.status === "ready" && r.patch?.publishAttempts === 1;
})());

t("échec → la réservation est rendue, sinon le post resterait bloqué", (() => {
  const r = reglerPublication(reserve, "A", false, {}, MAINTENANT);
  return r.accepte && r.patch?.claimId === null && r.patch?.claimedAt === null;
})());

t(`${ECHECS_AVANT_ABANDON}e échec → quitte la file et redevient brouillon`, (() => {
  const use = { ...reserve, publishAttempts: ECHECS_AVANT_ABANDON - 1 };
  const r = reglerPublication(use, "A", false, { erreur: "compte déconnecté" }, MAINTENANT);
  return r.accepte && r.patch?.status === "draft" && r.patch?.publishAttempts === ECHECS_AVANT_ABANDON;
})());

t("post abandonné → ne ressort plus tout seul de la file",
  !estReservable(post({ status: "draft", publishAttempts: ECHECS_AVANT_ABANDON }), MAINTENANT));

t("un succès remet le compteur d'échecs à zéro", (() => {
  const use = { ...reserve, publishAttempts: 3 };
  const r = reglerPublication(use, "A", true, {}, MAINTENANT);
  return r.accepte && r.patch?.publishAttempts === 0;
})());

t("message d'erreur tronqué à 500 caractères", (() => {
  const r = reglerPublication(reserve, "A", false, { erreur: "x".repeat(900) }, MAINTENANT);
  return (r as { patch: Record<string, unknown> }).patch.publishError === "x".repeat(500);
})());

t("échec sans message → libellé par défaut, jamais vide", (() => {
  const r = reglerPublication(reserve, "A", false, {}, MAINTENANT);
  return (r as { patch: Record<string, unknown> }).patch.publishError === "échec inconnu";
})());

// ── Visuel ─────────────────────────────────────────────────────────────────
t("post sans visuel → signalé", manqueVisuel(post({ imageUrl: null })));
t("post avec visuel → non signalé", !manqueVisuel(post()));

console.log(`\n${ko === 0 ? "✅ TOUT PASSE" : "❌ ÉCHECS"} — ${ok} ok, ${ko} ko\n`);
process.exit(ko ? 1 : 0);
