import nodemailer from "nodemailer";
import { BRAND } from "./email/newsletter";

/**
 * Programme partenaires (influenceurs) — conditions et mails.
 *
 * Conditions uniques pour tout le monde : c'est ce qui permet de démarcher
 * cent créateurs sans cent négociations. Un cas particulier se règle sur la
 * fiche (commissionPct), jamais ici.
 *
 * Les mails partent par le compte SMTP de prospection (SMTP_OUTREACH_*),
 * jamais par celui qui livre les factures des clients : si ce canal finit en
 * spam, les factures doivent continuer d'arriver.
 */

export const PROGRAMME = {
  discountPct: 20,
  commissionPct: 30,
  /** Seuil de versement, en euros. */
  minPayoutEur: 30,
  /** Durée pendant laquelle un lien cliqué reste attribué. */
  cookieDays: 90,
} as const;

export type PartnerLang = "fr" | "en" | "es";

export const langFromLocale = (locale: string): PartnerLang => {
  const base = (locale || "fr").slice(0, 2).toLowerCase();
  return base === "en" || base === "es" ? base : "fr";
};

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://robi-app.com";

export const partnerLink = (code: string) => `${SITE}/r/${code.toUpperCase()}`;

const CONFIGURED =
  !!process.env.SMTP_OUTREACH_HOST &&
  !!process.env.SMTP_OUTREACH_USER &&
  !!process.env.SMTP_OUTREACH_PASS;

const transporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_OUTREACH_HOST,
    port: Number(process.env.SMTP_OUTREACH_PORT || 465),
    secure: Number(process.env.SMTP_OUTREACH_PORT || 465) === 465,
    auth: { user: process.env.SMTP_OUTREACH_USER, pass: process.env.SMTP_OUTREACH_PASS },
  });

export const mailConfigured = () => CONFIGURED;

/** Adresse qui reçoit les alertes internes (nouvelle inscription). */
export const adminEmail = () =>
  process.env.ADMIN_EMAIL || process.env.SMTP_OUTREACH_REPLY_TO || process.env.SMTP_OUTREACH_USER || null;

export async function sendPartnerMail(input: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  if (!CONFIGURED) {
    console.warn("[partenaires] SMTP non configuré, mail non envoyé :", input.subject);
    return false;
  }
  try {
    await transporter().sendMail({
      from: process.env.SMTP_OUTREACH_FROM || process.env.SMTP_OUTREACH_USER,
      to: input.to,
      replyTo: process.env.SMTP_OUTREACH_REPLY_TO || undefined,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
    return true;
  } catch (e) {
    console.error("[partenaires] envoi échoué :", (e as Error).message);
    return false;
  }
}

// ─── Gabarit ──────────────────────────────────────────────────────────
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const euros = (cents: number, lang: PartnerLang = "fr") =>
  (cents / 100).toLocaleString(lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "fr-FR", {
    style: "currency", currency: "EUR", maximumFractionDigits: 2,
  });

interface Block { kind: "p" | "big" | "code" | "cta"; text: string; href?: string }

/** Un mail court, une seule colonne, lisible en 5 secondes. */
export function renderPartnerMail(input: { title: string; blocks: Block[]; footer: string }): { html: string; text: string } {
  const body = input.blocks.map((b) => {
    switch (b.kind) {
      case "big":
        return `<p style="margin:18px 0;font-size:34px;font-weight:800;color:${BRAND.amethyst};letter-spacing:-0.02em">${esc(b.text)}</p>`;
      case "code":
        return `<p style="margin:14px 0"><span style="display:inline-block;padding:10px 16px;border-radius:10px;background:${BRAND.amethyst};color:${BRAND.lime};font-family:ui-monospace,Menlo,monospace;font-size:18px;font-weight:700;letter-spacing:0.04em">${esc(b.text)}</span></p>`;
      case "cta":
        return `<p style="margin:22px 0"><a href="${b.href}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:${BRAND.lime};color:${BRAND.amethyst};font-weight:800;text-decoration:none">${esc(b.text)}</a></p>`;
      default:
        return `<p style="margin:12px 0;font-size:15px;line-height:1.55;color:${BRAND.ink}">${esc(b.text)}</p>`;
    }
  }).join("");

  const html = `<!doctype html><html><body style="margin:0;background:${BRAND.bg};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid ${BRAND.border};border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted}">Robi AI · Partenaires</p>
<h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${BRAND.amethyst};letter-spacing:-0.01em">${esc(input.title)}</h1>
${body}
<p style="margin:26px 0 0;padding-top:16px;border-top:1px solid ${BRAND.border};font-size:12px;line-height:1.5;color:${BRAND.muted}">${esc(input.footer)}</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [input.title, "", ...input.blocks.map((b) => (b.kind === "cta" ? `${b.text} : ${b.href}` : b.text)), "", input.footer].join("\n");
  return { html, text };
}

// ─── Textes ───────────────────────────────────────────────────────────
const T = {
  fr: {
    team: "L'équipe Robi AI",
    footer: "Tu reçois ce mail parce que tu fais partie du programme partenaires Robi AI. Réponds directement à ce mail pour nous joindre.",
    welcomeSubject: (code: string) => `Ton lien partenaire Robi est prêt (${code})`,
    welcomeTitle: (name: string) => `Bienvenue ${name}, c'est parti.`,
    welcomeIntro: (d: number, c: number) => `Ton code offre ${d} % à tes abonnés, et tu touches ${c} % de chaque vente. Voici tes deux outils :`,
    yourLink: "Ton lien (à mettre en bio ou en story) :",
    yourCode: "Ton code (à dire à l'oral dans tes vidéos) :",
    howPaid: (min: number) => `On te paie chaque début de mois, dès ${min} € cumulés, sur le moyen que tu nous as indiqué. Tu reçois un mail à chaque vente.`,
    cta: "Ouvrir mon lien",
    saleSubject: "Une vente avec ton code Robi",
    saleTitle: (name: string) => `Bravo ${name}, une vente !`,
    saleLine: (code: string) => `Quelqu'un vient de payer Robi avec ton code ${code}. Ta commission sur cette vente :`,
    saleTotal: (total: string) => `Total en attente de versement : ${total}.`,
    recapSubject: (month: string) => `Ton récap partenaire Robi · ${month}`,
    recapTitle: (month: string) => `Récap ${month}`,
    recapLines: (p: { clicks: number; signups: number; sales: number }) => `${p.clicks} clics sur ton lien · ${p.signups} inscriptions · ${p.sales} ventes.`,
    recapDue: "Commission en attente de versement :",
    recapPaid: (paid: string) => `Déjà versé depuis le début : ${paid}.`,
    recapBelow: (min: number) => `En dessous de ${min} €, le montant est reporté au mois prochain.`,
    recapTip: "Astuce : une story par semaine avec ton code fait plus que tout le reste.",
  },
  en: {
    team: "The Robi AI team",
    footer: "You receive this email because you are part of the Robi AI partner programme. Reply to this email to reach us.",
    welcomeSubject: (code: string) => `Your Robi partner link is ready (${code})`,
    welcomeTitle: (name: string) => `Welcome ${name}, let's go.`,
    welcomeIntro: (d: number, c: number) => `Your code gives your audience ${d}% off, and you earn ${c}% of every sale. Here are your two tools:`,
    yourLink: "Your link (bio or story):",
    yourCode: "Your code (say it out loud in your videos):",
    howPaid: (min: number) => `We pay you at the start of each month, once you reach €${min}, via the method you gave us. You get an email for every sale.`,
    cta: "Open my link",
    saleSubject: "A sale with your Robi code",
    saleTitle: (name: string) => `Nice one ${name}, a sale!`,
    saleLine: (code: string) => `Someone just paid for Robi with your code ${code}. Your commission on this sale:`,
    saleTotal: (total: string) => `Total pending payout: ${total}.`,
    recapSubject: (month: string) => `Your Robi partner recap · ${month}`,
    recapTitle: (month: string) => `Recap ${month}`,
    recapLines: (p: { clicks: number; signups: number; sales: number }) => `${p.clicks} link clicks · ${p.signups} sign-ups · ${p.sales} sales.`,
    recapDue: "Commission pending payout:",
    recapPaid: (paid: string) => `Paid so far: ${paid}.`,
    recapBelow: (min: number) => `Below €${min}, the amount rolls over to next month.`,
    recapTip: "Tip: one story a week with your code beats everything else.",
  },
  es: {
    team: "El equipo de Robi AI",
    footer: "Recibes este correo porque formas parte del programa de socios de Robi AI. Responde a este correo para contactarnos.",
    welcomeSubject: (code: string) => `Tu enlace de socio Robi está listo (${code})`,
    welcomeTitle: (name: string) => `Bienvenido ${name}, empezamos.`,
    welcomeIntro: (d: number, c: number) => `Tu código da un ${d} % de descuento a tu audiencia y tú ganas el ${c} % de cada venta. Tus dos herramientas:`,
    yourLink: "Tu enlace (bio o story):",
    yourCode: "Tu código (dilo en tus vídeos):",
    howPaid: (min: number) => `Te pagamos a principio de cada mes, a partir de ${min} €, por el medio que nos indicaste. Recibes un correo por cada venta.`,
    cta: "Abrir mi enlace",
    saleSubject: "Una venta con tu código Robi",
    saleTitle: (name: string) => `¡Bien ${name}, una venta!`,
    saleLine: (code: string) => `Alguien acaba de pagar Robi con tu código ${code}. Tu comisión por esta venta:`,
    saleTotal: (total: string) => `Total pendiente de pago: ${total}.`,
    recapSubject: (month: string) => `Tu resumen de socio Robi · ${month}`,
    recapTitle: (month: string) => `Resumen ${month}`,
    recapLines: (p: { clicks: number; signups: number; sales: number }) => `${p.clicks} clics · ${p.signups} registros · ${p.sales} ventas.`,
    recapDue: "Comisión pendiente de pago:",
    recapPaid: (paid: string) => `Pagado hasta ahora: ${paid}.`,
    recapBelow: (min: number) => `Por debajo de ${min} €, el importe pasa al mes siguiente.`,
    recapTip: "Consejo: una story a la semana con tu código vale más que todo lo demás.",
  },
} as const;

export interface PartnerForMail {
  name: string;
  email: string;
  promoCode: string;
  discountPct?: number;
  commissionPct?: number;
  language?: string;
}

const firstName = (name: string) => (name || "").trim().split(/\s+/)[0] || "";

export function mailBienvenue(p: PartnerForMail) {
  const lang = langFromLocale(p.language || "fr");
  const t = T[lang];
  const link = partnerLink(p.promoCode);
  const { html, text } = renderPartnerMail({
    title: t.welcomeTitle(firstName(p.name)),
    blocks: [
      { kind: "p", text: t.welcomeIntro(p.discountPct ?? PROGRAMME.discountPct, p.commissionPct ?? PROGRAMME.commissionPct) },
      { kind: "p", text: t.yourLink },
      { kind: "code", text: link },
      { kind: "p", text: t.yourCode },
      { kind: "code", text: p.promoCode.toUpperCase() },
      { kind: "p", text: t.howPaid(PROGRAMME.minPayoutEur) },
      { kind: "cta", text: t.cta, href: link },
      { kind: "p", text: t.team },
    ],
    footer: t.footer,
  });
  return { subject: t.welcomeSubject(p.promoCode.toUpperCase()), html, text };
}

export function mailVente(p: PartnerForMail, commissionCents: number, pendingCents: number) {
  const lang = langFromLocale(p.language || "fr");
  const t = T[lang];
  const { html, text } = renderPartnerMail({
    title: t.saleTitle(firstName(p.name)),
    blocks: [
      { kind: "p", text: t.saleLine(p.promoCode.toUpperCase()) },
      { kind: "big", text: euros(commissionCents, lang) },
      { kind: "p", text: t.saleTotal(euros(pendingCents, lang)) },
      { kind: "p", text: t.team },
    ],
    footer: t.footer,
  });
  return { subject: t.saleSubject, html, text };
}

export function mailRecap(
  p: PartnerForMail,
  perf: { clicks: number; signups: number; sales: number; remainingCents: number; paidCents: number },
  monthLabel: string,
) {
  const lang = langFromLocale(p.language || "fr");
  const t = T[lang];
  const blocks: Block[] = [
    { kind: "p", text: t.recapLines(perf) },
    { kind: "p", text: t.recapDue },
    { kind: "big", text: euros(perf.remainingCents, lang) },
  ];
  if (perf.remainingCents > 0 && perf.remainingCents < PROGRAMME.minPayoutEur * 100) {
    blocks.push({ kind: "p", text: t.recapBelow(PROGRAMME.minPayoutEur) });
  }
  if (perf.paidCents > 0) blocks.push({ kind: "p", text: t.recapPaid(euros(perf.paidCents, lang)) });
  blocks.push({ kind: "p", text: t.recapTip }, { kind: "p", text: t.team });
  const { html, text } = renderPartnerMail({ title: t.recapTitle(monthLabel), blocks, footer: t.footer });
  return { subject: t.recapSubject(monthLabel), html, text };
}

/** Libellé du mois précédent dans la langue du partenaire (« septembre 2026 »). */
export const previousMonthLabel = (lang: PartnerLang, now = new Date()) => {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return d.toLocaleDateString(lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
};
