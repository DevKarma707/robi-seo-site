import { NextResponse } from "next/server";
import { requireAdmin, callRobiFunction } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** Reads the launch-offer config + the real number of sold seats. */
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const { status, json } = await callRobiFunction("updateLaunchOffer");
  return NextResponse.json(json, { status });
}

/** Updates the launch-offer config (seats, offset, override, deadline, kill-switch). */
export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { status, json } = await callRobiFunction("updateLaunchOffer", {
    method: "POST",
    body,
  });
  console.log(`[admin/launch] ${guard.email} updated launch offer → ${status}`);
  return NextResponse.json(json, { status });
}
