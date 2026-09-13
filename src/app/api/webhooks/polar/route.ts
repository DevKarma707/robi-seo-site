import { NextRequest, NextResponse } from "next/server";
import { verifyPolarSignature, toMajorUnits } from "@/lib/polarWebhook";

/**
 * Endpoint: /api/webhooks/polar
 * 
 * This handler receives events from Polar.sh and synchronizes 
 * transactions with Tolt and Reditus for affiliate tracking.
 */

const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET || "";
const TOLT_API_KEY = process.env.TOLT_API_KEY || "";
const REDITUS_API_KEY = process.env.REDITUS_API_KEY || "";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // 1. Verify Signature
  const verdict = verifyPolarSignature(
    rawBody,
    {
      id: req.headers.get("webhook-id"),
      timestamp: req.headers.get("webhook-timestamp"),
      signature: req.headers.get("webhook-signature"),
    },
    POLAR_WEBHOOK_SECRET,
  );
  if (!verdict.ok) {
    // Le motif part dans les logs, pas dans la réponse : inutile d'indiquer à
    // qui frappe laquelle des vérifications a échoué.
    console.error("[POLAR WEBHOOK] Signature refusée —", verdict.reason);
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
            amount: toMajorUnits(amount),
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
            amount: toMajorUnits(amount),
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
