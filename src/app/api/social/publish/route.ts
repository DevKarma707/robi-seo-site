import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "node:crypto";
import { listerComptes, preparer, publier, type PostAPublier } from "@/lib/blotato";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Le publieur : prend la file (`/api/social/queue`) et envoie à Blotato.
 *
 * Secours manuel (`curl -H "Authorization: Bearer $SOCIAL_AUTOMATION_TOKEN"
 * https://robi-app.com/api/social/publish`) : le chemin normal est
 * `/api/social/schedule`, appelé par l'admin, qui confie l'horaire à Blotato.
 * Cette route publie IMMÉDIATEMENT ce qui est « prêt », dû, et pas déjà
 * programmé chez Blotato — utile si un post n'a pas pu être programmé.
 * Il ne décide de rien : ce qui est publié a été marqué « prêt » dans
 * l'admin, la file l'a réservé, et le résultat est consigné par POST sur la
 * même file — c'est elle qui tient l'état, pas ce module.
 *
 * Pourquoi passer par la route HTTP de la file plutôt que par Firestore
 * directement : la file est le contrat. Si demain Blotato est remplacé, ce
 * fichier change ; si la file change, elle reste seule à savoir réserver.
 *
 * Accès : le cron Vercel présente `Authorization: Bearer $CRON_SECRET` ; un
 * appel manuel peut présenter le jeton d'automatisation. Les deux sont
 * comparés à durée constante.
 */

const memeSecret = (presented: string, attendu: string | undefined): boolean => {
  if (!attendu) return false;
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(attendu).digest();
  return timingSafeEqual(a, b);
};

const autorise = (req: Request): boolean => {
  const header = req.headers.get("authorization") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!presented) return false;
  return memeSecret(presented, process.env.CRON_SECRET) || memeSecret(presented, process.env.SOCIAL_AUTOMATION_TOKEN);
};

const lireForces = (): Record<string, string> => {
  try {
    return JSON.parse(process.env.BLOTATO_ACCOUNTS || "{}");
  } catch {
    return {};
  }
};

export async function GET(req: Request) {
  if (!autorise(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = process.env.BLOTATO_API_KEY;
  const jeton = process.env.SOCIAL_AUTOMATION_TOKEN;
  if (!apiKey || !jeton) {
    return NextResponse.json(
      { error: "not_configured", detail: "BLOTATO_API_KEY et SOCIAL_AUTOMATION_TOKEN sont requis." },
      { status: 503 }
    );
  }

  // La file, sur la même origine que ce déploiement.
  const file = new URL("/api/social/queue", req.url);
  const auth = { authorization: `Bearer ${jeton}` };

  const r = await fetch(file, { headers: auth, cache: "no-store" });
  if (!r.ok) {
    return NextResponse.json({ error: "queue_unavailable", status: r.status }, { status: 502 });
  }
  const { posts, bloques, claimId } = (await r.json()) as {
    posts: (PostAPublier & { claimId: string })[];
    bloques: unknown[];
    claimId: string;
  };

  if (!posts.length) {
    return NextResponse.json({ publies: 0, echecs: 0, bloques, claimId });
  }

  // Les comptes une fois par passage, pas par post.
  let comptes;
  try {
    comptes = await listerComptes(apiKey);
  } catch (e) {
    return NextResponse.json({ error: "blotato_accounts", detail: (e as Error).message }, { status: 502 });
  }
  const options = { forces: lireForces(), facebookPageId: process.env.BLOTATO_FACEBOOK_PAGE_ID };

  const resultats: { id: string; channel: string; ok: boolean; detail?: string }[] = [];

  for (const post of posts) {
    let ok = false;
    let url: string | undefined;
    let erreur: string | undefined;

    const prep = preparer(post, comptes, options);
    if (!prep.ok) {
      erreur = prep.motif;
    } else {
      try {
        const res = await publier(apiKey, prep.corps);
        ok = true;
        // Blotato ne rend pas l'URL publique tout de suite : on garde
        // l'identifiant de soumission, retrouvable dans son tableau de bord.
        url = `https://my.blotato.com/posts/${res.postSubmissionId}`;
      } catch (e) {
        erreur = (e as Error).message;
      }
    }

    // Consigner, quoi qu'il arrive : un post réservé et jamais réglé serait
    // repris quinze minutes plus tard, et republié.
    await fetch(file, {
      method: "POST",
      headers: { ...auth, "content-type": "application/json" },
      body: JSON.stringify({ id: post.id, claimId: post.claimId, ok, url, erreur }),
    }).catch(() => { /* la file reprendra la réservation expirée */ });

    resultats.push({ id: post.id, channel: post.channel, ok, detail: erreur ?? url });
  }

  return NextResponse.json({
    claimId,
    publies: resultats.filter((r) => r.ok).length,
    echecs: resultats.filter((r) => !r.ok).length,
    resultats,
    bloques,
  });
}
