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

      {/* Global Lead & Persistence Hook — propage vers l'app le ?ref=
          d'affiliation et les utm_* de la page d'arrivée. Sans ça, un inscrit
          venu de la bio Instagram était enregistré « robi-app.com » : l'app ne
          voit que le référent, et les utm restent sur la première page du
          site. Mémorisés pour la visite (sessionStorage, rien de déposé chez
          un tiers), repris sur n'importe quelle page du site. */}
      <Script id="affiliate-click-handler" strategy="afterInteractive">
        {`
          (function () {
            var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
            var STORE = 'robi_utm';
            var REF_STORE = 'robi_ref';
            var REF_TTL = 90 * 24 * 3600 * 1000;
            var landing = new URLSearchParams(window.location.search);
            // Code partenaire (?ref=CODE) : gardé 90 jours sur le site, comme
            // dans l'app, pour qu'un visiteur qui revient plus tard par la page
            // tarifs parte quand même vers l'app avec son code.
            var normRef = function (v) {
              v = (v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
              return v.length >= 3 && v.length <= 24 ? v : '';
            };
            var storedRef = function () {
              try {
                var raw = JSON.parse(localStorage.getItem(REF_STORE) || 'null');
                if (!raw || !raw.at || Date.now() - Date.parse(raw.at) > REF_TTL) return '';
                return normRef(raw.code);
              } catch (err) { return ''; }
            };
            try {
              var landingRef = normRef(landing.get('ref'));
              if (landingRef) localStorage.setItem(REF_STORE, JSON.stringify({ code: landingRef, at: new Date().toISOString() }));
            } catch (err) {}
            try {
              if (landing.get('utm_source')) {
                var keep = {};
                KEYS.forEach(function (k) { var v = landing.get(k); if (v) keep[k] = v.slice(0, 120); });
                sessionStorage.setItem(STORE, JSON.stringify(keep));
              }
            } catch (err) {}

            document.addEventListener('click', function (e) {
              var link = e.target.closest && e.target.closest('a');
              if (!link || !link.href || link.href.indexOf('go.robi-app.com') === -1) return;
              var targetUrl = new URL(link.href);
              var ref = normRef(new URLSearchParams(window.location.search).get('ref')) || storedRef();
              if (ref) targetUrl.searchParams.set('ref', ref);
              var utm = null;
              try { utm = JSON.parse(sessionStorage.getItem(STORE) || 'null'); } catch (err) {}
              if (utm && !targetUrl.searchParams.get('utm_source')) {
                KEYS.forEach(function (k) { if (utm[k]) targetUrl.searchParams.set(k, utm[k]); });
              }
              link.href = targetUrl.toString();
            });
          })();
        `}
      </Script>
    </>
  );
}
