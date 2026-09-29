import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";

function getLocale(request: NextRequest): string {
  // Check if locale is in cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("Accept-Language");
  if (acceptLanguage) {
    const browserLocales = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2));

    for (const browserLocale of browserLocales) {
      if (locales.includes(browserLocale as any)) {
        return browserLocale;
      }
    }
  }

  return defaultLocale;
}

/**
 * Anciennes adresses encore connues de Google (rapport « Introuvable (404) »
 * de Search Console, 29/09/2026). Sans ces règles, elles recevaient le
 * préfixe /fr plus bas (« /fr/es-MX/… ») et tombaient en 404.
 *
 * - Locales retirées du site → même page dans la langue la plus proche.
 * - Liens d'une ancienne bascule de période (mensuel / annuel…) → Tarifs.
 * Redirections permanentes (301) : Google transfère l'ancienne adresse.
 */
const RETIRED_LOCALES: Record<string, string> = {
  "es-MX": "es", "es-CO": "es", "es-419": "es", "es-AR": "es", "es-CL": "es", "es-PE": "es",
  "pt-BR": "pt-PT",
};
const OLD_PERIOD_PATHS: Record<string, string> = {
  "/jour": "/fr/pricing", "/semaine": "/fr/pricing", "/mois": "/fr/pricing", "/an": "/fr/pricing",
  "/day": "/en/pricing", "/week": "/en/pricing", "/month": "/en/pricing", "/year": "/en/pricing",
  "/mensalidades": "/pt-PT/pricing",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const oldPeriod = OLD_PERIOD_PATHS[pathname.replace(/\/$/, "")];
  if (oldPeriod) {
    const url = request.nextUrl.clone();
    url.pathname = oldPeriod;
    return NextResponse.redirect(url, 301);
  }
  const retired = pathname.match(/^\/([a-z]{2}-[A-Z0-9]{2,3})(\/.*)?$/);
  if (retired && RETIRED_LOCALES[retired[1]]) {
    const url = request.nextUrl.clone();
    url.pathname = `/${RETIRED_LOCALES[retired[1]]}${retired[2] || ""}`;
    return NextResponse.redirect(url, 301);
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Skip for static files, API routes, the admin dashboard and the opt-out page
  // (no locale prefix). /desinscription must stay stable: its URL is printed in
  // emails already sent, so it can never move or gain a locale segment.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/desinscription") ||
    pathname.startsWith("/r/") || // liens courts partenaires (robi-app.com/r/CODE)
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Redirect to locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api)
    "/((?!_next|api|favicon.ico|images|.*\\..*).*)",
  ],
};
