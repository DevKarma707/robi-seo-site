import { NextResponse } from "next/server";
import { requireAdmin, callRobiFunction } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** Aggregated app stats (signups, activation, Pro, documents). Counts only. */
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const refresh = new URL(req.url).searchParams.get("refresh") === "1";
  const { status, json } = await callRobiFunction("getAdminStats", {
    query: refresh ? "refresh=1" : undefined,
  });
  return NextResponse.json(json, { status });
}
