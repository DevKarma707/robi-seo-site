# ROBI SEO Site — Project Rules

## Deployment workflow

**Always deploy via `git push origin main`. Never use `vercel deploy --prod`.**

The repo `DevKarma707/robi-seo-site` is connected to Vercel project
`robi-seo-site` (team `quoteless-ai`, production domain `robi-app.com`).
Every push to `main` triggers an automatic build + production deploy.

Running `vercel deploy --prod` from CLI is redundant — it duplicates work
the GitHub integration already does, wastes tokens streaming build logs,
and produces orphan deployments.

The correct flow is:
1. Make changes
2. `git add` + `git commit`
3. `git push origin main`
4. Done — Vercel auto-deploys

If a build fails, check Vercel dashboard or use `vercel inspect <url>` to
read logs. Do not retry by manually deploying.

## Project domain map

- `robi-app.com` → this repo (marketing/SEO site **and the admin**)
- `go.robi-app.com` → the app, in `~/Desktop/ROBI_V1_READY` (separate repo,
  `DevKarma707/ROBI_AI`)

Don't confuse the two — they're different Vercel projects with different
codebases. Certains sujets sont à cheval : Polar a son webhook ici
(`/api/webhooks/polar`) et son service côté app
(`functions/src/polarService.ts`).

## L'admin (`/admin`)

Tableau de bord privé (Google sign-in, emails en dur dans `src/lib/firebase.ts`).
Onglets : Pilotage, Tâches, Fichiers, Santé, Acquisition, Influenceurs,
Analytics, Blog, Lancement.

- **Tâches** — kanban du lancement (`src/lib/launchTasks.ts`, collection
  Firestore `launchTasks`). Les tâches marquées automatisables peuvent
  lancer une session Claude Code, via l'URI
  `vscode://anthropic.claude-code/open?prompt=…` ou le runner local.
- **Runner local** — `npm run runner` (`scripts/robi-task-runner.mjs`).
  Écoute sur `127.0.0.1:4599`, ouvre une fenêtre VS Code par tâche et
  synchronise le dossier partagé dans `~/Desktop/ROBI_PARTAGE`. Jamais
  déployé : il ne tourne que sur le Mac de Ralph.
- **Fichiers** — dépôt dans Firebase Storage sous `partage/`, en lecture
  réservée à l'admin (contrairement à `blog/`, public). Nécessite que
  Storage soit provisionné sur le projet `robi-ai-website`.

Primitives visuelles communes dans `src/components/admin/ui.ts` — s'en
servir plutôt que de recopier des classes : surfaces `rounded-2xl`,
contrôles `rounded-xl`, marqueurs `rounded-full`.

## Contexte produit (à connaître avant d'écrire)

- **Prix** : freemium 2 docs/mois → **Lifetime 59 €** en une fois. Les
  mentions à 49 € sont périmées. Pas d'abonnement mensuel, par choix.
- **Priorité n°1 : Factur-X.** Facture électronique obligatoire en France
  au **1er septembre 2026** (EN 16931). Robi la génère nativement — c'est
  l'angle SEO principal du site.
- Palette : Amethyst `#0D0630`, SpaceBlue `#18314F`, Lime `#BEF221`, Inter.
  Baseline : « Parlez. Facturez. Encaissez. »

## Mascot

**NEVER redraw the Robi mascot.** It is the Lucide `Bot` icon in Lime
`#BEF221` — antenna, rounded head, two ears, two vertical pill eyes,
**no mouth, no body**. Reuse the canonical files (`public/robot-mark.svg`,
`public/favicon.svg`, `public/logo.svg`) or `import { Bot } from
"lucide-react"`. Full spec: `~/Desktop/ROBI_V1_READY/branding/MASCOT.md`.
