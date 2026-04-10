# Handover Document — Robi SEO Site
**Date**: 2026-04-08
**Last session by**: Claude Opus 4.6

---

## 1. What We're Building

**Robi AI** (`robi-app.com`) — a multilingual SEO landing site for an AI-powered invoicing app for freelancers. The site drives signups to the product app at `go.robi-app.com`.

- **Stack**: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4
- **Locales**: FR (default), EN, ES — all pages are statically generated
- **207+ static pages** across industries, features, comparisons, blog, tools
- **Hosting**: GitHub repo `DevKarma707/robi-seo-site`, likely deployed on Vercel/Hostinger

---

## 2. Decisions Locked In

### Git & Branching
- **`main`** is the production branch, pushed to `origin/main`
- Latest commit on main: `689898e` — SEO improvements (Open Graph, Instagram, X, sitemap)
- **Never force push to main**. Always commit specific files (no `git add .`)

### Social Media Links (confirmed by Ralph)
- **Instagram**: `https://instagram.com/robi.ai.app`
- **X (Twitter)**: `https://x.com/iamrobiai`
- **LinkedIn**: `https://linkedin.com/company/robi-ai`
- These are set in 3 places: Footer component, JSON-LD sameAs (homepage), seo-config.ts

### SEO Setup (pushed to main)
- Open Graph + Twitter Card meta tags on all pages (in `[locale]/layout.tsx`)
- `og.png` image referenced at `https://robi-app.com/og.png` — **file does NOT exist yet in `/public`**, needs to be created (1200x630px)
- Sitemap includes contact, legal, privacy, terms pages
- JSON-LD schemas: SoftwareApplication, Organization, FAQPage, Article, BreadcrumbList
- Google Search Console: Ralph added the DNS TXT record (`google-site-verification=afXD9c-k02ArSjxRRJ86Tca4Y4li_KPDM6iBxK`), DNS propagated OK but validation hadn't passed yet — he should retry

### Hero Redesign (NOT ready — do NOT merge)
- Branch `feat/hero-iphone-redesign` has a Prisma-style iPhone mockup hero
- Ralph explicitly said **"il est pas du tout pret"** (not ready at all)
- There's also a `git stash` with hero WIP: `stash@{0}: On claude/vibrant-spence: hero wip` — this contains uncommitted changes to `HeroIphoneMockup.tsx` and `.claude/launch.json`
- **Do not push, merge, or modify this branch without Ralph's explicit approval**

### Dev Server
- Turbopack (default in Next.js 16) has a **known panic bug** on this project (`Failed to write app endpoint /[locale]/page`). Dev server crashes.
- **Workaround**: use production build (`npm run build && npm run start`) for previewing
- launch.json has been updated to use `npm run start` (production server)
- Node path: `/opt/homebrew/Cellar/node/25.9.0_1/bin/node`
- There's a spurious `package-lock.json` at `~/package-lock.json` (not in the project) that triggers a Turbopack warning about multiple lockfiles

### Pricing
- Launch offer: 59EUR lifetime access (Robi Pro)
- Regular: 14.99 EUR/month

---

## 3. Critical Context a New Chat Would Miss

1. **Bracket escaping in zsh**: File paths with `[locale]` must be quoted (`'src/app/[locale]/page.tsx'`) or zsh treats brackets as glob patterns and fails
2. **npm/node not in PATH**: Must export PATH first: `export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"` before any npm/node/npx command
3. **Port conflicts**: Dev server often can't bind to 3000 (other processes). Always use `autoPort` or kill existing processes first (`lsof -ti :3000,:3001 | xargs kill -9`)
4. **i18n pattern**: All text comes from dictionary JSON files. Server components load dict via `getDictionary(locale)`, pass to client components. **Never hardcode French text** — previous bugs came from this
5. **Multiple stale branches**: `claude/awesome-shaw`, `claude/eloquent-hermann`, etc. are old worktree branches, can be cleaned up
6. **Ralph speaks French** — respond in French unless he switches to English

---

## 4. What Comes Next

### Immediate (deploy-blocking)
- [ ] Create `/public/og.png` (1200x630px) — Open Graph image for social sharing. Currently referenced but doesn't exist
- [ ] Ralph needs to retry Google Search Console validation (DNS was propagated, just timing issue)
- [ ] Deploy latest `main` to production (if not auto-deployed)

### Short-term SEO
- [ ] Verify each industry/feature/comparison page has unique meta descriptions
- [ ] Add more blog articles targeting long-tail keywords
- [ ] Register Robi on SaaS directories (Product Hunt, AlternativeTo)
- [ ] Set up Google Analytics 4 (`NEXT_PUBLIC_GA_ID` env var)

### Medium-term
- [ ] Hero redesign (branch `feat/hero-iphone-redesign`) — needs Ralph's creative direction
- [ ] Email infrastructure: install `resend`, uncomment API calls in `/api/contact/route.ts`
- [ ] Real images for blog posts, features, industry pages (currently placeholders)
- [ ] reCAPTCHA on contact form (structure ready, not implemented)

---

## 5. Open Questions to Pick Up First

1. **og.png**: Does Ralph have a brand image/mockup to use? Or should we generate one?
2. **Google Search Console**: Did validation pass after retrying? If not, try the HTML tag method instead
3. **Hero redesign**: What's wrong with the current iPhone mockup? What direction does Ralph want?
4. **Deployment**: Is the site auto-deployed from `main` (Vercel)? Or manual deploy needed?
5. **Analytics**: Does Ralph have a GA4 ID ready to plug in?
6. **Turbopack crash**: Should we downgrade to Next.js 15 for stable dev server, or wait for a fix?

---

## File Reference

| What | Where |
|------|-------|
| Locale layout (OG tags) | `src/app/[locale]/layout.tsx` |
| Homepage (JSON-LD) | `src/app/[locale]/page.tsx` |
| Footer (social links) | `src/components/layouts/Footer.tsx` |
| SEO config | `src/data/seo-config.ts` |
| Sitemap | `src/app/sitemap.ts` |
| Translations | `src/lib/i18n/locales/{fr,en,es}.json` |
| Project docs | `.claude/CLAUDE.md` |
| This handover | `.claude/HANDOVER.md` |
