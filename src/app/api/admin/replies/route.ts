import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ImapFlow } from "imapflow";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Détecte les réponses des prospects dans la boîte de réception, et les
 * écrit sur la fiche.
 *
 * Sans ça, un prospect qui répond reste « en relance » dans l'admin, et la
 * relance suivante part quand même — le pire signal qu'on puisse envoyer à
 * quelqu'un qui vient de nous écrire. Les relances sont espacées de
 * plusieurs jours : une vérification quotidienne (cron Vercel) suffit, et le
 * bouton « Vérifier les réponses » de l'admin la lance à la demande.
 *
 * Lecture seule, en IMAP, sur la boîte de réponse (`Reply-To` des mails de
 * prospection). Seuls les expéditeurs qui correspondent à une fiche déjà
 * contactée sont regardés ; le reste de la boîte n'est ni lu ni stocké.
 */

const memeSecret = (a: string, b?: string) => !!b && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

const CONFIGURED = !!process.env.IMAP_OUTREACH_HOST && !!process.env.IMAP_OUTREACH_USER && !!process.env.IMAP_OUTREACH_PASS;

async function authorized(req: NextRequest): Promise<boolean> {
  const header = req.headers.get("authorization") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (memeSecret(presented, process.env.CRON_SECRET)) return true;
  const guard = await requireAdmin(req);
  return guard.ok;
}

interface Reply { from: string; subject: string; date: string }

/** Expéditeurs des mails reçus depuis `days` jours, dédoublonnés (le plus récent gagne). */
async function recentSenders(days: number): Promise<Map<string, Reply>> {
  const client = new ImapFlow({
    host: process.env.IMAP_OUTREACH_HOST!,
    port: Number(process.env.IMAP_OUTREACH_PORT || 993),
    secure: true,
    auth: { user: process.env.IMAP_OUTREACH_USER!, pass: process.env.IMAP_OUTREACH_PASS! },
    logger: false,
  });
  const since = new Date(Date.now() - days * 86_400_000);
  const out = new Map<string, Reply>();
  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      for await (const msg of client.fetch({ since }, { envelope: true })) {
        const from = msg.envelope?.from?.[0]?.address?.toLowerCase();
        if (!from) continue;
        const date = (msg.envelope?.date || new Date()).toISOString();
        const prev = out.get(from);
        if (!prev || prev.date < date) out.set(from, { from, subject: msg.envelope?.subject || "", date });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
  return out;
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!CONFIGURED) return NextResponse.json({ error: "imap_not_configured" }, { status: 503 });
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "firestore_not_configured" }, { status: 503 });

  const days = Math.min(60, Math.max(1, Number(req.nextUrl.searchParams.get("days") || 14)));
  const senders = await recentSenders(days);

  // Seules les fiches déjà contactées peuvent avoir répondu.
  const snap = await db.collection("prospects").where("lastEmailAt", ">", "").get();
  const matched: string[] = [];

  for (const doc of snap.docs) {
    const p = doc.data() as {
      email?: string; status?: string; lastEmailAt?: string; touches?: unknown[];
      delivery?: { status?: string; at?: string };
    };
    const email = (p.email || "").toLowerCase();
    const reply = email ? senders.get(email) : undefined;
    // La réponse doit être postérieure à notre dernier envoi, sinon c'est un
    // vieux mail sans rapport.
    if (!reply || !p.lastEmailAt || reply.date <= p.lastEmailAt) continue;
    if (p.delivery?.status === "replied" && (p.delivery.at || "") >= reply.date) continue;

    const patch: Record<string, unknown> = {
      delivery: { status: "replied", at: reply.date },
      nextActionDate: null,
      nextActionLabel: null,
      touches: [
        ...((p.touches as unknown[]) || []),
        { date: reply.date.slice(0, 10), channel: "email", note: `Réponse reçue${reply.subject ? ` — « ${reply.subject} »` : ""}` },
      ],
      updatedAt: new Date(),
    };
    // On monte à « intéressé » sans jamais redescendre un statut plus avancé.
    if (["todo", "contacted", "followup"].includes(p.status || "")) {
      patch.status = "interested";
      patch.maxStage = "interested";
    }
    await doc.ref.update(patch);
    matched.push(email);
  }

  console.log(`[replies] ${senders.size} expéditeurs sur ${days} j, ${matched.length} fiche(s) mise(s) à jour`);
  return NextResponse.json({ ok: true, days, senders: senders.size, replied: matched });
}
