'use client';

import Script from 'next/script';
import { useConsent } from '@/hooks/useConsent';

/**
 * AffiliateTracking Component
 *
 * Injects Tolt and Reditus tracking scripts.
 * IDs should be provided via environment variables:
 * - NEXT_PUBLIC_TOLT_ID
 * - NEXT_PUBLIC_REDITUS_ID
 *
 * Tolt et Reditus déposent des cookies de suivi d'affiliation : ils ne sont
 * chargés qu'après consentement « marketing ». La propagation du paramètre
 * `ref` ci-dessous ne dépose rien et reste active sans consentement.
 */
export function AffiliateTracking() {
  const { ready, marketing } = useConsent();
  const toltId = process.env.NEXT_PUBLIC_TOLT_ID;
  const reditusId = process.env.NEXT_PUBLIC_REDITUS_ID;

  // Only load in production to avoid tracking dev clicks
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const allowTrackers = ready && marketing;

  return (
    <>
      {/* Tolt Tracking */}
      {allowTrackers && toltId && (
        <Script
          src="https://cdn.tolt.io/tolt.js"
          data-tolt={toltId}
          strategy="afterInteractive"
        />
      )}

      {/* Reditus Tracking */}
      {allowTrackers && reditusId && (
        <Script
          src={`https://app.getreditus.com/v1/scripts/${reditusId}.js`}
          strategy="afterInteractive"
          async
        />
      )}

      {/* Global Lead & Persistence Hook */}
      <Script id="affiliate-click-handler" strategy="afterInteractive">
        {`
          document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link || !link.href) return;

            // Target links to your app
            if (link.href.includes('go.robi-app.com')) {
              const urlParams = new URLSearchParams(window.location.search);
              const ref = urlParams.get('ref');
              
              if (ref) {
                const targetUrl = new URL(link.href);
                targetUrl.searchParams.set('ref', ref);
                link.href = targetUrl.toString();
              }
              
              console.log('[AFFILIATE] Propagation du ref vers l\\'app:', ref || 'aucun');
            }
          });
        `}
      </Script>
    </>
  );
}
