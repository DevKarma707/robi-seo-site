import { NextResponse } from "next/server";
import { requireAdmin, callRobiFunction } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Crée (POST) ou désactive (DELETE) le code Polar d'un influenceur.
 * Le travail est fait par la function `manageInfluencerCode` du projet app,
 * seule à porter le jeton Polar ; ici on ne fait que vérifier l'admin.
 */
export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const body = await req.json().catch(() => ({}));
  const { status, json } = await callRobiFunction("manageInfluencerCode", { method: "POST", body });
  return NextResponse.json(json, { status });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }
  const code = new URL(req.url).searchParams.get("code") || "";
  const { status, json } = await callRobiFunction("manageInfluencerCode", {
    method: "DELETE",
    query: `code=${encodeURIComponent(code)}`,
  });
  return NextResponse.json(json, { status });
}
