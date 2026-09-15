# Prospection Robi — mode d'emploi

Version lisible : https://claude.ai/artifact/NkMT6tt4Det1LwVby5svii (copie : `docs/PROSPECTION.html`).

1. **Trouver** — `/robi-acquisition <segment> <n>` → fiches créées directement dans l'admin (Acquisition). Rien à importer.
2. **Écrire** — `/robi-outreach <segment> <n>` → 2 variantes + reco posées sur chaque fiche (badge A/B).
3. **Envoyer** — robi-app.com/admin → Acquisition → fiche → (A ou B) → Envoyer.
4. **Suivi automatique** — livraison par webhook Brevo, réponses par cron IMAP chaque matin, bouton « Vérifier les réponses ».

Règles : ≤ 30 mails/jour · prospection uniquement depuis `hello@mail.robi-app.com` · jamais d'email deviné.
