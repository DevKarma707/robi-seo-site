# Robi AI - SEO Landing Page Site

## Project Overview

Production-ready multilingual SEO landing page for **Robi AI** — an AI-powered invoicing software for freelancers.

- **Stack**: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS 4, React
- **i18n**: French (default), English, Spanish with JSON locale files
- **Pages**: 197 static pages across 3 locales (65+ unique routes)
- **Theme**: Light background with dark hero/CTA sections (visual hierarchy)
- **Accent**: Lime green (#BEF221) on dark backgrounds

## Architecture

### Directory Structure
```
src/
├── app/
│   ├── [locale]/              # i18n routing
│   │   ├── page.tsx           # Homepage with JSON-LD schemas
│   │   ├── layout.tsx         # Locale layout (Header, Footer)
│   │   ├── features/
│   │   ├── industries/        # 40+ industry pages
│   │   ├── pricing/
│   │   ├── comparisons/
│   │   ├── blog/              # 5 articles × 3 locales
│   │   ├── tools/             # 3 calculator tools
│   │   ├── contact/           # Contact form (NEW)
│   │   ├── legal/             # Legal mentions (NEW)
│   │   ├── privacy/           # Privacy policy (NEW)
│   │   └── terms/             # Terms of service (NEW)
│   ├── api/
│   │   └── contact/           # Contact form API endpoint (NEW)
│   ├── globals.css            # Animations, scrollbar, CSS system
│   ├── layout.tsx             # Root layout
│   └── not-found.tsx          # Custom 404 page (NEW)
├── components/
│   ├── layouts/
│   │   ├── Header.tsx         # Navigation with language switcher
│   │   └── Footer.tsx         # Footer links (cleaned up)
│   ├── sections/              # Reusable page sections
│   │   ├── Hero.tsx           # Dark hero section
│   │   ├── Features.tsx
│   │   ├── Pricing.tsx
│   │   ├── FAQ.tsx            # Accordion with open state
│   │   ├── Testimonials.tsx
│   │   ├── Process.tsx
│   │   ├── Payments.tsx
│   │   ├── CTA.tsx            # Dark CTA section
│   │   └── LegalContent.tsx   # Reusable legal layout (NEW)
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ScrollReveal.tsx   # Scroll animation wrapper
│   │   └── Analytics.tsx      # GA4 integration (NEW)
├── lib/
│   ├── i18n/
│   │   ├── config.ts          # locales, defaultLocale
│   │   ├── dictionaries.ts    # getDictionary() async loader
│   │   └── locales/
│   │       ├── fr.json        # 400+ translation keys
│   │       ├── en.json
│   │       └── es.json
├── hooks/
│   └── useScrollReveal.ts     # IntersectionObserver for animations (NEW)
└── middleware.ts              # i18n redirect logic
```

### Key Components

**Hero Section** (`bg-[#0D0630]`)
- Dark background with lime accent
- Primary CTA button
- All text from dictionary
- Props: `socialProof` (optional), `badge`, `variant` ("default"|"centered"|"split"), `titleAccent` (lime green)
- Remove sections by omitting props (no conditional rendering needed)

**CTA Section** (`bg-[#0D0630]`)
- Dark background
- Secondary CTA at bottom
- Reusable across pages

**Contact Form** (NEW)
- Server component: `src/app/[locale]/contact/page.tsx`
- Client component: `src/app/[locale]/contact/client.tsx`
- API: `src/app/api/contact/route.ts`
- Form validation (client + server)
- Error/success states
- Full i18n support

**Legal Pages** (NEW)
- Reusable `LegalContent` component
- 3 pages: Legal Mentions, Privacy Policy, Terms of Service
- All 3 locales (FR/EN/ES)
- Custom 404 page for all locales

## i18n System

### Dictionary Keys Structure
```
meta:           // SEO metadata
hero:           // Homepage hero section
features:       // Features section
pricing:        // Pricing plans
blog:           // Blog section
contact:        // Contact form fields (NEW)
pages:
  legal:        // Legal mentions page (NEW)
  privacy:      // Privacy policy (NEW)
  terms:        // Terms of service (NEW)
footer:         // Footer links
```

### Server Component Pattern
```tsx
// 1. Server component (page.tsx) loads dict
const dict = await getDictionary(locale);

// 2. Pass dict to client components
<Component dict={dict} />

// 3. Client component uses dict values
```

## SEO & Structured Data

### JSON-LD Schemas Implemented
1. **SoftwareApplication** (homepage)
   - Name, category, rating, pricing

2. **Organization** (homepage)
   - Brand info, social profiles, contact point

3. **FAQPage** (homepage)
   - All 5 FAQ items with Q&A

4. **Article** (blog posts)
   - Headline, image, datePublished, author

5. **BreadcrumbList** (6 pages)
   - Navigation hierarchy (Home > Page)

### SEO Files
- `sitemap.ts` - Dynamic sitemap for all locales
- `robots.ts` - Search engine crawling rules
- hreflang tags in locale layout

## Recent Changes (Production-Ready PR)

### Commit: 79aae9e - Hardcoded French Defaults & Broken Links
- Removed French defaults from Hero, CTA, Features components
- All text now comes from dictionary (supports EN/ES properly)
- Fixed footer: removed `/guides`, `/templates`, `/integrations`, `/roadmap`, `/about`
- Added custom 404 page in all 3 locales

### Commit: 4c865bb - Analytics & Contact Form
- Google Analytics 4 integration (gtag script, production-only)
- Contact form page with full validation
- Contact API endpoint
- i18n for contact form fields

### Commit: 7e9bc9d - Structured Data Schemas
- Added FAQ schema to homepage
- Added Article schema to blog posts
- Added Organization schema with social profiles
- Improved SEO crawlability

### Commit: d2e8869 - Email Infrastructure & Breadcrumbs
- Email sending infrastructure (Resend-based, commented)
- `.env.example` template with all required variables
- BreadcrumbList schemas on 6 key pages

### Commit: 9888f77 - UI/UX Refinements
- Updated Features heading: "Dominate freelancing" → "All the tools to invoice with peace" (FR/EN/ES)
- Reduced desktop header height from h-16 (64px) to h-12 (48px)
- Removed green avatar circles and "Joined by 2000+ freelancers" social proof section
- Improved visual hierarchy and messaging clarity

## Configuration

### Environment Variables (.env.local)
```
NEXT_PUBLIC_GA_ID=G-YOUR_ID              # Google Analytics 4
RESEND_API_KEY=re_xxxxx                  # Email sending
ADMIN_EMAIL=support@robi.ai              # Contact form destination
NEXT_PUBLIC_SITE_URL=https://robi.ai     # Site URL
```

### Analytics
- Google Analytics 4 gtag script
- Production-only (no tracking on localhost)
- Add your GA_ID to enable

### Email (Optional)
- Resend API integration (structure in place)
- Run `npm install resend` to enable
- Uncomment calls in `src/app/api/contact/route.ts`

## Build & Deployment

### Build Stats
- **197 static pages** generated
- **0 compilation errors**
- Build time: ~30-60 seconds (Turbopack)

### Commands
```bash
npm run dev              # Start dev server (port 3000 or 3001 if busy)
npm run build           # Production build
npm run start           # Run production build
npm run lint            # ESLint check
```

### Dev Server Troubleshooting
- Dev server falls back to **port 3001** if port 3000 is in use
- Kill stuck processes: `pkill -9 node`
- Clean cache for fresh build: `rm -rf .next`
- Check server logs: `tail -50 /tmp/dev-server.log`
- Verify changes: `curl -s http://localhost:3001/fr | grep "text"`

### Deployment Checklist
- [ ] Set environment variables in production
- [ ] npm install resend (if using email)
- [ ] Uncomment Resend calls in contact API
- [ ] Set GA4 ID
- [ ] Test contact form
- [ ] Test all 3 language versions
- [ ] Verify 404 page works
- [ ] Test social links (X, LinkedIn)

## Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Header responsive: hidden on mobile, full nav on desktop
- Forms responsive: single column on mobile, proper spacing on desktop
- All sections use responsive grid layouts

## Color System

```css
Primary: #0D0630        (dark background)
Secondary: #0A0425      (darker background)
Card: #120A3D           (card backgrounds)
Accent: #BEF221         (lime green)
Text Primary: #FFFFFF   (white, dark sections)
Text Dark: #111827      (dark text, light sections)
```

## Animations

### ScrollReveal System
- Elements fade in + slide up on scroll
- Uses IntersectionObserver (performant)
- Staggered delays for card grids
- CSS classes: `.scroll-reveal`, `.clip-reveal`

### Button Animations
- Text slide on hover
- Scale effect on interactive cards
- Glow effect on hover (lime)

### Card 3D Effect
- Perspective transform on group hover
- Individual card scale on hover
- Shadow glow effect

## Testing

### Manual Testing Checklist
- [ ] Homepage loads in all 3 languages
- [ ] Hero section renders correctly
- [ ] Contact form submits without error
- [ ] Footer links all work (no 404s)
- [ ] 404 page displays on invalid routes
- [ ] Language switcher works
- [ ] Analytics loaded (check console)
- [ ] Mobile responsive on all pages
- [ ] ScrollReveal animations trigger on scroll
- [ ] Button hover states work

## Performance

- Static prerendering for all pages (fast)
- Turbopack for faster dev builds
- No unused npm packages
- CSS animations use GPU (transform, opacity)
- Responsive images ready for optimization

## Known Limitations / TODO

1. **Images**: Blog posts, features, industries pages need real images
2. **Email**: Resend not installed by default (uncomment when ready)
3. **reCAPTCHA**: Structure ready, not implemented
4. **Social Links**: Currently placeholders (https://x.com/robi_ai, https://linkedin.com/company/robi-ai)

## How to Continue

### To Add Features
1. Create new page: `src/app/[locale]/[route]/page.tsx`
2. Add i18n keys to `fr.json`, `en.json`, `es.json`
3. Import `getDictionary` in server component
4. Pass dict to client components
5. Test all 3 locales

### To Update Text Across All Languages
1. Update keys in **all 3 files simultaneously**: `src/lib/i18n/locales/{fr,en,es}.json`
2. Keep key structure identical across files
3. Test all locales: `curl http://localhost:3001/{fr,en,es} | grep "new-text"`
4. Never update only one language file without updating the others

### To Modify Styles
1. Update `src/app/globals.css` for global styles
2. Update individual component className props
3. Follow Tailwind color system

### To Add Analytics
1. Get Google Analytics 4 ID
2. Set `NEXT_PUBLIC_GA_ID` env var
3. Restart dev server

### To Enable Email
1. `npm install resend`
2. Get Resend API key
3. Uncomment Resend calls in `/api/contact/route.ts`
4. Set `RESEND_API_KEY` and `ADMIN_EMAIL` env vars

## PR & Deployment

- **Branch**: `claude/vibrant-spence`
- **PR**: Ready to merge to `main`
- **Status**: Production-ready, 0 build errors
- **Ready to deploy**: Yes (after env vars setup)

### Commit Pattern
```bash
git add <specific-files>  # Never use "git add ."
git commit -m "$(cat <<'EOF'
<Title>: <brief description>

<Details of changes>

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
EOF
)"
git log --oneline -1    # Verify
```

---

**Last Updated**: Session with Claude (UI/UX refinements - 2026-02-28)
**Build Status**: ✅ 207 pages, 0 errors
**Next Step**: Test UI changes at localhost:3001, merge to main, deploy with env vars
