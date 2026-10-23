import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { mailVente, sendPartnerMail, type PartnerForMail } from "@/lib/partenaires";
import { commissionOf, isCommissionable, minus, sumMoney, termsOf } from "@/lib/commissions";

export const dynamic = "force-dynamic";

/**
 * Appelée par la function `polarWebhook` (projet app) à chaque paiement
 * attribué à un code partenaire — premier paiement ou renouvellement :
 * applique les conditions de la fiche (un renouvellement n'est commissionné
 * que pour un ambassadeur, dans ses 12 mois) et envoie le mail « une vente ».
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

  const body = await req.json().catch(() => ({})) as {
    code?: string; orderId?: string; netAmount?: number; currency?: string;
    recurring?: boolean; monthIndex?: number; customer?: string;
  };
  const code = String(body.code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const orderId = String(body.orderId || "").slice(0, 80);
  const netAmount = Math.max(0, Math.round(Number(body.netAmount) || 0));
  const currency = String(body.currency || "EUR").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "EUR";
  const recurring = body.recurring === true;
  const monthIndex = Math.max(0, Math.round(Number(body.monthIndex) || 0));
  const customer = String(body.customer || "").replace(/[^a-f0-9]/g, "").slice(0, 24) || orderId;
  if (!code || !orderId) return NextResponse.json({ error: "params" }, { status: 400 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: "indisponible" }, { status: 503 });

  try {
    const snap = await db.collection("influencers").where("promoCode", "==", code).limit(1).get();
    if (snap.empty) return NextResponse.json({ ok: true, skipped: "code_sans_fiche" });
    const inf = { id: snap.docs[0].id, ...(snap.docs[0].data() as Record<string, unknown>) } as Omit<PartnerForMail, "email"> & {
      id: string; email?: string;
    };
    const terms = termsOf(inf);

    // Un renouvellement hors conditions (partenaire, ou après 12 mois) : rien
    // à verser, donc pas de mail « bravo ».
    if (!isCommissionable({ first: !recurring, m: monthIndex, refunded: false }, terms)) {
      return NextResponse.json({ ok: true, skipped: "hors_conditions" });
    }
    if (!inf.email) return NextResponse.json({ ok: true, skipped: "sans_email" });

    const dedupe = db.collection("influencerSaleMails").doc(orderId);
    if ((await dedupe.get()).exists) return NextResponse.json({ ok: true, skipped: "deja_envoye" });

    const commission = commissionOf(netAmount, terms);

    // Cumul « en attente » approximatif tenu sur les mails envoyés :
    // commissions notifiées − versements, par devise. L'admin, lui, recalcule
    // depuis les ventes réelles ; ici c'est juste le chiffre montré au partenaire.
    const [payouts, notified] = await Promise.all([
      db.collection("influencerPayouts").where("influencerId", "==", inf.id).get(),
      db.collection("influencerSaleMails").where("influencerId", "==", inf.id).get(),
    ]);
    const paid = sumMoney(payouts.docs.map((d) => d.data() as { amount?: number; currency?: string }));
    const past = notified.docs.map((d) => d.data() as { commission?: number; currency?: string; customer?: string; bonus?: number; bonusCurrency?: string });
    const earned = sumMoney([
      ...past.map((x) => ({ amount: x.commission, currency: x.currency })),
      ...past.filter((x) => x.bonus).map((x) => ({ amount: x.bonus, currency: x.bonusCurrency })),
      { amount: commission, currency },
    ]);

    // Prime : franchie au moment où ce paiement fait atteindre le seuil de
    // clients distincts. Notée une seule fois (sur le mail qui l'annonce).
    let bonusInfo: { reached: boolean; payingCustomers: number } | undefined;
    let bonusCents = 0;
    if (terms.bonus) {
      const customers = new Set(past.map((x) => x.customer).filter(Boolean) as string[]);
      const alreadyAwarded = past.some((x) => x.bonus);
      customers.add(customer);
      const reached = !alreadyAwarded && customers.size >= terms.bonus.seuil;
      if (reached) {
        bonusCents = Math.round(terms.bonus.montant * 100);
        earned[terms.bonus.devise] = (earned[terms.bonus.devise] || 0) + bonusCents;
      }
      bonusInfo = { reached, payingCustomers: customers.size };
    }
    const pending = minus(earned, paid);

    await dedupe.set({
      influencerId: inf.id, code, netAmount, currency, commission, recurring, monthIndex, customer,
      ...(bonusCents && terms.bonus ? { bonus: bonusCents, bonusCurrency: terms.bonus.devise } : {}),
      at: FieldValue.serverTimestamp(),
    });

    const mail = mailVente(
      { ...inf, email: inf.email, promoCode: code },
      { commissionCents: commission, currency, recurring, monthIndex },
      pending,
      bonusInfo,
    );
    const sent = await sendPartnerMail({ to: inf.email, ...mail });
    return NextResponse.json({ ok: true, sent, commission, currency, bonus: bonusCents || undefined });
  } catch (e) {
    console.error("[partenaires/vente]", (e as Error).message);
    return NextResponse.json({ error: "erreur" }, { status: 500 });
  }
}
