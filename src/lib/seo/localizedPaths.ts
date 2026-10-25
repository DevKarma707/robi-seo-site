/**
 * Adresses dans la langue du marché.
 *
 * Jusqu'au 25/10/2026 les pages anglaises et espagnoles gardaient leur slug
 * français (« /en/facture-ai », « /es/blog/factur-x-c-est-quoi-… ») : un
 * lecteur anglophone ne retrouvait pas sa requête dans l'adresse. Les routes
 * Next restent nommées en français (chemin « interne ») ; ce fichier donne
 * l'adresse publique de chaque langue, et le middleware fait le lien :
 *   - adresse publique  → réécriture vers la route interne (invisible) ;
 *   - ancienne adresse française dans une locale EN/ES → 301 vers la nouvelle.
 *
 * Fichier pur (aucune dépendance) : lu par le middleware (edge), le sitemap,
 * pageSeo et les liens internes.
 *
 * Les locales françaises gardent les slugs français. pt-PT n'a pas encore de
 * contenu éditorial à lui (il sert la version anglaise en noindex) : il prend
 * les slugs anglais, en attendant des pages écrites en portugais.
 */

type SlugLang = "en" | "es";

/** Slug traduit par langue, indexé par le slug français. */
type SlugMap = Record<string, Partial<Record<SlugLang, string>>>;

const PAGES: SlugMap = {
  "facture-ai": { en: "ai-invoice-generator", es: "factura-ia" },
  connexion: { en: "login", es: "iniciar-sesion" },
};

const TOOLS: SlugMap = {
  "generateur-facture": { en: "invoice-generator", es: "generador-de-facturas" },
  "calculateur-tjm": { en: "day-rate-calculator", es: "calculadora-tarifa-diaria" },
  "simulateur-charges": { en: "tax-simulator", es: "simulador-de-impuestos" },
  "generateur-mentions-legales": { en: "legal-notice-generator", es: "generador-aviso-legal" },
};

const FEATURES: SlugMap = {
  "facturation-ia": { en: "ai-invoicing", es: "facturacion-ia" },
  "devis-automatique": { en: "automatic-quotes", es: "presupuestos-automaticos" },
  "relance-automatique": { en: "payment-reminders", es: "recordatorios-de-pago" },
  "paiement-en-ligne": { en: "online-payments", es: "pagos-online" },
  "tableau-de-bord": { en: "dashboard", es: "panel-de-control" },
};

const INDUSTRIES: SlugMap = {
  plombier: { en: "plumber", es: "fontanero" },
  electricien: { en: "electrician", es: "electricista" },
  macon: { en: "bricklayer", es: "albanil" },
  peintre: { en: "painter", es: "pintor" },
  menuisier: { en: "carpenter", es: "carpintero" },
  chauffagiste: { en: "heating-engineer", es: "instalador-calefaccion" },
  serrurier: { en: "locksmith", es: "cerrajero" },
  carreleur: { en: "tiler", es: "alicatador" },
  couvreur: { en: "roofer", es: "techador" },
  architecte: { en: "architect", es: "arquitecto" },
  developpeur: { en: "developer", es: "desarrollador" },
  "designer-ux": { en: "ux-designer", es: "disenador-ux" },
  "data-scientist": { es: "cientifico-de-datos" },
  graphiste: { en: "graphic-designer", es: "disenador-grafico" },
  photographe: { en: "photographer", es: "fotografo" },
  videaste: { en: "videographer", es: "videografo" },
  illustrateur: { en: "illustrator", es: "ilustrador" },
  "redacteur-web": { en: "copywriter", es: "redactor-web" },
  traiteur: { en: "caterer", es: "catering" },
  "decorateur-evenementiel": { en: "event-decorator", es: "decorador-de-eventos" },
  "photographe-mariage": { en: "wedding-photographer", es: "fotografo-de-bodas" },
  consultant: { es: "consultor" },
  avocat: { en: "lawyer", es: "abogado" },
  "agent-immobilier": { en: "real-estate-agent", es: "agente-inmobiliario" },
  "expert-comptable": { en: "accountant", es: "contable" },
  traducteur: { en: "translator", es: "traductor" },
  kinesitherapeute: { en: "physiotherapist", es: "fisioterapeuta" },
  osteopathe: { en: "osteopath", es: "osteopata" },
  psychologue: { en: "psychologist", es: "psicologo" },
  dieteticien: { en: "dietitian", es: "dietista" },
  sophrologue: { en: "sophrologist", es: "sofrologo" },
  naturopathe: { en: "naturopath", es: "naturopata" },
};

/** Articles du blog (statiques et publiés depuis l'admin) — slug FR = identifiant. */
const BLOG: SlugMap = {
  "checklist-facturation-electronique-2026-freelance": { en: "french-e-invoicing-checklist-2026", es: "checklist-factura-electronica-francia-2026" },
  "client-exige-facture-electronique-avant-2027": { en: "client-demands-e-invoice-before-2027", es: "cliente-exige-factura-electronica-antes-2027" },
  "comment-facturer-premier-client": { en: "how-to-invoice-your-first-client", es: "como-facturar-primer-cliente" },
  "comment-faire-un-devis-auto-entrepreneur": { en: "how-to-write-a-quote-french-self-employed", es: "como-hacer-presupuesto-autonomo-francia" },
  "comment-faire-une-facture-auto-entrepreneur": { en: "how-to-invoice-french-self-employed", es: "como-hacer-factura-autonomo-francia" },
  "creer-facture-avec-ia": { en: "create-invoice-with-ai", es: "crear-factura-con-ia" },
  "e-reporting-2026-qui-est-concerne": { en: "e-reporting-2026-who-is-concerned", es: "e-reporting-2026-a-quien-afecta" },
  "factur-x-c-est-quoi-format-facture-electronique": { en: "what-is-factur-x", es: "que-es-factur-x" },
  "factur-x-ubl-chorus-pro-pdp-glossaire": { en: "e-invoicing-glossary-factur-x-ubl-pdp", es: "glosario-factura-electronica-factur-x-ubl" },
  "facturacion-electronica-mexico-guia-cfdi": { en: "mexico-e-invoicing-cfdi-guide" },
  "facturation-electronique-2026-2027-freelance": { en: "mandatory-e-invoicing-2026-2027-freelancers", es: "factura-electronica-obligatoria-2026-2027-freelance" },
  "facturation-electronique-2026-auto-entrepreneur": { en: "france-e-invoicing-2026-self-employed-guide", es: "factura-electronica-francia-2026-autonomos" },
  "facturation-par-ia-creer-facture-voix": { en: "ai-invoicing-create-invoice-by-voice", es: "facturacion-ia-crear-factura-hablando" },
  "facture-electronique-septembre-2026-etes-vous-pret": { en: "e-invoicing-since-september-2026", es: "factura-electronica-desde-septiembre-2026" },
  "facture-pdf-recue-apres-septembre-2026-payer-tva": { en: "pdf-invoice-after-september-2026-vat", es: "factura-pdf-despues-septiembre-2026-iva" },
  "facture-vocale-creer-en-parlant": { en: "voice-invoicing", es: "factura-por-voz" },
  "logiciel-facture-electronique-2026-comment-choisir": { en: "how-to-choose-e-invoicing-software-2026", es: "como-elegir-software-factura-electronica-2026" },
  "logiciel-gestion-factures-ia": { en: "ai-invoice-management-software", es: "software-gestion-facturas-ia" },
  "making-tax-digital-self-employed-2026": { es: "making-tax-digital-autonomos-reino-unido-2026" },
  "meilleur-logiciel-facturation-freelance-2026": { en: "best-invoicing-software-freelancers-2026", es: "mejor-software-facturacion-freelance-2026" },
  "mention-tva-facture-2026-293b-cibs": { en: "french-vat-exemption-mention-293b-cibs", es: "mencion-tva-non-applicable-293b-cibs" },
  "mentions-obligatoires-facture": { en: "invoice-mandatory-information", es: "datos-obligatorios-factura" },
  "micro-entreprise-vs-sasu": { en: "sole-trader-vs-company", es: "autonomo-vs-sociedad" },
  "relancer-client-impaye": { en: "chase-unpaid-invoice", es: "reclamar-factura-impagada" },
  "robi-disponible-16-pays": { en: "robi-available-16-countries", es: "robi-disponible-16-paises" },
  "robi-vs-abby-comparatif-facturation": { en: "robi-vs-abby", es: "robi-vs-abby-comparativa" },
  "robi-vs-attix-comparatif-devis-vocal": { en: "robi-vs-attix", es: "robi-vs-attix-comparativa" },
  "sanctions-facture-electronique-amendes-2026-2027": { en: "france-e-invoicing-penalties-2026-2027", es: "sanciones-factura-electronica-francia-2026-2027" },
  "tarif-journalier-moyen-freelance": { en: "average-freelance-day-rate", es: "tarifa-diaria-media-freelance" },
  "verifactu-2026-autonomos-guia": { en: "verifactu-2026-self-employed-guide" },
  "verifier-facture-factur-x-valide": { en: "check-factur-x-invoice-valid", es: "comprobar-factura-factur-x-valida" },
};

/** Préfixe de route → table de slugs. "" = page à la racine de la locale. */
const SECTIONS: [prefix: string, map: SlugMap][] = [
  ["", PAGES],
  ["/tools", TOOLS],
  ["/features", FEATURES],
  ["/industries", INDUSTRIES],
  ["/blog", BLOG],
];

function slugLang(locale: string): SlugLang | null {
  if (locale.startsWith("en") || locale.startsWith("pt")) return "en";
  if (locale.startsWith("es")) return "es";
  return null; // locales françaises : slugs français
}

// Tables à plat : chemin interne ↔ chemin public, par langue.
const TO_PUBLIC: Record<SlugLang, Map<string, string>> = { en: new Map(), es: new Map() };
const TO_INTERNAL: Record<SlugLang, Map<string, string>> = { en: new Map(), es: new Map() };
for (const [prefix, map] of SECTIONS) {
  for (const [fr, tr] of Object.entries(map)) {
    for (const l of ["en", "es"] as const) {
      const slug = tr[l];
      if (!slug || slug === fr) continue;
      TO_PUBLIC[l].set(`${prefix}/${fr}`, `${prefix}/${slug}`);
      TO_INTERNAL[l].set(`${prefix}/${slug}`, `${prefix}/${fr}`);
    }
  }
}

/** Chemin public (sans la locale) d'une route interne : « /facture-ai » → « /ai-invoice-generator » en anglais. */
export function publicPath(locale: string, internal: string): string {
  const l = slugLang(locale);
  return (l && TO_PUBLIC[l].get(internal)) || internal;
}

/** Route interne (sans la locale) d'un chemin public. Inverse de publicPath. */
export function internalPath(locale: string, pub: string): string {
  const l = slugLang(locale);
  return (l && TO_INTERNAL[l].get(pub)) || pub;
}

/** Lien interne complet : localePath("en", "/facture-ai") → « /en/ai-invoice-generator ». */
export function localePath(locale: string, internal = ""): string {
  return `/${locale}${publicPath(locale, internal)}`;
}

/**
 * Réécrit les liens internes d'un HTML d'article (« /en/blog/creer-facture-avec-ia »
 * → « /en/blog/create-invoice-with-ai ») pour éviter une redirection par clic.
 */
export function localizeHrefs(html: string): string {
  return html.replace(
    /href="(?:https:\/\/robi-app\.com)?\/([a-z]{2}(?:-[A-Z]{2})?)(\/[^"#?]*)?([^"]*)"/g,
    (m, locale: string, path = "") => {
      const pub = publicPath(locale, path);
      return pub === path ? m : m.replace(`/${locale}${path}`, `/${locale}${pub}`);
    },
  );
}
