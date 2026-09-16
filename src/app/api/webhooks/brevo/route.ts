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

/**
 * Un statut plus avancé n'est jamais écrasé par un plus faible arrivé en retard.
 *
 * Couvre aussi les deux statuts que Brevo n'émet pas mais qui vivent sur la
 * fiche : `sent` (posé à l'envoi) et `replied` (posé par le cron IMAP). Sans
 * eux la comparaison portait sur `undefined`, donc ne bloquait rien — et une
 * réouverture du mail après une réponse effaçait « A répondu », le signal le
 * plus fort du pipeline.
 *
 * `replied` passe devant l'engagement (livré, ouvert, cliqué) mais reste
 * derrière les échecs : un signalement en spam après une réponse doit bien
 * fermer la fiche.
 */
type Stored = Status | "sent" | "replied";

const RANK: Record<Stored, number> = {
  sent: 0, delivered: 1, opened: 2, clicked: 3, replied: 4,
  soft_bounce: 5, blocked: 6, hard_bounce: 7, spam: 8,
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
  const current = doc.data() as { delivery?: { status?: Stored }; touches?: unknown[]; status?: string };
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
    // Une adresse morte ou un signalement : la raison reste lisible dans
    // l'historique, et plus rien n'est programmé — écrire encore serait
    // inutile ou nuisible, quel que soit le stade de la fiche.
    const label = status === "spam" ? "Signalé comme spam" : status === "hard_bounce" ? "Adresse invalide (rebond dur)" : "Bloqué par Brevo";
    patch.nextActionDate = null;
    patch.nextActionLabel = null;
    patch.touches = [
      ...((current.touches as unknown[]) || []),
      { date: at.slice(0, 10), channel: "other", note: `${label}${body.reason ? ` — ${body.reason}` : ""}` },
    ];
    // En revanche on ne ferme que les fiches encore dans la mécanique
    // d'envoi. Un intéressé, un inscrit ou un client qui signale un mail en
    // spam ne redevient pas un prospect perdu : c'est Ralph qui décide au-delà.
    if (["todo", "contacted", "followup"].includes(current.status || "")) {
      patch.status = "lost";
      patch.lostReason = label;
    }
  }

  await doc.ref.update(patch);
  console.log(`[brevo-webhook] ${email} → ${status}`);
  return NextResponse.json({ ok: true, status });
}
