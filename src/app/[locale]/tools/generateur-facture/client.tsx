"use client";

import { useEffect, useMemo, useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Locale } from "@/lib/i18n/config";
import { Plus, Trash2, Download, Sparkles, Mic } from "lucide-react";

type Lang = "fr" | "en" | "es";

interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  locale: Locale;
  lang: Lang;
  ctaDict: { title?: string; subtitle?: string; button?: string; subtext?: string };
  toolsLabel: string;
  faq: { q: string; a: string }[];
}

const ui: Record<Lang, Record<string, string>> = {
  fr: {
    heroBadge: "Outil gratuit",
    heroTitle: "Générateur de facture gratuit",
    heroAccent: "en ligne",
    heroSubtitle:
      "Créez une facture professionnelle et téléchargez-la en PDF. Gratuit, sans inscription, calcul de TVA automatique.",
    yourInfo: "Vos informations (émetteur)",
    clientInfo: "Client",
    name: "Nom / Société",
    address: "Adresse",
    siret: "SIREN / SIRET",
    email: "Email",
    phone: "Téléphone",
    invoiceDetails: "Détails de la facture",
    invoiceNumber: "N° de facture",
    invoiceDate: "Date d'émission",
    dueDate: "Date d'échéance",
    items: "Prestations",
    itemDescription: "Description",
    qty: "Qté",
    unitPrice: "Prix unit. HT",
    lineTotal: "Total",
    addItem: "Ajouter une ligne",
    vatRate: "Taux de TVA (%)",
    vatExempt: "Franchise de TVA (micro-entreprise)",
    currency: "Devise",
    notes: "Notes / conditions de paiement",
    notesPlaceholder: "Ex : Paiement à 30 jours. Pénalités de retard : 3x le taux légal.",
    preview: "Aperçu",
    download: "Télécharger en PDF",
    reset: "Réinitialiser",
    invoice: "FACTURE",
    billedTo: "Facturé à",
    subtotal: "Total HT",
    vat: "TVA",
    total: "Total TTC",
    vatExemptMention: "TVA non applicable, art. 293 B du CGI",
    dueOn: "Échéance",
    issuedOn: "Émise le",
    emptyItem: "Description de la prestation",
    faqTitle: "Questions fréquentes",
    ctaBlockTitle: "Marre de remplir une facture à la main ?",
    ctaBlockText:
      "Avec Robi, dites « Facture de 500 € pour Alice » et l'IA génère le document conforme en 30 secondes, l'envoie, relance les impayés et encaisse via Stripe.",
    ctaBlockButton: "Essayer Robi gratuitement",
    learnMore: "Découvrir la facture par IA",
  },
  en: {
    heroBadge: "Free tool",
    heroTitle: "Free invoice generator",
    heroAccent: "online",
    heroSubtitle:
      "Create a professional invoice and download it as a PDF. Free, no sign-up, automatic VAT calculation.",
    yourInfo: "Your details (sender)",
    clientInfo: "Client",
    name: "Name / Company",
    address: "Address",
    siret: "Company reg. number",
    email: "Email",
    phone: "Phone",
    invoiceDetails: "Invoice details",
    invoiceNumber: "Invoice no.",
    invoiceDate: "Issue date",
    dueDate: "Due date",
    items: "Line items",
    itemDescription: "Description",
    qty: "Qty",
    unitPrice: "Unit price (excl.)",
    lineTotal: "Total",
    addItem: "Add a line",
    vatRate: "VAT rate (%)",
    vatExempt: "VAT exempt (small business)",
    currency: "Currency",
    notes: "Notes / payment terms",
    notesPlaceholder: "E.g. Payment due in 30 days. Late fees apply.",
    preview: "Preview",
    download: "Download as PDF",
    reset: "Reset",
    invoice: "INVOICE",
    billedTo: "Billed to",
    subtotal: "Subtotal",
    vat: "VAT",
    total: "Total",
    vatExemptMention: "VAT not applicable",
    dueOn: "Due",
    issuedOn: "Issued",
    emptyItem: "Service description",
    faqTitle: "Frequently asked questions",
    ctaBlockTitle: "Tired of filling in invoices by hand?",
    ctaBlockText:
      "With Robi, say \"£500 invoice for Alice\" and AI generates the compliant document in 30 seconds, sends it, chases late payers and collects via Stripe.",
    ctaBlockButton: "Try Robi for free",
    learnMore: "Discover AI invoicing",
  },
  es: {
    heroBadge: "Herramienta gratis",
    heroTitle: "Generador de facturas gratis",
    heroAccent: "online",
    heroSubtitle:
      "Crea una factura profesional y descárgala en PDF. Gratis, sin registro, cálculo de IVA automático.",
    yourInfo: "Tus datos (emisor)",
    clientInfo: "Cliente",
    name: "Nombre / Empresa",
    address: "Dirección",
    siret: "NIF / CIF",
    email: "Email",
    phone: "Teléfono",
    invoiceDetails: "Detalles de la factura",
    invoiceNumber: "N.º de factura",
    invoiceDate: "Fecha de emisión",
    dueDate: "Fecha de vencimiento",
    items: "Líneas",
    itemDescription: "Descripción",
    qty: "Cant.",
    unitPrice: "Precio unit. (sin IVA)",
    lineTotal: "Total",
    addItem: "Añadir línea",
    vatRate: "Tipo de IVA (%)",
    vatExempt: "Exento de IVA (autónomo)",
    currency: "Moneda",
    notes: "Notas / condiciones de pago",
    notesPlaceholder: "Ej: Pago a 30 días. Recargo por demora aplicable.",
    preview: "Vista previa",
    download: "Descargar en PDF",
    reset: "Reiniciar",
    invoice: "FACTURA",
    billedTo: "Facturado a",
    subtotal: "Base imponible",
    vat: "IVA",
    total: "Total",
    vatExemptMention: "IVA no aplicable",
    dueOn: "Vencimiento",
    issuedOn: "Emitida",
    emptyItem: "Descripción del servicio",
    faqTitle: "Preguntas frecuentes",
    ctaBlockTitle: "¿Cansado de rellenar facturas a mano?",
    ctaBlockText:
      "Con Robi, di «Factura de 500 € para Alice» y la IA genera el documento conforme en 30 segundos, lo envía, reclama los impagos y cobra con Stripe.",
    ctaBlockButton: "Probar Robi gratis",
    learnMore: "Descubrir la factura con IA",
  },
};

const CURRENCIES = ["€", "$", "£", "CHF", "CA$", "MAD"];

const STORAGE_KEY = "robi-facture-generator";

function defaultState(lang: Lang) {
  return {
    sellerName: "",
    sellerAddress: "",
    sellerSiret: "",
    sellerEmail: "",
    sellerPhone: "",
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    invoiceNumber: "2026-001",
    invoiceDate: "",
    dueDate: "",
    vatRate: 20,
    vatExempt: false,
    currency: lang === "en" ? "£" : "€",
    notes: "",
    items: [{ id: 1, description: "", quantity: 1, unitPrice: 0 }] as LineItem[],
  };
}

export function GenerateurFactureClient({ locale, lang, ctaDict, toolsLabel, faq }: Props) {
  const T = ui[lang];
  const [state, setState] = useState(() => defaultState(lang));
  const [loaded, setLoaded] = useState(false);

  // Restore from localStorage (client-only, no server roundtrip)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items)) setState({ ...defaultState(lang), ...parsed });
      }
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [lang]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, loaded]);

  const set = <K extends keyof typeof state>(key: K, value: (typeof state)[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const updateItem = (id: number, patch: Partial<LineItem>) =>
    setState((s) => ({
      ...s,
      items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));

  const addItem = () =>
    setState((s) => ({
      ...s,
      items: [...s.items, { id: Date.now(), description: "", quantity: 1, unitPrice: 0 }],
    }));

  const removeItem = (id: number) =>
    setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));

  const fmt = useMemo(() => {
    const loc = lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-GB";
    return new Intl.NumberFormat(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [lang]);

  const money = (n: number) =>
    lang === "en" ? `${state.currency}${fmt.format(n)}` : `${fmt.format(n)} ${state.currency}`;

  const subtotal = state.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const effectiveVat = state.vatExempt ? 0 : state.vatRate;
  const vatAmount = (subtotal * effectiveVat) / 100;
  const total = subtotal + vatAmount;

  const reset = () => setState(defaultState(lang));
  const downloadPdf = () => window.print();

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-[#BEF221] focus:ring-2 focus:ring-[#BEF221]/30 outline-none text-gray-900 text-sm";
  const labelClass = "block text-xs font-semibold text-gray-500 mb-1";

  return (
    <>
      {/* Print stylesheet: only the invoice paper prints */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden !important; }
              #invoice-paper, #invoice-paper * { visibility: visible !important; }
              #invoice-paper {
                position: absolute; left: 0; top: 0; width: 100%;
                box-shadow: none !important; border: none !important; margin: 0 !important;
              }
              .no-print { display: none !important; }
              @page { margin: 1.5cm; }
            }
          `,
        }}
      />

      <div className="bg-white pt-24 pb-4 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            locale={locale}
            items={[
              { label: toolsLabel, href: `/${locale}/tools` },
              { label: T.heroTitle },
            ]}
          />
        </div>
      </div>

      <div className="no-print">
        <Hero
          badge={T.heroBadge}
          title={T.heroTitle}
          titleAccent={T.heroAccent}
          subtitle={T.heroSubtitle}
          variant="centered"
        />
      </div>

      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ===== FORM ===== */}
            <div className="no-print space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{T.yourInfo}</h2>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>{T.name}</label>
                    <input className={inputClass} value={state.sellerName} onChange={(e) => set("sellerName", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>{T.address}</label>
                    <input className={inputClass} value={state.sellerAddress} onChange={(e) => set("sellerAddress", e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>{T.siret}</label>
                      <input className={inputClass} value={state.sellerSiret} onChange={(e) => set("sellerSiret", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>{T.email}</label>
                      <input className={inputClass} value={state.sellerEmail} onChange={(e) => set("sellerEmail", e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{T.phone}</label>
                    <input className={inputClass} value={state.sellerPhone} onChange={(e) => set("sellerPhone", e.target.value)} />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{T.clientInfo}</h2>
                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>{T.name}</label>
                    <input className={inputClass} value={state.clientName} onChange={(e) => set("clientName", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>{T.address}</label>
                    <input className={inputClass} value={state.clientAddress} onChange={(e) => set("clientAddress", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>{T.email}</label>
                    <input className={inputClass} value={state.clientEmail} onChange={(e) => set("clientEmail", e.target.value)} />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{T.invoiceDetails}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>{T.invoiceNumber}</label>
                    <input className={inputClass} value={state.invoiceNumber} onChange={(e) => set("invoiceNumber", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>{T.invoiceDate}</label>
                    <input type="date" className={inputClass} value={state.invoiceDate} onChange={(e) => set("invoiceDate", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>{T.dueDate}</label>
                    <input type="date" className={inputClass} value={state.dueDate} onChange={(e) => set("dueDate", e.target.value)} />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{T.items}</h2>
                <div className="space-y-3">
                  {state.items.map((it) => (
                    <div key={it.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6">
                        <label className={labelClass}>{T.itemDescription}</label>
                        <input className={inputClass} value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <label className={labelClass}>{T.qty}</label>
                        <input type="number" min={0} step="0.5" className={inputClass} value={it.quantity} onChange={(e) => updateItem(it.id, { quantity: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="col-span-3">
                        <label className={labelClass}>{T.unitPrice}</label>
                        <input type="number" min={0} step="0.01" className={inputClass} value={it.unitPrice} onChange={(e) => updateItem(it.id, { unitPrice: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="col-span-1 flex justify-center pb-2">
                        <button onClick={() => removeItem(it.id)} className="text-gray-300 hover:text-red-500 transition-colors" aria-label="Remove">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addItem} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-[#0D0630]">
                  <Plus className="w-4 h-4" /> {T.addItem}
                </button>
              </Card>

              <Card className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>{T.vatRate}</label>
                    <input type="number" min={0} max={100} className={inputClass} value={state.vatRate} disabled={state.vatExempt} onChange={(e) => set("vatRate", parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className={labelClass}>{T.currency}</label>
                    <select className={inputClass} value={state.currency} onChange={(e) => set("currency", e.target.value)}>
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-4 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={state.vatExempt} onChange={(e) => set("vatExempt", e.target.checked)} className="w-4 h-4 accent-[#BEF221]" />
                  {T.vatExempt}
                </label>
                <div className="mt-4">
                  <label className={labelClass}>{T.notes}</label>
                  <textarea className={`${inputClass} min-h-[70px]`} placeholder={T.notesPlaceholder} value={state.notes} onChange={(e) => set("notes", e.target.value)} />
                </div>
              </Card>
            </div>

            {/* ===== PREVIEW ===== */}
            <div className="lg:sticky lg:top-24 self-start">
              <div className="flex items-center justify-between mb-3 no-print">
                <h2 className="text-lg font-bold text-gray-900">{T.preview}</h2>
                <div className="flex gap-2">
                  <button onClick={reset} className="px-3 py-2 text-sm rounded-full border border-gray-200 text-gray-600 hover:bg-gray-100">
                    {T.reset}
                  </button>
                  <button onClick={downloadPdf} className="btn-slide inline-flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full bg-[#0D0630] text-white hover:bg-[#0D0630]/90">
                    <Download className="w-4 h-4" /> {T.download}
                  </button>
                </div>
              </div>

              <div id="invoice-paper" className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-10 text-gray-800">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-2xl font-black text-[#0D0630] tracking-tight">{T.invoice}</p>
                    <p className="text-sm text-gray-500 mt-1">#{state.invoiceNumber || "—"}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold text-gray-900">{state.sellerName || T.name}</p>
                    {state.sellerAddress && <p className="text-gray-500 whitespace-pre-line">{state.sellerAddress}</p>}
                    {state.sellerSiret && <p className="text-gray-500">{T.siret}: {state.sellerSiret}</p>}
                    {state.sellerEmail && <p className="text-gray-500">{state.sellerEmail}</p>}
                    {state.sellerPhone && <p className="text-gray-500">{state.sellerPhone}</p>}
                  </div>
                </div>

                <div className="flex justify-between mb-8 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{T.billedTo}</p>
                    <p className="font-bold text-gray-900">{state.clientName || "—"}</p>
                    {state.clientAddress && <p className="text-gray-500 whitespace-pre-line">{state.clientAddress}</p>}
                    {state.clientEmail && <p className="text-gray-500">{state.clientEmail}</p>}
                  </div>
                  <div className="text-right text-gray-500">
                    {state.invoiceDate && <p>{T.issuedOn}: {state.invoiceDate}</p>}
                    {state.dueDate && <p>{T.dueOn}: {state.dueDate}</p>}
                  </div>
                </div>

                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="border-b-2 border-[#0D0630] text-left text-gray-500">
                      <th className="py-2 font-semibold">{T.itemDescription}</th>
                      <th className="py-2 font-semibold text-right w-14">{T.qty}</th>
                      <th className="py-2 font-semibold text-right w-28">{T.unitPrice}</th>
                      <th className="py-2 font-semibold text-right w-28">{T.lineTotal}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.items.map((it) => (
                      <tr key={it.id} className="border-b border-gray-100">
                        <td className="py-2 text-gray-800">{it.description || <span className="text-gray-300">{T.emptyItem}</span>}</td>
                        <td className="py-2 text-right text-gray-600">{it.quantity}</td>
                        <td className="py-2 text-right text-gray-600">{money(it.unitPrice)}</td>
                        <td className="py-2 text-right text-gray-900 font-medium">{money(it.quantity * it.unitPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end">
                  <div className="w-full max-w-[240px] text-sm space-y-1">
                    <div className="flex justify-between text-gray-600">
                      <span>{T.subtotal}</span>
                      <span>{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>{T.vat} ({effectiveVat}%)</span>
                      <span>{money(vatAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-[#0D0630] border-t border-gray-200 pt-2 mt-1">
                      <span>{T.total}</span>
                      <span>{money(total)}</span>
                    </div>
                  </div>
                </div>

                {state.vatExempt && (
                  <p className="text-xs text-gray-500 mt-4 italic">{T.vatExemptMention}</p>
                )}
                {state.notes && (
                  <p className="text-xs text-gray-500 mt-6 whitespace-pre-line border-t border-gray-100 pt-4">{state.notes}</p>
                )}

                <p className="text-[10px] text-gray-300 mt-8 text-center">
                  robi-app.com — {T.heroTitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversion block to the app */}
      <section className="py-16 bg-[#0D0630] no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#BEF221]/15 text-[#BEF221] text-sm font-semibold mb-5">
            <Sparkles className="w-4 h-4" /> {T.heroBadge}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">{T.ctaBlockTitle}</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">{T.ctaBlockText}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a href="https://go.robi-app.com" className="btn-slide inline-flex items-center gap-2 px-7 py-3.5 font-bold rounded-full bg-[#BEF221] text-[#0D0630] hover:shadow-[0_0_30px_rgba(190,242,33,0.4)]">
              <Mic className="w-5 h-5" /> {T.ctaBlockButton}
            </a>
            <a href={`/${locale}/facture-ai`} className="text-white/70 hover:text-[#BEF221] font-medium underline underline-offset-4">
              {T.learnMore}
            </a>
          </div>
        </div>
      </section>

      {/* FAQ — server-provided, mirrors the JSON-LD */}
      <section className="py-20 bg-white no-print">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8 text-center">{T.faqTitle}</h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <Card key={i} className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="no-print">
        <CTA
          title={ctaDict.title}
          subtitle={ctaDict.subtitle}
          ctaText={ctaDict.button}
          secondaryText={ctaDict.subtext}
        />
      </div>
    </>
  );
}
