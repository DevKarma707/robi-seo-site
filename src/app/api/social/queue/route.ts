import { NextResponse } from "next/server";
import { timingSafeEqual, createHash, randomUUID } from "node:crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  estReservable,
  manqueVisuel,
  patchReservation,
  reglerPublication,
  jour,
  DUREE_RESERVATION_MS,
  type PostEnFile,
} from "@/lib/socialQueue";

export const dynamic = "force-dynamic";

/**
 * File d'attente de publication, pour une automatisation sans humain.
 *
 * GET  → réserve et rend les posts à publier maintenant
 * POST → consigne le résultat d'une réservation
 *
 * Volontairement indépendant du réseau social et du fournisseur de
 * publication : cette route dit CE QUI est à publier et enregistre le
 * RÉSULTAT ; elle ne publie rien elle-même. Blotato, Windsor ou autre se
 * branche au-dessus sans qu'une ligne d'ici ne change.
 *
 * Seuls les posts marqués « prêt » sortent d'ici. L'approbation humaine est
 * donc déjà dans le flux de l'admin : rien qui n'ait été relu ne peut partir
 * sur un compte public.
 *
 * `GET` n'est PAS une lecture : il réserve. Sans cela un appelant qui publie
 * puis meurt avant `POST` laisse le post « prêt », et le passage suivant le
 * republie — le même contenu deux fois dans le feed, découvert par un
 * abonné. Les règles de réservation vivent dans `socialQueue.ts` et sont
 * vérifiées par `npm run check:social`.
 */

const TOKEN = process.env.SOCIAL_AUTOMATION_TOKEN;

/** Plafond par passage : une automatisation emballée ne vide pas le calendrier. */
const LOT_MAX = 25;

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

type DocFirestore = { id: string; data: () => Record<string, unknown> };

const enFile = (d: DocFirestore): PostEnFile => {
  const p = d.data();
  return {
    id: d.id,
    date: String(p.date ?? ""),
    status: p.status as PostEnFile["status"],
    imageUrl: (p.imageUrl as string) ?? null,
    claimId: (p.claimId as string) ?? null,
    claimedAt: (p.claimedAt as string) ?? null,
    publishAttempts: (p.publishAttempts as number) ?? 0,
    scheduledVia: (p.scheduledVia as string) ?? null,
  };
};

/** Réserve les posts dus et les rend à l'appelant. */
export async function GET(req: Request) {
  const refus = guard(req);
  if (refus) return refus;

  const db = dbOrError();
  if (db instanceof NextResponse) return db;

  const maintenant = new Date();
  const aujourdhui = jour(maintenant);
  const claimId = randomUUID();

  // Deux requêtes, pas une : les posts prêts, et ceux dont la réservation a
  // été abandonnée par un appelant mort en cours de route. Toutes deux sont
  // une égalité sur `status` et une plage sur `date` — le même index composite
  // les sert.
  const dus = (statut: string) =>
    db
      .collection("socialPosts")
      .where("status", "==", statut)
      .where("date", "<=", aujourdhui)
      .limit(LOT_MAX);

  const { posts, bloques } = await db.runTransaction(async (tx) => {
    // Toutes les lectures avant toute écriture : Firestore l'exige.
    const [snapPrets, snapAbandonnes] = await Promise.all([
      tx.get(dus("ready")),
      tx.get(dus("publishing")),
    ]);

    const candidats = [...snapPrets.docs, ...snapAbandonnes.docs]
      .map(enFile)
      .filter((p) => estReservable(p, maintenant));

    // Un post sans visuel serait refusé par le réseau : le réserver
    // consommerait un essai pour rien et le ferait compter comme un échec.
    // On le signale au lieu de le sortir.
    const publiables = candidats.filter((p) => !manqueVisuel(p)).slice(0, LOT_MAX);
    const sansVisuel = candidats.filter(manqueVisuel);

    const patch = patchReservation(claimId, maintenant);
    for (const p of publiables) {
      tx.update(db.collection("socialPosts").doc(p.id), patch);
    }

    const parId = new Map(
      [...snapPrets.docs, ...snapAbandonnes.docs].map((d) => [d.id, d.data()])
    );
    return {
      posts: publiables.map((p) => {
        const brut = parId.get(p.id) ?? {};
        return {
          id: p.id,
          claimId,
          date: p.date,
          channel: brut.channel,
          market: brut.market ?? "fr",
          type: brut.type,
          caption: brut.caption,
          hashtags: brut.hashtags ?? null,
          imageUrl: p.imageUrl,
        };
      }),
      bloques: sansVisuel.map((p) => ({ id: p.id, date: p.date, motif: "visuel_manquant" })),
    };
  });

  return NextResponse.json({
    aujourdhui,
    claimId,
    // Après ce délai sans nouvelle, la réservation est reprise : l'appelant
    // sait donc de combien de temps il dispose.
    reservationExpireDansMs: DUREE_RESERVATION_MS,
    total: posts.length,
    posts,
    bloques,
  });
}

/** Consigne le résultat d'une publication réservée. */
export async function POST(req: Request) {
  const refus = guard(req);
  if (refus) return refus;

  const db = dbOrError();
  if (db instanceof NextResponse) return db;

  let body: { id?: string; claimId?: string; ok?: boolean; url?: string; erreur?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { id, claimId, ok } = body;
  if (!id || typeof ok !== "boolean" || !claimId) {
    return NextResponse.json(
      { error: "id, claimId et ok sont requis" },
      { status: 400 }
    );
  }

  const ref = db.collection("socialPosts").doc(id);
  const maintenant = new Date();

  const issue = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return { introuvable: true as const };

    const decision = reglerPublication(
      enFile({ id: snap.id, data: () => snap.data() as Record<string, unknown> }),
      claimId,
      ok,
      { url: body.url, erreur: body.erreur },
      maintenant
    );
    if (decision.accepte && decision.patch) tx.update(ref, decision.patch);
    return { decision };
  });

  if ("introuvable" in issue) {
    return NextResponse.json({ error: "post_introuvable" }, { status: 404 });
  }

  const { decision } = issue;
  if (!decision.accepte) {
    // 409 et non 400 : la demande est bien formée, c'est l'état qui a bougé.
    // Un rappel en double, ou émis par une exécution dont la réservation a
    // expiré, tombe ici — sans rien écraser.
    return NextResponse.json(
      { error: decision.motif, detail: "Cette réservation n'est plus la bonne ; rien n'a été modifié." },
      { status: 409 }
    );
  }

  return NextResponse.json({
    ok: true,
    id,
    status: decision.statut,
    ...("dejaFait" in decision ? { dejaFait: true } : {}),
  });
}
