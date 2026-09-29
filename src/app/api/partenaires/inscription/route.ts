import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { PROGRAMME, adminEmail, langFromLocale, renderPartnerMail, sendPartnerMail } from "@/lib/partenaires";

export const dynamic = "force-dynamic";

/**
 * Inscription publique au programme partenaires (page /partenaires).
 *
 * Crée la fiche influenceur en « repéré » : rien n'est actif tant que Ralph
 * n'a pas cliqué « Activer le code » dans l'admin. Un inconnu ne peut donc
 * ni obtenir un code, ni polluer l'attribution ; au pire il crée une fiche
 * que l'admin supprime en un clic.
 */

const PLATFORMS = new Set(["instagram", "tiktok", "youtube", "linkedin", "x", "blog", "podcast", "autre"]);
const METHODS = new Set(["paypal", "virement", "wise"]);

const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Anti-abus minimal : 5 inscriptions par IP et par heure. */
const hits = new Map<string, { n: number; at: number }>();
const rateLimited = (ip: string) => {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.at > 3600_000) { hits.set(ip, { n: 1, at: now }); return false; }
  h.n += 1;
  return h.n > 5;
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "?";
  if (rateLimited(ip)) return NextResponse.json({ error: "trop_de_tentatives" }, { status: 429 });

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;

  // Champ piège invisible : un robot le remplit, un humain non.
  if (clean(body.website, 10)) return NextResponse.json({ ok: true });

  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const handle = clean(body.handle, 60).replace(/^@+/, "");
  const platform = clean(body.platform, 20);
  const url = clean(body.url, 200);
  const country = clean(body.country, 2).toUpperCase();
  const audience = Math.max(0, Math.min(50_000_000, Math.round(Number(body.audience) || 0)));
  const payoutMethod = clean(body.payoutMethod, 10);
  const payoutDetails = clean(body.payoutDetails, 120);
  const notes = clean(body.message, 500);
  const language = langFromLocale(clean(body.locale, 8));

  if (name.length < 2) return NextResponse.json({ error: "nom" }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "email" }, { status: 400 });
  if (!PLATFORMS.has(platform)) return NextResponse.json({ error: "plateforme" }, { status: 400 });
  if (!handle && !url) return NextResponse.json({ error: "compte" }, { status: 400 });
  if (payoutMethod && !METHODS.has(payoutMethod)) return NextResponse.json({ error: "paiement" }, { status: 400 });

  const db = adminDb();
  if (!db) return NextResponse.json({ error: "indisponible" }, { status: 503 });

  try {
    const dup = await db.collection("influencers").where("email", "==", email).limit(1).get();
    if (!dup.empty) {
      // Déjà inscrit : on ne dit rien de plus (pas d'énumération d'adresses),
      // et on ne crée pas de doublon.
      return NextResponse.json({ ok: true, already: true });
    }

    const ref = await db.collection("influencers").add({
      name,
      email,
      ...(handle ? { handle: `@${handle}` } : {}),
      platform,
      ...(url ? { url } : {}),
      ...(country ? { country } : {}),
      ...(audience ? { audience } : {}),
      ...(payoutMethod ? { payoutMethod } : {}),
      ...(payoutDetails ? { payoutDetails } : {}),
      ...(notes ? { notes } : {}),
      language,
      status: "prospect",
      source: "site",
      discountPct: PROGRAMME.discountPct,
      commissionPct: PROGRAMME.commissionPct,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Alerte interne : Ralph active en un clic depuis l'admin.
    const to = adminEmail();
    if (to) {
      const { html, text } = renderPartnerMail({
        title: `Nouveau partenaire à activer : ${name}`,
        blocks: [
          { kind: "p", text: `${platform} · ${handle ? `@${handle}` : url} · ${audience ? `${audience.toLocaleString("fr-FR")} abonnés` : "audience non renseignée"} · ${country || "pays ?"} · ${language}` },
          { kind: "p", text: `Paiement : ${payoutMethod || "non renseigné"} ${payoutDetails ? `(${payoutDetails})` : ""}` },
          ...(notes ? [{ kind: "p" as const, text: `Message : ${notes}` }] : []),
          { kind: "cta", text: "Ouvrir l'admin › Influenceurs", href: "https://robi-app.com/admin" },
        ],
        footer: `Fiche ${ref.id}, créée depuis /partenaires.`,
      });
      await sendPartnerMail({ to, subject: `[Robi] Nouveau partenaire : ${name} (${platform})`, html, text });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[partenaires/inscription]", (e as Error).message);
    return NextResponse.json({ error: "erreur" }, { status: 500 });
  }
}
