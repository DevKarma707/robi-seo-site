import { Metadata } from "next";
import { notFound } from "next/navigation";
import { features, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Check, Sparkles, Zap, Clock, TrendingUp } from "lucide-react";

export async function generateStaticParams() {
  return features.map((feature) => ({
    slug: feature.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const feature = features.find((f) => f.slug === slug);

  if (!feature) {
    return { title: "Feature not found" };
  }

  return {
    title: t(feature.title, locale),
    description: t(feature.description, locale),
    keywords: feature.keywords,
  };
}

// Feature-specific content (keeping French content for now - these are detailed and will need proper translation later)
const featureContent: Record<string, {
  benefits: { fr: string; en: string; es: string }[];
  howItWorks: { title: { fr: string; en: string; es: string }; description: { fr: string; en: string; es: string } }[];
  stats: { value: string; label: { fr: string; en: string; es: string } }[];
}> = {
  "facturation-ia": {
    benefits: [
      { fr: "Créez des factures en parlant naturellement", en: "Create invoices by speaking naturally", es: "Crea facturas hablando naturalmente" },
      { fr: "L'IA comprend le contexte et complète les informations", en: "AI understands context and fills in the details", es: "La IA entiende el contexto y completa la información" },
      { fr: "Suggestions intelligentes basées sur votre historique", en: "Smart suggestions based on your history", es: "Sugerencias inteligentes basadas en tu historial" },
      { fr: "Détection automatique des erreurs", en: "Automatic error detection", es: "Detección automática de errores" },
    ],
    howItWorks: [
      { title: { fr: "Parlez à Robi", en: "Talk to Robi", es: "Habla con Robi" }, description: { fr: "Dites simplement 'Crée une facture de 500€ pour le projet web de Marie'", en: "Simply say 'Create a €500 invoice for Marie's web project'", es: "Di simplemente 'Crea una factura de 500€ para el proyecto web de Marie'" } },
      { title: { fr: "Robi comprend", en: "Robi understands", es: "Robi entiende" }, description: { fr: "L'IA analyse votre demande et identifie client, montant, prestation", en: "AI analyzes your request and identifies client, amount, service", es: "La IA analiza tu solicitud e identifica cliente, monto, servicio" } },
      { title: { fr: "Validez et envoyez", en: "Validate and send", es: "Valida y envía" }, description: { fr: "Vérifiez le document généré et envoyez-le en un clic", en: "Review the generated document and send it in one click", es: "Revisa el documento generado y envíalo en un clic" } },
    ],
    stats: [
      { value: "30s", label: { fr: "Temps de création", en: "Creation time", es: "Tiempo de creación" } },
      { value: "99%", label: { fr: "Précision IA", en: "AI accuracy", es: "Precisión IA" } },
      { value: "10h", label: { fr: "Gagnées par mois", en: "Saved per month", es: "Ahorradas al mes" } },
    ],
  },
  "devis-automatique": {
    benefits: [
      { fr: "Templates professionnels personnalisables", en: "Customizable professional templates", es: "Plantillas profesionales personalizables" },
      { fr: "Calculs automatiques (TVA, remises, totaux)", en: "Automatic calculations (VAT, discounts, totals)", es: "Cálculos automáticos (IVA, descuentos, totales)" },
      { fr: "Bibliothèque de prestations réutilisables", en: "Reusable service library", es: "Biblioteca de servicios reutilizables" },
      { fr: "Conversion devis → facture en un clic", en: "Quote → invoice conversion in one click", es: "Conversión presupuesto → factura en un clic" },
    ],
    howItWorks: [
      { title: { fr: "Choisissez un template", en: "Choose a template", es: "Elige una plantilla" }, description: { fr: "Sélectionnez parmi nos modèles adaptés à votre métier", en: "Select from our templates adapted to your profession", es: "Selecciona entre nuestras plantillas adaptadas a tu profesión" } },
      { title: { fr: "Ajoutez vos prestations", en: "Add your services", es: "Añade tus servicios" }, description: { fr: "Depuis votre catalogue ou en les décrivant à l'IA", en: "From your catalog or by describing them to the AI", es: "Desde tu catálogo o describiéndolos a la IA" } },
      { title: { fr: "Personnalisez et envoyez", en: "Customize and send", es: "Personaliza y envía" }, description: { fr: "Ajustez les détails et partagez le lien avec votre client", en: "Adjust details and share the link with your client", es: "Ajusta los detalles y comparte el enlace con tu cliente" } },
    ],
    stats: [
      { value: "2min", label: { fr: "Devis complet", en: "Complete quote", es: "Presupuesto completo" } },
      { value: "85%", label: { fr: "Taux d'acceptation", en: "Acceptance rate", es: "Tasa de aceptación" } },
      { value: "0", label: { fr: "Erreur de calcul", en: "Calculation errors", es: "Errores de cálculo" } },
    ],
  },
  "relance-automatique": {
    benefits: [
      { fr: "Détection automatique des factures en retard", en: "Automatic detection of overdue invoices", es: "Detección automática de facturas atrasadas" },
      { fr: "Emails de relance personnalisés par l'IA", en: "AI-personalized reminder emails", es: "Emails de recordatorio personalizados por la IA" },
      { fr: "Escalade progressive (rappel → relance → mise en demeure)", en: "Progressive escalation (reminder → follow-up → formal notice)", es: "Escalada progresiva (recordatorio → seguimiento → requerimiento)" },
      { fr: "Suivi des ouvertures et clics", en: "Open and click tracking", es: "Seguimiento de aperturas y clics" },
    ],
    howItWorks: [
      { title: { fr: "Configuration initiale", en: "Initial setup", es: "Configuración inicial" }, description: { fr: "Définissez vos délais et le ton des messages", en: "Set your deadlines and message tone", es: "Define tus plazos y el tono de los mensajes" } },
      { title: { fr: "Surveillance continue", en: "Continuous monitoring", es: "Vigilancia continua" }, description: { fr: "Robi surveille les échéances et détecte les retards", en: "Robi monitors deadlines and detects delays", es: "Robi vigila los plazos y detecta los retrasos" } },
      { title: { fr: "Relance automatique", en: "Automatic follow-up", es: "Seguimiento automático" }, description: { fr: "Des emails personnalisés sont envoyés au bon moment", en: "Personalized emails are sent at the right time", es: "Emails personalizados se envían en el momento adecuado" } },
    ],
    stats: [
      { value: "-50%", label: { fr: "Impayés", en: "Unpaid invoices", es: "Impagos" } },
      { value: "3j", label: { fr: "Paiement plus rapide", en: "Faster payment", es: "Pago más rápido" } },
      { value: "0", label: { fr: "Relance manuelle", en: "Manual reminders", es: "Recordatorios manuales" } },
    ],
  },
  "paiement-en-ligne": {
    benefits: [
      { fr: "Stripe et PayPal intégrés nativement", en: "Stripe and PayPal natively integrated", es: "Stripe y PayPal integrados de forma nativa" },
      { fr: "Liens de paiement en un clic", en: "One-click payment links", es: "Links de pago en un clic" },
      { fr: "Paiement par carte, virement, prélèvement", en: "Pay by card, transfer, direct debit", es: "Pago por tarjeta, transferencia, domiciliación" },
      { fr: "Réconciliation automatique des paiements", en: "Automatic payment reconciliation", es: "Reconciliación automática de pagos" },
    ],
    howItWorks: [
      { title: { fr: "Connectez vos comptes", en: "Connect your accounts", es: "Conecta tus cuentas" }, description: { fr: "Liez Stripe et/ou PayPal en quelques clics", en: "Link Stripe and/or PayPal in a few clicks", es: "Vincula Stripe y/o PayPal en unos clics" } },
      { title: { fr: "Générez des liens", en: "Generate links", es: "Genera enlaces" }, description: { fr: "Chaque facture inclut un bouton 'Payer maintenant'", en: "Each invoice includes a 'Pay now' button", es: "Cada factura incluye un botón 'Pagar ahora'" } },
      { title: { fr: "Soyez notifié", en: "Get notified", es: "Recibe notificaciones" }, description: { fr: "Recevez une notification dès que le paiement est reçu", en: "Get notified as soon as payment is received", es: "Recibe una notificación en cuanto se reciba el pago" } },
    ],
    stats: [
      { value: "2x", label: { fr: "Plus vite payé", en: "Paid faster", es: "Pagado más rápido" } },
      { value: "24h", label: { fr: "Délai moyen", en: "Average delay", es: "Plazo medio" } },
      { value: "100%", label: { fr: "Sécurisé", en: "Secure", es: "Seguro" } },
    ],
  },
  "tableau-de-bord": {
    benefits: [
      { fr: "Vue d'ensemble de votre activité en temps réel", en: "Real-time overview of your business", es: "Vista general de tu actividad en tiempo real" },
      { fr: "Graphiques de CA, factures, paiements", en: "Revenue, invoices, payments charts", es: "Gráficos de facturación, facturas, pagos" },
      { fr: "Alertes intelligentes (impayés, objectifs)", en: "Smart alerts (unpaid, goals)", es: "Alertas inteligentes (impagos, objetivos)" },
      { fr: "Export comptable automatique", en: "Automatic accounting export", es: "Exportación contable automática" },
    ],
    howItWorks: [
      { title: { fr: "Connectez-vous", en: "Log in", es: "Inicia sesión" }, description: { fr: "Accédez à votre dashboard depuis n'importe quel appareil", en: "Access your dashboard from any device", es: "Accede a tu panel desde cualquier dispositivo" } },
      { title: { fr: "Visualisez", en: "Visualize", es: "Visualiza" }, description: { fr: "Graphiques, KPIs et alertes en un coup d'œil", en: "Charts, KPIs and alerts at a glance", es: "Gráficos, KPIs y alertas de un vistazo" } },
      { title: { fr: "Agissez", en: "Take action", es: "Actúa" }, description: { fr: "Cliquez sur une alerte pour traiter le problème immédiatement", en: "Click an alert to handle the issue immediately", es: "Haz clic en una alerta para resolver el problema de inmediato" } },
    ],
    stats: [
      { value: "360°", label: { fr: "Vision complète", en: "Complete vision", es: "Visión completa" } },
      { value: "Live", label: { fr: "Temps réel", en: "Real-time", es: "Tiempo real" } },
      { value: "1clic", label: { fr: "Export comptable", en: "Accounting export", es: "Exportación contable" } },
    ],
  },
};

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const feature = features.find((f) => f.slug === slug);

  if (!feature) {
    notFound();
  }

  const content = featureContent[slug] || featureContent["facturation-ia"];
  const fp = dict.pages.featuresPage;

  return (
    <>
      <Hero
        badge={fp.badge}
        title={t(feature.name, locale)}
        subtitle={t(feature.description, locale)}
        variant="centered"
      />

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            {content.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-[#BEF221]">
                  {stat.value}
                </p>
                <p className="text-gray-500 mt-2">{t(stat.label, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              {fp.whyYouWillLove}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {content.benefits.map((benefit, index) => (
              <Card key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#BEF221] flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-[#0D0630]" />
                </div>
                <p className="text-lg text-gray-900 font-medium">{t(benefit, locale)}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              {fp.simpleAs123}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-black text-[#BEF221]/20 absolute -top-4 -left-2">
                  {index + 1}
                </div>
                <Card className="relative z-10 h-full">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {t(step.title, locale)}
                  </h3>
                  <p className="text-gray-500">{t(step.description, locale)}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Pricing locale={locale} dict={dict} />

      <CTA
        title={fp.tryFeature.replace("{name}", t(feature.name, locale))}
        subtitle={fp.freeFor14Days}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
