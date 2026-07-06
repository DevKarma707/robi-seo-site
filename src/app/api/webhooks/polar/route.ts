import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Endpoint: /api/webhooks/polar
 * 
 * This handler receives events from Polar.sh and synchronizes 
 * transactions with Tolt and Reditus for affiliate tracking.
 */

const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";
const TOLT_API_KEY = process.env.TOLT_API_KEY || "";
const REDITUS_API_KEY = process.env.REDITUS_API_KEY || "";

/**
 * Verify signatures from Standard Webhooks (used by Polar.sh)
 */
function verifyPolarSignature(
  payload: string,
  headers: Headers,
  secret: string
): boolean {
  const webhookId = headers.get("webhook-id");
  const webhookTimestamp = headers.get("webhook-timestamp");
  const webhookSignature = headers.get("webhook-signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature || !secret) {
    return false;
  }

  // Standard webhooks format: id.timestamp.payload
  const signedPayload = `${webhookId}.${webhookTimestamp}.${payload}`;
  
  // Signatures are comma separated: v1,base64hash v1,base64hash
  const signatures = webhookSignature.split(" ");
  
  for (const sig of signatures) {
    const parts = sig.split(",");
    if (parts.length !== 2) continue;
    
    const [version, hash] = parts;
    if (version !== "v1") continue;

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(signedPayload);
    const expectedHash = hmac.digest("base64");

    try {
      if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
        return true;
      }
    } catch (e) {
      continue;
    }
  }

  return false;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Verify Signature
  if (!verifyPolarSignature(rawBody, req.headers, POLAR_WEBHOOK_SECRET)) {
    console.error("[POLAR WEBHOOK] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  console.log(`[POLAR WEBHOOK] Received event: ${event.type}`);

  // 2. Handle relevant events (payments/subscriptions)
  // Possible types: order.created, subscription.created
  if (event.type === "order.created" || event.type === "subscription.created") {
    const data = event.data;
    const customerEmail = data.customer_email || data.user?.email;
    const amount = data.amount || data.price_amount;
    const currency = data.currency || "usd";
    const transactionId = data.id;

    if (!customerEmail) {
      console.warn("[POLAR WEBHOOK] No customer email found in event data");
      return NextResponse.json({ success: true, message: "No email, skipped" });
    }

    // 3. Notify Tolt
    if (TOLT_API_KEY) {
      try {
        await fetch("https://api.tolt.io/v1/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOLT_API_KEY}`,
          },
          body: JSON.stringify({
            customer_id: customerEmail, // Using email as ID for tracking
            amount: amount / 100, // Polar amounts are usually in cents
            currency: currency.toUpperCase(),
            external_id: transactionId,
          }),
        });
        console.log(`[TOLT] Transaction reported for ${customerEmail}`);
      } catch (err) {
        console.error("[TOLT ERROR]", err);
      }
    }

    // 4. Notify Reditus
    if (REDITUS_API_KEY) {
      try {
        await fetch("https://app.getreditus.com/api/v1/payments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${REDITUS_API_KEY}`,
          },
          body: JSON.stringify({
            email: customerEmail,
            amount: amount / 100,
            currency: currency.toUpperCase(),
            external_id: transactionId,
            idempotency_key: `polar_${transactionId}`,
          }),
        });
        console.log(`[REDITUS] Payment reported for ${customerEmail}`);
      } catch (err) {
        console.error("[REDITUS ERROR]", err);
      }
    }
  }

  return NextResponse.json({ success: true });
}
