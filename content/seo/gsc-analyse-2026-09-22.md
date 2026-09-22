# Analyse Search Console — robi-app.com (export du 22/09/2026, 3 derniers mois)

Fenêtre réelle : **20/06/2026 → 19/09/2026**. Remplace l'analyse du 14/09.

## Chiffres clés

- **95 clics · 4 812 impressions · CTR 1,97 %** (contre 81 · 4 404 · 1,84 % au 14/09)
- Hors bruit de marque : ~90 clics · **4 249 impressions** · CTR 2,1 %
- Mobile : 59 clics · 2 352 imp · pos **7,38** · Ordinateur : 36 clics · 2 431 imp · pos **16,65**

| Mois | Impressions | Clics |
|---|---|---|
| Juin (à partir du 20) | 124 | 7 |
| Juillet | 1 297 | 23 |
| Août | 2 020 | 37 |
| Septembre (19 j) | 1 371 | 28 |

Septembre est au rythme d'environ 2 170 impressions — la croissance continue mais
s'aplatit. Le CTR progresse légèrement.

## Le constat n°1 : l'anglais est un gisement bloqué

| Marché | Impressions | Clics | Position |
|---|---|---|---|
| États-Unis | **397** | **0** | 17,47 |
| Canada | 177 | 1 | 12,06 |
| Royaume-Uni | 174 | 2 | 15,74 |
| Pays-Bas / ÉAU / Australie / NZ / Irlande / Afrique du Sud | 148 | 1 | 11–36 |
| **Total anglophone** | **~896** | **4** | — |

La famille de requêtes anglaise « AI invoice » : **22 requêtes, 417 impressions,
1 clic, position moyenne pondérée 20,1.**

| Requête | Imp. | Clics | Position |
|---|---|---|---|
| invoice ai | **243** | 0 | 15,25 |
| ai invoice | 100 | 1 | 28,60 |
| ai generated invoice | 15 | 0 | 28,80 |
| ai generate an invoice | 13 | 0 | 24,15 |
| ai invoices | 8 | 0 | 14,50 |
| ai invoice maker | 7 | 0 | 52,57 |
| ai invoice generator | 5 | 0 | 20,40 |
| + 15 variantes (invoice generator ai, ai create invoice, invoicing ai…) | 26 | 0 | 12–52 |

`/en/facture-ai` : 893 imp · 7 clics · **pos 14,71** (contre 871 · 6 · 15,50 au
14/09). Le levier 1 du 14/09 n'a pas été actionné : la page est toujours en page 2
et la réserve a grossi.

## Ce qui a bougé depuis le 14/09

| Levier du 14/09 | Résultat mesuré |
|---|---|
| 1. `/en/facture-ai` en page 1 | ❌ pos 15,50 → 14,71. Toujours page 2. Non actionné. |
| 2. Récupérer la variante « IA » en FR | 🟡 `facture ia` 12,90 → **11,38** (185 imp, 2 clics). Progresse, reste loin de `facture ai` (pos 3,99). |
| 3. Article « gestion des factures avec IA » | ❌ Article écrit, **absent de l'export** → pas en ligne. 141 imp l'attendent. |
| 4. Enrichir la page sophrologue | ❌ **Aucun effet** : 83 imp · 0 clic · pos 27,33 (contre 78 · pos 27). Le contenu est dans `industry-content.ts` mais la position n'a pas bougé. |

## Corrections à mes conclusions du 14/09 et à mon inventaire

1. **Le cluster Factur-X EST en ligne et indexé.** Le `published: false` des JSON de
   `content/blog/` est une donnée de semence périmée — l'état réel vit dans Firestore.
   `factur-x-c-est-quoi-format-facture-electronique` apparaît sur 5 locales :
   `/es` (23 imp, pos 8,26), `/en-US` (7 imp, pos **4,57**), `/pt-PT` (3), `/fr` (1,
   pos 10), `/en-IE` (1, pos 9).
2. **Nouveau signal Factur-X** : 5 requêtes, 14 impressions, **position moyenne 8,6**
   (`factura x` 9,80 · `factur-x` 8,25 · `factura x para que sirve` 7,00 ·
   `factur x` 9,00 · `factur-x format` 7,00). Volume minuscule, positions
   excellentes → le contenu est bon, la demande n'est pas encore là. À surveiller,
   l'obligation de réception date du 1er septembre.
3. **Seul `logiciel-gestion-factures-ia` est réellement hors ligne** — il n'apparaît
   sur aucune requête ni page de l'export.
4. **Plus d'articles en ligne que les 17 des JSON du dépôt** : `creer-facture-avec-ia`,
   `facture-vocale-creer-en-parlant`, `relancer-client-impaye`,
   `facturation-electronique-2026-2027-freelance`,
   `facturacion-electronica-mexico-guia-cfdi` rankent tous et ne sont dans aucun JSON.

## Pages qui performent

| Page | Imp. | Clics | Position |
|---|---|---|---|
| /fr/facture-ai | 1 750 | **53** (56 % des clics) | 9,75 |
| /fr | 679 | 10 | 10,80 |
| /en/facture-ai | 893 | 7 | 14,71 |
| /es/facture-ai | 303 | 7 | **9,89 — meilleur CTR du site (2,31 %)** |
| /en-AE/pricing | 187 | 3 | 7,89 |
| /en-US | 241 | 2 | 12,15 |
| /fr/blog/creer-facture-avec-ia | 81 | 3 | **6,52 — meilleur article** |

## Deux trouvailles techniques

- **`go.robi-app.com` : 194 impressions, pos 35,31, 1 clic.** Le sous-domaine de
  l'app est indexé et concurrence le site SEO. À passer en `noindex`.
- **Poche inattendue aux Émirats** : `/en-AE/pricing` 187 imp · 3 clics · pos 7,89,
  plus `/en-AE/tools`, `/en-AE/industries/expert-comptable`, `/en-AE/industries/avocat`.
  La locale en-AE ranke bien sans qu'on l'ait travaillée.

## À ignorer

**Bruit de marque Robi Axiata : 63 requêtes, 563 impressions (11,7 % du total),
5 clics.** « robi » seul = 436 imp. Bangladesh 338 imp / 7 clics, Inde 83, Pakistan 62,
Philippines 29. Ce bruit gonfle la courbe d'impressions — lire la croissance hors bruit.
