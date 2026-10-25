// Bloc « L'abonnement Robi AI » de la page tarifs : porte la requête de marque
// « robi ai subscription » (32 impressions, position 7,8 — export Search
// Console du 28/06 au 27/09/2026). Aucun prix ici : la page tarifs change de
// devise et de grille selon le marché, les montants restent dans le tableau.

const COPY = {
  fr: {
    title: "L'abonnement Robi AI, en clair",
    items: [
      "Tu commences gratuitement, sans carte bancaire, avec 4 factures ou devis par mois.",
      "Quand tu veux plus, tu choisis ta formule Robi AI ci-dessus : au mois sans engagement, à l'année, ou en paiement unique selon les offres de ton marché.",
      "Ton abonnement se gère dans l'app, écran « Mon abonnement », une fois connecté sur go.robi-app.com.",
    ],
    login: "Se connecter à Robi AI",
  },
  en: {
    title: "Your Robi AI subscription, explained",
    items: [
      "You start for free, no card needed, with 4 invoices or quotes a month.",
      "When you need more, pick your Robi AI plan above: monthly with no commitment, yearly, or a one-off payment depending on the offers in your market.",
      "You manage your subscription in the app, on the « My subscription » screen, once signed in at go.robi-app.com.",
    ],
    login: "Robi AI login",
  },
  es: {
    title: "La suscripción Robi AI, en claro",
    items: [
      "Empiezas gratis, sin tarjeta, con 4 facturas o presupuestos al mes.",
      "Cuando necesites más, eliges tu plan Robi AI arriba: mensual sin permanencia, anual o pago único según las ofertas de tu mercado.",
      "Gestionas tu suscripción en la app, pantalla « Mi suscripción », una vez dentro de go.robi-app.com.",
    ],
    login: "Iniciar sesión en Robi AI",
  },
};

export function SubscriptionNote({ locale, loginHref }: { locale: string; loginHref: string }) {
  const c = locale.startsWith("es") ? COPY.es : locale.startsWith("en") || locale.startsWith("pt") ? COPY.en : COPY.fr;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[28px] md:text-4xl font-black tracking-tight leading-[1.08] [text-wrap:balance] text-[#0D0630]">
          {c.title}
        </h2>
        <ul className="mt-6 space-y-3">
          {c.items.map((item) => (
            <li key={item} className="flex gap-3 text-gray-600 leading-relaxed">
              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#BEF221]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <a href={loginHref} className="mt-6 inline-block font-semibold text-[#0D0630] underline decoration-[#BEF221] decoration-2 underline-offset-4">
          {c.login}
        </a>
      </div>
    </section>
  );
}
