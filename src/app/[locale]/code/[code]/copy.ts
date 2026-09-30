/**
 * Textes de la page d'atterrissage d'un code partenaire (/[locale]/code/CODE).
 * Trois langues (fr, en, es), tutoiement comme toute la com' Robi.
 * Aucun prix ici : la remise est un pourcentage lu sur la fiche partenaire,
 * le prix final s'affiche chez Polar au paiement.
 */

export interface CodeCopy {
  metaTitle: (name: string, pct: number) => string;
  metaDescription: (name: string, pct: number) => string;
  badge: (code: string) => string;
  title: (name: string, pct: number) => string;
  titleAccent: string;
  subtitle: string;
  cta: string;
  ctaHint: string;
  stepsTitle: string;
  steps: { title: string; text: (pct: number) => string }[];
  whyTitle: string;
  why: { title: string; text: string }[];
  smallPrint: (code: string, pct: number) => string;
  from: (platform: string) => string;
}

const fr: CodeCopy = {
  metaTitle: (n, p) => `${n} t'offre ${p} % sur Robi AI`,
  metaDescription: (n, p) => `Code de ${n} : ${p} % de remise sur ton premier paiement Robi AI, appliqués automatiquement. Dicte tes devis et factures, Robi les écrit.`,
  badge: (c) => `Code ${c} activé`,
  title: (n, p) => `${n} t'offre ${p} %`,
  titleAccent: "sur ton premier paiement Robi.",
  subtitle: "Tu parles, Robi écrit ton devis ou ta facture. Le code est déjà appliqué : tu n'as rien à taper.",
  cta: "Commencer gratuitement",
  ctaHint: "Sans carte bancaire. La remise t'attend au moment où tu passes Pro.",
  stepsTitle: "Comment ça marche",
  steps: [
    { title: "1. Crée ton compte", text: () => "Gratuit, en quelques secondes avec Google ou ton adresse e-mail." },
    { title: "2. Dicte ton premier devis", text: () => "« Pose de parquet, 30 m², client Martin… » : Robi remplit le document pour toi." },
    { title: "3. Passe Pro quand tu veux", text: (p) => `Tes ${p} % sont appliqués tout seuls au paiement, même si tu reviens dans quelques semaines.` },
  ],
  whyTitle: "Ce que Robi fait pour toi",
  why: [
    { title: "Devis et factures à la voix", text: "Tu décris ta prestation, Robi rédige un document propre, prêt à envoyer." },
    { title: "Factur-X intégré", text: "Tes factures sortent au format électronique Factur-X (EN 16931)." },
    { title: "Relances automatiques", text: "Robi relance les factures impayées à ta place." },
  ],
  smallPrint: (c, p) => `Remise de ${p} % valable une fois, sur ton premier paiement, tant que le code ${c} est actif. Si elle n'apparaît pas au paiement, saisis le code ${c}.`,
  from: (pl) => `Recommandé par un créateur ${pl}`,
};

const en: CodeCopy = {
  metaTitle: (n, p) => `${n} gives you ${p}% off Robi AI`,
  metaDescription: (n, p) => `${n}'s code: ${p}% off your first Robi AI payment, applied automatically. Speak your quotes and invoices, Robi writes them.`,
  badge: (c) => `Code ${c} applied`,
  title: (n, p) => `${n} gives you ${p}% off`,
  titleAccent: "your first Robi payment.",
  subtitle: "You speak, Robi writes your quote or invoice. The code is already applied: nothing to type.",
  cta: "Start for free",
  ctaHint: "No credit card. Your discount is waiting when you upgrade to Pro.",
  stepsTitle: "How it works",
  steps: [
    { title: "1. Create your account", text: () => "Free, in seconds with Google or your email address." },
    { title: "2. Dictate your first quote", text: () => "“Parquet flooring, 30 m², client Martin…”: Robi fills in the document for you." },
    { title: "3. Go Pro whenever you like", text: (p) => `Your ${p}% is applied automatically at checkout, even if you come back weeks later.` },
  ],
  whyTitle: "What Robi does for you",
  why: [
    { title: "Voice-to-quote and invoice", text: "Describe the job, Robi drafts a clean document ready to send." },
    { title: "Factur-X built in", text: "Your invoices come out in the Factur-X e-invoicing format (EN 16931)." },
    { title: "Automatic reminders", text: "Robi follows up on unpaid invoices for you." },
  ],
  smallPrint: (c, p) => `${p}% discount valid once, on your first payment, while code ${c} is active. If it doesn't show at checkout, enter code ${c}.`,
  from: (pl) => `Recommended by a ${pl} creator`,
};

const es: CodeCopy = {
  metaTitle: (n, p) => `${n} te regala un ${p} % en Robi AI`,
  metaDescription: (n, p) => `Código de ${n}: ${p} % de descuento en tu primer pago de Robi AI, aplicado automáticamente. Dicta tus presupuestos y facturas, Robi los escribe.`,
  badge: (c) => `Código ${c} activado`,
  title: (n, p) => `${n} te regala un ${p} %`,
  titleAccent: "en tu primer pago de Robi.",
  subtitle: "Tú hablas, Robi escribe tu presupuesto o tu factura. El código ya está aplicado: no tienes que escribir nada.",
  cta: "Empezar gratis",
  ctaHint: "Sin tarjeta. El descuento te espera cuando pases a Pro.",
  stepsTitle: "Cómo funciona",
  steps: [
    { title: "1. Crea tu cuenta", text: () => "Gratis, en unos segundos con Google o tu correo." },
    { title: "2. Dicta tu primer presupuesto", text: () => "«Colocación de parquet, 30 m², cliente Martín…»: Robi rellena el documento por ti." },
    { title: "3. Pasa a Pro cuando quieras", text: (p) => `Tu ${p} % se aplica solo al pagar, aunque vuelvas dentro de unas semanas.` },
  ],
  whyTitle: "Lo que Robi hace por ti",
  why: [
    { title: "Presupuestos y facturas por voz", text: "Describes el trabajo y Robi redacta un documento limpio, listo para enviar." },
    { title: "Factur-X integrado", text: "Tus facturas salen en formato electrónico Factur-X (EN 16931)." },
    { title: "Recordatorios automáticos", text: "Robi reclama las facturas impagadas por ti." },
  ],
  smallPrint: (c, p) => `Descuento del ${p} % válido una vez, en tu primer pago, mientras el código ${c} esté activo. Si no aparece al pagar, introduce el código ${c}.`,
  from: (pl) => `Recomendado por un creador de ${pl}`,
};

export const codeCopy = (locale: string): CodeCopy => {
  const base = (locale || "fr").slice(0, 2).toLowerCase();
  return base === "en" ? en : base === "es" ? es : fr;
};
