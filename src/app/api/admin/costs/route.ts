import { NextResponse } from "next/server";
import { requireAdmin, callRobiFunction } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Dépenses de Robi : la consommation IA mesurée, et les factures saisies à la
 * main. L'admin suivait les revenus sans les coûts — la moitié d'une réponse
 * à « est-ce qu'on est rentable ? ».
 */
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const months = new URL(req.url).searchParams.get("months") || "6";
  const { status, json } = await callRobiFunction("getCostReport", {
    query: `months=${encodeURIComponent(months)}`,
  });
  return NextResponse.json(json, { status });
}

/** Créer ou modifier une dépense déclarée, ou régler le tarif des tokens. */
export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "corps invalide" }, { status: 400 });

  const { status, json } = await callRobiFunction("saveCost", { method: "POST", body });
  return NextResponse.json(json, { status });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const { status, json } = await callRobiFunction("saveCost", {
    method: "DELETE",
    query: `id=${encodeURIComponent(id)}`,
  });
  return NextResponse.json(json, { status });
}
