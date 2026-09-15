import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "node:crypto";

/**
 * Jeton partagé des routes d'automatisation.
 *
 * Il existe pour une raison précise : donner à un agent de quoi agir sur les
 * posts SANS lui donner la clé du compte de service Firebase. Cette clé passe
 * outre toutes les règles Firestore ; un jeton n'ouvre que les routes écrites
 * ici, et se révoque en changeant une variable sur Vercel, sans toucher à
 * Firebase.
 *
 * La clé d'administration reste donc côté serveur, où elle est née.
 */

const TOKEN = process.env.SOCIAL_AUTOMATION_TOKEN;

/**
 * Comparaison à durée constante. Un `===` sur un secret fuit sa longueur et
 * son préfixe par le temps de réponse ; le hachage préalable égalise les
 * longueurs, que timingSafeEqual exige identiques.
 */
const tokenOk = (presente: string): boolean => {
  if (!TOKEN) return false;
  const a = createHash("sha256").update(presente).digest();
  const b = createHash("sha256").update(TOKEN).digest();
  return timingSafeEqual(a, b);
};

/** `null` si la requête est autorisée, sinon la réponse à renvoyer telle quelle. */
export const verifierJeton = (req: Request): NextResponse | null => {
  if (!TOKEN) {
    return NextResponse.json(
      { error: "not_configured", detail: "SOCIAL_AUTOMATION_TOKEN manquant." },
      { status: 503 }
    );
  }
  const entete = req.headers.get("authorization") || "";
  const presente = entete.startsWith("Bearer ") ? entete.slice(7) : "";
  if (!presente || !tokenOk(presente)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
};
