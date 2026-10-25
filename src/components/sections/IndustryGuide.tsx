import Link from "next/link";
import { Mic, FileText, Scale, BookOpen, ArrowRight } from "lucide-react";
import type { IndustryGuide as Guide } from "@/data/industry-guides";

type L = { fr: string; en: string; es: string };

const UI = {
  fr: { quoteTitle: "Exemple : le devis d'un", said: "Tu dictes", built: "Robi prépare", price: "à ton tarif", rulesTitle: "Les règles propres au métier", source: "Source", readTitle: "À lire aussi" },
  en: { quoteTitle: "Example quote:", said: "You say", built: "Robi prepares", price: "your rate", rulesTitle: "The rules specific to this trade", source: "Source", readTitle: "Read next" },
  es: { quoteTitle: "Ejemplo: el presupuesto de un", said: "Tú dictas", built: "Robi prepara", price: "tu tarifa", rulesTitle: "Las reglas propias del oficio", source: "Fuente", readTitle: "Para seguir leyendo" },
};

/**
 * Bloc éditorial des pages métiers enrichies (src/data/industry-guides.ts) :
 * exemple de devis, règles sourcées, articles liés. Le texte vient tout entier
 * des données — ce composant ne fait que la mise en page.
 */
export function IndustryGuide({
  guide,
  pick,
  lang,
  industryName,
  blogHref,
}: {
  guide: Guide;
  pick: (l: L) => string;
  lang: "fr" | "en" | "es";
  industryName: string;
  blogHref: (slug: string) => string;
}) {
  const ui = UI[lang];
  return (
    <>
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-[28px] md:text-4xl font-black tracking-tight leading-[1.08] [text-wrap:balance] text-[#0D0630] mb-8">
            {ui.quoteTitle} {industryName}
          </h2>
          <div className="rounded-2xl bg-[#0D0630] p-6 md:p-8 text-white">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BEF221]">
              <Mic className="w-4 h-4" aria-hidden="true" /> {ui.said}
            </p>
            <p className="mt-3 text-lg md:text-xl leading-relaxed">{pick(guide.quote.said)}</p>
          </div>
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <FileText className="w-4 h-4" aria-hidden="true" /> {ui.built}
            </p>
            <ul className="mt-4 divide-y divide-gray-100">
              {guide.quote.lines.map((line, i) => (
                <li key={i} className="flex items-baseline justify-between gap-4 py-3">
                  <span className="text-gray-800">{pick(line)}</span>
                  <span className="shrink-0 text-sm text-gray-400">{ui.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">{pick(guide.quote.note)}</p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-3 text-[28px] md:text-4xl font-black tracking-tight leading-[1.08] [text-wrap:balance] text-[#0D0630] mb-8">
            <Scale className="w-8 h-8 shrink-0 text-[#0D0630]" aria-hidden="true" />
            {ui.rulesTitle}
          </h2>
          <div className="space-y-6">
            {guide.rules.map((rule, i) => (
              <article key={i} className="rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900">{pick(rule.title)}</h3>
                <p className="mt-3 text-gray-600 leading-relaxed">{pick(rule.text)}</p>
                <p className="mt-3 text-sm text-gray-500">
                  {ui.source} :{" "}
                  <a href={rule.source.url} target="_blank" rel="noopener" className="underline decoration-[#BEF221] decoration-2 underline-offset-2 hover:text-gray-900">
                    {rule.source.label}
                  </a>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
            <BookOpen className="w-5 h-5" aria-hidden="true" /> {ui.readTitle}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            {guide.articles.map((a) => (
              <li key={a.slug}>
                <Link href={blogHref(a.slug)} className="flex h-full items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 text-gray-800 hover:border-[#0D0630]">
                  <span>{pick(a.label)}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 text-gray-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
