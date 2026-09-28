# Reel « Parlez. Facturez. Encaissez. »

Pub verticale 9:16 (1080×1920, 30 i/s, 36 s) pour Instagram / TikTok / Meta Ads.
Même esprit que la vidéo de présentation de Khosmos (motion design d'app,
notification qui ouvre sur le problème, rembobinage, démo, CTA), réécrite
pour Robi avec notre DA : Amethyst `#0D0630`, SpaceBlue `#18314F`, Lime
`#BEF221`, Inter + JetBrains Mono pour les chiffres, mascotte officielle
(`public/robot-mark.svg`, pas redessinée).

Vidéo finale : `renders/robi-reel.mp4`.

## Découpage

| Temps | Scène | Contenu |
|---|---|---|
| 0–4 s | Accroche | Écran verrouillé à 22:47, notifs client / rappel / banque → « 22h47. Et toujours pas facturé. » |
| 4–8 s | Problème | Word, Excel en `#REF!`, calculette, étiquettes TVA ? SIRET ? Factur-X ?! → rembobinage |
| 8–12 s | Marque | Mascotte + « Robi » + « Parlez. Facturez. Encaissez. » (le drop de la musique) |
| 12–18 s | 01 Parlez. | Dictée vocale, onde, transcription mot à mot, « Compris ✓ » |
| 18–24 s | 02 Facturez. | La facture se construit, total 1 440,00 € TTC, tampon Factur-X EN 16931 |
| 24–30 s | 03 Encaissez. | Envoyer → lien de paiement → facture ouverte → « Payé 1 440,00 € » |
| 30–33 s | Offre | Gratuit (4 factures/devis par mois) + accès à vie 59 € au lieu de 149 €, 1 000 premiers |
| 33–36 s | Fin | Logo, baseline, « Essayer gratuitement », robi-app.com |

## Son

- Musique originale générée par `assets/audio/music.py` (house 120 BPM, fa mineur,
  calée sur les coupes : drop à 8 s, pause à 30 s, final à 33 s). Libre de droits.
- Bruitages : bibliothèque fournie avec HyperFrames.
- Pour mettre un autre morceau : remplacer `assets/audio/music.mp3` (36 s) et relancer le rendu.

## Modifier et relancer

Fait avec [HyperFrames](https://hyperframes.heygen.com) (HTML → vidéo).

```bash
cd marketing/videos/reel-parlez-facturez-encaissez
npx hyperframes preview   # aperçu dans le navigateur
npm run check             # vérifications
npx hyperframes render -o renders/robi-reel.mp4 -q delivery
```

Tous les textes sont dans `index.html`. GSAP est inclus en local (`assets/vendor/`).
