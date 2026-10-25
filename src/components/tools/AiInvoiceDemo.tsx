"use client";

import { useMemo, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

/**
 * Démo « tape ta prestation → facture d'exemple » en haut de
 * /en/ai-invoice-generator. Les concurrents de la page 1 (QuickBooks, HubSpot,
 * template.net) laissent tester sans compte : ici aussi.
 *
 * Tout se passe dans le navigateur, sans IA ni serveur : une lecture simple
 * de la phrase (client, quantité, tarif, taxe, échéance) pour montrer le
 * principe. La vraie app comprend bien plus — on le dit sous la facture.
 */

type Market = { intl: string; currency: string; tax: number; taxLabel: string };

const MARKETS: Record<string, Market> = {
  en: { intl: "en-GB", currency: "GBP", tax: 20, taxLabel: "VAT" },
  "en-US": { intl: "en-US", currency: "USD", tax: 0, taxLabel: "Sales tax" },
  "en-AU": { intl: "en-AU", currency: "AUD", tax: 10, taxLabel: "GST" },
  "en-IE": { intl: "en-IE", currency: "EUR", tax: 23, taxLabel: "VAT" },
  "en-NL": { intl: "en-IE", currency: "EUR", tax: 21, taxLabel: "VAT" },
  "en-AE": { intl: "en-AE", currency: "AED", tax: 5, taxLabel: "VAT" },
};

const EXAMPLES: Record<string, string[]> = {
  GBP: [
    "3 days of web design at £450 a day for Nova Ltd, due in 30 days",
    "Bathroom tiling for Harper & Co, 2 days at £220 a day",
    "10 hours of bookkeeping at £35 an hour for Green Leaf Café",
  ],
  USD: [
    "3 days of web design at $450 a day for Nova LLC, due in 30 days",
    "Water heater install for the Johnsons, $1,450, due on receipt",
    "10 hours of bookkeeping at $40 an hour for Green Leaf Café",
  ],
  default: [
    "3 days of web design at 450 a day for Nova, due in 30 days",
    "Logo design for Green Leaf Café, 1200",
    "10 hours of consulting at 85 an hour for Studio Van Dijk",
  ],
};

const UNITS = "days?|hours?|hrs?|sessions?|pages?|items?|units?|weeks?|months?";

function parse(text: string, market: Market) {
  const WORDS: Record<string, string> = { one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10" };
  const t = text
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b(?=\s+(?:days?|hours?|weeks?|sessions?))/gi, (w) => WORDS[w.toLowerCase()]);
  const num = (s?: string) => (s ? parseFloat(s.replace(/,/g, "")) : NaN);
  const NAME = "\\p{Lu}[\\p{L}\\p{N}'&.-]*(?:\\s+(?:&|and|\\p{Lu}[\\p{L}\\p{N}'&.-]*))*";

  // L'échéance d'abord, pour que « due in 30 days » ne passe ni pour une quantité ni pour un prix.
  const dueMatch = t.match(/(?:due in|payment in|within|net)\s*(\d+)\s*(?:days?)?|(\d+)\s*days? to pay/i);
  const dueDays = dueMatch ? num(dueMatch[1] || dueMatch[2]) : /receipt|completion/i.test(t) ? 0 : 30;
  let body = dueMatch ? t.replace(dueMatch[0], "") : t;

  // « Invoice Acme for 5 hours… » : le client vient juste après le verbe.
  const lead = body.match(new RegExp(`^(?:[Ii]nvoice|[Bb]ill|[Cc]harge)\\s+(?:the\\s+)?(${NAME})\\s+for\\s+`, "u"));
  const client =
    lead?.[1] ||
    body.match(new RegExp(`\\bfor (?:the )?(${NAME})`, "u"))?.[1]?.replace(/[.,]$/, "") ||
    "Your client";
  if (lead) body = body.slice(lead[0].length);

  const qtyMatch = body.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${UNITS})\\b`, "i"));
  const rateMatch = body.match(/(?:at|@)\s*[£$€]?\s*(\d[\d,]*(?:\.\d+)?)/i);
  // Montants de la phrase, hors durées et pourcentages (« 3 days », « 20% »).
  const amounts = [...body.matchAll(new RegExp(`[£$€]?\\s?(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?(?![\\d,.]*\\s*(?:%|${UNITS}))`, "gi"))].map((m) => m[0]);

  const qty = qtyMatch ? num(qtyMatch[1].replace(",", ".")) : 1;
  const unit = qtyMatch ? qtyMatch[2].toLowerCase().replace(/s$/, "") : "";
  let rate = rateMatch ? num(rateMatch[1]) : NaN;
  if (Number.isNaN(rate)) {
    // Pas de « at … » : le plus grand montant de la phrase est le total, réparti sur la quantité.
    const values = amounts.map((a) => num(a.replace(/[£$€\s]/g, ""))).filter((v) => !Number.isNaN(v) && v >= 10);
    rate = values.length ? Math.max(...values) / qty : NaN;
  }
  if (!rate || Number.isNaN(rate)) rate = 500;

  const service =
    body.match(new RegExp(`\\d+(?:[.,]\\d+)?\\s*(?:${UNITS})\\s+of\\s+(.+?)(?:\\s+(?:at|@|for)\\s|,|$)`, "i"))?.[1] ||
    (lead ? "" : body.match(/^(?:invoice|bill|quote|estimate)?\s*(?:for\s+)?(.+?)(?:\s+for\s+(?:the\s+)?[A-Z]|,|\s+at\s|\s+\d|$)/i)?.[1]) ||
    (unit ? `${unit.charAt(0).toUpperCase()}${unit.slice(1)}s of work` : "Services");

  const taxMatch = t.match(/(\d+(?:\.\d+)?)\s*%/);
  const tax = taxMatch ? num(taxMatch[1]) : market.tax;

  const net = Math.round(qty * rate * 100) / 100;
  const taxAmount = Math.round(net * tax) / 100;
  return {
    client,
    service: service.charAt(0).toUpperCase() + service.slice(1),
    qty,
    unit,
    rate,
    net,
    tax,
    taxAmount,
    total: Math.round((net + taxAmount) * 100) / 100,
    dueDays,
  };
}

export function AiInvoiceDemo({ locale }: { locale: string }) {
  const market = MARKETS[locale] ?? MARKETS.en;
  const examples = EXAMPLES[market.currency] ?? EXAMPLES.default;
  const [text, setText] = useState(examples[0]);
  const [submitted, setSubmitted] = useState(examples[0]);
  const inv = useMemo(() => parse(submitted, market), [submitted, market]);
  const [now] = useState(() => Date.now());

  const money = (v: number) =>
    new Intl.NumberFormat(market.intl, { style: "currency", currency: market.currency }).format(v);
  const date = (offset: number) =>
    new Intl.DateTimeFormat(market.intl, { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(now + offset * 86400000),
    );

  return (
    <section id="try" className="bg-[#0D0630] pb-16 md:pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10 items-start">
          {/* Saisie */}
          <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#BEF221]">Try it — no sign-up</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight text-white">Type the job, get the invoice</h2>
            <p className="mt-2 text-sm md:text-base text-white/60">
              Describe what you did, for whom and how much. In the app you can also just say it out loud.
            </p>
            <form
              className="mt-5"
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(text);
              }}
            >
              <label htmlFor="ai-invoice-prompt" className="sr-only">Describe the job to invoice</label>
              <textarea
                id="ai-invoice-prompt"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-2xl border border-white/15 bg-[#0D0630] p-4 text-base text-white placeholder-white/40 focus:border-[#BEF221] focus:outline-none"
                placeholder={examples[0]}
              />
              <button
                type="submit"
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#BEF221] px-6 py-3.5 text-base font-bold text-[#0D0630] transition hover:brightness-95 sm:w-auto"
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                Generate invoice
              </button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setText(ex);
                    setSubmitted(ex);
                  }}
                  className="rounded-full border border-white/15 px-3 py-1.5 text-left text-xs text-white/70 hover:border-[#BEF221] hover:text-white"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Facture d'exemple */}
          <div>
            <div className="rounded-[28px] bg-white p-5 md:p-8 text-[#0D0630] shadow-[0_30px_80px_rgba(0,0,0,0.35)]" aria-live="polite">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Invoice</p>
                  <p className="mt-1 text-lg font-black tabular-nums">INV-0001</p>
                </div>
                <div className="text-right text-sm text-gray-500" suppressHydrationWarning>
                  <p>Issued {date(0)}</p>
                  <p>{inv.dueDays === 0 ? "Due on receipt" : `Due ${date(inv.dueDays)}`}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Bill to</p>
                <p className="mt-1 font-bold">{inv.client}</p>
              </div>
              <table className="mt-6 w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-400">
                    <th className="py-2 font-semibold">Description</th>
                    <th className="py-2 text-right font-semibold">Qty</th>
                    <th className="py-2 text-right font-semibold">Rate</th>
                    <th className="py-2 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100 align-top">
                    <td className="py-3 pr-2">{inv.service}</td>
                    <td className="py-3 text-right tabular-nums whitespace-nowrap">
                      {inv.qty} {inv.unit ? `${inv.unit}${inv.qty > 1 ? "s" : ""}` : ""}
                    </td>
                    <td className="py-3 text-right tabular-nums">{money(inv.rate)}</td>
                    <td className="py-3 text-right tabular-nums font-semibold">{money(inv.net)}</td>
                  </tr>
                </tbody>
              </table>
              <dl className="mt-4 ml-auto max-w-[260px] space-y-1.5 text-sm">
                <div className="flex justify-between gap-4"><dt className="text-gray-500">Subtotal</dt><dd className="tabular-nums">{money(inv.net)}</dd></div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">{market.taxLabel} {inv.tax}%</dt>
                  <dd className="tabular-nums">{money(inv.taxAmount)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-200 pt-2 text-base font-black">
                  <dt>Total due</dt><dd className="tabular-nums">{money(inv.total)}</dd>
                </div>
              </dl>
            </div>
            <p className="mt-4 text-sm text-white/60">
              Sample invoice built in your browser. In Robi, the AI also adds your business details, tax ID and legal
              mentions, numbers it in sequence, then sends it with a payment link.
            </p>
            <a
              href="https://go.robi-app.com/?signup"
              className="mt-4 inline-flex items-center gap-2 font-bold text-[#BEF221] hover:underline underline-offset-4"
            >
              Create it for real — free, no card <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
