/**
 * Vérification des contrôles de pré-programmation, hors navigateur.
 *
 *   npx tsx scripts/checkPublication.ts
 *
 * Ces contrôles sont le dernier moment où un humain est devant l'écran. Ce
 * qu'ils laissent passer part sur un compte public sans nouvelle relecture.
 */
import {
  verifierAvantProgrammation,
  estProgrammable,
} from "../src/lib/publicationCheck";
import type { SocialPost } from "../src/lib/socialPosts";

let ok = 0;
let ko = 0;
const t = (nom: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "✅" : "❌"} ${nom}${cond ? "" : "  →  " + detail}`);
  if (cond) ok++;
  else ko++;
};

const AUJ = "2026-09-15";
const post = (p: Partial<SocialPost> = {}): SocialPost => ({
  id: "p1",
  date: AUJ,
  channel: "instagram",
  type: "bold",
  caption: "Tu dictes, Robi rédige ta facture.",
  imageUrl: "https://exemple.test/v.jpg",
  status: "draft",
  ...p,
});
const v = (p: Partial<SocialPost> = {}, voisins: SocialPost[] = []) =>
  verifierAvantProgrammation(post(p), voisins, AUJ);

// ── Blocages ───────────────────────────────────────────────────────────────
t("post complet → programmable", estProgrammable(v()));
t("sans visuel → bloqué", v({ imageUrl: undefined }).blocages.length === 1);
t("visuel en http → bloqué",
  v({ imageUrl: "http://exemple.test/v.jpg" }).blocages[0]?.includes("https"));
t("texte vide → bloqué", v({ caption: "   " }).blocages.some((b) => b.includes("vide")));
t("date absente → bloquée", v({ date: "" }).blocages.some((b) => b.includes("date")));
t("date mal formée → bloquée", v({ date: "15/09/2026" }).blocages.length > 0);
t("légende trop longue pour Instagram → bloquée",
  v({ caption: "a".repeat(2201) }).blocages.some((b) => b.includes("2200")));
t("2200 caractères pile → accepté", estProgrammable(v({ caption: "a".repeat(2200) })));
t("LinkedIn tolère plus long qu'Instagram",
  estProgrammable(v({ channel: "linkedin", caption: "Vous ".repeat(500) })));
t("plusieurs défauts → tous listés, pas seulement le premier",
  v({ imageUrl: undefined, caption: "" }).blocages.length === 2);

// ── Ton : l'erreur déjà commise en vrai ────────────────────────────────────
t("« Vous, vous finissez votre café » sur Instagram → averti",
  v({ caption: "Vous, vous finissez votre café." }).avertissements.some((a) => a.includes("tutoie")));
t("Instagram qui tutoie → rien à signaler", v().avertissements.length === 0);
t("LinkedIn qui tutoie → averti",
  v({ channel: "linkedin", caption: "Tu perds 10h par mois." })
    .avertissements.some((a) => a.includes("vouvoie")));
t("LinkedIn qui vouvoie → rien à signaler",
  v({ channel: "linkedin", caption: "Vous perdez 10h par mois." }).avertissements.length === 0);
t("texte mixte → pas d'alerte, le doute profite au texte",
  v({ caption: "Tu factures, vous encaissez." }).avertissements.length === 0);
t("un ton douteux n'empêche pas de programmer",
  estProgrammable(v({ caption: "Vous finissez votre café." })));

// ── Avertissements de calendrier ───────────────────────────────────────────
t("date passée → averti, pas bloqué", (() => {
  const r = v({ date: "2026-09-01" });
  return r.blocages.length === 0 && r.avertissements.some((a) => a.includes("prochain passage"));
})());
t("date future → rien à signaler", v({ date: "2026-09-30" }).avertissements.length === 0);

t("deux posts prêts le même jour sur le même réseau → averti",
  v({}, [post({ id: "autre", status: "ready" })]).avertissements.some((a) => a.includes("déjà prévu")));
t("collision avec un brouillon → pas d'alerte, il ne partira pas",
  v({}, [post({ id: "autre", status: "draft" })]).avertissements.length === 0);
t("même jour mais autre réseau → pas de collision",
  v({}, [post({ id: "autre", channel: "linkedin", status: "ready" })]).avertissements.length === 0);
t("le post ne se détecte pas lui-même comme collision",
  v({}, [post({ id: "p1", status: "ready" })]).avertissements.length === 0);

console.log(`\n${ko === 0 ? "✅ TOUT PASSE" : "❌ ÉCHECS"} — ${ok} ok, ${ko} ko\n`);
process.exit(ko ? 1 : 0);
