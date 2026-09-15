# CORS du bucket Firebase Storage

## Le symptôme

L'onglet **Fichiers** de l'admin reste sur « Chargement de la médiathèque… »
indéfiniment. La console du navigateur affiche, en boucle :

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/…'
from origin 'https://robi-app.com' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
It does not have HTTP ok status.
```

## Ce que ça veut dire

Un bucket Cloud Storage **refuse par défaut** toute requête venue d'un
navigateur, quelle que soit l'origine. Ce n'est pas une question de droits :
les règles Firestore et `storage.rules` sont respectées, la requête n'arrive
simplement jamais jusqu'à elles. Le navigateur envoie un `OPTIONS` préalable,
le bucket ne sait pas y répondre, et tout s'arrête là.

C'est pour ça que le symptôme ressemble à de la lenteur : rien n'échoue
visiblement, l'écran attend une réponse qui ne viendra pas.

Le SDK d'administration côté serveur n'est pas concerné — il ne passe pas par
un navigateur. D'où une situation trompeuse : les automatisations lisent le
bucket sans problème pendant que l'admin ne voit rien.

## La correction

Elle se fait **sur le bucket**, pas dans le code : aucune ligne de ce dépôt ne
peut l'appliquer. Une fois posée, elle est permanente.

Le plus simple, sans rien installer — [Google Cloud Shell](https://console.cloud.google.com/?cloudshell=true)
ouvert sur le projet `robi-ai-website`, puis :

**D'abord le nom exact du bucket.** Selon l'âge du projet il finit en
`.appspot.com` ou en `.firebasestorage.app` — les deux existent, et une
commande lancée sur le mauvais échoue sans rien expliquer. Il est affiché en
haut de <https://console.firebase.google.com/project/robi-ai-website/storage>,
et c'est la même valeur que `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` sur Vercel.

Puis, dans Cloud Shell :

```bash
BUCKET=robi-ai-website.firebasestorage.app   # ← colle ici le nom exact

cat > cors.json <<'EOF'
[{"origin":["https://robi-app.com","https://www.robi-app.com","https://go.robi-app.com","http://localhost:3000"],
  "method":["GET","HEAD","PUT","POST","DELETE"],
  "responseHeader":["Content-Type","Content-Length","Content-Disposition","Content-Encoding","Authorization","User-Agent","x-goog-resumable","x-goog-meta-*"],
  "maxAgeSeconds":3600}]
EOF

gcloud storage buckets update "gs://$BUCKET" --cors-file=cors.json
gcloud storage buckets describe "gs://$BUCKET" --format="default(cors_config)"
```

La dernière ligne doit réafficher la configuration. Si elle ressort vide, la
mise à jour n'a pas pris — vérifie le nom du bucket avant toute autre piste.

Le fichier `storage-cors.json` à la racine du dépôt contient la même
configuration, pour la garder versionnée.

## Pourquoi cette liste d'origines

- `robi-app.com` et `www` — l'admin
- `go.robi-app.com` — l'app, si elle vient à lire la médiathèque
- `localhost:3000` — le développement local, sinon la même panne s'y reproduit
  et on la croit spécifique à la production

`PUT` et `POST` sont nécessaires au dépôt de fichiers, `x-goog-resumable` aux
envois repris. Sans eux, la lecture marcherait et l'écriture échouerait — une
panne moitié visible, plus difficile à diagnostiquer que celle-ci.
