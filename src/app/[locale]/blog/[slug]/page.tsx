import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/data/seo-config";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { ArrowLeft, Calendar, Clock, Share2, BookOpen } from "lucide-react";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Article non trouvé" };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
    },
  };
}

const categoryColors: Record<string, string> = {
  guides: "bg-blue-100 text-blue-700",
  legal: "bg-purple-100 text-purple-700",
  tips: "bg-green-100 text-green-700",
  business: "bg-amber-100 text-amber-700",
};

const categoryNames: Record<string, string> = {
  guides: "Guide",
  legal: "Juridique",
  tips: "Conseils",
  business: "Business",
};

// Full article content for each post
const articleContent: Record<string, string> = {
  "comment-facturer-premier-client": `
## Introduction

Félicitations ! Vous venez de décrocher votre premier client en tant que freelance. Maintenant vient la question cruciale : comment facturer correctement ?

Ce guide vous accompagne étape par étape pour émettre votre première facture en toute conformité.

## 1. Vérifiez votre statut juridique

Avant de facturer, assurez-vous d'avoir un statut légal :
- **Micro-entreprise** : le plus simple pour démarrer
- **SASU/EURL** : pour des revenus plus importants
- **Portage salarial** : si vous préférez éviter l'administratif

## 2. Les mentions obligatoires

Votre facture doit obligatoirement contenir :
- Votre nom/raison sociale et adresse
- Numéro SIRET
- Nom et adresse du client
- Date de la facture
- Numéro de facture unique
- Description détaillée de la prestation
- Montant HT et TTC
- Taux de TVA (ou mention "TVA non applicable, art. 293 B du CGI")
- Conditions de paiement

## 3. Fixez vos conditions de paiement

Les délais standards :
- **Paiement à réception** : idéal pour les petits montants
- **30 jours** : standard professionnel
- **45 jours fin de mois** : pour les grandes entreprises

## 4. Envoyez votre facture

Plusieurs options :
- Par email avec PDF en pièce jointe
- Via un logiciel de facturation comme Robi AI
- Par courrier recommandé (pour les montants importants)

## 5. Suivez les paiements

Ne laissez pas traîner les impayés :
- Relancez poliment après 7 jours de retard
- Envoyez une mise en demeure après 30 jours
- Envisagez l'injonction de payer si nécessaire

## Conclusion

Facturer correctement dès le départ vous évitera bien des problèmes. Avec un outil comme Robi AI, vous pouvez automatiser tout ce processus et vous concentrer sur votre cœur de métier.
  `,
  "mentions-obligatoires-facture": `
## Les mentions obligatoires en 2024

La réglementation française impose des mentions précises sur vos factures. Voici la liste complète pour être en conformité.

## Mentions concernant votre entreprise

1. **Nom ou raison sociale**
2. **Adresse du siège social**
3. **Numéro SIRET** (14 chiffres)
4. **Code APE/NAF**
5. **Forme juridique** (pour les sociétés)
6. **Capital social** (pour les sociétés)

## Mentions concernant le client

1. **Nom ou raison sociale**
2. **Adresse de facturation**
3. **Numéro de TVA intracommunautaire** (si applicable)

## Mentions concernant la facture

1. **Numéro de facture unique** et chronologique
2. **Date d'émission**
3. **Date de la prestation** ou livraison
4. **Quantité et dénomination précise** des produits/services
5. **Prix unitaire HT**
6. **Taux de TVA applicable** (ou mention d'exonération)
7. **Montant total HT et TTC**
8. **Remises éventuelles**

## Mentions de paiement

1. **Date d'échéance**
2. **Conditions d'escompte** (ou mention "pas d'escompte")
3. **Taux de pénalités de retard**
4. **Indemnité forfaitaire de recouvrement** (40€)

## Cas particuliers

### Micro-entrepreneur
Ajoutez : "TVA non applicable, art. 293 B du CGI"

### Artisan
Ajoutez : Numéro d'inscription au répertoire des métiers

### Professionnel réglementé
Ajoutez : Références de l'assurance professionnelle

## Les sanctions

Une facture non conforme peut entraîner :
- Amende de 15€ par mention manquante
- Jusqu'à 75 000€ pour les cas graves
- Rejet de la déduction de TVA pour le client

## Conclusion

Avec Robi AI, toutes ces mentions sont ajoutées automatiquement. Vous n'avez plus qu'à vous concentrer sur votre activité.
  `,
  "relancer-client-impaye": `
## Comment relancer efficacement un client qui ne paie pas

Les retards de paiement sont le cauchemar des freelances. Voici 5 techniques pour récupérer votre argent sans détruire la relation client.

## 1. Le rappel amical (J+7)

**Ton** : Bienveillant, supposez une erreur

> Bonjour [Prénom],
>
> J'espère que vous allez bien ! Je me permets de vous contacter concernant la facture n°XXX d'un montant de XXX€, dont l'échéance était le [date].
>
> Il est possible que ce soit un oubli, aussi je vous joins à nouveau la facture.
>
> Bien cordialement

## 2. La relance formelle (J+15)

**Ton** : Professionnel, direct

> Madame, Monsieur,
>
> Sauf erreur de ma part, la facture n°XXX reste impayée à ce jour.
>
> Je vous remercie de bien vouloir procéder au règlement dans les meilleurs délais.
>
> Dans l'attente, je reste à votre disposition.

## 3. L'appel téléphonique (J+20)

Parfois, un appel vaut mieux qu'un email :
- Demandez à parler au service comptabilité
- Restez calme et factuel
- Proposez des solutions (échelonnement, etc.)
- Prenez des notes et confirmez par email

## 4. La mise en demeure (J+30)

C'est la dernière étape avant les actions légales :
- Envoyez en recommandé avec AR
- Mentionnez les pénalités de retard
- Fixez un délai de 8 jours
- Conservez une copie

## 5. L'action légale (J+45)

Si rien ne fonctionne :
- **Injonction de payer** : rapide et peu coûteuse
- **Société de recouvrement** : pour les gros montants
- **Tribunal de commerce** : en dernier recours

## Conseils pour éviter les impayés

1. Demandez un acompte de 30-50%
2. Facturez rapidement
3. Vérifiez la solvabilité des nouveaux clients
4. Utilisez des liens de paiement en ligne

## Automatisez avec Robi AI

Robi peut :
- Détecter automatiquement les retards
- Envoyer des relances personnalisées
- Suivre les ouvertures d'email
- Vous alerter si besoin d'action manuelle
  `,
  "tarif-journalier-moyen-freelance": `
## TJM Freelance 2024 : Quel tarif pratiquer ?

Le Tarif Journalier Moyen (TJM) est LA question que se pose tout freelance. Voici un guide complet pour fixer le vôtre.

## Les TJM moyens par métier en 2024

### Tech & Digital
| Métier | Junior | Confirmé | Senior |
|--------|--------|----------|--------|
| Développeur Web | 300-400€ | 450-550€ | 600-800€ |
| Data Scientist | 400-500€ | 550-700€ | 750-1000€ |
| DevOps | 400-500€ | 550-700€ | 750-900€ |
| UX Designer | 350-450€ | 500-600€ | 650-850€ |

### Conseil & Stratégie
| Métier | Junior | Confirmé | Senior |
|--------|--------|----------|--------|
| Consultant Marketing | 350-450€ | 500-650€ | 700-1000€ |
| Consultant RH | 300-400€ | 450-600€ | 650-850€ |
| Coach Business | 400-500€ | 600-800€ | 900-1500€ |

### Création
| Métier | Junior | Confirmé | Senior |
|--------|--------|----------|--------|
| Graphiste | 250-350€ | 400-500€ | 550-700€ |
| Motion Designer | 350-450€ | 500-650€ | 700-900€ |
| Photographe | 300-400€ | 450-600€ | 650-1000€ |

## Comment calculer votre TJM ?

### Méthode simple

1. **Salaire net annuel souhaité** : 50 000€
2. **Charges sociales** (~25% micro) : 16 667€
3. **CA nécessaire** : 66 667€
4. **Jours facturables** (~200/an) : 200 jours
5. **TJM** = 66 667 / 200 = **333€**

### N'oubliez pas

- Les congés (25-30 jours)
- La maladie (5-10 jours)
- La prospection (20-30 jours)
- La formation (10 jours)
- L'administratif (10 jours)

## Facteurs qui influencent le TJM

### À la hausse
- Expertise rare
- Références prestigieuses
- Certifications
- Urgence du projet
- Mission longue

### À la baisse
- Marché saturé
- Client récurrent
- Mission formatrice
- Télétravail intégral

## Négocier son TJM

1. **Ne donnez jamais de fourchette** : indiquez un chiffre précis
2. **Justifiez votre valeur** : ROI, références, expertise
3. **Proposez des options** : forfait vs régie, engagement durée
4. **Sachez dire non** : un mauvais tarif coûte plus qu'il ne rapporte

## Conclusion

Votre TJM doit couvrir vos charges, financer votre protection sociale, et vous permettre de vivre confortablement. Utilisez notre calculateur gratuit pour trouver le vôtre !
  `,
  "micro-entreprise-vs-sasu": `
## Micro-Entreprise vs SASU : Quel statut choisir ?

Vous lancez votre activité freelance et hésitez entre micro-entreprise et SASU ? Voici un comparatif détaillé pour vous aider.

## Tableau comparatif

| Critère | Micro-Entreprise | SASU |
|---------|------------------|------|
| Création | Simple, gratuit | Complexe, ~300€ |
| Comptabilité | Livre des recettes | Comptabilité complète |
| Charges | 22-25% du CA | ~45% du salaire |
| Plafond CA | 77 700€ (services) | Illimité |
| TVA | Franchise possible | Obligatoire |
| Responsabilité | Personnelle | Limitée aux apports |
| Chômage | Non | Oui (sous conditions) |

## Micro-Entreprise : pour qui ?

### Avantages
- Création en 10 minutes sur guichet-entreprises.fr
- Pas de comptabilité complexe
- Charges calculées sur le CA réel
- CFE réduite la première année
- Versement libératoire possible

### Inconvénients
- Plafond de CA (77 700€ services)
- Pas de déduction des charges
- Protection sociale limitée
- Image moins "professionnelle"
- Patrimoine personnel exposé

### Idéal pour
- Activité secondaire
- Test d'un projet
- CA < 50 000€/an
- Peu de frais professionnels

## SASU : pour qui ?

### Avantages
- Responsabilité limitée
- Déduction des frais
- Optimisation fiscale (dividendes)
- Image professionnelle
- Pas de plafond de CA

### Inconvénients
- Formalités de création
- Comptabilité obligatoire (~2000€/an)
- Charges sociales élevées
- Obligations déclaratives
- Frais de fermeture

### Idéal pour
- CA > 70 000€/an
- Frais importants (locaux, matériel)
- Associés potentiels
- Levée de fonds prévue
- Image importante

## Simulation comparative

### Exemple : CA de 60 000€

**Micro-entreprise (BNC 25%)**
- Charges : 15 000€
- IR estimé : 6 000€
- **Net : ~39 000€**

**SASU (salaire 40k + dividendes)**
- Salaire net : 30 000€
- Charges patronales : 12 000€
- IS : 2 500€
- Dividendes nets : 8 000€
- **Net : ~38 000€**

À ce niveau, les deux statuts sont équivalents. Au-delà de 70k€, la SASU devient avantageuse.

## Comment choisir ?

1. **CA prévu < 50k€** → Micro-entreprise
2. **CA prévu 50-70k€** → À calculer précisément
3. **CA prévu > 70k€** → SASU probable
4. **Beaucoup de frais** → SASU
5. **Besoin de chômage** → SASU
6. **Test d'activité** → Micro-entreprise

## Conclusion

Le bon statut dépend de votre situation personnelle. N'hésitez pas à consulter un expert-comptable pour une simulation personnalisée.

Avec Robi AI, quelle que soit votre structure, vous pouvez facturer facilement et en conformité !
  `,
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const content = articleContent[slug] || "Contenu à venir...";
  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      {/* JSON-LD for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            author: {
              "@type": "Organization",
              name: "Robi AI",
            },
            publisher: {
              "@type": "Organization",
              name: "Robi AI",
              logo: "https://robi.ai/logo.png",
            },
            datePublished: "2024-02-15",
            dateModified: "2024-02-15",
          }),
        }}
      />

      <article className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0D0630] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <Badge className={categoryColors[post.category]}>
              {categoryNames[post.category]}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-[#0D0630] mt-4 mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6">{post.description}</p>
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                15 février 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                8 min de lecture
              </span>
              <button className="flex items-center gap-2 hover:text-[#0D0630]">
                <Share2 className="w-4 h-4" />
                Partager
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:text-[#0D0630] prose-headings:font-bold prose-a:text-[#0D0630] prose-strong:text-[#0D0630]">
            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>").replace(/## /g, "</p><h2>").replace(/### /g, "</p><h3>").replace(/\| /g, "| ") }} />
          </div>

          {/* CTA Box */}
          <Card variant="accent" className="mt-12 text-center">
            <BookOpen className="w-12 h-12 text-[#0D0630] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#0D0630] mb-2">
              Mettez ces conseils en pratique
            </h3>
            <p className="text-gray-600 mb-6">
              Avec Robi AI, automatisez votre facturation et gagnez 10h par mois.
            </p>
            <Button href="/signup">Essayer Gratuitement</Button>
          </Card>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#0D0630] mb-8">
            Articles similaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherPosts.map((relatedPost) => (
              <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                <Card className="h-full group cursor-pointer">
                  <Badge className={categoryColors[relatedPost.category]}>
                    {categoryNames[relatedPost.category]}
                  </Badge>
                  <h3 className="text-lg font-bold text-[#0D0630] mt-4 mb-2 group-hover:text-[#BEF221] transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {relatedPost.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
