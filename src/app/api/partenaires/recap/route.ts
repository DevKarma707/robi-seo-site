import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin, callRobiFunction } from "@/lib/adminAuth";
import { langFromLocale, mailRecap, previousMonthLabel, sendPartnerMail, type PartnerForMail } from "@/lib/partenaires";
import { computeCommission, linesOfRow, minus, sumMoney, termsOf, type Money, type SaleLine } from "@/lib/commissions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Récap mensuel envoyé à chaque partenaire actif (cron Vercel, le 1er à 8 h) :
 * clics, inscriptions, ventes, commission en attente, déjà versé.
 *
 * Le partenaire n'a pas d'espace connecté : ce mail est son tableau de bord.
 * Les chiffres viennent des mêmes sources que l'admin (ventes attribuées
 * côté app, versements côté site), donc ce qu'il lit est ce que Ralph voit.
 */

const sameSecret = (a: string, b?: string) => !!b && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

async function authorized(req: NextRequest): Promise<boolean> {
  const header = req.headers.get("authorization") || "";
  const presented = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (sameSecret(presented, process.env.CRON_SECRET)) return true;
  const guard = await requireAdmin(req);
  return guard.ok;
}

interface Row { discountId: string; code: string | null; sales: number; netAmount: number; currency?: string; signups?: number; lines?: SaleLine[] }

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "indisponible" }, { status: 503 });

  const { status, json } = await callRobiFunction("getAttributionStats");
  if (status !== 200) return NextResponse.json({ error: "stats", detail: json }, { status: 502 });
  const rows = ((json as { byCode?: Row[] }).byCode || []);

  const [infs, payouts] = await Promise.all([
    db.collection("influencers").where("status", "==", "actif").get(),
    db.collection("influencerPayouts").get(),
  ]);
  const paidBy: Record<string, { amount?: number; currency?: string }[]> = {};
  for (const d of payouts.docs) {
    const p = d.data() as { influencerId: string; amount?: number; currency?: string };
    (paidBy[p.influencerId] ||= []).push(p);
  }

  const results: { id: string; sent: boolean; skipped?: string }[] = [];
  for (const doc of infs.docs) {
    const inf = doc.data() as Omit<PartnerForMail, "email" | "promoCode"> & {
      email?: string; promoCode?: string; polarDiscountId?: string; clicks?: number;
    };
    if (!inf.email || !inf.promoCode) { results.push({ id: doc.id, sent: false, skipped: "sans_email_ou_code" }); continue; }

    const row =
      rows.find((r) => inf.polarDiscountId && r.discountId === inf.polarDiscountId) ||
      rows.find((r) => (r.code || "").toUpperCase() === inf.promoCode!.toUpperCase());
    const r = computeCommission(row ? linesOfRow(row) : [], termsOf(inf));
    const paid: Money = sumMoney(paidBy[doc.id] || []);
    const lang = langFromLocale(inf.language || "fr");

    const mail = mailRecap(
      { ...inf, email: inf.email, promoCode: inf.promoCode },
      {
        clicks: inf.clicks || 0, signups: row?.signups || 0, sales: r.firstPayments,
        payingCustomers: row?.lines ? r.payingCustomers : row?.sales || 0, renewals: r.renewals,
        remaining: minus(r.total, paid), paid, bonusEarned: r.bonusEarned,
      },
      previousMonthLabel(lang),
    );
    const sent = await sendPartnerMail({ to: inf.email, ...mail });
    if (sent) await doc.ref.set({ lastRecapAt: FieldValue.serverTimestamp() }, { merge: true });
    results.push({ id: doc.id, sent });
  }

  return NextResponse.json({ ok: true, count: results.length, sent: results.filter((r) => r.sent).length, results });
}
