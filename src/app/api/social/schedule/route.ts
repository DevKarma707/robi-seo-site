import { NextResponse } from "next/server";
import { adminDb, adminDepuisJeton } from "@/lib/firebaseAdmin";
import { listerComptes, preparer, publier, scheduledTimeParis } from "@/lib/blotato";

export const dynamic = "force-dynamic";

/**
 * « Programmer » : envoie un post à Blotato, qui le publiera à la date prévue.
 *
 * Appelée par l'admin, depuis le navigateur, au moment où Ralph valide un
 * post. Pas de cron : Blotato tient l'horaire (`scheduledTime`, 10h Paris).
 * La contrepartie est assumée — une fois programmé, un post modifié dans
 * l'admin doit être renvoyé (le bouton « Renvoyer à Blotato ») : ce qui
 * partira est ce que Blotato a reçu, pas ce que Firestore contient.
 *
 * Autorisation : jeton Firebase de l'admin (vérifié côté serveur, même liste
 * d'e-mails que les règles Firestore). La clé Blotato ne quitte jamais le
 * serveur.
 *
 * Le post est marqué `scheduledVia: "blotato"` : la file `/api/social/queue`
 * ne le réservera plus (il partirait deux fois), et l'admin affiche qu'il est
 * entre les mains de Blotato.
 */

const lireForces = (): Record<string, string> => {
  try {
    return JSON.parse(process.env.BLOTATO_ACCOUNTS || "{}");
  } catch {
    return {};
  }
};

export async function POST(req: Request) {
  const header = req.headers.get("authorization") || "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7) : "";
  const email = idToken ? await adminDepuisJeton(idToken) : null;
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.BLOTATO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "not_configured", detail: "BLOTATO_API_KEY manquant." }, { status: 503 });
  }
  const db = adminDb();
  if (!db) {
    return NextResponse.json({ error: "not_configured", detail: "FIREBASE_SERVICE_ACCOUNT manquant." }, { status: 503 });
  }

  let body: { id?: string; heure?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const ref = db.collection("socialPosts").doc(body.id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "post_introuvable" }, { status: 404 });
  const p = snap.data() as Record<string, unknown>;

  if (p.status === "published") {
    return NextResponse.json({ error: "deja_publie" }, { status: 409 });
  }
  if (!p.imageUrl) {
    return NextResponse.json({ error: "visuel_manquant" }, { status: 422 });
  }

  let comptes;
  try {
    comptes = await listerComptes(apiKey);
  } catch (e) {
    return NextResponse.json({ error: "blotato_accounts", detail: (e as Error).message }, { status: 502 });
  }

  const prep = preparer(
    {
      id: snap.id,
      channel: String(p.channel),
      caption: String(p.caption ?? ""),
      hashtags: (p.hashtags as string) ?? null,
      imageUrl: p.imageUrl as string,
    },
    comptes,
    { forces: lireForces(), facebookPageId: process.env.BLOTATO_FACEBOOK_PAGE_ID }
  );
  if (!prep.ok) return NextResponse.json({ error: prep.motif }, { status: 422 });

  const scheduledTime = scheduledTimeParis(String(p.date), body.heure);
  const corps = { ...prep.corps, scheduledTime };

  try {
    const res = await publier(apiKey, corps);
    const maintenant = new Date().toISOString();
    await ref.update({
      status: "ready",
      scheduledVia: "blotato",
      scheduledAt: maintenant,
      scheduledFor: scheduledTime,
      publishedUrl: `https://my.blotato.com/posts/${res.postSubmissionId}`,
      blotatoSubmissionId: res.postSubmissionId,
      blotatoStatus: "scheduled",
      blotatoCheckedAt: null,
      publishError: null,
      publishAttempts: 0,
      claimId: null,
      claimedAt: null,
    });
    return NextResponse.json({ ok: true, scheduledFor: scheduledTime, submissionId: res.postSubmissionId, par: email });
  } catch (e) {
    const erreur = (e as Error).message;
    await ref.update({ publishError: erreur }).catch(() => { /* rien à faire de plus */ });
    return NextResponse.json({ error: "blotato_publish", detail: erreur }, { status: 502 });
  }
}
