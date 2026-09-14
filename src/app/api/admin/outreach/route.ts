import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Sends one outreach email.
 *
 * Deliberately uses a SEPARATE SMTP account (SMTP_OUTREACH_*) from the one the
 * app uses to deliver customers' invoices. If cold outreach gets this sender
 * flagged as spam, invoices must keep arriving — that is the whole reason this
 * route does not reuse the app's transactional credentials.
 *
 * Every message carries an unsubscribe link. That is not decoration: without a
 * working opt-out, B2B prospecting in the EU is unlawful (ePrivacy / art. L34-5
 * CPCE, and GDPR art. 21 on the right to object).
 */

const CONFIGURED =
  !!process.env.SMTP_OUTREACH_HOST &&
  !!process.env.SMTP_OUTREACH_USER &&
  !!process.env.SMTP_OUTREACH_PASS;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://robi-app.com";

const transporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_OUTREACH_HOST,
    port: Number(process.env.SMTP_OUTREACH_PORT || 465),
    secure: Number(process.env.SMTP_OUTREACH_PORT || 465) === 465,
    auth: {
      user: process.env.SMTP_OUTREACH_USER,
      pass: process.env.SMTP_OUTREACH_PASS,
    },
  });

/**
 * Marque les liens Robi d'un mail de prospection pour que PostHog sache d'où
 * vient le visiteur.
 *
 * Sans ça un prospect arrive en trafic anonyme et la campagne est invisible :
 * on voit des inscriptions, jamais lesquelles viennent des mails. Les UTM sont
 * lus par le SDK au premier chargement et attachés à la personne, donc
 * l'attribution survit jusqu'au paiement, des semaines plus tard.
 *
 * Aucun identifiant de destinataire dans l'URL : l'attribution se fait à la
 * campagne. Mettre l'email du prospect dans un lien le ferait fuiter dans les
 * journaux de tous les intermédiaires.
 */
const UTM_TARGET = /https?:\/\/(?:www\.)?(?:go\.)?robi-app\.com[^\s<>"')]*/g;

export const withUtm = (text: string, campagne: string): string =>
  text.replace(UTM_TARGET, (brut) => {
    // Une phrase finit par un point, et ce point se retrouve collé à l'URL.
    // L'y laisser produirait « robi-app.com.?utm_source=… » : un domaine qui
    // n'existe pas, donc un lien mort dans chaque mail se terminant par un lien.
    const fin = brut.match(/[.,;:!?)\]]+$/)?.[0] ?? "";
    const url = fin ? brut.slice(0, -fin.length) : brut;

    // Un lien déjà marqué à la main l'emporte : réécrire par-dessus
    // écraserait une intention explicite.
    if (url.includes("utm_source=")) return brut;
    // La désinscription reste nue — c'est une obligation légale, pas un canal
    // d'acquisition, et la polluer de paramètres invite à la casser.
    if (url.includes("/desinscription")) return brut;

    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}utm_source=prospection&utm_medium=email&utm_campaign=${encodeURIComponent(campagne)}${fin}`;
  });

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Reports whether real sending is available, so the UI can explain itself. */
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });
  return NextResponse.json({
    configured: CONFIGURED,
    from: process.env.SMTP_OUTREACH_FROM || process.env.SMTP_OUTREACH_USER || null,
    host: process.env.SMTP_OUTREACH_HOST || null,
  });
}

export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  if (!CONFIGURED) {
    return NextResponse.json(
      {
        error: "outreach_smtp_not_configured",
        detail:
          "Définis SMTP_OUTREACH_HOST / _PORT / _USER / _PASS / _FROM sur un sous-domaine d'envoi dédié. " +
          "Tant que ce n'est pas fait, utilise « Copier » ou « Ouvrir dans le mail ».",
      },
      { status: 503 }
    );
  }

  let body: {
    to?: string; subject?: string; text?: string; unsubToken?: string;
    replyTo?: string; campagne?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { to, subject, text, unsubToken } = body;
  if (!to || !subject || !text || !unsubToken) {
    return NextResponse.json({ error: "to, subject, text et unsubToken sont requis" }, { status: 400 });
  }

  // Par défaut, le mois d'envoi : deux campagnes lancées à des semaines
  // d'écart restent comparables au lieu de se confondre dans un seul sac.
  const campagne = body.campagne?.trim() || `prospection-${new Date().toISOString().slice(0, 7)}`;
  const texteMarque = withUtm(text, campagne);

  const unsubUrl = `${SITE}/desinscription?t=${encodeURIComponent(unsubToken)}`;
  const footerText = `\n\n—\nVous recevez ce message dans un cadre professionnel. Pour ne plus être contacté : ${unsubUrl}`;
  const html =
    `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1f2937">` +
    escapeHtml(texteMarque).replace(/\n/g, "<br>") +
    `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">` +
    `<p style="font-size:12px;color:#6b7280">Vous recevez ce message dans un cadre professionnel. ` +
    `<a href="${unsubUrl}" style="color:#6b7280">Ne plus être contacté</a>.</p></div>`;

  try {
    const info = await transporter().sendMail({
      from: process.env.SMTP_OUTREACH_FROM || process.env.SMTP_OUTREACH_USER,
      to,
      replyTo: body.replyTo || process.env.SMTP_OUTREACH_REPLY_TO || undefined,
      subject,
      text: texteMarque + footerText,
      html,
      headers: {
        // Lets mail clients offer one-click unsubscribe, which protects sender
        // reputation far better than a footer link alone.
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    console.log(`[outreach] ${guard.email} → ${to} (${info.messageId}) [${campagne}]`);
    return NextResponse.json({ ok: true, messageId: info.messageId, campagne });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[outreach] send failed:", message);
    return NextResponse.json({ error: "send_failed", detail: message }, { status: 502 });
  }
}
