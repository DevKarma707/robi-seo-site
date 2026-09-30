import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";

/**
 * Encart de maillage interne vers la page pilier /facture-ai
 * (« facture IA » / « invoice ai » / « factura con IA »).
 * Posé sur les pages fonctionnalités, métiers et comparatifs : la page
 * anglaise stagnait en page 2 faute de liens internes (chantier SEO 2, 30/09/2026).
 */
const copy = {
  fr: { lead: "Le guide", anchor: "Facture IA : créer une facture en parlant à l'IA", hint: "Exemple dicté, comparatif et FAQ" },
  en: { lead: "The guide", anchor: "AI invoice generator: create an invoice by speaking", hint: "Worked example, comparison and FAQ" },
  es: { lead: "La guía", anchor: "Factura con IA: crea una factura hablando", hint: "Ejemplo dictado, comparativa y FAQ" },
} as const;

export function AiInvoiceLink({ locale }: { locale: string }) {
  const c = locale.startsWith("fr") ? copy.fr : locale.startsWith("es") ? copy.es : copy.en;
  return (
    <section className="py-10 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/facture-ai`}
          className="group flex items-center gap-4 rounded-2xl border border-gray-200 px-5 py-4 hover:border-[#0D0630] transition-colors"
        >
          <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[#0D0630]">
            <Mic className="h-5 w-5 text-[#BEF221]" />
          </span>
          <span className="flex-1">
            <span className="block text-xs font-bold uppercase tracking-widest text-gray-500">{c.lead}</span>
            <span className="block font-bold text-[#0D0630]">{c.anchor}</span>
            <span className="block text-sm text-gray-500">{c.hint}</span>
          </span>
          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#0D0630] transition-colors" />
        </Link>
      </div>
    </section>
  );
}
