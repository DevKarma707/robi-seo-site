import { NextResponse } from "next/server";
import { getPublicStatus } from "@/lib/publicStatus";

export const dynamic = "force-dynamic";

/** Public, unauthenticated read of the health report — sanitized in
 *  publicStatus.ts. Feeds the /status page's refresh button, and is stable
 *  enough for an external uptime monitor to poll. */
export async function GET() {
  const status = await getPublicStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
