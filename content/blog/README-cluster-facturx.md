---
tags: [robi, seo, blog, import, factur-x]
créé: 2026-07-31
---

# 📥 Import du cluster « Factur-X / facture électronique 2026 »

5 articles SEO qui exploitent le seul avantage concurrentiel non copiable de
Robi à cette date : **l'obligation tombe le 1er septembre 2026 et Robi est
déjà conforme**. Cinq semaines d'avance à convertir en trafic.

Fichier : `content/blog/articles-cluster-facturx-2026.json`

## Comment publier (2 min)

1. **robi-app.com/admin** → onglet **Blog** → **« Importer JSON »**.
2. Copier tout le contenu de `articles-cluster-facturx-2026.json`, coller, valider.
3. Les 5 articles sont créés d'un coup. ⚠️ Ils sont en **`published: false`** —
   les passer en ligne un par un depuis l'admin, ou éditer le JSON avant import.
4. **Google Search Console** → demander l'indexation des 5 URLs `/fr/blog/<slug>`.

*(Réimport après correction : cocher « Écraser si le slug existe déjà ».)*

## Les 5 articles

| # | Slug | Requête cible | Rôle |
|---|------|---------------|------|
| 1 | `factur-x-c-est-quoi-format-facture-electronique` | `factur-x c'est quoi` | **Pilier du cluster** — définition du format |
| 2 | `facture-electronique-septembre-2026-etes-vous-pret` | `facture électronique septembre 2026` | **Urgence** — deadline, à republier en août |
| 3 | `logiciel-facture-electronique-2026-comment-choisir` | `logiciel facture électronique 2026` | **Commercial** — critères d'achat, intent transactionnel |
| 4 | `verifier-facture-factur-x-valide` | `vérifier facture factur-x` | **Long-tail technique** — faible concurrence |
| 5 | `factur-x-ubl-chorus-pro-pdp-glossaire` | `factur-x ubl différence` | **Glossaire** — capte les requêtes de définition |

Tous en FR + EN + ES, avec TL;DR + FAQ (le rendu blog génère le **FAQPage
JSON-LD** automatiquement — cf. `src/app/[locale]/blog/[slug]/page.tsx`).

Couvertures déjà câblées sur des images existantes de `public/covers/` :
aucun upload à faire.

## Maillage interne

Le cluster est refermé sur lui-même et raccroché à l'existant :

```
        pilier existant /facture-ai
                  ↑
  (1) factur-x c'est quoi  ←──── 4 liens entrants (centre du cluster)
       ↓              ↓
  (2) septembre 2026   (4) vérifier
       ↓              ↓
  (3) logiciel ────────┘
  (5) glossaire ───────┘

  + 4 liens vers l'article existant mention-tva-facture-2026-293b-cibs
  + 1 lien vers facturation-electronique-2026-auto-entrepreneur
```

## ⚠️ Garde-fou honnêteté (respecté dans les 5 articles)

Conformément à `SEO-GEO-STRATEGY.md` §2, les articles distinguent
explicitement **générer le format** (ce que Robi fait) de **transmettre via une
PDP** (ce que Robi n'est pas). L'article n°3 le dit noir sur blanc dans un
paragraphe « Ce que Robi ne prétend pas être ».

Cette transparence est un atout SEO : c'est la question que se posent les
lecteurs, et aucun concurrent n'y répond clairement.

## Affirmations produit — toutes vérifiées dans le code

Vérifiées contre `~/Desktop/ROBI_V1_READY/utils/facturx/` :

| Affirmation dans les articles | Source |
|---|---|
| Profil **EN 16931** | `xmlGenerator.ts` — `urn:cen.eu:en16931:2017` |
| **PDF/A-3** avec `factur-x.xml` attaché | `pdfA3.ts` |
| XML **UN/CEFACT CII** | `xmlGenerator.ts` |
| **Validation avant export** des mentions manquantes | `validate.ts` — `validateFacturX()` |
| Calculs **en centimes entiers** (règles `BR-CO-*`) | `xmlGenerator.ts` |
| Motif d'exonération **293 B dans le XML** (valable jusqu'au 31/12/2026, puis L. 233-3 du CIBS) | `xmlGenerator.ts` — catégorie TVA `E` + BT-121 |
| Prix : gratuit 4 factures ou devis/mois · 14 €/mois · 89 €/an · 149 €/2 ans · Lifetime 59 € (1 000 premiers) | page pricing live + `CLAUDE.md` |

Aucun chiffre, prix ou témoignage inventé.

## Mise à jour du 14 septembre 2026

- Article n°2 réécrit pour l'après-échéance (plus de décompte, section « pas encore raccordé ? »). Slug conservé pour ne pas casser les liens internes.
- Article n°3 : vrais prix Robi (abonnements + Lifetime), plus de « pas d'abonnement ».
- Mention TVA : report du CIBS au 1er janvier 2027 (ordonnance n° 2026-671), note ajoutée dans les articles 3, 4 et 5.
- Dates alignées sur le planning de publication (2 par semaine).

## Planning de publication

| Date | Article |
|---|---|
| mar. 15/09 | (2) facture-electronique-septembre-2026-etes-vous-pret |
| ven. 18/09 | (1) factur-x-c-est-quoi-format-facture-electronique |
| mar. 22/09 | (3) logiciel-facture-electronique-2026-comment-choisir |
| ven. 25/09 | (4) verifier-facture-factur-x-valide |
| mar. 29/09 | (5) factur-x-ubl-chorus-pro-pdp-glossaire |

## Ce qui reste à faire

- [ ] Importer le JSON dans l'admin (`published: false`), puis publier selon le planning
- [ ] Demander l'indexation GSC de chaque article le jour de sa publication
- [x] Ajouter les guides à `llms.txt`
- [ ] Le lien `/fr/blog/mentions-obligatoires-facture` **est mort** : il est
      référencé par l'article publié `facturation-electronique-2026-auto-entrepreneur`
      et par `src/data/seo-config.ts`, mais aucun article ne porte ce slug.
      Bug préexistant, à corriger séparément.
