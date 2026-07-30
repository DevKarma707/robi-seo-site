import { NextResponse } from "next/server";
import { requireAdmin, callRobiFunction } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** Ventes groupées par code promo, pour rattacher chaque vente à son influenceur. */
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const days = new URL(req.url).searchParams.get("days");
  const { status, json } = await callRobiFunction("getAttributionStats", {
    query: days ? `days=${encodeURIComponent(days)}` : undefined,
  });
  return NextResponse.json(json, { status });
}
