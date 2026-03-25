# Strategie SEO — Robi AI

## Vue d'Ensemble

Le site genere **~186 pages statiques** (SSG) en 3 langues, ciblant les freelances et independants dans 6 categories de metiers.

## Pages SEO par Type

### Pages Industries (38 x 3 langues = 114 pages)

Cible : freelances par metier. Chaque page contient :
- Hero avec nom du metier
- Pain points specifiques au metier
- Solutions Robi adaptees
- Section "Gagnez 10h/mois"
- Temoignages + Pricing + FAQ contextuelle + CTA

**Categories :**
| Categorie | Metiers |
|-----------|---------|
| BTP & Artisans | Plombier, Electricien, Macon, Peintre, Menuisier, Chauffagiste, Serrurier, Carreleur, Couvreur, Architecte |
| Tech & Digital | Developpeur, Designer UX, Data Scientist, DevOps, Product Manager |
| Creatifs | Graphiste, Photographe, Videaste, Illustrateur, Redacteur Web, Community Manager |
| Evenementiel | Traiteur, DJ, Wedding Planner, Decorateur, Photographe Mariage |
| Conseil & Services | Consultant, Coach, Avocat, Agent Immobilier, Expert-Comptable, Traducteur |
| Sante & Bien-etre | Kinesitherapeute, Osteopathe, Psychologue, Dieteticien, Sophrologue, Naturopathe |

### Pages Comparaisons (5 x 3 = 15 pages)

Cible : utilisateurs cherchant des alternatives.
- Robi AI vs Excel
- Robi AI vs Henrri
- Robi AI vs Freebe
- Robi AI vs Facture.net
- Robi AI vs Pennylane

Chaque page : tableau comparatif feature-par-feature + avantages exclusifs Robi + CTA migration.

### Pages Features (5 x 3 = 15 pages)

- Facturation par IA
- Devis Automatiques
- Relances Automatiques
- Paiement en Ligne (Stripe/PayPal)
- Tableau de Bord

Chaque page : stats, benefices, "Comment ca marche" en 3 etapes + CTA.

### Articles Blog (5 x 3 = 15 pages)

- Comment facturer son premier client
- Mentions obligatoires sur une facture
- Comment relancer un client impaye
- TJM Freelance 2024
- Micro-Entreprise vs SASU

### Outils Gratuits (3 x 3 = 9 pages)

- Calculateur de TJM
- Simulateur de Charges
- Generateur de Mentions Legales

## SEO Technique

### Sitemap (`src/app/sitemap.ts`)
- Genere automatiquement toutes les URLs
- Inclut les prefixes locale (`/fr/`, `/en/`, `/es/`)
- Ajoute les `hreflang` alternates pour chaque page

### Robots (`src/app/robots.ts`)
- Allow all crawlers
- Reference le sitemap

### JSON-LD Schema
- `SoftwareApplication` sur les pages industries
- `Article` sur les pages blog
- `Organization` global

### Meta Tags
- Title/Description dynamiques par locale
- OpenGraph tags
- Keywords cibles

## Design Tokens

| Token | Valeur | Usage |
|-------|--------|-------|
| Primary (Amethyst) | `#0D0630` | Textes, backgrounds |
| Secondary (SpaceBlue) | `#18314F` | Accents secondaires |
| Accent (Lime) | `#BEF221` | CTAs, highlights |
| Fonts | Inter/Outfit | Headings |
| Body Font | Roboto | Corps de texte |
