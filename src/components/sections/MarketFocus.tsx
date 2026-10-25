import { Mic, Check } from "lucide-react";
import { getMarketCopy } from "@/lib/seo/marketCopy";
import { H2, LEAD, SECTION } from "./shared";

/**
 * « Robi chez toi » : ce qui change d'un marché à l'autre (devise, taxe,
 * identifiant fiscal, règle du pays) et une phrase d'exemple locale. Textes
 * dans lib/seo/marketCopy — c'est ce qui distingue vraiment /fr-BE de /fr.
 */
export function MarketFocus({ locale }: { locale: string }) {
  const { focus } = getMarketCopy(locale);

  return (
    <section className={`${SECTION} bg-white`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <h2 className={`${H2} text-[#0D0630]`}>{focus.title}</h2>
          <p className={`${LEAD} mt-4 text-gray-500`}>{focus.intro}</p>
        </div>

        <div className="mx-auto mb-8 max-w-3xl rounded-[24px] bg-[#0D0630] p-5 md:p-7 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-[#BEF221]">{focus.exampleLabel}</p>
          <div className="mt-3 flex items-start gap-3">
            <Mic className="mt-1 h-5 w-5 flex-shrink-0 text-[#BEF221]" aria-hidden="true" />
            <p className="text-base md:text-lg leading-relaxed">{focus.example}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {focus.points.map((point) => (
            <div key={point.title} className="h-full rounded-[24px] border border-gray-200 bg-gray-50 p-5 md:p-7">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#BEF221] text-[#0D0630]">
                <Check className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-extrabold tracking-tight text-[#0D0630] md:text-lg">{point.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{point.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
