# 🤝 Guide de l'Affiliation - Robi AI

Ce document explique comment fonctionne et comment gérer le système d'affiliation basé sur **Tolt** et **Reditus**.

## 🏗 Architecture
L'intégration est divisée en deux parties :
1.  **Le Tracking (Frontend)** : Détecte les visiteurs venant d'un lien affilié (ex: `?ref=...`) et pose un cookie.
2.  **La Conversion (Backend)** : Un "pont" qui reçoit les paiements de Polar.sh et les transmet aux plateformes d'affiliation.

---

## 🛠 Configuration (Installation)

### 1. Variables d'Environnement
Copiez `.env.example` vers `.env.local` et remplissez les valeurs suivantes :
- `NEXT_PUBLIC_TOLT_ID` : Votre ID de programme.
- `NEXT_PUBLIC_REDITUS_ID` : Vos scripts Reditus.
- `TOLT_API_KEY` & `REDITUS_API_KEY` : Pour que le serveur puisse envoyer les ventes.
- `POLAR_WEBHOOK_SECRET` : Indispensable pour sécuriser le pont.

### 2. Configuration Polar.sh
Dans votre dashboard Polar :
1. Allez dans **Settings -> Webhooks**.
2. URL : `https://votre-site.com/api/webhooks/polar`
3. Événements : `order.created` et `subscription.created`.

---

## 🧪 Comment tester ?

### Test du Tracking
1. Ouvrez votre site avec un paramètre bidon : `https://robi-app.com/?ref=test`.
2. Vérifiez dans la console (F12) que vous voyez le message : `[AFFILIATE] Propagation du ref...`.
3. Cliquez sur un bouton "Démarrer" : le paramètre `ref=test` doit suivre l'URL vers `go.robi-app.com`.

### Test du Webhook (Simulation de vente)
Utilisez le script de test pour simuler une vente Polar localement :
```bash
chmod +x scratch/test-webhook.sh
./scratch/test-webhook.sh
```
*Vérifiez ensuite vos dashboards Tolt/Reditus (en mode test) pour voir si la transaction apparaît.*

---

## 🏪 Checklist Reditus Marketplace
Pour être accepté sur la marketplace Reditus et attirer des influenceurs :
- [ ] **Description claire** : Expliquez ce qu'est Robi AI (Facturation IA).
- [ ] **Commissions** : Réglez au moins 20% ou 30% pour être attractif.
- [ ] **Logo** : Utilisez une image haute résolution.
- [ ] **Lien Marketing** : Pointez vers `https://robi-app.com`.

---

## 💡 Support Technique
Si une vente ne remonte pas :
1. Vérifiez les logs de Vercel (ou de votre serveur) pour la route `/api/webhooks/polar`.
2. Assurez-vous que l'email utilisé pour le test est bien celui qui a cliqué sur le lien d'affilié.
