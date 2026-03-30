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
- [x] Redirect CTA buttons vers app.robi-app.com (commit 565a098)

## Tâches en cours
- [/] Correction stratégie d'URLs (canonicals incohérents)
    - [/] Clarifier: robi-app.com = SEO, www.robi-app.com = app OU app.robi-app.com = app
    - [ ] Corriger les canonicals SEO -> robi-app.com (sans www)
    - [ ] Aligner tous les CTA vers le même sous-domaine app
- [/] Redéploiement du site SEO avec la dernière version Git
    - [ ] Corriger les URLs dans le code
    - [ ] Commit + Push
    - [ ] Vérifier le déploiement auto Vercel
- [ ] Configuration DNS Hostinger (en attente utilisateur)
    - [ ] Configurer DNS pour robi-app.com -> Vercel (site SEO)
    - [ ] Configurer DNS pour www.robi-app.com -> App (Vercel/autre)
    - [ ] Tester les accès
