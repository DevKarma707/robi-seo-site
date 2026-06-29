import { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale, isContentIndexable } from "@/lib/i18n/config";
import { GenerateurFactureClient } from "./client";

type Lang = "fr" | "en" | "es";

function lang(locale: string): Lang {
  if (locale.startsWith("es")) return "es";
  if (locale.startsWith("en")) return "en";
  return "fr";
}

const seo: Record<Lang, { title: string; description: string; keywords: string[] }> = {
  fr: {
    title: "Générateur de Facture Gratuit en Ligne (PDF) — sans inscription",
    description:
      "Créez une facture professionnelle conforme en ligne et téléchargez-la en PDF gratuitement, sans inscription. Calcul TVA automatique. Ou laissez l'IA la faire pour vous.",
    keywords: [
      "générateur de facture",
      "générateur de facture gratuit",
      "créer une facture en ligne",
      "facture pdf gratuit",
      "modèle de facture",
      "faire une facture gratuitement",
      "facture ai",
    ],
  },
  en: {
    title: "Free Online Invoice Generator (PDF) — no sign-up",
    description:
      "Create a professional, compliant invoice online and download it as a PDF for free, no sign-up. Automatic VAT calculation. Or let AI do it for you.",
    keywords: [
      "invoice generator",
      "free invoice generator",
      "create invoice online",
      "free pdf invoice",
      "invoice template",
      "make an invoice free",
      "ai invoice",
    ],
  },
  es: {
    title: "Generador de Facturas Gratis Online (PDF) — sin registro",
    description:
      "Crea una factura profesional y conforme online y descárgala en PDF gratis, sin registro. Cálculo de IVA automático. O deja que la IA la haga por ti.",
    keywords: [
      "generador de facturas",
      "generador de facturas gratis",
      "crear factura online",
      "factura pdf gratis",
      "plantilla de factura",
      "hacer una factura gratis",
      "factura ia",
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const s = seo[lang(locale)];

  return {
    title: { absolute: s.title },
    description: s.description,
    keywords: s.keywords,
    robots: isContentIndexable(locale) ? undefined : { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/tools/generateur-facture`,
      languages: {
        fr: "/fr/tools/generateur-facture",
        en: "/en/tools/generateur-facture",
        es: "/es/tools/generateur-facture",
        "x-default": "/fr/tools/generateur-facture",
      },
    },
  };
}

export default async function GenerateurFacturePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const l = lang(locale);
  const s = seo[l];

  const faq = {
    fr: [
      {
        q: "Le générateur de facture est-il vraiment gratuit ?",
        a: "Oui, totalement gratuit et sans inscription. Vous remplissez le formulaire, vous prévisualisez la facture et vous la téléchargez en PDF. Aucune carte bancaire, aucun email demandé.",
      },
      {
        q: "Mes factures sont-elles conformes à la loi ?",
        a: "Le générateur inclut les mentions obligatoires d'une facture française (numéro séquentiel, dates, identité du vendeur et du client, détail des prestations, TVA, total HT et TTC). Renseignez votre SIREN/SIRET et, si vous êtes en franchise de TVA, la mention « TVA non applicable, art. 293 B du CGI » s'affiche automatiquement.",
      },
      {
        q: "Comment télécharger ma facture en PDF ?",
        a: "Cliquez sur « Télécharger en PDF » : la fenêtre d'impression de votre navigateur s'ouvre, choisissez « Enregistrer au format PDF » comme destination. La facture s'imprime seule, proprement, sans le reste de la page.",
      },
      {
        q: "Mes données sont-elles enregistrées quelque part ?",
        a: "Non. Tout se passe dans votre navigateur : rien n'est envoyé à un serveur. Vos informations sont seulement gardées en local sur votre appareil pour vous éviter de tout retaper la prochaine fois.",
      },
      {
        q: "Et si je dois faire des factures toutes les semaines ?",
        a: "Remplir un formulaire à chaque fois devient vite répétitif. Avec Robi, vous dictez « Facture de 500 € pour Alice » et l'IA génère le document conforme en 30 secondes, l'envoie, relance les impayés et encaisse via Stripe. Le générateur est parfait pour un besoin ponctuel ; Robi pour facturer au quotidien.",
      },
    ],
    en: [
      {
        q: "Is the invoice generator really free?",
        a: "Yes, completely free and no sign-up. Fill in the form, preview the invoice and download it as a PDF. No credit card, no email required.",
      },
      {
        q: "Are my invoices legally compliant?",
        a: "The generator includes the mandatory details of a professional invoice (sequential number, dates, seller and client identity, line items, VAT, net and gross totals). Add your company registration number, and a VAT-exemption notice appears automatically when VAT is set to 0%.",
      },
      {
        q: "How do I download my invoice as a PDF?",
        a: "Click \"Download as PDF\": your browser's print dialog opens, choose \"Save as PDF\" as the destination. The invoice prints cleanly on its own, without the rest of the page.",
      },
      {
        q: "Is my data stored anywhere?",
        a: "No. Everything runs in your browser: nothing is sent to a server. Your details are only kept locally on your device so you don't have to retype them next time.",
      },
      {
        q: "What if I need to invoice every week?",
        a: "Filling in a form every time quickly gets repetitive. With Robi, you say \"€500 invoice for Alice\" and AI generates the compliant document in 30 seconds, sends it, chases late payers and collects via Stripe. The generator is great for one-off needs; Robi is for invoicing every day.",
      },
    ],
    es: [
      {
        q: "¿El generador de facturas es realmente gratis?",
        a: "Sí, totalmente gratis y sin registro. Rellena el formulario, previsualiza la factura y descárgala en PDF. Sin tarjeta, sin email.",
      },
      {
        q: "¿Mis facturas son conformes a la ley?",
        a: "El generador incluye los datos obligatorios de una factura profesional (número secuencial, fechas, identidad del vendedor y del cliente, líneas de detalle, IVA, total base y total). Añade tu NIF/CIF y la mención de exención de IVA aparece automáticamente cuando el IVA es 0%.",
      },
      {
        q: "¿Cómo descargo mi factura en PDF?",
        a: "Haz clic en «Descargar en PDF»: se abre el diálogo de impresión del navegador, elige «Guardar como PDF» como destino. La factura se imprime sola, limpia, sin el resto de la página.",
      },
      {
        q: "¿Se guardan mis datos en algún sitio?",
        a: "No. Todo ocurre en tu navegador: no se envía nada a un servidor. Tus datos solo se guardan localmente en tu dispositivo para no tener que volver a escribirlos.",
      },
      {
        q: "¿Y si tengo que facturar cada semana?",
        a: "Rellenar un formulario cada vez se vuelve repetitivo. Con Robi, dices «Factura de 500 € para Alice» y la IA genera el documento conforme en 30 segundos, lo envía, reclama los impagos y cobra con Stripe. El generador es ideal para necesidades puntuales; Robi, para facturar a diario.",
      },
    ],
  }[l];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: s.title,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    url: `https://robi-app.com/${locale}/tools/generateur-facture`,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Robi AI", item: `https://robi-app.com/${locale}` },
      { "@type": "ListItem", position: 2, name: dict.nav.tools, item: `https://robi-app.com/${locale}/tools` },
      {
        "@type": "ListItem",
        position: 3,
        name: seo[l].title,
        item: `https://robi-app.com/${locale}/tools/generateur-facture`,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <GenerateurFactureClient locale={locale} lang={l} ctaDict={dict.cta} toolsLabel={dict.nav.tools} faq={faq} />
    </>
  );
}
