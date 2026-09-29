import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/**
 * Lien court partenaire : robi-app.com/r/MARIE20
 *
 * Compte un clic sur la fiche influenceur qui porte ce code, puis renvoie sur
 * la page d'accueil avec `?ref=` (mémorisé par le site puis par l'app, qui
 * l'applique au checkout) et des utm cohérents pour l'attribution des
 * inscriptions. Un code inconnu redirige quand même : le visiteur ne doit
 * jamais tomber sur une erreur à cause d'un partenaire radié.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code: raw } = await ctx.params;
  const code = (raw || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);

  const target = new URL("https://robi-app.com/");
  if (code.length >= 3) {
    target.searchParams.set("ref", code);
    target.searchParams.set("utm_source", "partenaire");
    target.searchParams.set("utm_medium", "affiliation");
    target.searchParams.set("utm_campaign", code);

    const db = adminDb();
    if (db) {
      try {
        const snap = await db.collection("influencers").where("promoCode", "==", code).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.set(
            { clicks: FieldValue.increment(1), lastClickAt: FieldValue.serverTimestamp() },
            { merge: true }
          );
        }
      } catch (e) {
        // Le compteur est du confort ; la redirection, elle, doit toujours marcher.
        console.warn("[r/code] clic non compté:", (e as Error).message);
      }
    }
  }

  return NextResponse.redirect(target, { status: 302 });
}
