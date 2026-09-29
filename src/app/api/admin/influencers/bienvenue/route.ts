import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { mailBienvenue, sendPartnerMail } from "@/lib/partenaires";

export const dynamic = "force-dynamic";

/**
 * Envoie (ou renvoie) au partenaire son mail de bienvenue : lien, code,
 * conditions. Appelé par l'admin juste après « Activer le code ».
 */
export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { influencerId } = await req.json().catch(() => ({})) as { influencerId?: string };
  if (!influencerId) return NextResponse.json({ error: "influencerId" }, { status: 400 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: "indisponible" }, { status: 503 });

  const ref = db.collection("influencers").doc(influencerId);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "inconnu" }, { status: 404 });
  const inf = snap.data() as { name: string; email?: string; promoCode?: string; polarDiscountId?: string; discountPct?: number; commissionPct?: number; language?: string };
  if (!inf.email) return NextResponse.json({ error: "sans_email" }, { status: 400 });
  if (!inf.promoCode || !inf.polarDiscountId) return NextResponse.json({ error: "code_non_actif" }, { status: 400 });

  const mail = mailBienvenue({ name: inf.name, email: inf.email, promoCode: inf.promoCode, discountPct: inf.discountPct, commissionPct: inf.commissionPct, language: inf.language });
  const sent = await sendPartnerMail({ to: inf.email, ...mail });
  if (sent) await ref.set({ welcomeSentAt: FieldValue.serverTimestamp() }, { merge: true });
  return NextResponse.json({ ok: sent, sent });
}
