import Link from "next/link";
import { Bot } from "lucide-react";
import { Locale } from "@/lib/i18n/config";

interface FooterProps {
  locale: Locale;
  dict: any;
}

export function Footer({ locale, dict }: FooterProps) {
  const indCat = dict.footer.industryCategories;

  const footerLinks = {
    product: {
      title: dict.footer.product,
      links: [
        { name: dict.footer.features, href: `/${locale}/features` },
        { name: dict.footer.pricing, href: `/${locale}/pricing` },
        { name: dict.footer.comparisons, href: `/${locale}/comparisons` },
        { name: dict.footer.blog, href: `/${locale}/blog` },
      ],
    },
    resources: {
      title: dict.footer.resources,
      links: [
        { name: dict.footer.tools, href: `/${locale}/tools` },
        { name: dict.footer.calculator, href: `/${locale}/tools/calculateur-tjm` },
        { name: dict.footer.chargesSimulator, href: `/${locale}/tools/simulateur-charges` },
        { name: dict.footer.legalGenerator, href: `/${locale}/tools/generateur-mentions-legales` },
      ],
    },
    industries: {
      title: dict.footer.industries,
      links: [
        { name: `🔧 ${indCat.btp}`, href: `/${locale}/industries` },
        { name: `💻 ${indCat.tech}`, href: `/${locale}/industries` },
        { name: `🎨 ${indCat.creatif}`, href: `/${locale}/industries` },
        { name: `🎉 ${indCat.evenementiel}`, href: `/${locale}/industries` },
        { name: `💼 ${indCat.conseil}`, href: `/${locale}/industries` },
        { name: `❤️ ${indCat.sante}`, href: `/${locale}/industries` },
      ],
    },
    company: {
      title: dict.footer.company,
      links: [
        { name: dict.footer.legal, href: `/${locale}/legal` },
        { name: dict.footer.privacy, href: `/${locale}/privacy` },
        { name: dict.footer.cguWeb || "CGU (app web)", href: `/${locale}/terms` },
        { name: dict.footer.cguMobile || "CGU (app mobile)", href: `/${locale}/cgu-mobile` },
        { name: dict.footer.cgv || "CGV", href: `/${locale}/cgv` },
        { name: dict.footer.contact, href: `/${locale}/contact` },
      ],
    },
  };

  return (
    <footer className="bg-[#0D0630] text-white py-10 md:py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Logo + description - mobile: inline, desktop: full block */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <Bot className="w-7 h-7 text-[#BEF221]" />
            <span className="text-lg font-bold">
              Robi <span className="text-[#BEF221]">AI</span>
            </span>
          </Link>
          <div className="flex gap-4">
            <a href="https://instagram.com/robi.ai.app" className="text-white/30 hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://x.com/iamrobiai" className="text-white/30 hover:text-white transition-colors" aria-label="X (Twitter)">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://linkedin.com/company/robi-ai" className="text-white/30 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Logo & Description - desktop only */}
          <div className="hidden md:block col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <Bot className="w-8 h-8 text-[#BEF221]" />
              <span className="text-xl font-bold">
                Robi <span className="text-[#BEF221]">AI</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              {dict.footer.description}
            </p>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/50 hover:text-[#BEF221] text-xs md:text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-6 md:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <p className="text-white/30 text-xs md:text-sm text-center md:text-left">
            {dict.footer.copyright.replace("{year}", new Date().getFullYear().toString())}
          </p>
          <div className="hidden md:flex gap-6">
            <a href="https://instagram.com/robi.ai.app" className="text-white/30 hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://x.com/iamrobiai" className="text-white/30 hover:text-white transition-colors" aria-label="X (Twitter)">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="https://linkedin.com/company/robi-ai" className="text-white/30 hover:text-white transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
