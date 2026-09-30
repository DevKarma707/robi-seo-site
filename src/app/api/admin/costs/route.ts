import { NextResponse } from "next/server";
import { requireAdmin, callRobiFunction } from "@/lib/adminAuth";
import { metaMonthlySpend } from "@/lib/metaSpend";

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
  const report = json as { months?: { month: string; total: number; activeUsers: number }[]; ads?: unknown };
  if (status !== 200 || !Array.isArray(report?.months)) return NextResponse.json(json, { status });

  // Pubs Meta, mois par mois, ajoutées au total et au coût par actif.
  const meta = await metaMonthlySpend(report.months.map((m) => m.month));
  const round2 = (x: number) => Math.round(x * 100) / 100;
  report.months = report.months.map((m) => {
    const spend = meta.byMonth[m.month] ?? 0;
    const total = round2(m.total + spend);
    return {
      ...m,
      ads: { spend, currency: meta.currency },
      total,
      costPerActiveUser: m.activeUsers > 0 ? round2(total / m.activeUsers) : null,
    };
  });
  report.ads = { source: "meta", currency: meta.currency, ...(meta.error ? { error: meta.error } : {}) };
  return NextResponse.json(report, { status });
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
