import { NextResponse } from "next/server";
import { requireAdmin, callRobiFunction } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/** Health report: silent failures across emails, client crashes, AI and crons. */
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const days = new URL(req.url).searchParams.get("days") || "7";
  const { status, json } = await callRobiFunction("getHealthReport", {
    query: `days=${encodeURIComponent(days)}`,
  });
  return NextResponse.json(json, { status });
}
