import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cache } from "react";
import { Check } from "lucide-react";
import { adminDb } from "@/lib/firebaseAdmin";
import { PLATFORM_META, type Influencer } from "@/lib/influencers";
import { PROGRAMME } from "@/lib/partenaires";
import { codeCopy } from "./copy";

/**
 * Page d'atterrissage d'un code partenaire : robi-app.com/fr/code/MARIE20.
 *
 * Le lien court /r/CODE y renvoie quand la fiche partenaire est active. Le
 * code part vers l'app en `?ref=` (bouton + AffiliateTracking), l'app le garde
 * 90 jours et createPolarCheckout l'applique tout seul au paiement : le
 * visiteur n'a rien à taper. Code inconnu ou inactif → accueil, jamais d'erreur.
 * Pas indexée : une page par partenaire, contenu quasi identique.
 */

export const revalidate = 300;

const normCode = (raw: string) =>
  decodeURIComponent(raw || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);

interface Partner { code: string; name: string; pct: number; platform?: string }

const loadPartner = cache(async (raw: string): Promise<Partner | null> => {
  const code = normCode(raw);
  if (code.length < 3) return null;
  const db = adminDb();
  if (!db) return null;
  try {
    const snap = await db.collection("influencers").where("promoCode", "==", code).limit(1).get();
    if (snap.empty) return null;
    const f = snap.docs[0].data() as Influencer;
    if (f.status !== "actif") return null;
    const pct = Number(f.discountPct) > 0 ? Math.round(Number(f.discountPct)) : PROGRAMME.discountPct;
    const platform = f.platform && f.platform !== "autre" ? PLATFORM_META[f.platform]?.label : undefined;
    return { code, name: (f.name || "").trim() || code, pct, platform };
  } catch (e) {
    console.warn("[code] fiche partenaire illisible:", (e as Error).message);
    return null;
  }
});

type Params = { params: Promise<{ locale: string; code: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, code } = await params;
  const p = await loadPartner(code);
  const c = codeCopy(locale);
  if (!p) return { robots: { index: false, follow: true } };
  return {
    title: { absolute: c.metaTitle(p.name, p.pct) },
    description: c.metaDescription(p.name, p.pct),
    robots: { index: false, follow: true },
    alternates: { canonical: `/${locale}/code/${p.code}` },
  };
}

export default async function CodePage({ params }: Params) {
  const { locale, code } = await params;
  const p = await loadPartner(code);
  if (!p) redirect(`/${locale}`);
  const c = codeCopy(locale);

  const app = new URL("https://go.robi-app.com/");
  app.searchParams.set("signup", "");
  app.searchParams.set("ref", p.code);
  app.searchParams.set("utm_source", "partenaire");
  app.searchParams.set("utm_medium", "affiliation");
  app.searchParams.set("utm_campaign", p.code);
  const href = app.toString().replace("signup=&", "signup&");

  return (
    <>
      <section className="relative overflow-hidden bg-[#0D0630] text-white pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#BEF221]/40 bg-[#BEF221]/10 px-4 py-1.5 text-sm font-bold text-[#BEF221]">
            <Check className="w-4 h-4" aria-hidden />
            {c.badge(p.code)}
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            {c.title(p.name, p.pct)}
            <span className="block text-[#BEF221]">{c.titleAccent}</span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 leading-relaxed">{c.subtitle}</p>
          <a
            href={href}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#BEF221] px-8 py-4 text-base font-black text-[#0D0630] hover:brightness-95 transition"
          >
            {c.cta}
          </a>
          <p className="mt-3 text-sm text-slate-400">{c.ctaHint}</p>
          {p.platform && <p className="mt-6 text-xs uppercase tracking-widest text-slate-500">{c.from(p.platform)}</p>}
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-[#0D0630] text-center mb-8">{c.stepsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {c.steps.map((s) => (
              <div key={s.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="font-black text-[#0D0630] mb-2">{s.title}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{s.text(p.pct)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-[#0D0630] text-center mb-8">{c.whyTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {c.why.map((w) => (
              <div key={w.title} className="rounded-2xl bg-white border border-slate-200 p-6">
                <p className="font-black text-[#0D0630] mb-2">{w.title}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a
              href={href}
              className="inline-flex items-center justify-center rounded-full bg-[#0D0630] px-8 py-4 text-base font-black text-white hover:bg-[#18314F] transition"
            >
              {c.cta}
            </a>
            <p className="mt-4 text-xs text-slate-500 max-w-xl mx-auto">{c.smallPrint(p.code, p.pct)}</p>
          </div>
        </div>
      </section>
    </>
  );
}
