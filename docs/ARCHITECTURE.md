# Robi AI SEO Site — Architecture

## Stack Technique

| Techno | Version | Usage |
|--------|---------|-------|
| Next.js | 16.1.6 | Framework (App Router + Turbopack) |
| React | 19.2.3 | UI Library |
| TypeScript | 5 | Typage |
| Tailwind CSS | 4 | Styling |
| MDX | 3.1.1 | Contenu Markdown + React |
| Lucide React | 0.564 | Icones |

## Structure du Projet

```
robi-seo-site/
├── public/                     # Assets statiques
│   ├── logo.svg
│   ├── favicon.svg
│   └── images/                 # Screenshots app
├── src/
│   ├── app/
│   │   ├── globals.css         # Styles globaux Tailwind
│   │   ├── robots.ts           # robots.txt dynamique
│   │   ├── sitemap.ts          # sitemap.xml avec hreflang
│   │   └── [locale]/           # Routes i18n (fr/en/es)
│   │       ├── layout.tsx      # Layout principal (Header + Footer)
│   │       ├── page.tsx        # Landing page
│   │       ├── pricing/        # Page tarifs
│   │       ├── industries/     # 38 pages industries
│   │       │   ├── page.tsx    # Liste par catégorie
│   │       │   └── [slug]/     # Page individuelle
│   │       ├── features/       # 5 pages fonctionnalités
│   │       │   ├── page.tsx    # Liste features
│   │       │   └── [slug]/     # Page individuelle
│   │       ├── blog/           # 5 articles
│   │       │   ├── page.tsx    # Liste articles
│   │       │   └── [slug]/     # Article complet
│   │       ├── comparisons/    # 5 pages comparatifs
│   │       │   └── [slug]/     # Robi vs X
│   │       └── tools/          # 3 outils gratuits
│   │           ├── page.tsx    # Liste outils
│   │           ├── calculateur-tjm/
│   │           ├── simulateur-charges/
│   │           └── generateur-mentions-legales/
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── Header.tsx      # Nav + dropdown + language switcher
│   │   │   └── Footer.tsx      # Footer multicolonne
│   │   ├── sections/
│   │   │   ├── Hero.tsx        # Section hero configurable
│   │   │   ├── Features.tsx    # Grille fonctionnalités
│   │   │   ├── Process.tsx     # 4 etapes du processus
│   │   │   ├── Payments.tsx    # Intégrations paiement
│   │   │   ├── Testimonials.tsx
│   │   │   ├── Pricing.tsx     # Tableau de prix
│   │   │   ├── FAQ.tsx         # Accordion FAQ
│   │   │   └── CTA.tsx         # Call-to-action
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── LanguageSwitcher.tsx
│   ├── data/
│   │   └── seo-config.ts      # Config SEO multilingue (38 industries, 5 comparisons, etc.)
│   ├── lib/
│   │   └── i18n/
│   │       ├── config.ts       # Locales: fr, en, es
│   │       ├── dictionaries.ts # Chargeur de dictionnaires
│   │       └── locales/
│   │           ├── fr.json     # Traductions francais
│   │           ├── en.json     # Traductions anglais
│   │           └── es.json     # Traductions espagnol
│   └── middleware.ts           # Detection locale auto
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Nombre de Pages Generees (SSG)

| Type | Nombre | x3 locales |
|------|--------|------------|
| Landing | 1 | 3 |
| Industries | 38 | 114 |
| Features | 5 | 15 |
| Blog | 5 | 15 |
| Comparisons | 5 | 15 |
| Tools | 3 | 9 |
| Pricing | 1 | 3 |
| Listes (industries, blog, features, tools) | 4 | 12 |
| **Total** | **~62** | **~186** |
