'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/hooks/useConsent';
import { isInternalDevice } from '@/lib/internalTraffic';

/**
 * Pixel Meta (Facebook / Instagram Ads) — ensemble de données
 * « Robi AI · robi-app.com », créé le 27/09/2026 dans le Business « Robi Ai ».
 *
 * Même règle que GA4 et l'affiliation : aucun script Meta n'est chargé tant
 * que le visiteur n'a pas accepté la catégorie « marketing ». Les achats, eux,
 * remontent côté serveur (API Conversions, voir lib/metaCapi.ts) depuis le
 * webhook Polar : c'est ce qui donne un ROI fiable malgré les bloqueurs.
 *
 * Événements envoyés d'ici :
 *  - PageView à chaque page, navigations client comprises ;
 *  - Lead au clic vers l'app (go.robi-app.com), première marche du tunnel —
 *    le même clic que `cta_app_clicked` dans PostHog.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '975561445564920';

type Fbq = (...args: unknown[]) => void;
const fbq = (...args: unknown[]) => {
  const f = (window as unknown as { fbq?: Fbq }).fbq;
  if (f) f(...args);
};

export function MetaPixel() {
  const { ready, marketing } = useConsent();
  const pathname = usePathname();
  const enabled = process.env.NODE_ENV === 'production' && ready && marketing && !isInternalDevice();

  // Vue de page à chaque navigation client. La première part avec l'init du
  // script (plus bas) : l'effet peut tourner avant que le script inline ne
  // s'exécute, et `fbq` n'existerait pas encore.
  const first = useRef(true);
  useEffect(() => {
    if (!enabled) return;
    if (first.current) { first.current = false; return; }
    fbq('track', 'PageView');
  }, [enabled, pathname]);

  // Clic vers l'app : délégué sur le document, comme dans PostHogTracking.
  useEffect(() => {
    if (!enabled) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.('a');
      if (!link?.href?.includes('go.robi-app.com')) return;
      fbq('track', 'Lead', { content_name: link.textContent?.trim().slice(0, 80) || undefined });
    };
    document.addEventListener('click', onClick, { passive: true });
    return () => document.removeEventListener('click', onClick);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}
