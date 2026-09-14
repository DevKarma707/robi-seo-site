import { NextResponse } from "next/server";
import { timingSafeEqual, createHash } from "node:crypto";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/**
 * File d'attente de publication, pour une automatisation sans humain.
 *
 * GET  → les posts à publier aujourd'hui
 * POST → marque un post comme publié (ou consigne l'échec)
 *
 * Volontairement indépendant du réseau social et du fournisseur de
 * publication : cette route dit CE QUI est à publier et enregistre le
 * RÉSULTAT ; elle ne publie rien elle-même. Blotato, Windsor ou autre se
 * branche au-dessus sans qu'une ligne d'ici ne change.
 *
 * Seuls les posts marqués « prêt » sortent d'ici. L'approbation humaine est
 * donc déjà dans le flux de l'admin : rien qui n'ait été relu ne peut partir
 * sur un compte public, et la relecture ne demande aucune surveillance au
 * moment de la publication.
 */

const TOKEN = process.env.SOCIAL_AUTOMATION_TOKEN;

/**
 * Comparaison à durée constante. Un `===` sur un secret fuit sa longueur et
 * son préfixe par le temps de réponse ; le hachage préalable égalise les
 * longueurs, que timingSafeEqual exige identiques.
 */
const tokenOk = (presented: string): boolean => {
  if (!TOKEN) return false;
  const a = createHash("sha256").update(presented).digest();
  const b = createHash("sha256").update(TOKEN).digest();
  return timingSafeEqual(a, b);
};

const guard = (req: Request): NextResponse | null => {
  if (!TOKEN) {
    return NextResponse.json(
      { error: "not_configured", detail: "SOCIAL_AUTOMATION_TOKEN manquant." },
      { status: 503 }
    );
  }
  const header = req.headers.get("authorization") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!presented || !tokenOk(presented)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
};

const dbOrError = () => {
  const db = adminDb();
  if (!db) {
    return NextResponse.json(
      { error: "firebase_admin_not_configured", detail: "FIREBASE_SERVICE_ACCOUNT manquant." },
      { status: 503 }
    );
  }
  return db;
};

/** Les posts prêts et dus. */
export async function GET(req: Request) {
  const refus = guard(req);
  if (refus) return refus;

  const db = dbOrError();
  if (db instanceof NextResponse) return db;

  // Les dates sont stockées en AAAA-MM-JJ : la comparaison lexicographique
  // équivaut à la comparaison chronologique, sans conversion ni fuseau.
  // « <= aujourd'hui » et non « == » : un post dont le jour est passé parce
  // que l'automatisation n'a pas tourné doit sortir, pas être oublié.
  const aujourdhui = new Date().toISOString().slice(0, 10);

  const snap = await db
    .collection("socialPosts")
    .where("status", "==", "ready")
    .where("date", "<=", aujourdhui)
    .get();

  const posts = snap.docs.map((d) => {
    const p = d.data();
    return {
      id: d.id,
      date: p.date,
      channel: p.channel,
      type: p.type,
      caption: p.caption,
      hashtags: p.hashtags ?? null,
      imageUrl: p.imageUrl ?? null,
      // Sans visuel, la plupart des réseaux refusent la publication. Le dire
      // ici évite à l'appelant de le redécouvrir par une erreur d'API.
      pretAPublier: !!p.imageUrl,
    };
  });

  return NextResponse.json({ aujourdhui, total: posts.length, posts });
}

/** Consigne le résultat d'une publication. */
export async function POST(req: Request) {
  const refus = guard(req);
  if (refus) return refus;

  const db = dbOrError();
  if (db instanceof NextResponse) return db;

  let body: { id?: string; ok?: boolean; url?: string; erreur?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { id, ok } = body;
  if (!id || typeof ok !== "boolean") {
    return NextResponse.json({ error: "id et ok sont requis" }, { status: 400 });
  }

  const ref = db.collection("socialPosts").doc(id);
  if (!(await ref.get()).exists) {
    return NextResponse.json({ error: "post_introuvable" }, { status: 404 });
  }

  // Un échec ne repasse PAS en brouillon : le post reste « prêt » et ressortira
  // au prochain passage. Le rétrograder demanderait une réapprobation humaine
  // pour une panne réseau, et ferait disparaître le post du calendrier sans
  // que personne ne comprenne pourquoi.
  await ref.update(
    ok
      ? {
          status: "published",
          publishedAt: new Date().toISOString(),
          ...(body.url ? { publishedUrl: body.url } : {}),
          publishError: null,
        }
      : { publishError: (body.erreur || "échec inconnu").slice(0, 500) }
  );

  return NextResponse.json({ ok: true, id, status: ok ? "published" : "ready" });
}
