# Marque « Robi AI » : fiche Wikidata et annuaires (textes prêts à coller)

Préparé le 25/10/2026 (chantier SEO 4). **Rien n'a été inscrit** : chaque
inscription demande un compte, c'est à Ralph de la faire. Ce fichier complète
`BACKLINKS.md` (liste des annuaires et suivi), il ne le remplace pas.

Pourquoi : « robi » seul appartient à la chanteuse Robi (Wikipédia, Spotify) et à
l'opérateur télécom Robi du Bangladesh. On vise **« Robi AI »** : il faut que
Google et les IA relient ce nom à un seul objet, avec partout le même nom, la
même URL et les mêmes profils (le schéma Organization du site liste désormais
Instagram, TikTok, X et LinkedIn).

**Partout, les mêmes infos :**

| Champ | Valeur |
|---|---|
| Nom | Robi AI |
| Site | https://robi-app.com |
| App (connexion) | https://go.robi-app.com |
| Page de connexion indexable | https://robi-app.com/fr/connexion |
| Instagram | https://www.instagram.com/robi.ai.app/ |
| TikTok | https://www.tiktok.com/@robi.ai7 |
| X | https://x.com/iamrobiai |
| LinkedIn | https://linkedin.com/company/robi-ai |
| App Store / Play Store | **pas encore** : aucune URL publiée trouvée dans le repo ni le second cerveau. À ajouter partout (et au `sameAs` du site) le jour de la sortie. |

---

## 1. Wikidata

⚠️ **À lire avant de créer l'élément.** Wikidata supprime les éléments sans
source externe sérieuse (critère de notoriété). Le site de Robi ne suffit pas
comme référence. Attendre d'avoir au moins un article de presse, un comparatif
indépendant ou une fiche d'annuaire reconnu (Capterra, G2, Product Hunt) à citer
en référence. Créer l'élément avant, c'est risquer qu'il soit effacé.

Création : https://www.wikidata.org/wiki/Special:NewItem (compte Wikidata requis).

**Libellés et descriptions**

| Langue | Libellé | Description | Alias |
|---|---|---|---|
| fr | Robi AI | logiciel de facturation par intelligence artificielle | Robi IA ; Robi |
| en | Robi AI | AI invoicing software for freelancers and small businesses | Robi |
| es | Robi AI | software de facturación con inteligencia artificial | Robi IA ; Robi |

La description sert justement à distinguer Robi AI de la chanteuse et de
l'opérateur : ne pas la raccourcir à « logiciel ».

**Déclarations** (chercher la propriété par son code dans « ajouter une déclaration »)

| Propriété | Valeur à saisir |
|---|---|
| nature de l'élément (P31) | logiciel (Q7397) ; application web (chercher « application web ») |
| site officiel (P856) | https://robi-app.com |
| pays d'origine (P495) | France (Q142) |
| langue de l'œuvre (P407) | français (Q150), anglais (Q1860), espagnol (Q1321) |
| nom d'utilisateur Instagram (P2003) | robi.ai.app |
| nom d'utilisateur TikTok (P7085) | robi.ai7 |
| nom d'utilisateur X (P2002) | iamrobiai |
| identifiant d'entreprise LinkedIn (P4264) | robi-ai |
| usage (P366) | chercher « facturation » et prendre l'élément du concept |

**À ne pas remplir pour l'instant** : développeur / éditeur (P178) et date de
création (P571). La société n'est pas encore immatriculée (`src/lib/legalEntity.ts`,
`registered: false`) : ne pas inventer de nom de société ni de date. À
compléter à l'immatriculation.

**Références** : sur chaque déclaration, ajouter « URL de la référence (P854) »
vers la source externe (article, fiche d'annuaire), pas seulement vers robi-app.com.

---

## 2. Annuaires : textes mis à jour

Ce kit remplace les textes A, B et C de `BACKLINKS.md`, qui datent d'avant
plusieurs changements : tutoiement, Factur-X, TikTok, et jamais de signature
au nom de Ralph (on signe « l'équipe Robi AI »). La liste des annuaires et le
tableau de suivi restent dans `BACKLINKS.md`.

### A. Fiche annuaire FR (Appvizer, Les Pépites Tech, annuaires FR)

- **Nom** : Robi AI
- **URL** : https://robi-app.com/fr/facture-ai (si l'annuaire n'accepte que la racine : https://robi-app.com)
- **Accroche** : Parle. Robi facture.
- **Description courte (≤ 160 caractères)** :
  Robi AI crée tes devis et factures en 30 secondes, à la voix ou par écrit, au format Factur-X. Relances et paiement en ligne inclus.
- **Description longue** :
  Robi AI est un logiciel de facturation par intelligence artificielle pour les
  freelances, artisans et petites entreprises. Tu dictes ou tu écris
  « Prépare une facture de 500 € pour Alice » : l'IA comprend la demande, et le
  logiciel génère un document conforme, avec numérotation séquentielle,
  mentions obligatoires et TVA. En France, les factures sont produites au format
  Factur-X (norme EN 16931), prêtes pour la facturation électronique. Robi gère
  ensuite tout le cycle : signature électronique des devis, transformation en
  facture en un geste, lien de paiement Stripe ou PayPal, relances d'impayés
  rédigées par l'IA. Il fonctionne dans n'importe quel navigateur, sur ordinateur
  ou téléphone, dans 16 pays. Robi crée les factures ; ce n'est ni un outil
  d'OCR pour les factures reçues, ni une plateforme agréée.
- **Catégories** : Facturation, Devis, Facture électronique, Intelligence artificielle
- **Prix (France)** : gratuit pour 4 factures ou devis par mois · 14 €/mois sans
  engagement · 89 €/an · 149 € pour 2 ans · offre de lancement à vie 59 €
  (au lieu de 149 €, réservée aux 1 000 premiers). Vérifier la page tarifs le
  jour de l'inscription.
- **Réseaux** : https://www.instagram.com/robi.ai.app/ · https://www.tiktok.com/@robi.ai7 ·
  https://x.com/iamrobiai · https://linkedin.com/company/robi-ai
- **Visuels** : captures de l'app uniquement ; mascotte = `public/robot-mark.svg`, jamais un robot généré.

### B. Fiche annuaire EN (G2, Capterra, Product Hunt, SaaSHub, AlternativeTo)

- **Name**: Robi AI
- **URL**: https://robi-app.com/en/ai-invoice-generator (adresse anglaise après la relocalisation ; si elle n'est pas encore en ligne, https://robi-app.com/en/facture-ai, qui y redirigera)
- **Tagline**: Say it. Robi invoices it.
- **Short description (≤ 160 chars)**:
  AI invoicing for freelancers: say or type the job and get a compliant quote or invoice in 30 seconds. Payment links and reminders built in.
- **Long description**:
  Robi AI is AI invoicing software for freelancers, tradespeople and small
  businesses. Say or type "Invoice Acme £800 for the website redesign": the AI
  understands the request and the software builds a compliant invoice, with
  sequential numbering, tax details and fiscal IDs handled for 16 countries.
  Quotes can be e-signed and turned into invoices in one tap, each invoice
  carries a Stripe or PayPal payment link, and AI-written reminders chase late
  payers. In France, invoices are generated as Factur-X (EN 16931). Runs in any
  browser on desktop and mobile. Robi creates invoices; it is not an OCR tool
  for supplier invoices.
- **Pricing model**: Freemium — free plan with 4 invoices or quotes a month, then
  paid plans in local currency (see https://robi-app.com/en/pricing on the day you submit).
- **Category / tags**: Invoicing · AI invoice generator, quotes, voice, freelancers, e-invoicing

### C. Annuaires IA (There's An AI For That, Futurepedia, Toolify)

Reprendre le texte B bis de `BACKLINKS.md` (toujours à jour), en changeant
seulement l'URL pour l'adresse anglaise ci-dessus et en ajoutant TikTok aux réseaux.

### D. Email de pitch pour les comparatifs (FR, signé par l'équipe)

Objet : Un logiciel de facturation à la voix pour votre comparatif ?

Bonjour [Prénom],

Nous avons lu votre comparatif « [titre exact] », en particulier [détail réel
de l'article, pour montrer qu'on l'a lu].

Nous développons Robi AI (robi-app.com), un logiciel de facturation piloté par
l'IA : on dicte « Prépare une facture de 500 € pour Alice » et la facture est
générée au format Factur-X en quelques secondes, avec relances d'impayés et
paiement en ligne intégrés.

La facturation à la voix n'apparaît pas encore dans votre sélection, et vos
lecteurs freelances et artisans la cherchent de plus en plus. Nous vous offrons
volontiers un accès Pro pour la tester ; nous avons aussi un programme
d'affiliation si vous fonctionnez ainsi.

Bonne journée,
L'équipe Robi AI

---

## 3. Ordre conseillé

1. Annuaires (A, B, C) : ce sont eux qui donneront les sources externes.
2. Profils stores le jour de la sortie, avec le nom exact « Robi AI ».
3. Wikidata en dernier, une fois deux ou trois sources externes en ligne.
4. Noter chaque inscription dans le tableau « Suivi » de `BACKLINKS.md`.
