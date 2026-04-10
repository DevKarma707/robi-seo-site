# Guide de Déploiement - Landing Page SEO Robi AI

## Architecture

```
robi-app.com (sans www)  →  Landing page SEO (ce projet)
www.robi-app.com         →  App principale (login/dashboard) — NE PAS TOUCHER
```

## Pré-requis

- Le repo GitHub `robi-seo-site` est prêt avec tous les commits pushés sur la branche `claude/vibrant-spence`
- L'app principale est déjà déployée sur `www.robi-app.com` via Vercel

## Étapes de Déploiement

### 1. Merger la branche vers main

```bash
git checkout main
git merge claude/vibrant-spence
git push origin main
```

### 2. Créer un NOUVEAU projet Vercel

- Aller sur https://vercel.com/new
- Importer le repo GitHub `DevKarma707/robi-seo-site`
- **IMPORTANT** : C'est un projet Vercel SÉPARÉ de l'app www.robi-app.com
- Framework : Next.js (détection auto)
- Build command : `npm run build`
- Output directory : `.next`

### 3. Variables d'environnement (Vercel Settings > Environment Variables)

```
NEXT_PUBLIC_SITE_URL=https://robi-app.com
ADMIN_EMAIL=robi@robi-app.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX   # Remplacer par ton vrai ID Google Analytics 4
```

Optionnel (pour le formulaire de contact par email) :

```
RESEND_API_KEY=re_xxxxx          # Créer un compte sur resend.com si besoin
```

### 4. Configurer le domaine

- Dans Vercel > Settings > Domains du NOUVEAU projet
- Ajouter : `robi-app.com` (domaine nu, SANS www)
- Vercel te donnera les enregistrements DNS à configurer

### 5. Configuration DNS (chez ton registrar de domaine)

Ajouter un enregistrement A :

```
Type: A
Name: @ (ou vide)
Value: 76.76.21.21  (IP Vercel)
```

**IMPORTANT** : Ne PAS modifier l'enregistrement CNAME de `www` qui pointe déjà vers l'app principale.

### 6. Vérification post-déploiement

- [X] `robi-app.com` affiche la landing page SEO
- [X] `www.robi-app.com` affiche toujours l'app (login/dashboard)
- [X] Cliquer "Démarrer Gratuitement" redirige vers `https://www.robi-app.com`
- [X] Cliquer "Essayer Gratuit" (header) redirige vers `https://www.robi-app.com`
- [X] Toutes les pages pricing CTA redirigent vers `https://www.robi-app.com`
- [X] Les 3 langues fonctionnent : `/fr`, `/en`, `/es`
- [X] Google Analytics reçoit des données (si GA4 ID configuré)

## Résultat attendu

| URL                  | Affiche                              |
| -------------------- | ------------------------------------ |
| `robi-app.com`     | Landing page SEO (ce projet)         |
| `robi-app.com/fr`  | Landing page en français            |
| `robi-app.com/en`  | Landing page en anglais              |
| `robi-app.com/es`  | Landing page en espagnol             |
| `www.robi-app.com` | App principale (login) — inchangée |

## Infos projet

- **Email admin** : robi@robi-app.com
- **Repo** : DevKarma707/robi-seo-site
- **Branche** : claude/vibrant-spence (à merger vers main)
- **Pages statiques** : 207
- **Langues** : FR, EN, ES
