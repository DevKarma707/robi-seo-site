# 📋 Suivi des tâches - Site SEO Robi

## Historique (tâches terminées)
- [x] Initialisation du suivi des tâches et planification
- [x] Intégration des "Spline Skills" dans `.agent/skills/spline`
- [x] Installation et configuration du MCP Spline
- [x] Préparation du site SEO pour les animations Spline
- [x] Créer le composant `SplineScene.tsx` dans `robi-seo-site`
- [x] Pousser le site SEO sur Git
- [x] Configurer les domaines (www pour SEO, root pour App)
- [x] Mettre à jour les métadonnées SEO et canonicals
- [x] Mise à jour des canonicals vers robi-app.com
- [x] Mise à jour de `src/data/seo-config.ts`
- [x] Mise à jour de `src/app/sitemap.ts`
- [x] Mise à jour de `src/app/robots.ts`
- [x] Mise à jour des layouts (`layout.tsx`)
- [x] Déploiement sur Vercel (via Push Git)
- [x] Redirect CTA buttons (Header, Hero, Pricing, Footers) vers go.robi-app.com (commit 565a098 + fix Pricing)

## Tâches en cours
- [x] Correction stratégie d'URLs (canonicals incohérents)
    - [x] Clarifier: robi-app.com = SEO, www.robi-app.com = app OU go.robi-app.com = app
    - [x] Corriger les canonicals SEO -> robi-app.com (sans www)
    - [x] Aligner tous les CTA vers le même sous-domaine app
- [x] Redéploiement du site SEO avec la dernière version Git
    - [x] Corriger les URLs dans le code
    - [x] Commit + Push
    - [/] Vérifier le déploiement auto Vercel (en cours)
- [ ] Configuration DNS Hostinger (en attente utilisateur)
    - [ ] Configurer DNS pour robi-app.com -> Vercel (site SEO)
    - [ ] Configurer DNS pour www.robi-app.com -> App (Vercel/autre)
    - [ ] Tester les accès

- [x] [SEO International] Ajouter le Portugais Brésilien (`pt-BR`)
- [x] [SEO International] Ajouter le Français pour le Maroc (`fr-MA`)
- [x] [SEO International] Configurer la contextualisation des devises (`BRL`, `MAD`, `EUR`, `USD`) dans `config.ts`
- [x] [SEO International] Option B : Implémentation LATAM Granulaire (`es-419`, `es-MX`, `es-CO`) avec devises MXN/COP
- [x] [SEO International] Fix : Fallback temporaire des dictionnaires dans `dictionaries.ts` pour éviter le crash des nouvelles routes (500 Server Error)
- [x] [SEO International] Traduction des sections Hero et Pricing en `pt-BR` avec prix locaux para test utilisateur
- [x] [SEO International] Traduction 100% complète de l'application en Portugais Brésilien (`pt-BR.json`)
- [x] [SEO International] Déploiement en production via Push Git (`feat(seo): international expansion...`)
- [x] [UI Hotfix] Retrait du mini-scroll horizontal indésirable sur les conteneurs de la section Pricing (Desktop)
- [x] [Vercel Hotfix] Modification du type `LocaleStrings` dans `seo-config.ts` pour résoudre le crash de build TypeScript lié à l'extension des pays.
- [x] [SEO International] Architecture de "Fallback Intelligent" : `es-MX`, `es-CO` héritent de l'espagnol pur par défaut, et `pt-BR` de l'anglais au lieu du français.
- [x] [SEO Content] Traduction complète et adaptation (fiscalité, plafonds) des 5 articles de Blog SEO pour le Brésil (`pt-BR`).
- [x] [Vercel Hotfix] Injection des propriétés UI `blog.categories` manquantes dans le dictionnaire `pt-BR.json` causant des erreurs 500 au Pre-Render.
- [x] [Architecture Core] Implémentation d'un utilitaire `deepMerge` dans le dictionnaire pour que chaque langue utilise un Fallback Absolu (FR / EN). Vercel est désormais totalement immunisé contre tout crash dû à des objets JSON incomplets.
- [x] [Brésil / PIX] Intégration du message PIX dans la section Paiements pour booster la conversion locale.
- [x] [Localisation / Social Proof] Adaptation des témoignages avec des noms et contextes locaux pour le Maroc, le Mexique et la Colombie.
- [x] [Pricing / Automation] Automatisation du calcul des économies et des prix mensuels dans les cartes de tarifs pour une cohérence parfaite inter-marchés.
- [x] [SEO Advanced] Implémentation du Schéma de Données Structurées BreadcrumbList pour un affichage premium dans les SERP Google.
- [x] [Build Hotfix] Correction d'une erreur de syntaxe JSX (fragment manquant) dans `page.tsx` ayant causé l'échec du build Vercel.

