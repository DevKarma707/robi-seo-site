import { Metadata } from "next";
import Link from "next/link";
import { LogIn, UserPlus, CreditCard, HelpCircle } from "lucide-react";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { FAQ } from "@/components/sections/FAQ";
import { pageSeo } from "@/lib/seo/pageSeo";
import { localePath } from "@/lib/seo/localizedPaths";

// Page de connexion indexable (chantier marque, 25/10/2026).
// « robi » seul appartient à la chanteuse et à l'opérateur télécom du
// Bangladesh ; les requêtes de marque à notre portée sont « robi ai »,
// « robi login » / « roby login » (62 impressions, position 35) et
// « robi ai subscription ». L'app (go.robi-app.com) reste en noindex : c'est
// cette page qui porte la requête et y renvoie.

const APP = "https://go.robi-app.com/";
const SIGNUP = "https://go.robi-app.com/?signup";

type Lang = "fr" | "en" | "es";
const langOf = (locale: string): Lang =>
  locale.startsWith("es") ? "es" : locale.startsWith("en") || locale.startsWith("pt") ? "en" : "fr";

const content: Record<Lang, {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  title: string;
  subtitle: string;
  login: string;
  signup: string;
  cards: { icon: "login" | "signup" | "plan" | "help"; title: string; text: string; href: string; cta: string }[];
  notUs: { title: string; text: string };
  faq: { question: string; answer: string }[];
}> = {
  fr: {
    metaTitle: "Robi AI : se connecter à ton compte",
    metaDescription: "Connexion à Robi AI, le logiciel de facturation par IA : accède à tes devis, factures et à ton abonnement sur go.robi-app.com. Pas de compte ? Crée-le gratuitement.",
    badge: "Connexion Robi AI",
    title: "Robi AI : se connecter",
    subtitle: "Ton espace Robi AI est sur go.robi-app.com : tes devis, tes factures, tes clients et ton abonnement. Connecte-toi avec ton e-mail ou ton compte Google.",
    login: "Se connecter à Robi AI",
    signup: "Créer un compte gratuit",
    cards: [
      { icon: "login", title: "Déjà client", text: "Connecte-toi sur go.robi-app.com avec l'e-mail ou le compte Google utilisé à l'inscription. Sur téléphone, ajoute la page à ton écran d'accueil pour l'ouvrir comme une app.", href: APP, cta: "Ouvrir l'app" },
      { icon: "signup", title: "Pas encore de compte", text: "L'inscription prend une minute, sans carte bancaire : 4 factures ou devis gratuits par mois pour essayer.", href: SIGNUP, cta: "Créer mon compte" },
      { icon: "plan", title: "Ton abonnement Robi AI", text: "Formules, prix dans ta devise et offre de lancement : tout est sur la page tarifs. Une fois connecté, l'écran « Mon abonnement » de l'app te montre ta formule.", href: "/pricing", cta: "Voir les tarifs" },
      { icon: "help", title: "Un souci pour te connecter ?", text: "Mot de passe oublié : utilise le lien de l'écran de connexion. Tu t'es inscrit avec Google ? Reprends « Continuer avec Google ». Sinon, écris-nous, l'équipe Robi AI te répond.", href: "/contact", cta: "Nous écrire" },
    ],
    notUs: {
      title: "Robi AI, pas un autre Robi",
      text: "Robi AI est un logiciel de facturation par intelligence artificielle pour freelances, artisans et TPE. Nous n'avons aucun lien avec l'opérateur mobile Robi au Bangladesh, ni avec d'autres services portant ce nom : leurs identifiants ne fonctionnent pas ici.",
    },
    faq: [
      { question: "Où se connecter à Robi AI ?", answer: "Sur go.robi-app.com, l'adresse de l'application. Le site robi-app.com présente le logiciel ; ton compte, tes devis et tes factures sont dans l'app." },
      { question: "J'ai oublié mon mot de passe Robi AI, que faire ?", answer: "Sur l'écran de connexion de go.robi-app.com, choisis « mot de passe oublié » : tu reçois un lien par e-mail pour en créer un nouveau. Si tu t'es inscrit avec Google, utilise simplement « Continuer avec Google »." },
      { question: "Comment voir ou changer mon abonnement Robi AI ?", answer: "Connecte-toi, puis ouvre « Mon abonnement » dans les réglages de l'app. Les formules et leurs prix sont détaillés sur la page tarifs." },
      { question: "Robi AI est-il gratuit ?", answer: "Oui pour commencer : 4 factures ou devis par mois, sans carte bancaire. Au-delà, tu choisis une formule payante sur la page tarifs." },
    ],
  },
  en: {
    metaTitle: "Robi AI login: sign in to your account",
    metaDescription: "Robi AI login: sign in to the AI invoicing app at go.robi-app.com to reach your quotes, invoices and subscription. No account yet? Create one for free.",
    badge: "Robi AI login",
    title: "Robi AI login",
    subtitle: "Your Robi AI workspace lives at go.robi-app.com: quotes, invoices, clients and your subscription. Sign in with your email or your Google account.",
    login: "Sign in to Robi AI",
    signup: "Create a free account",
    cards: [
      { icon: "login", title: "Already a customer", text: "Sign in at go.robi-app.com with the email or Google account you signed up with. On a phone, add the page to your home screen to open it like an app.", href: APP, cta: "Open the app" },
      { icon: "signup", title: "No account yet", text: "Signing up takes a minute, no card needed: 4 free invoices or quotes a month to try it.", href: SIGNUP, cta: "Create my account" },
      { icon: "plan", title: "Your Robi AI subscription", text: "Plans, prices in your currency and the launch offer are on the pricing page. Once signed in, the app's « My subscription » screen shows your plan.", href: "/pricing", cta: "See pricing" },
      { icon: "help", title: "Trouble signing in?", text: "Forgot your password: use the link on the sign-in screen. Signed up with Google? Choose « Continue with Google » again. Otherwise, write to us and the Robi AI team will reply.", href: "/contact", cta: "Contact us" },
    ],
    notUs: {
      title: "Robi AI, not another Robi",
      text: "Robi AI is AI invoicing software for freelancers, tradespeople and small businesses. We have no connection with the Robi mobile operator in Bangladesh or other services with that name: their logins don't work here.",
    },
    faq: [
      { question: "Where do I log in to Robi AI?", answer: "At go.robi-app.com, the app's address. The robi-app.com website presents the software; your account, quotes and invoices are in the app." },
      { question: "I forgot my Robi AI password. What now?", answer: "On the go.robi-app.com sign-in screen, choose « forgot password »: you'll get an email link to set a new one. If you signed up with Google, just use « Continue with Google »." },
      { question: "How do I see or change my Robi AI subscription?", answer: "Sign in, then open « My subscription » in the app's settings. Plans and prices are detailed on the pricing page." },
      { question: "Is Robi AI free?", answer: "Yes, to start: 4 invoices or quotes a month, no card needed. Beyond that, pick a paid plan on the pricing page." },
    ],
  },
  es: {
    metaTitle: "Robi AI: iniciar sesión en tu cuenta",
    metaDescription: "Inicia sesión en Robi AI, el software de facturación con IA, en go.robi-app.com: tus presupuestos, facturas y suscripción. ¿Sin cuenta? Créala gratis.",
    badge: "Acceso Robi AI",
    title: "Robi AI: iniciar sesión",
    subtitle: "Tu espacio Robi AI está en go.robi-app.com: presupuestos, facturas, clientes y tu suscripción. Entra con tu correo o tu cuenta de Google.",
    login: "Iniciar sesión en Robi AI",
    signup: "Crear una cuenta gratis",
    cards: [
      { icon: "login", title: "Ya eres cliente", text: "Entra en go.robi-app.com con el correo o la cuenta de Google con la que te registraste. En el móvil, añade la página a tu pantalla de inicio para abrirla como una app.", href: APP, cta: "Abrir la app" },
      { icon: "signup", title: "Aún sin cuenta", text: "El registro lleva un minuto, sin tarjeta: 4 facturas o presupuestos gratis al mes para probar.", href: SIGNUP, cta: "Crear mi cuenta" },
      { icon: "plan", title: "Tu suscripción Robi AI", text: "Planes, precios en tu moneda y la oferta de lanzamiento están en la página de precios. Una vez dentro, la pantalla « Mi suscripción » de la app muestra tu plan.", href: "/pricing", cta: "Ver precios" },
      { icon: "help", title: "¿Problemas para entrar?", text: "¿Olvidaste la contraseña? Usa el enlace de la pantalla de acceso. ¿Te registraste con Google? Vuelve a elegir « Continuar con Google ». Si no, escríbenos y el equipo de Robi AI te responde.", href: "/contact", cta: "Escribirnos" },
    ],
    notUs: {
      title: "Robi AI, no otro Robi",
      text: "Robi AI es un software de facturación con inteligencia artificial para autónomos y pymes. No tenemos relación con el operador móvil Robi de Bangladés ni con otros servicios con ese nombre: sus credenciales no funcionan aquí.",
    },
    faq: [
      { question: "¿Dónde inicio sesión en Robi AI?", answer: "En go.robi-app.com, la dirección de la aplicación. La web robi-app.com presenta el software; tu cuenta, presupuestos y facturas están en la app." },
      { question: "Olvidé mi contraseña de Robi AI, ¿qué hago?", answer: "En la pantalla de acceso de go.robi-app.com elige « contraseña olvidada »: recibirás un enlace por correo para crear otra. Si te registraste con Google, usa « Continuar con Google »." },
      { question: "¿Cómo veo o cambio mi suscripción Robi AI?", answer: "Inicia sesión y abre « Mi suscripción » en los ajustes de la app. Los planes y precios están en la página de precios." },
      { question: "¿Robi AI es gratis?", answer: "Sí, para empezar: 4 facturas o presupuestos al mes, sin tarjeta. Después, eliges un plan de pago en la página de precios." },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = content[langOf(locale)];
  return {
    ...pageSeo(locale, "/connexion"),
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    openGraph: { title: c.metaTitle, description: c.metaDescription, type: "website", siteName: "Robi AI" },
  };
}

const ICONS = { login: LogIn, signup: UserPlus, plan: CreditCard, help: HelpCircle };

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const c = content[langOf(locale)];
  const href = (h: string) => (h.startsWith("http") ? h : localePath(locale, h));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: c.faq.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }),
        }}
      />

      <Hero
        badge={c.badge}
        title={c.title}
        subtitle={c.subtitle}
        ctaText={c.login}
        ctaHref={APP}
        secondaryCtaText={c.signup}
        secondaryCtaHref={SIGNUP}
        variant="centered"
      />

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2">
          {c.cards.map((card) => {
            const Icon = ICONS[card.icon];
            const external = card.href.startsWith("http");
            const cls = "mt-4 inline-flex items-center gap-2 font-semibold text-[#0D0630] underline decoration-[#BEF221] decoration-2 underline-offset-4";
            return (
              <article key={card.title} className="rounded-2xl border border-gray-200 p-6">
                <div className="w-12 h-12 rounded-2xl bg-[#0D0630] flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[#BEF221]" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900">{card.title}</h2>
                <p className="mt-2 text-gray-600 leading-relaxed">{card.text}</p>
                {external ? (
                  <a href={card.href} className={cls}>{card.cta}</a>
                ) : (
                  <Link href={href(card.href)} className={cls}>{card.cta}</Link>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="pb-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 rounded-2xl bg-gray-50 p-6">
          <h2 className="text-lg font-bold text-gray-900">{c.notUs.title}</h2>
          <p className="mt-2 text-gray-600 leading-relaxed">{c.notUs.text}</p>
        </div>
      </section>

      <FAQ items={c.faq} />
    </>
  );
}
