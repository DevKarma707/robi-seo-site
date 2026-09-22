---
tags: [robi, seo, blog, import, gsc]
créé: 2026-09-22
---

# 📥 Import du batch 4 — réponse à l'export GSC du 22/09/2026

5 articles issus de l'analyse de l'export Search Console du 22 septembre 2026
(`content/seo/gsc-analyse-2026-09-22.md`). Chacun attaque un gisement **mesuré**,
pas une intuition.

Fichier : `content/blog/articles-batch-4-2026-10.json`

## Comment publier (2 min)

1. **robi-app.com/admin** → onglet **Blog** → **« Importer JSON »**.
2. Copier tout le contenu de `articles-batch-4-2026-10.json`, coller, valider.
3. Les 5 articles sont créés d'un coup, en **`published: false`** — les passer en
   ligne selon le planning ci-dessous.
4. **Google Search Console** → demander l'indexation des URLs le jour de la mise
   en ligne (les 3 locales `/fr`, `/en`, `/es`).

*(Réimport après correction : cocher « Écraser si le slug existe déjà ».)*

## Les 5 articles et le gisement visé

| # | Slug | Requête cible | Gisement mesuré (export 22/09) |
|---|------|---------------|--------------------------------|
| 1 | `ai-invoice-generator` | `invoice ai`, `ai invoice` | **417 imp · 1 clic · pos 20,1** sur 22 requêtes. US 397 imp / 0 clic |
| 2 | `logiciel-facturation-therapeutes-praticiens` | `logiciel facturation sophrologue` | 83 imp · 0 clic · **pos 27,33** — l'enrichissement de la page métier n'a rien donné |
| 3 | `numerotation-factures-regles-2026` | `numérotation des factures` | Gap Cluster C + preuve produit + maillage vers le cluster Factur-X (pos 7–10) |
| 4 | `facture-acompte-et-avoir-regles-modeles` | `facture d'acompte`, `facture d'avoir` | Gap Cluster C, aucune page sur le site |
| 5 | `programa-facturacion-con-ia-autonomos` | `factura ia`, `ia para hacer facturas` | `/es/facture-ai` = **meilleur CTR du site** (2,31 % à pos 9,89) ; ES 210 + MX 45 + CO 44 imp |

Tous en FR + EN + ES, avec TL;DR + FAQ (le rendu blog génère le **FAQPage
JSON-LD** automatiquement). Couvertures câblées sur des images existantes de
`public/covers/` : aucun upload à faire.

**L'article n°1 est écrit nativement en anglais**, pas traduit du français : c'est
le seul dont le retour est chiffrable aujourd'hui, et la page `/en/facture-ai`
stagne en page 2 (pos 14,71) avec 893 impressions et 7 clics.

## Maillage interne

```
        pilier existant /facture-ai  (FR pos 9,75 · EN pos 14,71 · ES pos 9,89)
                  ↑
  (1) ai-invoice-generator ──► /en/facture-ai   ← objectif : sortir de la page 2
       │
       ├──► (3) numerotation ──┐
       └──► verifier-factur-x  │
                               │
  (4) acompte-et-avoir ────────┤──► verifier-factur-x
       └──► (3) numerotation ──┘
  (3) numerotation ──► mentions-obligatoires-facture
                    └► factur-x-c-est-quoi

  (2) therapeutes ──► 5 pages /industries (sophrologue, osteopathe,
                      naturopathe, kinesitherapeute, psychologue)
                   └► mention-tva-293b-cibs, mentions-obligatoires, numerotation

  (5) programa-ia ──► facturacion-electronica-mexico-guia-cfdi
```

L'article n°2 est le seul à **mailler vers les pages industries** : c'est l'angle
d'attaque choisi après l'échec du levier « enrichir la page métier ».

## ⚠️ Garde-fou honnêteté — périmètre produit dit explicitement

Conformément à `SEO-GEO-STRATEGY.md` §2, chaque article porte un encadré
« ce que Robi ne fait pas ». Les limites énoncées, toutes vérifiées dans le code :

| Limite annoncée | Vérification |
|---|---|
| Pas de type **facture d'avoir** (UNTDID `381`) ni **rectificative** (`384`) | `types.ts:255` — `type: 'invoice' \| 'estimate'` |
| Pas de **facture d'acompte** comme document distinct (`386`) | idem ; l'acompte est une déduction (`downPayment` dans `utils/documentLabels.ts`) |
| Pas une **PDP** française | positionnement produit, déjà acté dans le cluster Factur-X |
| Pas un **programme homologué AEAT** (Verifactu) | dit noir sur blanc dans l'article n°5 |
| Pas un **logiciel de comptabilité** | articles n°2 et n°5 |
| Pas de **tiers payant / télétransmission** santé | article n°2 |

L'article n°5 est celui qui demande le plus d'attention : il cible des requêtes
espagnoles alors que **Robi ne couvre pas l'obligation Verifactu**. Le parti pris
est de le dire en toutes lettres et de recentrer l'article sur la distinction
« l'IA pour écrire / un système homologué pour être conforme ». C'est honnête,
et c'est aussi ce qui le rend citable.

## Affirmations produit — toutes vérifiées dans le code

Vérifiées contre le dépôt `DevKarma707/ROBI_AI` :

| Affirmation dans les articles | Source |
|---|---|
| Numérotation **transactionnelle** (pas de doublon) | `services/db.ts` — `reserveNextDocNumber` via `runTransaction` |
| Numérotation **auto-réparante** (plancher) | `services/db.numbering.test.ts` — « un plancher plus haut que le compteur fait foi » |
| **50 réservations sans doublon ni trou** (`001` → `050`) | `services/db.numbering.test.ts` |
| Séquences **distinctes** factures / devis (`FAC-` / `DEV-`) | idem |
| **Préfixe personnalisable** | idem — `invoicePrefix` |
| Profil **EN 16931**, XML **UN/CEFACT CII** | `utils/facturx/xmlGenerator.ts` |
| **PDF/A-3** avec `factur-x.xml` attaché | `utils/facturx/pdfA3.ts` |
| **Validation avant export** des mentions manquantes | `utils/facturx/validate.ts` |
| Calculs **en centimes entiers** (règles `BR-CO-*`) | `utils/facturx/xmlGenerator.ts` |
| Acompte en déduction (« Net à payer après acompte ») | `utils/documentLabels.ts` — `downPayment`, `netToPayAfterDeposit` |
| Backend en **`europe-west1`** | `CLAUDE.md` + `services/firebase.ts` |
| Prix : gratuit 2 docs/mois · 14 €/mois · 89 €/an · 149 €/2 ans · Lifetime 59 € (1 000 premiers) | page pricing live + `CLAUDE.md` |

Aucun chiffre, prix ou témoignage inventé. Les chiffres GSC cités dans ce README
viennent de l'export du 22/09/2026, pas d'une estimation.

## Sources réglementaires citées

- Numérotation : **article 242 nonies A** de l'annexe II au CGI
- Conservation : **L. 123-22** du Code de commerce (10 ans) · **L. 102 B** du LPF (6 ans)
- Acomptes : **article 289** du CGI · exigibilité **article 269** · TVA sur acomptes de
  biens depuis le **1er janvier 2023**
- Exonération soins : **article 261, 4-1°** du CGI
- Franchise en base : **293 B du CGI** jusqu'au 31/12/2026, **L. 233-3 du CIBS** à
  partir du 01/01/2027 (ordonnance n° 2026-671)
- Types de documents : **UNTDID 1001** — `380` / `381` / `384` / `386`, champ `BT-3`
- Verifactu : **Ley 11/2021** + **Real Decreto 1007/2023**

## Planning de publication proposé

Deux par semaine, après le cluster Factur-X (qui finit le 29/09).

| Date | Article |
|---|---|
| ven. 02/10 | (1) `ai-invoice-generator` — priorité absolue |
| mar. 06/10 | (2) `logiciel-facturation-therapeutes-praticiens` |
| ven. 09/10 | (3) `numerotation-factures-regles-2026` |
| mar. 13/10 | (4) `facture-acompte-et-avoir-regles-modeles` |
| ven. 16/10 | (5) `programa-facturacion-con-ia-autonomos` |

## Ce qui rapporte plus que ces 5 articles

Dans l'ordre, à faire **avant** ou **en parallèle** :

- [ ] **Publier `logiciel-gestion-factures-ia`**, seul article réellement hors ligne
      (absent de tout l'export), en ajoutant les formulations **« gen AI »**,
      **« IA générative »** et **« GPT »** au titre et au corps. La variante
      `logiciel de gestion des factures avec gen ai` pèse 66 des 141 impressions
      de la famille, à elle seule.
- [ ] **Travailler `/en/facture-ai`** : liens internes depuis l'article n°1 et le
      blog EN, annuaires IA anglophones. 893 imp · 7 clics · pos 14,71.
- [ ] **Passer `go.robi-app.com` en `noindex`** : le sous-domaine de l'app est
      indexé, 194 impressions à pos 35,31, et concurrence le site SEO.
      *(Traité dans le dépôt `ROBI_AI`, pas ici.)*

## Trou produit révélé par l'article n°4

L'article n°4 va capter des requêtes `facture d'acompte` et `facture d'avoir`
que **Robi ne sait pas traiter aujourd'hui** (pas de type de document `381`,
`384` ni `386`). L'article le dit honnêtement, mais c'est un écart entre la
demande captée et le produit livré.

À trancher par Ralph : soit on assume l'article comme purement informationnel,
soit ces trois types de documents entrent dans la roadmap. Le bâtiment et
l'événementiel, deux cibles des pages industries, facturent presque toujours
par acomptes.
