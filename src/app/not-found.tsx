import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page introuvable | Robi AI",
  description: "La page que vous recherchez n'existe pas ou a été déplacée.",
};

export default function NotFound() {
  return (
    <html lang="fr">
      <body
        style={{ fontFamily: '"Inter", "Outfit", sans-serif', margin: 0 }}
      >
        <div className="min-h-screen bg-[#0D0630] flex items-center justify-center px-4 relative overflow-hidden">
          {/* Background effects matching Hero/CTA */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,33,0.08),transparent_50%)]" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#BEF221]/5 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#BEF221]/5 rounded-full blur-3xl" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {/* 404 number */}
            <p className="text-[12rem] md:text-[16rem] font-black text-[#BEF221] leading-none select-none tracking-tighter">
              404
            </p>

            {/* Main message */}
            <h1 className="text-3xl md:text-4xl font-black text-white mt-2 mb-3 tracking-tight">
              Page introuvable
            </h1>

            {/* Subtitle in multiple languages */}
            <p className="text-white/40 text-base md:text-lg mb-10 leading-relaxed">
              Cette page n&apos;existe pas ou a été déplacée.
              <br />
              <span className="text-white/25">
                This page doesn&apos;t exist&nbsp;&middot;&nbsp;Esta página no existe
              </span>
            </p>

            {/* CTA button */}
            <a
              href="/fr"
              className="inline-flex items-center gap-2 bg-[#BEF221] text-[#0D0630] font-bold px-8 py-4 rounded-full text-lg hover:scale-105 transition-transform shadow-lg shadow-[#BEF221]/20"
            >
              Retour à l&apos;accueil
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </a>

            {/* Branding */}
            <p className="mt-16 text-white/20 text-sm font-medium uppercase tracking-widest">
              Robi AI
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
