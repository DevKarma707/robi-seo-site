import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { adminDb, adminDepuisJeton } from "@/lib/firebaseAdmin";
import { lireStatut, patchDepuisStatut, submissionIdDepuisUrl } from "@/lib/blotato";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Remontée de statut Blotato : pour chaque post qu'on lui a confié et qui
 * n'est pas encore marqué publié, demande à Blotato ce qu'il en a fait et
 * l'écrit sur le post (`published`, ou `publishError`).
 *
 * Sans ça, la programmation est aveugle : `/api/social/schedule` remet le
 * post à Blotato et n'en entend plus jamais parler. Un post que Blotato n'a
 * pas publié (compte Instagram déconnecté, visuel refusé…) reste « prêt »
 * dans l'admin avec la ligne verte « Programmé chez Blotato », et on
 * découvre l'échec en regardant le feed — c'est arrivé le 18 sept. 2026.
 *
 * Deux appelants : le cron Vercel (`CRON_SECRET`, tous les jours après
 * l'heure de publication) et le bouton « Vérifier chez Blotato » de
 * l'onglet Réseaux (jeton Firebase d'un admin).
 */

const memeSecret = (a: string, b?: string) =>
  !!b && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

const autorise = async (req: Request): Promise<boolean> => {
  const header = req.headers.get("authorization") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!presented) return false;
  if (memeSecret(presented, process.env.CRON_SECRET)) return true;
  return !!(await adminDepuisJeton(presented));
};

/** Plafond par passage : Blotato limite à 60 requêtes/minute. */
const LOT_MAX = 50;

export async function GET(req: Request) {
  if (!(await autorise(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.BLOTATO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured", detail: "BLOTATO_API_KEY manquant." }, { status: 503 });
  }
  const db = adminDb();
  if (!db) {
    return NextResponse.json({ error: "not_configured", detail: "FIREBASE_SERVICE_ACCOUNT manquant." }, { status: 503 });
  }

  // Tout ce qui est chez Blotato et pas encore publié — y compris les posts
  // à venir : les interroger ne coûte qu'une requête et confirme qu'ils sont
  // bien dans sa file (`scheduled`).
  // Une seule égalité : pas d'index composite à provisionner. Le tri sur le
  // statut se fait ici, sur quelques dizaines de documents au plus.
  const snap = await db.collection("socialPosts").where("scheduledVia", "==", "blotato").get();
  const aVerifier = snap.docs.filter((d) => d.data().status !== "published").slice(0, LOT_MAX);

  const maintenant = new Date();
  const resultats: { id: string; date: string; statut: string; detail?: string }[] = [];
  let publies = 0;
  let echecs = 0;

  for (const d of aVerifier) {
    const p = d.data() as Record<string, unknown>;
    const submissionId =
      (p.blotatoSubmissionId as string | undefined) || submissionIdDepuisUrl(p.publishedUrl as string | undefined);
    if (!submissionId) {
      resultats.push({ id: d.id, date: String(p.date), statut: "sans_identifiant" });
      continue;
    }
    try {
      const statut = await lireStatut(apiKey, submissionId);
      const patch = patchDepuisStatut(statut, maintenant);
      if (patch) await d.ref.update(patch);
      if (statut.status === "published") publies++;
      if (statut.status === "failed") echecs++;
      resultats.push({
        id: d.id,
        date: String(p.date),
        statut: statut.status,
        detail: statut.errorMessage || statut.publicUrl || statut.scheduledTime,
      });
    } catch (e) {
      resultats.push({ id: d.id, date: String(p.date), statut: "erreur", detail: (e as Error).message });
    }
  }

  return NextResponse.json({ verifies: resultats.length, publies, echecs, resultats });
}
