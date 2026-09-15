import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { adminDb } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/**
 * Webhook transactionnel Brevo → statut de livraison sur la fiche prospect.
 *
 * Le bouton « Envoyer » de l'admin ne voit que l'accusé SMTP (250) : Brevo
 * peut encore bloquer, rebondir, ou le destinataire signaler en spam. Sans
 * ce retour, la fiche avance dans la séquence sur un mail jamais reçu, et
 * Ralph relance quelqu'un qui n'a rien lu — ou pire, quelqu'un qui a cliqué
 * « spam ». On écrit donc l'événement sur la fiche, et on coupe la séquence
 * quand il ne faut plus écrire.
 *
 * Brevo ne signe pas ses webhooks : l'URL porte un secret (`?k=…`) comparé
 * à temps constant. Le prospect est retrouvé par email — c'est la seule clé
 * commune, puisque l'admin n'envoie aucun identifiant de fiche dans le mail.
 *
 * À déclarer dans Brevo : Transactionnel → Paramètres → Webhooks →
 * https://robi-app.com/api/webhooks/brevo?k=<BREVO_WEBHOOK_SECRET>
 * événements : delivered, soft_bounce, hard_bounce, blocked, spam, opened, click.
 */

const memeSecret = (a: string, b?: string) => {
  if (!b || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

type Status = "delivered" | "opened" | "clicked" | "soft_bounce" | "hard_bounce" | "spam" | "blocked";

/** Événements Brevo → statut fiche. Les autres (request, deferred, unsubscribed…) sont ignorés. */
const MAP: Record<string, Status> = {
  delivered: "delivered",
  opened: "opened",
  unique_opened: "opened",
  click: "clicked",
  soft_bounce: "soft_bounce",
  hard_bounce: "hard_bounce",
  blocked: "blocked",
  spam: "spam",
  complaint: "spam",
};

/** Un statut plus avancé n'est jamais écrasé par un plus faible arrivé en retard. */
const RANK: Record<Status, number> = {
  delivered: 1, opened: 2, clicked: 3, soft_bounce: 4, blocked: 5, hard_bounce: 6, spam: 7,
};

/** Après ça, la séquence s'arrête : écrire encore serait inutile ou nuisible. */
const STOP: Status[] = ["hard_bounce", "blocked", "spam"];

export async function POST(req: NextRequest) {
  const k = req.nextUrl.searchParams.get("k") || "";
  if (!memeSecret(k, process.env.BREVO_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: { event?: string; email?: string; reason?: string; date?: string; ts_event?: number; subject?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const status = MAP[body.event || ""];
  const email = (body.email || "").trim().toLowerCase();
  if (!status || !email) return NextResponse.json({ ok: true, ignored: body.event });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: "firestore_not_configured" }, { status: 503 });

  const snap = await db.collection("prospects").where("email", "==", email).limit(1).get();
  if (snap.empty) return NextResponse.json({ ok: true, unknown: email });

  const doc = snap.docs[0];
  const current = doc.data() as { delivery?: { status?: Status }; touches?: unknown[]; status?: string };
  const prev = current.delivery?.status;
  if (prev && RANK[prev] >= RANK[status] && prev !== status) {
    return NextResponse.json({ ok: true, kept: prev });
  }

  const at = body.ts_event ? new Date(body.ts_event * 1000).toISOString() : new Date().toISOString();
  const patch: Record<string, unknown> = {
    delivery: { status, at, ...(body.reason ? { reason: body.reason } : {}) },
    updatedAt: new Date(),
  };

  if (STOP.includes(status)) {
    // Une adresse morte ou un signalement : on ferme, avec la raison lisible
    // dans l'historique, pour que personne ne relance à la main.
    const label = status === "spam" ? "Signalé comme spam" : status === "hard_bounce" ? "Adresse invalide (rebond dur)" : "Bloqué par Brevo";
    patch.status = "lost";
    patch.lostReason = label;
    patch.nextActionDate = null;
    patch.nextActionLabel = null;
    patch.touches = [
      ...((current.touches as unknown[]) || []),
      { date: at.slice(0, 10), channel: "other", note: `${label}${body.reason ? ` — ${body.reason}` : ""}` },
    ];
  }

  await doc.ref.update(patch);
  console.log(`[brevo-webhook] ${email} → ${status}`);
  return NextResponse.json({ ok: true, status });
}
