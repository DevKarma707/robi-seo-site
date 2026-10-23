import nodemailer from "nodemailer";
import { BRAND } from "./email/newsletter";
import { AMBASSADEUR_TERMS, MIN_PAYOUT, formatAmount, formatMoney, isEmpty, reachesPayout, termsOf, type Money, type Terms, type TermsFields } from "./commissions";

/**
 * Programme partenaires (influenceurs) — conditions et mails.
 *
 * Deux programmes, conditions uniques dans chacun : c'est ce qui permet de
 * démarcher cent personnes sans cent négociations. Un cas particulier se
 * règle sur la fiche (commissionPct, commissionMonths, bonus), jamais ici.
 *
 * - PROGRAMME : partenaires FR/EN/ES (20 % du premier paiement, 29/09/2026).
 * - AMBASSADEUR : ambassadeurs Robi Maroc, inscrits depuis /fr-MA/partenaires
 *   (30 % de tout ce que paie le client pendant 12 mois + 300 DH au 10e client
 *   payant, décision de Ralph du 23/10/2026). Calculs : src/lib/commissions.ts.
 *
 * Les mails partent par le compte SMTP de prospection (SMTP_OUTREACH_*),
 * jamais par celui qui livre les factures des clients : si ce canal finit en
 * spam, les factures doivent continuer d'arriver.
 */

export const PROGRAMME = {
  discountPct: 20,
  commissionPct: 20,
  /** Seuil de versement, en euros. */
  minPayoutEur: 30,
  /** Durée pendant laquelle un lien cliqué reste attribué. */
  cookieDays: 90,
} as const;

export const AMBASSADEUR = {
  ...AMBASSADEUR_TERMS,
  discountPct: 20,
  bonus: AMBASSADEUR_TERMS.bonus!,
  /** Seuils de versement : 30 €, ou 300 DH. */
  minPayout: MIN_PAYOUT,
  cookieDays: PROGRAMME.cookieDays,
} as const;

/** Les inscriptions depuis cette page créent des fiches ambassadeur. */
export const isAmbassadorLocale = (locale: string) => locale === "fr-MA";

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
export function renderPartnerMail(input: { title: string; blocks: Block[]; footer: string; kicker?: string }): { html: string; text: string } {
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
<p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.muted}">${esc(input.kicker || "Robi AI · Partenaires")}</p>
<h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${BRAND.amethyst};letter-spacing:-0.01em">${esc(input.title)}</h1>
${body}
<p style="margin:26px 0 0;padding-top:16px;border-top:1px solid ${BRAND.border};font-size:12px;line-height:1.5;color:${BRAND.muted}">${esc(input.footer)}</p>
</td></tr></table></td></tr></table></body></html>`;

  const text = [input.title, "", ...input.blocks.map((b) => (b.kind === "cta" ? `${b.text} : ${b.href}` : b.text)), "", input.footer].join("\n");
  return { html, text };
}

// ─── Textes ───────────────────────────────────────────────────────────
/** Seuil de versement en clair : « 30 € » (partenaire) ou « 30 € (ou 300 DH) » (ambassadeur). */
const payoutLabel = (t: Terms, lang: PartnerLang) =>
  t.programme === "ambassadeur"
    ? `${formatAmount(MIN_PAYOUT.EUR * 100, "EUR", lang)} (${lang === "fr" ? "ou" : lang === "es" ? "o" : "or"} ${formatAmount(MIN_PAYOUT.MAD * 100, "MAD", lang)})`
    : formatAmount(MIN_PAYOUT.EUR * 100, "EUR", lang);

const T = {
  fr: {
    team: "L'équipe Robi AI",
    footer: (t: Terms) => `Tu reçois ce mail parce que tu fais partie du programme ${t.programme === "ambassadeur" ? "Ambassadeurs Robi Maroc" : "partenaires Robi AI"}. Réponds directement à ce mail pour nous joindre.`,
    welcomeSubject: (code: string, t: Terms) => `Ton lien ${t.programme === "ambassadeur" ? "ambassadeur" : "partenaire"} Robi est prêt (${code})`,
    welcomeTitle: (name: string) => `Bienvenue ${name}, c'est parti.`,
    welcomeIntro: (d: number, t: Terms) => t.programme === "ambassadeur"
      ? `Ton code offre ${d} % à tes clients sur leur premier paiement. Toi, tu touches ${t.commissionPct} % de tout ce qu'ils paient pendant ${t.commissionMonths ?? 12} mois, renouvellements compris${t.bonus ? `, et une prime de ${formatAmount(t.bonus.montant * 100, t.bonus.devise, "fr")} à ton ${t.bonus.seuil}e client payant` : ""}. Voici tes deux outils :`
      : `Ton code offre ${d} % à tes abonnés, et tu touches ${t.commissionPct} % de chaque vente. Voici tes deux outils :`,
    yourLink: (t: Terms) => t.programme === "ambassadeur" ? "Ton lien (à envoyer à tes clients, sur WhatsApp ou par mail) :" : "Ton lien (à mettre en bio ou en story) :",
    yourCode: (t: Terms) => t.programme === "ambassadeur" ? "Ton code (à donner de vive voix) :" : "Ton code (à dire à l'oral dans tes vidéos) :",
    howPaid: (min: string, t: Terms) => `On te paie chaque début de mois, dès ${min} cumulés, sur le moyen que tu nous as indiqué. Tu reçois un mail à chaque ${t.programme === "ambassadeur" ? "paiement d'un de tes clients" : "vente"}.`,
    cta: "Ouvrir mon lien",
    saleSubject: (recurring: boolean) => recurring ? "Un de tes clients Robi a renouvelé" : "Une vente avec ton code Robi",
    saleTitle: (name: string, recurring: boolean) => recurring ? `${name}, un renouvellement !` : `Bravo ${name}, une vente !`,
    saleLine: (code: string, recurring: boolean, m: number, t: Terms) => recurring
      ? `Un client que tu as amené avec ton code ${code} vient de payer son renouvellement (mois ${m + 1} sur ${t.commissionMonths ?? 12}). Ta commission sur ce paiement :`
      : `Quelqu'un vient de payer Robi avec ton code ${code}. Ta commission sur cette vente :`,
    saleTotal: (total: string) => `Total en attente de versement : ${total}.`,
    bonusReached: (prime: string, seuil: number) => `Tu viens de passer ${seuil} clients payants : ta prime de ${prime} est ajoutée à ton solde.`,
    bonusProgress: (n: number, seuil: number, prime: string) => `Clients payants : ${n} sur ${seuil} pour la prime de ${prime}.`,
    recapSubject: (month: string, t: Terms) => `Ton récap ${t.programme === "ambassadeur" ? "ambassadeur" : "partenaire"} Robi · ${month}`,
    recapTitle: (month: string) => `Récap ${month}`,
    recapLines: (p: { clicks: number; signups: number; sales: number; payingCustomers: number; renewals: number }, t: Terms) => t.programme === "ambassadeur"
      ? `${p.clicks} clics sur ton lien · ${p.signups} inscriptions · ${p.payingCustomers} clients payants · ${p.renewals} renouvellements.`
      : `${p.clicks} clics sur ton lien · ${p.signups} inscriptions · ${p.sales} ventes.`,
    recapDue: "Commission en attente de versement :",
    recapPaid: (paid: string) => `Déjà versé depuis le début : ${paid}.`,
    recapBelow: (min: string) => `En dessous de ${min}, le montant est reporté au mois prochain.`,
    recapTip: (t: Terms) => t.programme === "ambassadeur"
      ? "Astuce : un message à trois clients par semaine, avec ton lien, fait plus que tout le reste."
      : "Astuce : une story par semaine avec ton code fait plus que tout le reste.",
  },
  en: {
    team: "The Robi AI team",
    footer: (t: Terms) => `You receive this email because you are part of the ${t.programme === "ambassadeur" ? "Robi Morocco ambassador" : "Robi AI partner"} programme. Reply to this email to reach us.`,
    welcomeSubject: (code: string, t: Terms) => `Your Robi ${t.programme === "ambassadeur" ? "ambassador" : "partner"} link is ready (${code})`,
    welcomeTitle: (name: string) => `Welcome ${name}, let's go.`,
    welcomeIntro: (d: number, t: Terms) => t.programme === "ambassadeur"
      ? `Your code gives your clients ${d}% off their first payment. You earn ${t.commissionPct}% of everything they pay for ${t.commissionMonths ?? 12} months, renewals included${t.bonus ? `, plus a ${formatAmount(t.bonus.montant * 100, t.bonus.devise, "en")} bonus at your ${t.bonus.seuil}th paying client` : ""}. Here are your two tools:`
      : `Your code gives your audience ${d}% off, and you earn ${t.commissionPct}% of every sale. Here are your two tools:`,
    yourLink: (t: Terms) => t.programme === "ambassadeur" ? "Your link (send it to your clients by WhatsApp or email):" : "Your link (bio or story):",
    yourCode: (t: Terms) => t.programme === "ambassadeur" ? "Your code (give it in person):" : "Your code (say it out loud in your videos):",
    howPaid: (min: string, t: Terms) => `We pay you at the start of each month, once you reach ${min}, via the method you gave us. You get an email ${t.programme === "ambassadeur" ? "every time one of your clients pays" : "for every sale"}.`,
    cta: "Open my link",
    saleSubject: (recurring: boolean) => recurring ? "One of your Robi clients renewed" : "A sale with your Robi code",
    saleTitle: (name: string, recurring: boolean) => recurring ? `${name}, a renewal!` : `Nice one ${name}, a sale!`,
    saleLine: (code: string, recurring: boolean, m: number, t: Terms) => recurring
      ? `A client you brought with your code ${code} just paid their renewal (month ${m + 1} of ${t.commissionMonths ?? 12}). Your commission on this payment:`
      : `Someone just paid for Robi with your code ${code}. Your commission on this sale:`,
    saleTotal: (total: string) => `Total pending payout: ${total}.`,
    bonusReached: (prime: string, seuil: number) => `You just reached ${seuil} paying clients: your ${prime} bonus is added to your balance.`,
    bonusProgress: (n: number, seuil: number, prime: string) => `Paying clients: ${n} of ${seuil} for the ${prime} bonus.`,
    recapSubject: (month: string, t: Terms) => `Your Robi ${t.programme === "ambassadeur" ? "ambassador" : "partner"} recap · ${month}`,
    recapTitle: (month: string) => `Recap ${month}`,
    recapLines: (p: { clicks: number; signups: number; sales: number; payingCustomers: number; renewals: number }, t: Terms) => t.programme === "ambassadeur"
      ? `${p.clicks} link clicks · ${p.signups} sign-ups · ${p.payingCustomers} paying clients · ${p.renewals} renewals.`
      : `${p.clicks} link clicks · ${p.signups} sign-ups · ${p.sales} sales.`,
    recapDue: "Commission pending payout:",
    recapPaid: (paid: string) => `Paid so far: ${paid}.`,
    recapBelow: (min: string) => `Below ${min}, the amount rolls over to next month.`,
    recapTip: (t: Terms) => t.programme === "ambassadeur"
      ? "Tip: a message to three clients a week, with your link, beats everything else."
      : "Tip: one story a week with your code beats everything else.",
  },
  es: {
    team: "El equipo de Robi AI",
    footer: (t: Terms) => `Recibes este correo porque formas parte del programa de ${t.programme === "ambassadeur" ? "embajadores de Robi Marruecos" : "socios de Robi AI"}. Responde a este correo para contactarnos.`,
    welcomeSubject: (code: string, t: Terms) => `Tu enlace de ${t.programme === "ambassadeur" ? "embajador" : "socio"} Robi está listo (${code})`,
    welcomeTitle: (name: string) => `Bienvenido ${name}, empezamos.`,
    welcomeIntro: (d: number, t: Terms) => t.programme === "ambassadeur"
      ? `Tu código da un ${d} % de descuento a tus clientes en su primer pago. Tú ganas el ${t.commissionPct} % de todo lo que pagan durante ${t.commissionMonths ?? 12} meses, renovaciones incluidas${t.bonus ? `, y una prima de ${formatAmount(t.bonus.montant * 100, t.bonus.devise, "es")} con tu cliente número ${t.bonus.seuil}` : ""}. Tus dos herramientas:`
      : `Tu código da un ${d} % de descuento a tu audiencia y tú ganas el ${t.commissionPct} % de cada venta. Tus dos herramientas:`,
    yourLink: (t: Terms) => t.programme === "ambassadeur" ? "Tu enlace (envíalo a tus clientes por WhatsApp o correo):" : "Tu enlace (bio o story):",
    yourCode: (t: Terms) => t.programme === "ambassadeur" ? "Tu código (dalo de viva voz):" : "Tu código (dilo en tus vídeos):",
    howPaid: (min: string, t: Terms) => `Te pagamos a principio de cada mes, a partir de ${min}, por el medio que nos indicaste. Recibes un correo ${t.programme === "ambassadeur" ? "cada vez que uno de tus clientes paga" : "por cada venta"}.`,
    cta: "Abrir mi enlace",
    saleSubject: (recurring: boolean) => recurring ? "Uno de tus clientes de Robi ha renovado" : "Una venta con tu código Robi",
    saleTitle: (name: string, recurring: boolean) => recurring ? `${name}, ¡una renovación!` : `¡Bien ${name}, una venta!`,
    saleLine: (code: string, recurring: boolean, m: number, t: Terms) => recurring
      ? `Un cliente que trajiste con tu código ${code} acaba de pagar su renovación (mes ${m + 1} de ${t.commissionMonths ?? 12}). Tu comisión por este pago:`
      : `Alguien acaba de pagar Robi con tu código ${code}. Tu comisión por esta venta:`,
    saleTotal: (total: string) => `Total pendiente de pago: ${total}.`,
    bonusReached: (prime: string, seuil: number) => `Acabas de llegar a ${seuil} clientes de pago: tu prima de ${prime} se suma a tu saldo.`,
    bonusProgress: (n: number, seuil: number, prime: string) => `Clientes de pago: ${n} de ${seuil} para la prima de ${prime}.`,
    recapSubject: (month: string, t: Terms) => `Tu resumen de ${t.programme === "ambassadeur" ? "embajador" : "socio"} Robi · ${month}`,
    recapTitle: (month: string) => `Resumen ${month}`,
    recapLines: (p: { clicks: number; signups: number; sales: number; payingCustomers: number; renewals: number }, t: Terms) => t.programme === "ambassadeur"
      ? `${p.clicks} clics · ${p.signups} registros · ${p.payingCustomers} clientes de pago · ${p.renewals} renovaciones.`
      : `${p.clicks} clics · ${p.signups} registros · ${p.sales} ventas.`,
    recapDue: "Comisión pendiente de pago:",
    recapPaid: (paid: string) => `Pagado hasta ahora: ${paid}.`,
    recapBelow: (min: string) => `Por debajo de ${min}, el importe pasa al mes siguiente.`,
    recapTip: (t: Terms) => t.programme === "ambassadeur"
      ? "Consejo: un mensaje a tres clientes por semana, con tu enlace, vale más que todo lo demás."
      : "Consejo: una story a la semana con tu código vale más que todo lo demás.",
  },
} as const;

export interface PartnerForMail extends TermsFields {
  name: string;
  email: string;
  promoCode: string;
  discountPct?: number;
  language?: string;
}

const firstName = (name: string) => (name || "").trim().split(/\s+/)[0] || "";

const kickerOf = (t: Terms) => (t.programme === "ambassadeur" ? "Robi AI · Ambassadeurs" : "Robi AI · Partenaires");

export function mailBienvenue(p: PartnerForMail) {
  const lang = langFromLocale(p.language || "fr");
  const t = T[lang];
  const terms = termsOf({ ...p, commissionPct: p.commissionPct ?? PROGRAMME.commissionPct });
  const link = partnerLink(p.promoCode);
  const { html, text } = renderPartnerMail({
    kicker: kickerOf(terms),
    title: t.welcomeTitle(firstName(p.name)),
    blocks: [
      { kind: "p", text: t.welcomeIntro(p.discountPct ?? PROGRAMME.discountPct, terms) },
      { kind: "p", text: t.yourLink(terms) },
      { kind: "code", text: link },
      { kind: "p", text: t.yourCode(terms) },
      { kind: "code", text: p.promoCode.toUpperCase() },
      { kind: "p", text: t.howPaid(payoutLabel(terms, lang), terms) },
      { kind: "cta", text: t.cta, href: link },
      { kind: "p", text: t.team },
    ],
    footer: t.footer(terms),
  });
  return { subject: t.welcomeSubject(p.promoCode.toUpperCase(), terms), html, text };
}

export function mailVente(
  p: PartnerForMail,
  sale: { commissionCents: number; currency: string; recurring: boolean; monthIndex: number },
  pending: Money,
  bonus?: { reached: boolean; payingCustomers: number },
) {
  const lang = langFromLocale(p.language || "fr");
  const t = T[lang];
  const terms = termsOf(p);
  const blocks: Block[] = [
    { kind: "p", text: t.saleLine(p.promoCode.toUpperCase(), sale.recurring, sale.monthIndex, terms) },
    { kind: "big", text: formatAmount(sale.commissionCents, sale.currency, lang) },
  ];
  if (terms.bonus && bonus) {
    const prime = formatAmount(terms.bonus.montant * 100, terms.bonus.devise, lang);
    blocks.push({
      kind: "p",
      text: bonus.reached ? t.bonusReached(prime, terms.bonus.seuil) : t.bonusProgress(Math.min(bonus.payingCustomers, terms.bonus.seuil), terms.bonus.seuil, prime),
    });
  }
  blocks.push({ kind: "p", text: t.saleTotal(formatMoney(pending, lang, sale.currency)) }, { kind: "p", text: t.team });
  const { html, text } = renderPartnerMail({ kicker: kickerOf(terms), title: t.saleTitle(firstName(p.name), sale.recurring), blocks, footer: t.footer(terms) });
  return { subject: t.saleSubject(sale.recurring), html, text };
}

export function mailRecap(
  p: PartnerForMail,
  perf: { clicks: number; signups: number; sales: number; payingCustomers: number; renewals: number; remaining: Money; paid: Money; bonusEarned: boolean },
  monthLabel: string,
) {
  const lang = langFromLocale(p.language || "fr");
  const t = T[lang];
  const terms = termsOf(p);
  const blocks: Block[] = [
    { kind: "p", text: t.recapLines(perf, terms) },
    { kind: "p", text: t.recapDue },
    { kind: "big", text: formatMoney(perf.remaining, lang) },
  ];
  if (!isEmpty(perf.remaining) && !reachesPayout(perf.remaining)) {
    blocks.push({ kind: "p", text: t.recapBelow(payoutLabel(terms, lang)) });
  }
  if (terms.bonus && !perf.bonusEarned) {
    const prime = formatAmount(terms.bonus.montant * 100, terms.bonus.devise, lang);
    blocks.push({ kind: "p", text: t.bonusProgress(perf.payingCustomers, terms.bonus.seuil, prime) });
  }
  if (!isEmpty(perf.paid)) blocks.push({ kind: "p", text: t.recapPaid(formatMoney(perf.paid, lang)) });
  blocks.push({ kind: "p", text: t.recapTip(terms) }, { kind: "p", text: t.team });
  const { html, text } = renderPartnerMail({ kicker: kickerOf(terms), title: t.recapTitle(monthLabel), blocks, footer: t.footer(terms) });
  return { subject: t.recapSubject(monthLabel, terms), html, text };
}

/** Libellé du mois précédent dans la langue du partenaire (« septembre 2026 »). */
export const previousMonthLabel = (lang: PartnerLang, now = new Date()) => {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return d.toLocaleDateString(lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
};
