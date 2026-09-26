---
tags: [robi, seo, blog, import]
créé: 2026-06-29
---

# 📥 Import des 3 articles « cluster facture AI »

3 articles SEO prêts à publier, qui renforcent la page pilier `/facture-ai`.
Chacun lie vers `/facture-ai` et `/tools/generateur-facture` (maillage interne).

## Fichiers (dans ce dossier)

- `blog-import-facture-ai.json` → le JSON des 3 articles (FR + EN + ES, tldr + FAQ)
- `covers/` → copies de travail des 3 images (les originales servies sont dans `public/covers/`)

Les couvertures sont **déjà câblées** : chaque article a son `coverImage` rempli
avec une URL `https://robi-app.com/covers/...`. **Aucun upload manuel à faire** —
les images sont commitées dans `public/covers/` et servies par le site.

| Article | Slug | Couverture (déjà liée) |
|---------|------|------------------------|
| Créer une facture avec l'IA | `creer-facture-avec-ia` | `/covers/creer-facture-avec-ia.png` |
| Facture vocale | `facture-vocale-creer-en-parlant` | `/covers/facture-vocale.png` |
| Facturation électronique 2026-2027 | `facturation-electronique-2026-2027-freelance` | `/covers/facturation-electronique-2026.png` |

## Comment publier (2 min)

1. Va sur **robi-app.com/admin** → onglet **Blog**.
2. Clique **« Importer JSON »**.
3. Ouvre `blog-import-facture-ai.json`, copie **tout** le contenu, colle-le dans la fenêtre, valide.
   → Les 3 articles sont créés d'un coup, **avec leur image de couverture**, en ligne dès l'import (`published: true`).
4. Dans **Google Search Console**, demande l'indexation des 3 URLs `/fr/blog/<slug>`.

*(Pré-requis : que le commit qui ajoute `public/covers/*.png` soit déployé — fait en même temps que la livraison de ces fichiers.)*

> Astuce : si tu réimportes (correction), coche **« Écraser si le slug existe déjà »** dans la fenêtre d'import.

## Pourquoi ces 3 articles

Ils forment un **cluster** autour de la page pilier : Google comprend que `/facture-ai`
est le centre d'un sujet traité en profondeur. Chaque article cible une requête
distincte (créer une facture avec l'IA / facture vocale / réforme 2026-2027) et
renvoie vers la pilier + l'outil gratuit. C'est l'étape « cluster blog » du plan SEO.

## Prochains articles possibles (même cluster)

- « Facture AI vs ChatGPT : peut-on faire ses factures avec ChatGPT ? »
- « Modèle de facture auto-entrepreneur 2026 (gratuit) »
- « Comment être payé plus vite : relances de factures par IA »
