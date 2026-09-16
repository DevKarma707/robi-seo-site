# Registre des sous-traitants — Robi AI

Art. 28 et 30 du RGPD : liste des prestataires qui traitent des données
personnelles pour le compte de Robi AI, avec la finalité, les données
concernées, la localisation et le lien vers leurs conditions de traitement
(DPA). La version publique, résumée, est la section « Destinataires et
sous-traitants » de la politique de confidentialité
(`pages.privacy.subprocessorsContent`, fr/en/es).

Établi le 16/09/2026 à partir du code (`ROBI_V1_READY/functions/src`,
`robi-seo-site/src`) et des variables de production. **À mettre à jour à
chaque nouveau prestataire** — et la politique de confidentialité avec.

| Prestataire | Finalité | Données | Localisation | Transfert hors UE | Conditions de traitement |
|---|---|---|---|---|---|
| **Google Cloud / Firebase** (Auth, Firestore, Storage, Cloud Functions) | Authentification, base de données, fichiers, serveur | Compte, entreprise, clients, documents, factures | europe-west1 (Belgique) | Non | [Cloud Data Processing Addendum](https://cloud.google.com/terms/data-processing-addendum) · [Firebase DPST](https://firebase.google.com/terms/data-processing-terms) |
| **Google Gemini** (Generative Language API) | Génération de devis/factures par IA, contexte conversationnel | Contenu des demandes, extraits de documents et de fiches clients | Global (Google) | Oui — CCT via le DPA Google | [Gemini API Additional Terms](https://ai.google.dev/gemini-api/terms) · DPA Google Cloud (offre payante, pas d'entraînement sur les données) |
| **Supabase** | Base secondaire : historique de conversation, relances | Messages, identifiants utilisateur, statut des relances | À vérifier dans le projet Supabase (région choisie à la création) | Selon région | [Supabase DPA](https://supabase.com/legal/dpa) |
| **Pinecone** | Index vectoriel pour la recherche dans les documents, clients, produits | Embeddings + métadonnées (libellés, noms de clients) | `robi-main-index` — région à vérifier dans la console Pinecone | Probable (US) — CCT | [Pinecone DPA](https://www.pinecone.io/legal/dpa/) |
| **Vercel** | Hébergement du site, de l'admin et du front de l'app | Journaux techniques (IP, user-agent), données transitant par les routes API | Fonctions en cdg1 (Paris) ; edge/CDN mondial | CDN mondial — CCT | [Vercel DPA](https://vercel.com/legal/dpa) |
| **Polar** | Encaissement des abonnements Robi (checkout, webhooks) | Email, nom, adresse de facturation, historique d'achat | Polar Software Inc. (US) ; paiements via Stripe | Oui — CCT | [Polar DPA](https://polar.sh/legal/dpa) · [Privacy](https://polar.sh/legal/privacy) |
| **Stripe** | Encaissement des paiements des clients de nos utilisateurs (liens de paiement) | Données de paiement (jamais stockées chez Robi), email du payeur | UE (Stripe Payments Europe, Irlande) + US | Oui — CCT / DPF | [Stripe DPA](https://stripe.com/legal/dpa) |
| **Hostinger** (SMTP) | Envoi des emails transactionnels de l'app (documents, relances, notifications) | Email destinataire, contenu du message, pièces jointes (PDF) | UE (Lituanie) | Non | [Hostinger DPA](https://www.hostinger.com/legal/data-processing-agreement) |
| **Brevo** | Envoi et suivi de livraison des emails commerciaux (prospection B2B depuis l'admin) | Email, nom, société du prospect ; événements de livraison | France (Paris) | Non | [Brevo DPA](https://www.brevo.com/legal/termsofuse/#annex) |
| **Meta Platforms** (WhatsApp Business) | Agent WhatsApp | Numéro de téléphone, contenu des messages échangés avec Robi | Global (Meta) | Oui — CCT | [WhatsApp Business Data Processing Terms](https://www.whatsapp.com/legal/business-data-processing-terms) |
| **PostHog** | Analytics produit (parcours dans l'app), replay de session | Identifiant utilisateur, événements d'usage, erreurs JS | UE (eu.posthog.com, Francfort) | Non | [PostHog DPA](https://posthog.com/dpa) |
| **Google Analytics 4** | Mesure d'audience du site robi-app.com, sous consentement (Consent Mode) | Identifiants cookies, pages vues, IP tronquée | UE/US | Oui — CCT / DPF | [Google Ads Data Processing Terms](https://business.safety.google/adsprocessorterms/) |
| **Upstash** (Redis) | Limitation du débit des requêtes IA | Identifiant utilisateur, compteurs | Région à vérifier (console Upstash) | Selon région | [Upstash DPA](https://upstash.com/trust/dpa.pdf) |

## Prestataires sans données clients

- **Blotato** — publication des posts réseaux (contenu marketing, aucune donnée utilisateur).
- **GitHub** — code source ; **Higgsfield** — génération de visuels marketing.

## Points à trancher (Ralph)

1. **Régions à confirmer** dans les consoles : Supabase, Pinecone, Upstash. Si l'un est hors UE, la mention de transfert de la politique le couvre déjà, mais le registre doit dire lequel.
2. **Gemini** : vérifier que le projet `robi-ai-system` est bien sur l'offre payante de l'API (les données ne servent pas à l'entraînement) — c'est ce que la politique promet implicitement.
3. **DPA signés** : la plupart s'acceptent en ligne (Google, Vercel, Stripe, PostHog, Brevo) ; garder une copie PDF datée de chacun dans `~/Desktop/ROBI_PARTAGE/conformite/`.
