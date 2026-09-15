'use client';

import Script from 'next/script';
import { useConsent } from '@/hooks/useConsent';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-5RMK9FPV61';

export function Analytics() {
  const { ready, analytics } = useConsent();

  // Only load Google Analytics in production
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  // Aucun script n'est injecté tant que le consentement analytique n'est pas
  // accordé — le blocage porte sur le chargement de gtag.js lui-même, pas
  // seulement sur la configuration.
  if (!ready || !analytics) {
    return null;
  }

  return (
    <>
      {/* Consent Mode v2 : posé avant gtag.js, marketing refusé par défaut.
          Le composant n'étant monté qu'après acceptation de l'analytique,
          `analytics_storage` est accordé ici ; l'état marketing réel est
          poussé en `update` par ConsentMode. */}
      <Script
        id="google-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              analytics_storage: 'granted',
              functionality_storage: 'granted',
              security_storage: 'granted'
            });
          `,
        }}
      />

      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });
          `,
        }}
      />
    </>
  );
}
