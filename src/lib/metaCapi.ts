import { createHash } from "crypto";

/**
 * API Conversions de Meta — événements envoyés côté serveur.
 *
 * Complète le pixel (components/MetaPixel.tsx) là où le navigateur ne voit
 * rien : le paiement se fait chez Polar, et la confirmation n'arrive qu'au
 * webhook. C'est ce qui permet à Meta (et à l'onglet Ads de l'admin) de
 * calculer un ROI : dépense publicitaire ↔ achats réels.
 *
 * Le token (META_CAPI_ACCESS_TOKEN) se génère dans le Gestionnaire
 * d'événements → ensemble de données → Paramètres → API Conversions. Il reste
 * côté serveur. Sans lui, les appels sont ignorés sans bruit : rien ne casse.
 */

const PIXEL_ID = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "975561445564920";
const TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
const GRAPH = "https://graph.facebook.com/v23.0";

const sha256 = (s: string) => createHash("sha256").update(s.trim().toLowerCase()).digest("hex");

export interface MetaServerEvent {
  /** « Purchase », « Subscribe », « CompleteRegistration »… */
  eventName: string;
  /** Identifiant stable : Meta dédoublonne avec le pixel sur (eventName, eventId). */
  eventId: string;
  email?: string;
  value?: number;
  currency?: string;
  eventSourceUrl?: string;
}

export async function sendMetaEvent(e: MetaServerEvent): Promise<void> {
  if (!TOKEN) return;
  const payload = {
    data: [
      {
        event_name: e.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: "website",
        event_source_url: e.eventSourceUrl || "https://robi-app.com",
        // L'email est haché (SHA-256) avant de partir, comme Meta l'exige.
        user_data: e.email ? { em: [sha256(e.email)] } : {},
        custom_data:
          e.value !== undefined ? { value: e.value, currency: (e.currency || "EUR").toUpperCase() } : undefined,
      },
    ],
  };
  try {
    const res = await fetch(`${GRAPH}/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error("[META CAPI]", res.status, (await res.text()).slice(0, 300));
    else console.log(`[META CAPI] ${e.eventName} envoyé (${e.eventId})`);
  } catch (err) {
    console.error("[META CAPI ERROR]", err);
  }
}
