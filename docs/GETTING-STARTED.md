# Getting Started — Robi AI SEO Site

## Prerequisites

- Node.js 18+
- npm ou yarn

## Installation

```bash
cd robi-seo-site
npm install
```

## Dev Server

```bash
npm run dev
```

Ouvre http://localhost:3000 (redirige auto vers `/fr`)

## Build Production

```bash
npm run build
```

Genere ~186 pages statiques en SSG.

## Deploiement

### Vercel (recommande)

1. Push sur GitHub
2. Connecter le repo sur vercel.com
3. Build auto sur chaque push

### Autre

```bash
npm run build
npm run start
```

## Fichiers Cles a Connaitre

| Fichier | Role |
|---------|------|
| `src/data/seo-config.ts` | Toutes les donnees SEO (industries, blog, features) |
| `src/lib/i18n/locales/*.json` | Traductions UI (fr, en, es) |
| `src/app/[locale]/layout.tsx` | Layout principal avec Header/Footer |
| `src/app/[locale]/page.tsx` | Landing page |
| `src/components/sections/` | Sections reutilisables (Hero, CTA, FAQ...) |

## Commandes Utiles

```bash
npm run dev          # Dev server (Turbopack)
npm run build        # Build production
npm run start        # Serveur production
npm run lint         # ESLint
```

## Repo GitHub

https://github.com/DevKarma707/robi-seo-site

Branche principale : `feat/seo-landing-page`
