/**
 * Titres et descriptions des articles pour Google (≤ 60 / ≤ 160 caractères).
 *
 * Le titre affiché dans l'article (H1) ne change pas ; seul le <title> est
 * raccourci. Audit du 25/10/2026 : 83 titres d'articles dépassaient 60
 * caractères une fois suffixés de « | Robi AI » (Google les coupait), et 9
 * descriptions dépassaient 160.
 *
 * Règle (seoTitle) : titre court écrit à la main s'il existe ; sinon le titre
 * suffixé s'il tient en 60 ; sinon le titre seul ; sinon coupé au dernier mot.
 * Les nouveaux articles publiés depuis l'admin suivent la même règle.
 */

type Lang = "fr" | "en" | "es";
type Texts = Partial<Record<Lang, string>>;

const TITLES: Record<string, Texts> = {
  "checklist-facturation-electronique-2026-freelance": {
    fr: "Facturation électronique : la checklist freelance 2026-2027",
    es: "Factura electrónica en Francia: checklist 2026-2027",
  },
  "client-exige-facture-electronique-avant-2027": {
    fr: "Un client exige une facture électronique avant 2027 ?",
    en: "French client demands an e-invoice before 2027: your rights",
  },
  "comment-faire-un-devis-auto-entrepreneur": {
    fr: "Devis auto-entrepreneur : modèle, exemple et mentions 2026",
    en: "How to write a quote as a French auto-entrepreneur",
    es: "Cómo hacer un presupuesto de autónomo en Francia",
  },
  "comment-faire-une-facture-auto-entrepreneur": {
    fr: "Faire une facture en auto-entrepreneur (modèle 2026)",
    en: "How to invoice as a French auto-entrepreneur (2026)",
    es: "Cómo hacer una factura de autónomo en Francia (2026)",
  },
  "factur-x-c-est-quoi-format-facture-electronique": {
    fr: "Factur-X : c'est quoi ? Le format de facture 2026 expliqué",
    en: "Factur-X explained: the 2026 French e-invoice format",
    es: "Factura X (Factur-X): ¿qué es y para qué sirve?",
  },
  "factur-x-ubl-chorus-pro-pdp-glossaire": {
    fr: "Factur-X, UBL, PDP, e-reporting : le glossaire",
    es: "Factur-X, UBL, PDP: glosario de la factura electrónica",
  },
  "facturacion-electronica-mexico-guia-cfdi": {
    fr: "Facturation électronique au Mexique : guide CFDI 4.0",
    en: "E-invoicing in Mexico: CFDI 4.0 guide for freelancers",
    es: "Facturación electrónica en México: guía CFDI 4.0",
  },
  "facturation-electronique-2026-2027-freelance": {
    fr: "Facturation électronique obligatoire 2026-2027 : guide",
    es: "Factura electrónica obligatoria 2026-2027: guía freelance",
  },
  "facturation-electronique-2026-auto-entrepreneur": {
    fr: "Facture électronique 2026-2027 : le guide auto-entrepreneur",
    en: "French e-invoicing 2026-2027: guide for the self-employed",
    es: "Factura electrónica en Francia 2026-2027: guía autónomos",
  },
  "facturation-par-ia-creer-facture-voix": {
    fr: "Facturation par IA : créer une facture en parlant (2026)",
  },
  "facture-electronique-septembre-2026-etes-vous-pret": {
    fr: "Facture électronique depuis le 1er sept. 2026 : à faire",
    en: "E-invoicing since 1 Sept 2026: what changed, what's left",
    es: "Factura electrónica desde sept. 2026: qué ha cambiado",
  },
  "facture-pdf-recue-apres-septembre-2026-payer-tva": {
    fr: "Facture PDF reçue après sept. 2026 : payer, déduire la TVA ?",
    es: "Factura PDF recibida en Francia tras sept. 2026: ¿pagarla?",
  },
  "facture-vocale-creer-en-parlant": {
    en: "Voice invoicing: dictate invoices instead of typing",
  },
  "logiciel-facture-electronique-2026-comment-choisir": {
    fr: "Logiciel de facture électronique 2026 : 7 critères clés",
    en: "E-invoicing software 2026: the 7 criteria that matter",
    es: "Software de factura electrónica 2026: 7 criterios clave",
  },
  "logiciel-gestion-factures-ia": {
    fr: "Logiciel de gestion des factures avec IA : lequel choisir",
    en: "AI invoice software: how it works and which to choose",
    es: "Software de facturas con IA: cómo funciona y cuál elegir",
  },
  "making-tax-digital-self-employed-2026": {
    fr: "Making Tax Digital 2026 : guide des indépendants au UK",
    en: "Making Tax Digital 2026: guide for UK sole traders",
  },
  "meilleur-logiciel-facturation-freelance-2026": {
    fr: "Meilleur logiciel de facturation freelance 2026 : comparatif",
    en: "Best invoicing software for freelancers in 2026 (France)",
    es: "Mejor software de facturación freelance 2026 (Francia)",
  },
  "mention-tva-facture-2026-293b-cibs": {
    fr: "TVA non applicable : 293 B en 2026, L. 233-3 CIBS en 2027",
    en: "« TVA non applicable »: 293 B now, L. 233-3 CIBS in 2027",
    es: "«TVA non applicable»: 293 B en 2026, L. 233-3 CIBS en 2027",
  },
  "mentions-obligatoires-facture": {
    fr: "Mentions obligatoires d'une facture en 2026 (liste complète)",
    es: "Datos obligatorios de una factura en 2026 (lista)",
  },
  "robi-disponible-16-pays": {
    fr: "Robi AI disponible dans 16 pays : facturez partout",
    en: "Robi AI in 16 countries: invoice anywhere",
    es: "Robi AI en 16 países: factura desde cualquier lugar",
  },
  "robi-vs-abby-comparatif-facturation": {
    fr: "Robi vs Abby : comparatif facturation IA et électronique",
  },
  "robi-vs-attix-comparatif-devis-vocal": {
    fr: "Robi vs Attix : apps de devis à la voix comparées (2026)",
    es: "Robi vs Attix: apps de presupuestos por voz (2026)",
  },
  "sanctions-facture-electronique-amendes-2026-2027": {
    fr: "Sanctions facture électronique : amendes 2026-2027",
  },
  "verifier-facture-factur-x-valide": {
    fr: "Vérifier qu'une facture Factur-X est valide",
    en: "Factur-X validator: check your invoice is valid",
  },
};

const DESCRIPTIONS: Record<string, Texts> = {
  // Search Console oct. 2026 : « devis auto entrepreneur » pos. 7,3, « exemple » 4,1, « modèle » 4,9 — 0 clic.
  "comment-faire-un-devis-auto-entrepreneur": {
    fr: "Devis auto-entrepreneur : modèle gratuit, exemple rempli et mentions obligatoires 2026, avec ou sans TVA (293 B). À copier ou à remplir en parlant.",
  },
  "factur-x-c-est-quoi-format-facture-electronique": {
    fr: "Factur-X : définition simple du format hybride PDF/A-3 + XML, la norme EN 16931, les profils, et comment générer une facture Factur-X conforme.",
  },
  "facture-electronique-septembre-2026-etes-vous-pret": {
    fr: "Facture électronique : depuis le 1er septembre 2026, toute entreprise doit pouvoir recevoir. Émission en 2027 pour les micro-entreprises. À faire.",
    es: "Factura electrónica en Francia: desde el 1 de septiembre de 2026 todas las empresas deben poder recibirla; emisión en 2027 para microempresas.",
  },
  "facture-vocale-creer-en-parlant": {
    fr: "Dis la prestation, le client et le prix : l'IA rédige une facture numérotée avec la TVA, prête à envoyer. Comment ça marche, et une app gratuite.",
  },
  "mention-tva-facture-2026-293b-cibs": {
    fr: "Mention TVA non applicable : « art. 293 B du CGI » jusqu'au 31/12/2026, puis « art. L. 233-3 du CIBS » au 1er janvier 2027. Transition jusqu'en juin 2028.",
    en: "French VAT exemption mention: « art. 293 B du CGI » until 31/12/2026, then « art. L. 233-3 du CIBS » from 1 January 2027. Transition until June 2028.",
  },
  "robi-disponible-16-pays": {
    fr: "Robi AI est disponible dans 16 pays avec des prix en monnaie locale : France, Belgique, Suisse, Maroc, Royaume-Uni, États-Unis, Espagne et plus.",
    en: "Robi AI is available in 16 countries with local pricing and currency: France, Belgium, Switzerland, UK, US, Spain, Portugal, Morocco and more.",
    es: "Robi AI ya está en 16 países con precios en moneda local: Francia, Bélgica, Suiza, Reino Unido, EE. UU., España, Portugal, Marruecos y más.",
  },
};

const SUFFIX = " | Robi AI";

function lang(locale: string): Lang {
  if (locale.startsWith("es")) return "es";
  if (locale.startsWith("fr")) return "fr";
  return "en";
}

function cut(text: string, max: number): string {
  if (text.length <= max) return text;
  const head = text.slice(0, max - 1);
  return `${head.slice(0, head.lastIndexOf(" ")).replace(/[\s,;:–—-]+$/, "")}…`;
}

/** Titre suffixé « | Robi AI » s'il tient en 60 caractères, sinon seul (coupé au besoin). À poser en `absolute`. */
export function fitTitle(title: string): string {
  const withBrand = title.includes("Robi") ? title : title + SUFFIX;
  return withBrand.length <= 60 ? withBrand : cut(title, 60);
}

/** <title> d'un article, sans template (absolute) : toujours ≤ 60 caractères. */
export function seoTitle(slug: string, locale: string, title: string): string {
  return TITLES[slug]?.[lang(locale)] ?? fitTitle(title);
}

/** Meta description d'un article : toujours ≤ 160 caractères. */
export function seoDescription(slug: string, locale: string, description: string): string {
  return DESCRIPTIONS[slug]?.[lang(locale)] ?? cut(description, 160);
}
