import { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale, isContentIndexable } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Check, Mic, FileText, Zap, Shield, Bell, Smartphone } from "lucide-react";

// Page pilier SEO — cible la requête exacte "facture AI" / "facture IA".
// Contenu éditorial complet en FR/EN/ES ; les autres locales servent la
// version de leur langue de base et sont en noindex (même règle que les
// pages features/industries).

type Lang = "fr" | "en" | "es";

function lang(locale: string): Lang {
  if (locale.startsWith("fr")) return "fr";
  if (locale.startsWith("es")) return "es";
  return "en";
}

const content: Record<Lang, {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  hero: { badge: string; title: string; titleAccent: string; subtitle: string };
  stats: { value: string; label: string }[];
  definition: { title: string; paragraphs: string[] };
  prompts: { title: string; subtitle: string; examples: string[] };
  comparison: {
    title: string;
    subtitle: string;
    creation: { title: string; description: string; points: string[] };
    processing: { title: string; description: string; points: string[] };
  };
  steps: { title: string; items: { title: string; description: string }[] };
  benefits: { title: string; items: { title: string; description: string }[] };
  related: { title: string; links: { label: string; href: string }[] };
  faq: { question: string; answer: string }[];
}> = {
  fr: {
    metaTitle: "Facture AI : Créez vos Factures par Intelligence Artificielle | Robi",
    metaDescription:
      "Facture AI : créez devis et factures conformes en 30 secondes en parlant à l'IA. Relances automatiques, signature électronique, paiement Stripe. Essai gratuit.",
    keywords: [
      "facture ai",
      "facture ia",
      "facture intelligence artificielle",
      "générateur de facture ia",
      "créer une facture avec l'ia",
      "logiciel facturation ia",
    ],
    hero: {
      badge: "Facture AI",
      title: "La facture AI :",
      titleAccent: "dites-le, Robi facture",
      subtitle:
        "Créez une facture par intelligence artificielle en 30 secondes : dites « Prépare une facture de 500 € pour Alice » et Robi génère un document conforme, prêt à envoyer.",
    },
    stats: [
      { value: "30s", label: "Pour créer une facture AI" },
      { value: "99%", label: "Précision de l'IA" },
      { value: "10h", label: "Gagnées chaque mois" },
    ],
    definition: {
      title: "Qu'est-ce qu'une facture AI ?",
      paragraphs: [
        "Une facture AI (ou facture IA) est une facture générée par intelligence artificielle à partir d'une simple instruction en langage naturel, écrite ou dictée à la voix. Au lieu de remplir des champs un par un dans un logiciel de facturation classique, vous décrivez la prestation — « Facture de 850 € pour la refonte du site de Marc, payable à 30 jours » — et l'IA produit une facture complète : client, montant, TVA, mentions légales obligatoires et numérotation séquentielle conforme.",
        "Robi est une application de facture AI conçue pour les freelances, artisans et petites entreprises. L'IA comprend le contexte de votre activité : elle retrouve vos clients existants, applique vos tarifs habituels, calcule la TVA selon votre régime et génère un document conforme à la réglementation française (et de 15 autres pays). Aucune connaissance comptable n'est requise.",
        "La facture AI ne s'arrête pas à la création : Robi relance automatiquement les clients en retard avec des emails rédigés par l'IA, vous notifie quand une facture est ouverte ou payée, et encaisse via Stripe ou PayPal en un clic. C'est toute la chaîne de facturation — devis, signature, facture, relance, paiement — pilotée par l'intelligence artificielle.",
      ],
    },
    prompts: {
      title: "Parlez, Robi facture",
      subtitle: "Exemples de phrases comprises par la facture AI :",
      examples: [
        "« Prépare un devis de 1 200 € pour la rénovation de la salle de bain de M. Dupont »",
        "« Transforme le devis signé d'Alice en facture »",
        "« Facture 3 jours de développement à 450 € la journée pour la société Nova »",
      ],
    },
    comparison: {
      title: "Création de facture AI vs traitement de factures par IA",
      subtitle:
        "Le terme « facture IA » recouvre deux usages différents. Robi est un outil de création.",
      creation: {
        title: "Créer des factures avec l'IA (Robi)",
        description:
          "Pour les indépendants et TPE qui émettent des factures : l'IA génère le document à votre place.",
        points: [
          "Facture générée par la voix ou un prompt texte",
          "Mentions légales et TVA conformes automatiquement",
          "Relances d'impayés rédigées par l'IA",
          "Paiement en ligne intégré (Stripe, PayPal)",
        ],
      },
      processing: {
        title: "Traiter des factures reçues (OCR)",
        description:
          "Pour les services comptables qui reçoivent des factures fournisseurs : l'IA lit et saisit les documents.",
        points: [
          "Extraction de données par OCR",
          "Pré-saisie comptable automatisée",
          "Orienté comptabilité fournisseurs des PME/ETI",
          "Ne crée pas vos factures clients",
        ],
      },
    },
    steps: {
      title: "Comment créer une facture avec l'IA ?",
      items: [
        {
          title: "1. Dictez ou écrivez",
          description:
            "Dites à Robi ce que vous voulez facturer, comme vous le diriez à un assistant : client, montant, prestation.",
        },
        {
          title: "2. L'IA génère la facture",
          description:
            "Robi identifie le client, calcule la TVA, applique la numérotation légale et produit une facture conforme en quelques secondes.",
        },
        {
          title: "3. Envoyez et encaissez",
          description:
            "Vérifiez, envoyez en un clic, et laissez l'IA relancer automatiquement jusqu'au paiement.",
        },
      ],
    },
    benefits: {
      title: "Pourquoi choisir Robi pour vos factures AI ?",
      items: [
        { title: "Facturation vocale", description: "Créez devis et factures en parlant, depuis le chantier, la voiture ou le bureau." },
        { title: "Conformité automatique", description: "Numérotation séquentielle, mentions TVA, identifiants fiscaux : conforme en France et dans 15 pays." },
        { title: "Relances par IA", description: "Des emails de relance polis et contextuels, envoyés au bon moment, sans y penser." },
        { title: "Paiement intégré", description: "Lien de paiement Stripe ou PayPal sur chaque facture : soyez payé 2x plus vite." },
        { title: "100% mobile", description: "Application iOS et Android : votre facturation AI tient dans votre poche." },
        { title: "Sécurité bancaire", description: "Chiffrement AES-256, hébergement européen, conforme RGPD." },
      ],
    },
    related: {
      title: "Aller plus loin",
      links: [
        { label: "La facturation par IA en détail", href: "/features/facturation-ia" },
        { label: "Devis automatiques par IA", href: "/features/devis-automatique" },
        { label: "Relances de factures automatiques", href: "/features/relance-automatique" },
        { label: "Robi AI vs Excel pour facturer", href: "/comparisons/vs-excel" },
        { label: "Les mentions obligatoires sur une facture", href: "/blog/mentions-obligatoires-facture" },
        { label: "Tarifs de Robi", href: "/pricing" },
      ],
    },
    faq: [
      {
        question: "C'est quoi, une facture AI ?",
        answer:
          "Une facture AI est une facture générée par une intelligence artificielle à partir d'une instruction en langage naturel. Avec Robi, vous dictez ou écrivez « Facture de 500 € pour Alice » et l'IA produit en 30 secondes une facture conforme : client, montants, TVA, mentions légales et numérotation séquentielle.",
      },
      {
        question: "Une facture créée par l'IA est-elle légale et conforme ?",
        answer:
          "Oui. Robi applique automatiquement les règles de facturation françaises : numérotation séquentielle inaltérable, mentions obligatoires (SIREN/SIRET, TVA, pénalités de retard), et s'adapte à votre régime fiscal (micro-entreprise, TVA non applicable art. 293 B, etc.). La réglementation impose des mentions sur le document, pas la façon dont il est rédigé — une facture AI est aussi légale qu'une facture saisie à la main.",
      },
      {
        question: "Quelle différence entre Robi et ChatGPT pour faire une facture ?",
        answer:
          "ChatGPT peut rédiger le texte d'une facture, mais ne gère ni la numérotation séquentielle légale, ni votre fichier clients, ni la TVA selon votre régime, ni l'envoi, ni les relances, ni l'encaissement. Robi est un logiciel de facturation complet piloté par l'IA : chaque facture est conforme, archivée, suivie et reliée à un lien de paiement.",
      },
      {
        question: "Puis-je créer une facture AI à la voix depuis mon téléphone ?",
        answer:
          "Oui, c'est l'usage principal de Robi : les applications iOS et Android permettent de dicter une facture ou un devis depuis un chantier, une voiture ou entre deux rendez-vous. Le document est généré, envoyé et suivi depuis le téléphone.",
      },
      {
        question: "Combien coûte un logiciel de facture AI ?",
        answer:
          "Robi propose une offre de lancement à vie à 59 € (paiement unique), un abonnement mensuel à 14 €/mois ou annuel à 89 €/an pour la France. L'essai est gratuit et sans carte bancaire.",
      },
      {
        question: "La facture AI est-elle compatible avec la facturation électronique obligatoire en 2026 ?",
        answer:
          "Oui. La réforme française de la facturation électronique (2026-2027) impose des formats structurés et des plateformes agréées pour les transactions entre assujettis à la TVA. Robi suit ce calendrier et génère des documents conformes aux exigences en vigueur pour les indépendants et petites entreprises.",
      },
    ],
  },
  en: {
    metaTitle: "AI Invoice: Create Invoices with Artificial Intelligence | Robi",
    metaDescription:
      "AI invoice generator: create compliant quotes and invoices in 30 seconds by talking to AI. Automatic reminders, e-signature, Stripe payments. Free trial.",
    keywords: [
      "ai invoice",
      "ai invoice generator",
      "create invoice with ai",
      "ai invoicing software",
      "voice invoicing",
    ],
    hero: {
      badge: "AI Invoice",
      title: "The AI invoice:",
      titleAccent: "say it, Robi invoices it",
      subtitle:
        "Create an invoice with artificial intelligence in 30 seconds: say \"Prepare a £500 invoice for Alice\" and Robi generates a compliant document, ready to send.",
    },
    stats: [
      { value: "30s", label: "To create an AI invoice" },
      { value: "99%", label: "AI accuracy" },
      { value: "10h", label: "Saved every month" },
    ],
    definition: {
      title: "What is an AI invoice?",
      paragraphs: [
        "An AI invoice is an invoice generated by artificial intelligence from a simple natural-language instruction, typed or spoken aloud. Instead of filling in fields one by one in a classic invoicing tool, you describe the job — \"£850 invoice for Marc's website redesign, due in 30 days\" — and the AI produces a complete invoice: client, amounts, VAT, mandatory legal mentions and compliant sequential numbering.",
        "Robi is an AI invoicing app built for freelancers, tradespeople and small businesses. The AI understands the context of your business: it finds your existing clients, applies your usual rates, calculates VAT according to your tax scheme and generates documents compliant with the regulations of 16 countries. No accounting knowledge required.",
        "The AI invoice doesn't stop at creation: Robi automatically chases late payers with AI-written emails, notifies you when an invoice is opened or paid, and collects payment via Stripe or PayPal in one click. The entire invoicing chain — quote, signature, invoice, reminder, payment — driven by artificial intelligence.",
      ],
    },
    prompts: {
      title: "Speak, Robi invoices",
      subtitle: "Examples of prompts the AI invoice understands:",
      examples: [
        "\"Prepare a £1,200 quote for Mr Smith's bathroom renovation\"",
        "\"Turn Alice's signed quote into an invoice\"",
        "\"Invoice 3 days of development at £450 a day for Nova Ltd\"",
      ],
    },
    comparison: {
      title: "AI invoice creation vs AI invoice processing",
      subtitle:
        "\"AI invoice\" covers two different use cases. Robi is a creation tool.",
      creation: {
        title: "Create invoices with AI (Robi)",
        description:
          "For freelancers and small businesses that issue invoices: the AI generates the document for you.",
        points: [
          "Invoice generated by voice or text prompt",
          "Legal mentions and VAT handled automatically",
          "AI-written payment reminders",
          "Built-in online payments (Stripe, PayPal)",
        ],
      },
      processing: {
        title: "Process received invoices (OCR)",
        description:
          "For accounting teams that receive supplier invoices: the AI reads and enters documents.",
        points: [
          "Data extraction via OCR",
          "Automated accounting pre-entry",
          "Aimed at accounts payable in larger companies",
          "Does not create your client invoices",
        ],
      },
    },
    steps: {
      title: "How to create an invoice with AI?",
      items: [
        {
          title: "1. Speak or type",
          description:
            "Tell Robi what you want to invoice, like you would tell an assistant: client, amount, service.",
        },
        {
          title: "2. AI generates the invoice",
          description:
            "Robi identifies the client, calculates VAT, applies legal numbering and produces a compliant invoice in seconds.",
        },
        {
          title: "3. Send and get paid",
          description:
            "Review, send in one click, and let the AI chase payment automatically until it lands.",
        },
      ],
    },
    benefits: {
      title: "Why choose Robi for your AI invoices?",
      items: [
        { title: "Voice invoicing", description: "Create quotes and invoices by speaking — from the job site, the van or the office." },
        { title: "Automatic compliance", description: "Sequential numbering, VAT mentions, fiscal IDs: compliant in 16 countries." },
        { title: "AI reminders", description: "Polite, contextual follow-up emails sent at the right time, without thinking about it." },
        { title: "Built-in payments", description: "Stripe or PayPal payment link on every invoice: get paid 2x faster." },
        { title: "100% mobile", description: "iOS and Android apps: your AI invoicing fits in your pocket." },
        { title: "Bank-grade security", description: "AES-256 encryption, European hosting, GDPR compliant." },
      ],
    },
    related: {
      title: "Go further",
      links: [
        { label: "AI invoicing in detail", href: "/features/facturation-ia" },
        { label: "Automatic AI quotes", href: "/features/devis-automatique" },
        { label: "Automatic invoice reminders", href: "/features/relance-automatique" },
        { label: "Robi AI vs Excel for invoicing", href: "/comparisons/vs-excel" },
        { label: "Mandatory information on an invoice", href: "/blog/mentions-obligatoires-facture" },
        { label: "Robi pricing", href: "/pricing" },
      ],
    },
    faq: [
      {
        question: "What is an AI invoice?",
        answer:
          "An AI invoice is an invoice generated by artificial intelligence from a natural-language instruction. With Robi, you say or type \"£500 invoice for Alice\" and the AI produces a compliant invoice in 30 seconds: client, amounts, VAT, legal mentions and sequential numbering.",
      },
      {
        question: "Is an invoice created by AI legal and compliant?",
        answer:
          "Yes. Robi automatically applies invoicing rules: tamper-proof sequential numbering, mandatory mentions, and VAT adapted to your tax scheme. Regulations govern what must appear on the document, not how it is written — an AI invoice is as legal as one typed by hand.",
      },
      {
        question: "What's the difference between Robi and ChatGPT for invoicing?",
        answer:
          "ChatGPT can draft invoice text, but it doesn't handle legal sequential numbering, your client database, VAT rules, sending, reminders or payment collection. Robi is a full invoicing software driven by AI: every invoice is compliant, archived, tracked and linked to a payment link.",
      },
      {
        question: "Can I create an AI invoice by voice from my phone?",
        answer:
          "Yes, that's Robi's primary use case: the iOS and Android apps let you dictate an invoice or quote from a job site, a van or between two meetings. The document is generated, sent and tracked from your phone.",
      },
      {
        question: "How much does AI invoicing software cost?",
        answer:
          "Robi offers a lifetime launch deal at £49 (one-time payment), a monthly plan at £12/month or a yearly plan at £75/year in the UK. The trial is free, no credit card required.",
      },
    ],
  },
  es: {
    metaTitle: "Factura con IA: Crea Facturas por Inteligencia Artificial | Robi",
    metaDescription:
      "Factura con IA: crea presupuestos y facturas conformes en 30 segundos hablando con la IA. Recordatorios automáticos, firma electrónica, pagos Stripe.",
    keywords: [
      "factura ia",
      "factura con ia",
      "factura inteligencia artificial",
      "generador de facturas ia",
      "crear factura con ia",
    ],
    hero: {
      badge: "Factura IA",
      title: "La factura con IA:",
      titleAccent: "dilo, Robi factura",
      subtitle:
        "Crea una factura por inteligencia artificial en 30 segundos: di «Prepara una factura de 500 € para Alice» y Robi genera un documento conforme, listo para enviar.",
    },
    stats: [
      { value: "30s", label: "Para crear una factura IA" },
      { value: "99%", label: "Precisión de la IA" },
      { value: "10h", label: "Ahorradas cada mes" },
    ],
    definition: {
      title: "¿Qué es una factura con IA?",
      paragraphs: [
        "Una factura con IA es una factura generada por inteligencia artificial a partir de una simple instrucción en lenguaje natural, escrita o dictada por voz. En lugar de rellenar campos uno a uno en un programa de facturación clásico, describes el trabajo — «Factura de 850 € por el rediseño de la web de Marc, a 30 días» — y la IA produce una factura completa: cliente, importes, IVA, menciones legales obligatorias y numeración secuencial conforme.",
        "Robi es una aplicación de facturación con IA diseñada para freelancers, autónomos y pequeñas empresas. La IA entiende el contexto de tu actividad: encuentra tus clientes existentes, aplica tus tarifas habituales, calcula el IVA según tu régimen y genera documentos conformes con la normativa de 16 países. No se requieren conocimientos contables.",
        "La factura con IA no se detiene en la creación: Robi reclama automáticamente a los clientes morosos con emails redactados por la IA, te notifica cuando una factura se abre o se paga, y cobra por Stripe o PayPal en un clic. Toda la cadena de facturación — presupuesto, firma, factura, recordatorio, pago — dirigida por inteligencia artificial.",
      ],
    },
    prompts: {
      title: "Habla, Robi factura",
      subtitle: "Ejemplos de frases que entiende la factura IA:",
      examples: [
        "«Prepara un presupuesto de 1.200 € para la reforma del baño del Sr. García»",
        "«Convierte el presupuesto firmado de Alice en factura»",
        "«Factura 3 días de desarrollo a 450 € el día para la empresa Nova»",
      ],
    },
    comparison: {
      title: "Crear facturas con IA vs procesar facturas con IA",
      subtitle:
        "El término «factura IA» cubre dos usos distintos. Robi es una herramienta de creación.",
      creation: {
        title: "Crear facturas con IA (Robi)",
        description:
          "Para autónomos y pymes que emiten facturas: la IA genera el documento por ti.",
        points: [
          "Factura generada por voz o texto",
          "Menciones legales e IVA automáticos",
          "Reclamaciones de impagos redactadas por la IA",
          "Pago online integrado (Stripe, PayPal)",
        ],
      },
      processing: {
        title: "Procesar facturas recibidas (OCR)",
        description:
          "Para departamentos contables que reciben facturas de proveedores: la IA lee e introduce los documentos.",
        points: [
          "Extracción de datos por OCR",
          "Pre-contabilización automatizada",
          "Orientado a cuentas por pagar de empresas",
          "No crea tus facturas de cliente",
        ],
      },
    },
    steps: {
      title: "¿Cómo crear una factura con IA?",
      items: [
        {
          title: "1. Dicta o escribe",
          description:
            "Dile a Robi lo que quieres facturar, como se lo dirías a un asistente: cliente, importe, servicio.",
        },
        {
          title: "2. La IA genera la factura",
          description:
            "Robi identifica al cliente, calcula el IVA, aplica la numeración legal y produce una factura conforme en segundos.",
        },
        {
          title: "3. Envía y cobra",
          description:
            "Revisa, envía en un clic y deja que la IA reclame automáticamente hasta el pago.",
        },
      ],
    },
    benefits: {
      title: "¿Por qué elegir Robi para tus facturas con IA?",
      items: [
        { title: "Facturación por voz", description: "Crea presupuestos y facturas hablando, desde la obra, el coche o la oficina." },
        { title: "Conformidad automática", description: "Numeración secuencial, menciones de IVA, identificadores fiscales: conforme en 16 países." },
        { title: "Recordatorios por IA", description: "Emails de reclamación educados y contextuales, enviados en el momento justo." },
        { title: "Pago integrado", description: "Link de pago Stripe o PayPal en cada factura: cobra 2 veces más rápido." },
        { title: "100% móvil", description: "Apps iOS y Android: tu facturación IA cabe en tu bolsillo." },
        { title: "Seguridad bancaria", description: "Cifrado AES-256, alojamiento europeo, conforme con el RGPD." },
      ],
    },
    related: {
      title: "Para ir más lejos",
      links: [
        { label: "La facturación con IA en detalle", href: "/features/facturation-ia" },
        { label: "Presupuestos automáticos con IA", href: "/features/devis-automatique" },
        { label: "Recordatorios de facturas automáticos", href: "/features/relance-automatique" },
        { label: "Robi AI vs Excel para facturar", href: "/comparisons/vs-excel" },
        { label: "Información obligatoria en una factura", href: "/blog/mentions-obligatoires-facture" },
        { label: "Precios de Robi", href: "/pricing" },
      ],
    },
    faq: [
      {
        question: "¿Qué es una factura con IA?",
        answer:
          "Una factura con IA es una factura generada por inteligencia artificial a partir de una instrucción en lenguaje natural. Con Robi, dictas o escribes «Factura de 500 € para Alice» y la IA produce en 30 segundos una factura conforme: cliente, importes, IVA, menciones legales y numeración secuencial.",
      },
      {
        question: "¿Una factura creada por IA es legal y conforme?",
        answer:
          "Sí. Robi aplica automáticamente las reglas de facturación: numeración secuencial inalterable, menciones obligatorias e IVA adaptado a tu régimen fiscal. La normativa regula lo que debe aparecer en el documento, no cómo se redacta — una factura IA es tan legal como una escrita a mano.",
      },
      {
        question: "¿Qué diferencia hay entre Robi y ChatGPT para hacer una factura?",
        answer:
          "ChatGPT puede redactar el texto de una factura, pero no gestiona la numeración secuencial legal, ni tu base de clientes, ni el IVA, ni el envío, ni los recordatorios, ni el cobro. Robi es un software de facturación completo dirigido por IA: cada factura es conforme, archivada, seguida y vinculada a un link de pago.",
      },
      {
        question: "¿Puedo crear una factura IA por voz desde mi móvil?",
        answer:
          "Sí, es el uso principal de Robi: las apps iOS y Android permiten dictar una factura o un presupuesto desde la obra, el coche o entre dos citas. El documento se genera, se envía y se sigue desde el teléfono.",
      },
      {
        question: "¿Cuánto cuesta un programa de facturas con IA?",
        answer:
          "Robi ofrece una oferta de lanzamiento de por vida a 59 € (pago único), una suscripción mensual de 14 €/mes o anual de 89 €/año en España. La prueba es gratuita y sin tarjeta.",
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = content[lang(locale)];

  return {
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    keywords: c.keywords,
    robots: isContentIndexable(locale) ? undefined : { index: false, follow: true },
    alternates: {
      canonical: `/${locale}/facture-ai`,
      languages: {
        fr: "/fr/facture-ai",
        en: "/en/facture-ai",
        es: "/es/facture-ai",
        "x-default": "/fr/facture-ai",
      },
    },
  };
}

const benefitIcons = [Mic, Shield, Bell, Zap, Smartphone, FileText];

export default async function FactureAIPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const c = content[lang(locale)];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Robi AI", item: `https://robi-app.com/${locale}` },
      { "@type": "ListItem", position: 2, name: c.hero.badge, item: `https://robi-app.com/${locale}/facture-ai` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Hero
        badge={c.hero.badge}
        title={c.hero.title}
        titleAccent={c.hero.titleAccent}
        subtitle={c.hero.subtitle}
        ctaText={dict.cta.button}
        variant="centered"
      />

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            {c.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-[#BEF221]">{stat.value}</p>
                <p className="text-gray-500 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Definition — long-form, citable */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">
            {c.definition.title}
          </h2>
          <div className="space-y-6">
            {c.definition.paragraphs.map((p, index) => (
              <p key={index} className="text-lg text-gray-600 leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Prompt examples */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3">{c.prompts.title}</h2>
          <p className="text-gray-500 mb-10">{c.prompts.subtitle}</p>
          <div className="space-y-4">
            {c.prompts.examples.map((example, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-[#0D0630] text-white rounded-2xl px-6 py-5 text-left"
              >
                <Mic className="w-5 h-5 text-[#BEF221] flex-shrink-0" />
                <p className="text-base md:text-lg">{example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creation vs processing */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">{c.comparison.title}</h2>
            <p className="text-gray-500 mt-3">{c.comparison.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[c.comparison.creation, c.comparison.processing].map((col, colIndex) => (
              <Card key={colIndex} className={colIndex === 0 ? "border-2 border-[#BEF221]" : ""}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{col.title}</h3>
                <p className="text-gray-500 mb-6">{col.description}</p>
                <ul className="space-y-3">
                  {col.points.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colIndex === 0 ? "text-[#BEF221]" : "text-gray-300"}`} />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">{c.steps.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {c.steps.items.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-black text-[#BEF221]/20 absolute -top-4 -left-2">
                  {index + 1}
                </div>
                <Card className="relative z-10 h-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-500">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">{c.benefits.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {c.benefits.items.map((benefit, index) => {
              const Icon = benefitIcons[index % benefitIcons.length];
              return (
                <Card key={index}>
                  <div className="w-10 h-10 rounded-full bg-[#BEF221] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#0D0630]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-500">{benefit.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <FAQ items={c.faq} />

      {/* Internal links */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{c.related.title}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {c.related.links.map((link, index) => (
              <li key={index}>
                <Link
                  href={`/${locale}${link.href}`}
                  className="text-gray-600 hover:text-[#0D0630] underline underline-offset-4 decoration-[#BEF221] decoration-2"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Pricing locale={locale} dict={dict} />

      <CTA
        title={dict.cta.title}
        subtitle={dict.cta.subtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
