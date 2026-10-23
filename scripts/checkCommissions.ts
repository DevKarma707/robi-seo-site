/**
 * Vérifie les règles de commission (partenaires / ambassadeurs).
 * npx tsx scripts/checkCommissions.ts
 */
import assert from "node:assert/strict";
import {
  AMBASSADEUR_TERMS, computeCommission, termsOf, minus, formatMoney, reachesPayout, linesOfRow, type SaleLine,
} from "../src/lib/commissions";

const line = (p: Partial<SaleLine>): SaleLine => ({ cur: "EUR", net: 0, m: 0, first: true, refunded: false, cust: "c1", ...p });

// 1. Une fiche d'avant le 23/10 : partenaire, 20 %, premier paiement seulement.
const old = termsOf({ commissionPct: 20 });
assert.equal(old.programme, "partenaire");
assert.equal(old.commissionMonths, null);
{
  const r = computeCommission([
    line({ net: 1120 }),                       // 14 € remisé à 11,20 €
    line({ net: 1400, m: 1, first: false }),   // renouvellement
    line({ net: 1400, m: 2, first: false }),
  ], old);
  assert.deepEqual(r.earned, { EUR: 224 });     // 2,24 € comme le 29/09
  assert.equal(r.renewals, 0);
}

// 2. Ambassadeur, client mensuel en dirhams : 30 % pendant 12 mois.
{
  const lines: SaleLine[] = [line({ cur: "MAD", net: 4720 })]; // 59 DH − 20 %
  for (let m = 1; m <= 13; m++) lines.push(line({ cur: "MAD", net: 5900, m, first: false }));
  const r = computeCommission(lines, AMBASSADEUR_TERMS);
  // 14,16 + 11 × 17,70 = 208,86 DH (les mois 12 et 13 sont hors fenêtre)
  assert.deepEqual(r.earned, { MAD: 20886 });
  assert.equal(r.renewals, 11);
  assert.equal(r.bonusEarned, false);
}

// 3. Annuel : le renouvellement à 12 mois n'est pas commissionné.
{
  const r = computeCommission([line({ cur: "MAD", net: 47200 }), line({ cur: "MAD", net: 59000, m: 12, first: false })], AMBASSADEUR_TERMS);
  assert.deepEqual(r.earned, { MAD: 14160 });
}

// 4. Remboursements exclus, devises séparées, prime au 10e client payant.
{
  const lines: SaleLine[] = [];
  for (let i = 0; i < 9; i++) lines.push(line({ net: 1120, cust: `k${i}` }));
  lines.push(line({ net: 1120, cust: "rembourse", refunded: true }));
  let r = computeCommission(lines, AMBASSADEUR_TERMS);
  assert.equal(r.payingCustomers, 9);
  assert.equal(r.bonusEarned, false);
  lines.push(line({ cur: "MAD", net: 4720, cust: "k9" }));
  r = computeCommission(lines, AMBASSADEUR_TERMS);
  assert.equal(r.payingCustomers, 10);
  assert.equal(r.bonusEarned, true);
  assert.deepEqual(r.bonus, { MAD: 30000 });
  assert.deepEqual(r.total, { EUR: 9 * 336, MAD: 1416 + 30000 });
  assert.deepEqual(minus(r.total, { EUR: 1000 }), { EUR: 9 * 336 - 1000, MAD: 31416 });
  assert.equal(formatMoney({ EUR: 2024, MAD: 30000 }).replace(/\s/g, " "), "20,24 € + 300 DH");
}

// 5. Seuils de versement : 30 € ou 300 DH.
assert.equal(reachesPayout({ EUR: 2999 }), false);
assert.equal(reachesPayout({ EUR: 2999, MAD: 30000 }), true);

// 6. Stats d'avant (sans lignes) : même résultat qu'avant.
assert.deepEqual(
  computeCommission(linesOfRow({ netAmount: 4720, currency: "eur", sales: 1, discountId: "d" }), old).earned,
  { EUR: 944 },
);

console.log("✓ commissions : 6 scénarios OK");
