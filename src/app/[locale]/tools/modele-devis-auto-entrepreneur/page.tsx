import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mic, ArrowRight } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Hero } from "@/components/sections/Hero";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { pageSeo } from "@/lib/seo/pageSeo";
import { localePath } from "@/lib/seo/localizedPaths";
import { DevisModele } from "./client";

/**
 * Modèle de devis auto-entrepreneur — page France uniquement (25/10/2026).
 *
 * L'article /fr/blog/comment-faire-un-devis-auto-entrepreneur est en position
 * ~6,7 sur « devis auto entrepreneur » : cette page donne le modèle rempli
 * que la requête attend, et les deux se citent. Les autres locales sont
 * renvoyées vers leur page Outils (le statut et les mentions sont français).
 */

const PATH = "/tools/modele-devis-auto-entrepreneur";
const SIGNUP = "https://go.robi-app.com/?signup";

const MENTIONS = [
  { title: "Le mot « Devis », un numéro et la date", text: "Un numéro unique (D-2026-031) t'aide à retrouver le devis et à le relier à la facture." },
  { title: "Ton identité", text: "Nom et prénom suivis de « EI » (ou « Entrepreneur individuel »), adresse, numéro SIREN, et tes coordonnées." },
  { title: "Les coordonnées du client", text: "Nom ou raison sociale et adresse." },
  { title: "La durée de validité", text: "Souvent 30 à 90 jours : passé ce délai, tu n'es plus engagé sur le prix." },
  { title: "La prestation, la date de début et la durée", text: "Ce que tu fais, quand tu commences et combien de temps ça prend." },
  { title: "Le détail chiffré", text: "Pour chaque ligne : désignation, quantité, prix unitaire HT et total." },
  { title: "Les montants et la TVA", text: "Total HT, taux et montant de TVA, total TTC — ou, en franchise, la mention « TVA non applicable, art. 293 B du CGI »." },
  { title: "Les conditions de paiement", text: "Acompte éventuel, échéance, moyen de paiement. Puis le « Bon pour accord » daté et signé par le client." },
];

const FAQ_ITEMS = [
  {
    question: "Un auto-entrepreneur doit-il faire un devis ?",
    answer: "Pas toujours, mais il est obligatoire au-delà de certains montants dans quelques secteurs (travaux, dépannage) et fortement recommandé partout : une fois signé, il vaut contrat.",
  },
  {
    question: "Quelle mention TVA mettre sur un devis d'auto-entrepreneur ?",
    answer: "En franchise de TVA : « TVA non applicable, art. 293 B du CGI » pour les documents émis jusqu'au 31 décembre 2026, puis « TVA non applicable, art. L. 233-3 du CIBS » à partir du 1er janvier 2027 (l'ancienne mention reste acceptée jusqu'au 30 juin 2028).",
  },
  {
    question: "Combien de temps un devis est-il valable ?",
    answer: "C'est toi qui fixes la durée de validité, souvent 30 à 90 jours. Indique-la sur le devis : après ce délai, tu peux revoir ton prix.",
  },
  {
    question: "Comment remplir ce modèle de devis plus vite ?",
    answer: "Avec Robi AI, tu dis ta prestation (« Devis de 1 380 € pour Studio Belmont, logo et charte graphique ») : le devis se remplit avec tes infos, la bonne mention TVA et un numéro, puis part en signature électronique. Gratuit pour 4 devis ou factures par mois.",
  },
  {
    question: "Comment transformer le devis signé en facture ?",
    answer: "La facture reprend les lignes du devis accepté, avec un numéro de facture dans ta série. Dans Robi, le devis signé devient une facture conforme (Factur-X) en un clic.",
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: { absolute: "Modèle de devis auto-entrepreneur gratuit (2026) | Robi AI" },
    description:
      "Modèle de devis auto-entrepreneur rempli, avec ou sans TVA (293 B), et les 8 mentions obligatoires. Gratuit : copie-le ou remplis-le en parlant.",
    keywords: ["modèle devis auto entrepreneur", "devis auto entrepreneur", "exemple devis auto entrepreneur", "devis auto entrepreneur gratuit", "devis sans tva 293 b"],
    ...pageSeo(locale, PATH, "fr-only"),
  };
}

export default async function ModeleDevisPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (rawLocale !== "fr") redirect(localePath(rawLocale, "/tools"));
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Robi AI", item: "https://robi-app.com/fr" },
      { "@type": "ListItem", position: 2, name: "Outils", item: "https://robi-app.com/fr/tools" },
      { "@type": "ListItem", position: 3, name: "Modèle de devis auto-entrepreneur", item: `https://robi-app.com/fr${PATH}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Hero
        crumbs={<Breadcrumbs tone="dark" locale={locale} items={[{ label: "Outils", href: "/fr/tools" }, { label: "Modèle de devis" }]} />}
        badge="Modèle gratuit · 2026"
        title="Modèle de devis"
        titleAccent="auto-entrepreneur gratuit"
        subtitle="Un devis rempli, avec ou sans TVA, et chaque mention obligatoire expliquée. Copie-le, ou remplis le tien en parlant."
        ctaText="Remplir mon devis en parlant"
        ctaHref={SIGNUP}
        variant="centered"
      />

      {/* Le modèle rempli */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[28px] md:text-4xl font-black tracking-tight leading-[1.08] [text-wrap:balance] text-[#0D0630] mb-3">Le modèle, rempli</h2>
          <p className="text-center text-gray-500 mb-8">Exemple d&apos;une graphiste en micro-entreprise. Bascule entre la version sans TVA et la version avec TVA.</p>
          <DevisModele />
        </div>
      </section>

      {/* Les mentions obligatoires */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-[28px] md:text-4xl font-black tracking-tight leading-[1.08] [text-wrap:balance] text-[#0D0630] mb-10">Les 8 mentions obligatoires d&apos;un devis</h2>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {MENTIONS.map((m, i) => (
              <li key={m.title} className="flex gap-4 rounded-[20px] border border-gray-200 bg-gray-50 p-5">
                <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#0D0630] text-sm font-black text-[#BEF221]">{i + 1}</span>
                <div>
                  <h3 className="font-bold text-[#0D0630]">{m.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-gray-500">
            Le pas-à-pas complet (acompte, validité, du devis à la facture) :{" "}
            <Link href="/fr/blog/comment-faire-un-devis-auto-entrepreneur" className="font-semibold text-[#0D0630] underline decoration-[#BEF221] decoration-2 underline-offset-4">
              comment faire un devis en auto-entrepreneur
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Variante sans TVA */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[28px] md:text-4xl font-black tracking-tight leading-[1.08] [text-wrap:balance] text-[#0D0630] mb-6">Devis sans TVA : la mention 293 B</h2>
          <div className="space-y-4 text-lg leading-relaxed text-gray-600">
            <p>
              En franchise en base de TVA, tu ne factures pas de TVA : le devis affiche un total sans TVA et la mention
              <strong className="text-[#0D0630]"> « TVA non applicable, art. 293 B du CGI »</strong>.
            </p>
            <p>
              À partir du <strong className="text-[#0D0630]">1er janvier 2027</strong>, la référence devient
              « TVA non applicable, art. L. 233-3 du CIBS » ; l&apos;ancienne reste acceptée jusqu&apos;au 30 juin 2028. C&apos;est la date
              d&apos;émission du document qui compte. Tout est détaillé dans{" "}
              <Link href="/fr/blog/mention-tva-facture-2026-293b-cibs" className="font-semibold text-[#0D0630] underline decoration-[#BEF221] decoration-2 underline-offset-4">
                notre article sur la mention TVA
              </Link>
              .
            </p>
            <p>Si tu dépasses le seuil de franchise, tu passes à la version avec TVA : HT, taux, montant de TVA et TTC sur chaque ligne de total.</p>
          </div>
        </div>
      </section>

      {/* Remplir en parlant */}
      <section className="py-16 md:py-24 bg-[#0D0630]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-[28px] md:text-4xl font-black tracking-tight leading-[1.08] [text-wrap:balance] text-white mb-4">Ce devis, tu peux le remplir en parlant</h2>
          <p className="text-white/60 mb-8">Robi reprend ton SIREN, la bonne mention TVA et ta numérotation. Tu relis, tu envoies en signature électronique.</p>
          <div className="mx-auto mb-8 flex max-w-2xl items-start gap-3 rounded-[20px] border border-white/10 bg-white/[0.05] p-5 text-left">
            <Mic className="mt-1 h-5 w-5 flex-shrink-0 text-[#BEF221]" aria-hidden="true" />
            <p className="text-lg text-white">« Devis pour Studio Belmont : logo à 800 €, charte graphique à 400 €, trois déclinaisons réseaux sociaux à 60 €, acompte de 30 % »</p>
          </div>
          <a href={SIGNUP} className="inline-flex items-center gap-2 rounded-full bg-[#BEF221] px-7 py-4 text-base font-bold text-[#0D0630] hover:brightness-95">
            Remplir ce devis en parlant <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </a>
          <p className="mt-4 text-sm text-white/50">Gratuit pour 4 devis ou factures par mois, sans carte bancaire.</p>
        </div>
      </section>

      <FAQ title="Questions sur le devis auto-entrepreneur" items={FAQ_ITEMS} />

      {/* Maillage */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Pour aller plus loin</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Comment faire un devis en auto-entrepreneur", href: "/blog/comment-faire-un-devis-auto-entrepreneur" },
              { label: "Comment faire une facture en auto-entrepreneur", href: "/blog/comment-faire-une-facture-auto-entrepreneur" },
              { label: "Les mentions obligatoires d'une facture", href: "/blog/mentions-obligatoires-facture" },
              { label: "Générateur de facture gratuit", href: "/tools/generateur-facture" },
              { label: "Devis automatiques par IA", href: "/features/devis-automatique" },
              { label: "La facture IA en parlant", href: "/facture-ai" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={localePath(locale, l.href)} className="text-gray-600 hover:text-[#0D0630] underline underline-offset-4 decoration-[#BEF221] decoration-2">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTA title={dict.cta.title} subtitle={dict.cta.subtitle} ctaText={dict.cta.button} secondaryText={dict.cta.subtext} />
    </>
  );
}
