import { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { partnerCopy } from "./copy";
import { PartnerForm } from "./client";

import { pageSeo } from "@/lib/seo/pageSeo";
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = partnerCopy(locale);
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    ...pageSeo(locale, "/partenaires"),
  };
}

export default async function PartenairesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = partnerCopy(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: c.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <Hero
        badge={c.badge}
        title={c.title}
        titleAccent={c.titleAccent}
        subtitle={c.subtitle}
        ctaText={c.form.title}
        ctaHref="#inscription"
        variant="centered"
      />

      {/* Chiffres */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {c.numbers.map((n) => (
            <div key={n.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-4xl font-black tracking-tight text-[#0D0630]">{n.value}</p>
              <p className="mt-1 text-sm text-slate-600">{n.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Étapes */}
      <section className="py-14 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {c.steps.map((s) => (
            <div key={s.title} className="rounded-2xl bg-white border border-slate-200 p-6">
              <p className="font-black text-[#0D0630] mb-2">{s.title}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {c.darija && (
        <section className="py-14 bg-[#0D0630] text-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#BEF221] mb-3">Darija</p>
            <h2 className="text-2xl font-black mb-4">{c.darija.title}</h2>
            <div className="space-y-2 text-slate-200 leading-relaxed">
              {c.darija.lines.map((l) => <p key={l}>{l}</p>)}
            </div>
          </div>
        </section>
      )}

      {/* Pour qui */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-[#0D0630] mb-5">{c.who.title}</h2>
          <ul className="space-y-2.5">
            {c.who.items.map((it) => (
              <li key={it} className="flex items-start gap-3 text-slate-700">
                <span className="mt-2 w-2 h-2 rounded-full bg-[#BEF221] flex-shrink-0" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Formulaire */}
      <section id="inscription" className="py-20 bg-slate-50 scroll-mt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-[#0D0630]">{c.form.title}</h2>
          <p className="text-slate-600 mt-2 mb-8">{c.form.subtitle}</p>
          <PartnerForm copy={c.form} locale={locale} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {c.faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-bold text-[#0D0630]">{f.q}</h3>
              <p className="text-slate-600 mt-1 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
