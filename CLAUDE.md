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

- `robi-app.com` → this repo (marketing/SEO site)
- `go.robi-app.com` → the app, in `~/Desktop/ROBI_V1_READY` (separate repo)

Don't confuse the two — they're different Vercel projects with different
codebases.

## Mascot

**NEVER redraw the Robi mascot.** It is the Lucide `Bot` icon in Lime
`#BEF221` — antenna, rounded head, two ears, two vertical pill eyes,
**no mouth, no body**. Reuse the canonical files (`public/robot-mark.svg`,
`public/favicon.svg`, `public/logo.svg`) or `import { Bot } from
"lucide-react"`. Full spec: `~/Desktop/ROBI_V1_READY/branding/MASCOT.md`.
