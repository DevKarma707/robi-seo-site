/**
 * Gabarit de newsletter Robi — rendu HTML « premium ».
 *
 * Tout est en tableaux imbriqués et styles inline : c'est la seule chose que
 * Gmail, Outlook et Apple Mail rendent de la même façon. Pas de <svg> (plusieurs
 * clients le suppriment en silence), pas de flex/grid, pas de police web
 * obligatoire — Outfit/Inter sont chargées quand le client le permet, avec
 * -apple-system / Helvetica en repli pour que la hiérarchie tienne sans elles.
 *
 * Les images sont servies depuis robi-app.com : la mascotte est le
 * `robot-mark.svg` officiel converti en PNG (public/email/robot-mark.png),
 * jamais redessinée.
 */

import { CONTACT_EMAIL } from "@/lib/legalEntity";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://robi-app.com";

export const BRAND = {
  amethyst: "#0D0630",
  spaceBlue: "#18314F",
  lime: "#BEF221",
  bg: "#F5F6F7",
  muted: "#64748B",
  border: "#E2E8F0",
  ink: "#0F172A",
} as const;

export interface NewsletterFeature {
  /** Petite pilule au-dessus du titre (ex. « Nouveau », « Obligatoire »). */
  badge?: string;
  title: string;
  body: string;
  /** Lien facultatif « En savoir plus ». */
  href?: string;
  linkLabel?: string;
}

export interface NewsletterInput {
  /** Ligne cachée lue par les clients mail sous l'objet. */
  preheader: string;
  /** Pilule en haut à droite (ex. « Septembre 2026 »). */
  edition: string;
  /** Titre du bloc sombre. `\n` = retour à la ligne. */
  headline: string;
  subline: string;
  cta: { label: string; href: string };
  /** Intertitre au-dessus des fonctionnalités. */
  sectionTitle: string;
  features: NewsletterFeature[];
  /** Encart offre (facultatif). */
  offer?: { badge: string; title: string; body: string; cta: { label: string; href: string } };
  /** Mot de fin, signé. */
  closing?: { text: string; signature: string };
  unsubscribeUrl: string;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const nl = (s: string) => esc(s).replace(/\n/g, "<br>");

const FONT_DISPLAY = "'Outfit',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif";
const FONT_BODY = "'Inter',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif";

/** Pilule (rounded-full) — la forme signature de la marque. */
const pill = (label: string, opts: { bg: string; color: string; border?: string }) =>
  `<span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${opts.bg};color:${opts.color};` +
  `${opts.border ? `border:1px solid ${opts.border};` : ""}font-family:${FONT_BODY};font-size:11px;font-weight:600;` +
  `letter-spacing:0.12em;text-transform:uppercase;line-height:1;mso-line-height-rule:exactly">${esc(label)}</span>`;

/** CTA pilule lime, texte Amethyst — règle n°3 du brand kit. */
const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto"><tr>` +
  `<td align="center" style="border-radius:999px;background:${BRAND.lime}">` +
  `<a href="${esc(href)}" style="display:inline-block;padding:16px 32px;border-radius:999px;background:${BRAND.lime};` +
  `color:${BRAND.amethyst};font-family:${FONT_BODY};font-size:15px;font-weight:700;text-decoration:none;line-height:1;` +
  `mso-line-height-rule:exactly">${esc(label)}&nbsp;&nbsp;→</a></td></tr></table>`;

const featureRow = (f: NewsletterFeature, last: boolean) =>
  `<tr><td style="padding:28px 0;${last ? "" : `border-bottom:1px solid ${BRAND.border};`}">` +
  (f.badge ? `<div style="margin-bottom:12px">${pill(f.badge, { bg: BRAND.amethyst, color: BRAND.lime })}</div>` : "") +
  `<div style="font-family:${FONT_DISPLAY};font-size:22px;font-weight:600;color:${BRAND.amethyst};line-height:1.25;letter-spacing:-0.01em">${esc(f.title)}</div>` +
  `<div style="margin-top:10px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.muted};line-height:1.65">${nl(f.body)}</div>` +
  (f.href
    ? `<div style="margin-top:14px"><a href="${esc(f.href)}" style="font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${BRAND.amethyst};text-decoration:none;border-bottom:2px solid ${BRAND.lime}">${esc(f.linkLabel || "En savoir plus")}</a></div>`
    : "") +
  `</td></tr>`;

export function renderNewsletter(n: NewsletterInput): { html: string; text: string } {
  const html = `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Robi AI</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><!--<![endif]-->
<style>
  body{margin:0;padding:0;background:${BRAND.bg};-webkit-font-smoothing:antialiased}
  table{border-collapse:collapse}
  img{border:0;outline:none;text-decoration:none;display:block}
  a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}
  @media (max-width:640px){
    .wrap{width:100%!important;padding:16px!important}
    .card{border-radius:20px!important}
    .hero-pad{padding:44px 28px!important}
    .body-pad{padding:8px 28px!important}
    .h1{font-size:34px!important;line-height:1.1!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">${esc(n.preheader)}${"&#847;&zwnj;&nbsp;".repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg}">
<tr><td align="center" class="wrap" style="padding:40px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px">

  <!-- En-tête : logo + wordmark à gauche, pilule édition à droite -->
  <tr><td style="padding:0 8px 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="middle" style="padding-right:12px"><a href="${SITE}"><img src="${SITE}/logo.png" width="36" height="36" alt="Robi" style="width:36px;height:36px;border-radius:10px"></a></td>
          <td valign="middle" style="font-family:${FONT_DISPLAY};font-size:19px;font-weight:700;color:${BRAND.amethyst};letter-spacing:-0.01em">Robi&nbsp;AI</td>
        </tr></table>
      </td>
      <td valign="middle" align="right">${pill(n.edition, { bg: "#FFFFFF", color: BRAND.muted, border: BRAND.border })}</td>
    </tr></table>
  </td></tr>

  <!-- Bloc héros Amethyst -->
  <tr><td class="card" style="background:${BRAND.amethyst};border-radius:28px;background-image:linear-gradient(160deg,${BRAND.spaceBlue} 0%,${BRAND.amethyst} 60%)">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr><td align="center" class="hero-pad" style="padding:56px 48px 52px">
        <img src="${SITE}/email/robot-mark.png" width="72" height="72" alt="" style="width:72px;height:72px;margin:0 auto 28px">
        <div class="h1" style="font-family:${FONT_DISPLAY};font-size:42px;font-weight:700;color:#FFFFFF;line-height:1.08;letter-spacing:-0.025em">${nl(n.headline)}</div>
        <div style="margin:18px auto 0;max-width:420px;font-family:${FONT_BODY};font-size:16px;color:#C7CBE0;line-height:1.6">${nl(n.subline)}</div>
        <div style="margin-top:32px">${button(n.cta.label, n.cta.href)}</div>
      </td></tr>
    </table>
  </td></tr>

  <!-- Corps : fonctionnalités -->
  <tr><td style="padding:16px 0 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="card" style="background:#FFFFFF;border-radius:28px;border:1px solid ${BRAND.border}">
      <tr><td class="body-pad" style="padding:20px 44px 16px">
        <div style="padding-top:20px;font-family:${FONT_BODY};font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.muted}">${esc(n.sectionTitle)}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${n.features.map((f, i) => featureRow(f, i === n.features.length - 1)).join("")}
        </table>
      </td></tr>
    </table>
  </td></tr>

  ${n.offer ? `
  <!-- Encart offre -->
  <tr><td style="padding:16px 0 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="card" style="background:#FFFFFF;border-radius:28px;border:1px solid ${BRAND.border}">
      <tr><td align="center" class="hero-pad" style="padding:44px 44px">
        ${pill(n.offer.badge, { bg: BRAND.lime, color: BRAND.amethyst })}
        <div style="margin-top:18px;font-family:${FONT_DISPLAY};font-size:30px;font-weight:700;color:${BRAND.amethyst};line-height:1.15;letter-spacing:-0.02em">${nl(n.offer.title)}</div>
        <div style="margin:12px auto 0;max-width:400px;font-family:${FONT_BODY};font-size:15px;color:${BRAND.muted};line-height:1.65">${nl(n.offer.body)}</div>
        <div style="margin-top:26px">${button(n.offer.cta.label, n.offer.cta.href)}</div>
      </td></tr>
    </table>
  </td></tr>` : ""}

  ${n.closing ? `
  <!-- Mot de fin -->
  <tr><td style="padding:36px 44px 8px">
    <div style="font-family:${FONT_BODY};font-size:15px;color:${BRAND.ink};line-height:1.7">${nl(n.closing.text)}</div>
    <div style="margin-top:16px;font-family:${FONT_DISPLAY};font-size:15px;font-weight:600;color:${BRAND.amethyst}">${esc(n.closing.signature)}</div>
  </td></tr>` : ""}

  <!-- Pied de page -->
  <tr><td align="center" style="padding:32px 24px 0">
    <img src="${SITE}/logo.png" width="28" height="28" alt="" style="width:28px;height:28px;border-radius:8px;margin:0 auto 14px;opacity:.9">
    <div style="font-family:${FONT_DISPLAY};font-size:13px;font-weight:600;color:${BRAND.amethyst};letter-spacing:0.01em">Parlez. Facturez. Encaissez.</div>
    <div style="margin-top:14px;font-family:${FONT_BODY};font-size:12px;color:${BRAND.muted};line-height:1.7">
      <a href="${SITE}" style="color:${BRAND.muted};text-decoration:none">robi-app.com</a>
      &nbsp;·&nbsp; <a href="mailto:${CONTACT_EMAIL}" style="color:${BRAND.muted};text-decoration:none">${CONTACT_EMAIL}</a>
      <br>Vous recevez ce message dans un cadre professionnel.
      <a href="${esc(n.unsubscribeUrl)}" style="color:${BRAND.muted};text-decoration:underline">Ne plus recevoir la newsletter</a>
    </div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    `ROBI AI — ${n.edition}`,
    "",
    n.headline,
    n.subline,
    `${n.cta.label} : ${n.cta.href}`,
    "",
    n.sectionTitle.toUpperCase(),
    ...n.features.flatMap((f) => ["", `${f.badge ? `[${f.badge}] ` : ""}${f.title}`, f.body, f.href ? `${f.linkLabel || "En savoir plus"} : ${f.href}` : ""]),
    ...(n.offer ? ["", `[${n.offer.badge}] ${n.offer.title}`, n.offer.body, `${n.offer.cta.label} : ${n.offer.cta.href}`] : []),
    ...(n.closing ? ["", n.closing.text, n.closing.signature] : []),
    "",
    "—",
    `Parlez. Facturez. Encaissez. · ${SITE} · ${CONTACT_EMAIL}`,
    `Ne plus recevoir la newsletter : ${n.unsubscribeUrl}`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  return { html, text };
}
