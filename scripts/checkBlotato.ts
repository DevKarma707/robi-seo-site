/**
 * Vérification du client Blotato, hors réseau.
 *
 *   npx tsx scripts/checkBlotato.ts
 *
 * Ce qui est testé ici part sur un compte public sans relecture : le texte
 * envoyé, le compte choisi, les options obligatoires par réseau.
 */
import { texteFinal, compteFor, cibleFor, preparer, type CompteBlotato } from "../src/lib/blotato";

let ok = 0;
let ko = 0;
const t = (nom: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "✅" : "❌"} ${nom}${cond ? "" : "  →  " + detail}`);
  if (cond) ok++;
  else ko++;
};

const comptes: CompteBlotato[] = [
  { id: "11", platform: "instagram", username: "ralph.perso" },
  { id: "22", platform: "instagram", username: "robi.app" },
  { id: "33", platform: "linkedin", fullname: "Robi AI" },
  { id: "44", platform: "tiktok", username: "robi.app" },
];

// Texte
t("légende puis hashtags, séparés d'une ligne vide", texteFinal("Dictez.", "#a #b") === "Dictez.\n\n#a #b");
t("sans hashtags, pas de ligne vide en fin", texteFinal("Dictez.", null) === "Dictez.");
t("espaces parasites retirés", texteFinal("  Dictez. \n", " #a ") === "Dictez.\n\n#a");

// Compte
t("premier compte du réseau par défaut", compteFor("instagram", comptes)?.id === "11");
t("forçage BLOTATO_ACCOUNTS respecté", compteFor("instagram", comptes, { instagram: "22" })?.id === "22");
t("forçage inconnu de la liste : on fait confiance à l'id", compteFor("instagram", comptes, { instagram: "99" })?.id === "99");
t("réseau sans compte → null", compteFor("facebook", comptes) === null);

// Cible
t("instagram : type seul", JSON.stringify(cibleFor("instagram")) === JSON.stringify({ targetType: "instagram" }));
const tk = cibleFor("tiktok") as Record<string, unknown>;
t("tiktok : les 7 drapeaux obligatoires", ["privacyLevel","disabledComments","disabledDuet","disabledStitch","isBrandedContent","isYourBrand","isAiGenerated"].every((k) => k in tk));
t("tiktok : contenu IA déclaré", tk.isAiGenerated === true);
t("facebook sans pageId → null", cibleFor("facebook") === null);
t("facebook avec pageId", (cibleFor("facebook", { facebookPageId: "p1" }) as Record<string, unknown>).pageId === "p1");
t("réseau inconnu → null", cibleFor("threads") === null);

// Préparation complète
const base = { id: "x", channel: "linkedin", caption: "Payé. Sans relancer.", hashtags: "#a", imageUrl: "https://s/i.jpg" };
const p = preparer(base, comptes);
t("post complet → corps prêt", p.ok && p.corps.post.accountId === "33" && p.corps.post.content.mediaUrls[0] === "https://s/i.jpg");
t("plateforme du contenu = cible", p.ok && p.corps.post.content.platform === "linkedin" && p.corps.post.target.targetType === "linkedin");
t("sans visuel → refusé, motif explicite", !preparer({ ...base, imageUrl: null }).ok && (preparer({ ...base, imageUrl: null }) as { motif: string }).motif === "visuel_manquant");
t("réseau sans compte → refusé", (preparer({ ...base, channel: "facebook" }, comptes) as { motif: string }).motif === "aucun_compte_facebook");
t("texte vide → refusé", (preparer({ ...base, caption: "  ", hashtags: "" }, comptes) as { motif: string }).motif === "texte_vide");

console.log(`\n${ok} ok, ${ko} ko`);
process.exit(ko ? 1 : 0);
