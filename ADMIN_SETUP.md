# Admin Robi — Setup (analytics + blog)

Admin calqué sur Impulse Rebuild (Firebase Firestore), réduit à **2 onglets** :
**Analytics** (compteur de visites maison) et **Blog** (édition + import JSON).

URL : `https://robi-app.com/admin` (et `localhost:3000/admin` en dev).
Accès : connexion Google restreinte à `ralphkaram75014@gmail.com`.

## 1. Créer le projet Firebase `robi-seo`

1. https://console.firebase.google.com → **Ajouter un projet** → nom `robi-seo`.
2. **Build → Firestore Database → Créer une base** (mode production, région `eur3`).
3. **Build → Authentication → Get started → Sign-in method → Google → Activer.**
4. **Project settings (⚙️) → General → Your apps → Web (`</>`)** → enregistre l'app
   → copie l'objet `firebaseConfig`.

## 2. Renseigner les variables d'env

Copie les valeurs dans `.env.local` (modèle dans `.env.example`) :

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=robi-seo.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=robi-seo
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=robi-seo.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Puis **les mêmes variables dans Vercel** (Project `robi-seo-site` → Settings →
Environment Variables → Production) avant de déployer.

## 3. Déployer les règles de sécurité

Les règles sont dans `firestore.rules` (lecture publique des articles publiés,
visites en write-only anonyme, écriture réservée à l'admin). Pour les pousser :

- soit copier/coller le contenu dans **Firestore → Rules → Publier** ;
- soit via CLI : `npx firebase deploy --only firestore:rules` (après `firebase init`).

## 4. Autoriser le domaine pour l'auth

**Authentication → Settings → Authorized domains** → ajoute `robi-app.com`
(et `localhost` est déjà autorisé pour le dev).

## 5. Vérifier

1. `npm run dev` → ouvrir `http://localhost:3000/admin` → se connecter avec Google.
2. Onglet **Blog** → « Importer JSON » → « Charger un exemple » → Importer.
3. Naviguer sur le site → l'onglet **Analytics** doit afficher des visites.

---

## Workflow hebdo (objectif SEO)

1. Claude prépare un **JSON d'article** (FR/EN/ES, markdown, mots-clés).
2. Toi : `/admin` → Blog → **Importer JSON** → 1 clic.
3. Toggle **Publié** quand prêt. Pas de redéploiement nécessaire.

### Format JSON d'un article

```json
{
  "slug": "mon-article",
  "titleFr": "...", "titleEn": "...", "titleEs": "...",
  "excerptFr": "...", "category": "guides",
  "keywords": ["mot-clé 1", "mot-clé 2"],
  "metaDescFr": "≤160 caractères",
  "date": "2026-06-09",
  "published": false,
  "contentFr": "## H2\n\nParagraphe **gras** [lien](https://robi-app.com).",
  "contentEn": "...", "contentEs": "..."
}
```

Requis : `slug`, `titleFr`, `contentFr`. EN/ES manquants → copie du FR.
`category` ∈ `guides | legal | tips | business`.

---

## ⚠️ Reste à faire — Phase 2 (rendu public)

L'admin écrit/gère les articles dans Firestore et le tracking tourne. **Mais le
blog public (`/[locale]/blog` + `/blog/[slug]`) lit encore uniquement les 7
articles statiques de `seo-config.ts`** — il ne lit pas encore Firestore.

Pour que les articles publiés via l'admin apparaissent sur le site, il faut
brancher les routes blog sur Firestore (lecture SSR/ISR + fusion avec les
articles statiques + métadonnées/JSON-LD). À faire dans une prochaine session.
