# Reel « Parlez. Facturez. Encaissez. » — v2

Pub verticale 9:16 (1080×1920, 30 i/s, 35,5 s, −14 LUFS) pour Instagram / TikTok / Meta Ads.
Même esprit que la vidéo de présentation de Khosmos (notification qui ouvre sur le problème,
rembobinage, démo de l'app, CTA), réécrite pour Robi.

Vidéo finale : `renders/robi-reel-v2.mp4` (la v1 est dans l'historique git).

## DA

- **DA Reels « Moolah »** (notes du 27/09) : iPhone titane **unique et persistant** qui voyage
  d'une scène à l'autre, fonds Robi **révélés en cercle** depuis le téléphone, cartes qui
  **sortent de l'écran**. Fond Amethyst `#0D0630` dominant, SpaceBlue `#18314F` seulement en
  halo dans un coin, Outfit pour les titres, Inter pour l'UI, lime sur un mot/une ligne.
- **Vrais écrans de l'app** capturés sur `go.robi-app.com/?demo` (`assets/screens/`) :
  écran de démarrage, « Nouvelle facture », liste des factures (Studio Vernier 1 620,00 €).
- Composants du skill `robi-pub-video` (dépôt ROBI_AI) : pastille « Robi AI », carte du hero
  « Vous dites » → facture qui se remplit, notification iOS, pastille Factur-X grand format.
- **Carte de fin de la série** : pastille, « Parlez. ↔ Écrivez. » / « Robi facture. envoie.
  relance. » (roulette 1,3 s, jamais deux mots ensemble, un tic à chaque changement) /
  « Encaissez. », offre « 59 € à vie · jusqu'au 31 octobre » qui tombe en dernier, puce
  « Conforme Factur-X ». Pas d'URL à l'écran. 7,45 s.

## Découpage

| Temps | Scène | Contenu |
|---|---|---|
| 0–4 s | Accroche | Écran verrouillé 22:47, notifs (Studio Vernier, rappel, banque) → « 22h47. Toujours pas facturé. » |
| 4–8 s | Problème | Fond clair en cercle ; Word, Excel en `#REF!`, calculette, étiquettes qui jaillissent du téléphone puis y retournent |
| 8–11 s | Robi | Fond lime en cercle, écran de démarrage de l'app, pastille « Robi AI » → « Vous la dictiez à Robi ? » |
| 11–16,4 s | 01 / Parlez | Carte « Vous dites » qui sort de l'écran, dictée mot à mot, la facture se remplit (1 620,00 € TTC) |
| 16,4–22 s | 02 / Facturez | « Conforme Factur-X », coches TVA / mentions / numéro, « Envoyée à Studio Vernier » |
| 22–28 s | 03 / Encaissez | Liste des factures réelle, notif « Paiement reçu · 1 620,00 € », ENVOYÉ → PAYÉ |
| 28–35,45 s | Fin | Carte de fin de la série |

## Son

- Musique : **Hip Hop 02** (Mixkit n° 738, licence gratuite réseaux + commercial, sans
  attribution), n° 4 de la rotation choisie par Ralph. Extrait de 2 s à 37,45 s.
- Bruitages : bibliothèque HyperFrames (media-use) + `sfx-tic.wav` du skill `robi-pub-video`.
- Le rendu HyperFrames sort à ~−17,7 LUFS ; mastering final à −14 LUFS :
  `ffmpeg -i renders/robi-reel-v2-raw.mp4 -c:v copy -af "volume=3.7dB,alimiter=limit=0.84:level=false" -c:a aac -b:a 192k renders/robi-reel-v2.mp4`

## Modifier et relancer

```bash
cd marketing/videos/reel-parlez-facturez-encaissez
npx hyperframes preview      # aperçu
npm run check                # vérifications
npx hyperframes render -o renders/robi-reel-v2-raw.mp4 -q delivery -f 30
```

Tous les textes et timings sont dans `index.html` (GSAP en local dans `assets/vendor/`).
