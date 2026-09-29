import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { mailVente, sendPartnerMail } from "@/lib/partenaires";

export const dynamic = "force-dynamic";

/**
 * Appelée par la function `polarWebhook` (projet app) à chaque vente payée
 * avec un code partenaire : envoie au partenaire le mail « une vente ».
 *
 * Le webhook Polar rejoue parfois le même événement : le mail est dédoublonné
 * par id de commande (`influencerSaleMails/{orderId}`), un partenaire ne doit
 * jamais recevoir deux fois « bravo » pour une seule vente.
 *
 * Secret partagé avec l'app (ADMIN_STATS_SECRET), le même que pour les
 * statistiques : une seule clé à faire tourner.
 */

const sameSecret = (a: string, b?: string) => !!b && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

export async function POST(req: Request) {
  const header = req.headers.get("authorization") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!sameSecret(presented, process.env.ADMIN_STATS_SECRET)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({})) as { code?: string; orderId?: string; netAmount?: number };
  const code = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const orderId = String(body.orderId || "").slice(0, 80);
  const netAmount = Math.max(0, Math.round(Number(body.netAmount) || 0));
  if (!code || !orderId) return NextResponse.json({ error: "params" }, { status: 400 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: "indisponible" }, { status: 503 });

  try {
    const snap = await db.collection("influencers").where("promoCode", "==", code).limit(1).get();
    if (snap.empty) return NextResponse.json({ ok: true, skipped: "code_sans_fiche" });
    const inf = { id: snap.docs[0].id, ...(snap.docs[0].data() as Record<string, unknown>) } as {
      id: string; name: string; email?: string; promoCode: string; commissionPct?: number; language?: string;
      pendingCents?: number;
    };
    if (!inf.email) return NextResponse.json({ ok: true, skipped: "sans_email" });

    const dedupe = db.collection("influencerSaleMails").doc(orderId);
    if ((await dedupe.get()).exists) return NextResponse.json({ ok: true, skipped: "deja_envoye" });

    const commission = Math.round((netAmount * Number(inf.commissionPct || 0)) / 100);

    // Cumul « en attente » approximatif tenu sur la fiche : commissions
    // notifiées − versements enregistrés. L'admin, lui, recalcule depuis les
    // ventes réelles ; ici c'est juste le chiffre qu'on montre au partenaire.
    const payouts = await db.collection("influencerPayouts").where("influencerId", "==", inf.id).get();
    const paid = payouts.docs.reduce((s, d) => s + Number((d.data() as { amount?: number }).amount || 0), 0);
    const notified = await db.collection("influencerSaleMails").where("influencerId", "==", inf.id).get();
    const earned = notified.docs.reduce((s, d) => s + Number((d.data() as { commission?: number }).commission || 0), 0) + commission;
    const pending = Math.max(0, earned - paid);

    await dedupe.set({ influencerId: inf.id, code, netAmount, commission, at: FieldValue.serverTimestamp() });

    const mail = mailVente({ name: inf.name, email: inf.email, promoCode: code, commissionPct: inf.commissionPct, language: inf.language }, commission, pending);
    const sent = await sendPartnerMail({ to: inf.email, ...mail });
    return NextResponse.json({ ok: true, sent, commission });
  } catch (e) {
    console.error("[partenaires/vente]", (e as Error).message);
    return NextResponse.json({ error: "erreur" }, { status: 500 });
  }
}
