import Link from "next/link";
import { Bot } from "lucide-react";
import { Locale } from "@/lib/i18n/config";

interface FooterProps {
  locale: Locale;
  dict: any;
}

export function Footer({ locale, dict }: FooterProps) {
  const footerLinks = {
    product: {
      title: dict.footer.product,
      links: [
        { name: dict.footer.features, href: `/${locale}/features` },
        { name: dict.footer.pricing, href: `/${locale}/pricing` },
        { name: dict.footer.integrations, href: `/${locale}/integrations` },
        { name: dict.footer.roadmap, href: `/${locale}/roadmap` },
      ],
    },
    industries: {
      title: dict.footer.industries,
      links: [
        { name: "🔧 BTP & Artisans", href: `/${locale}/industries` },
        { name: "💻 Tech & Digital", href: `/${locale}/industries` },
        { name: "🎨 Créatifs", href: `/${locale}/industries` },
        { name: "🎉 Événementiel", href: `/${locale}/industries` },
        { name: "💼 Conseil", href: `/${locale}/industries` },
        { name: "❤️ Santé", href: `/${locale}/industries` },
      ],
    },
    resources: {
      title: dict.footer.resources,
      links: [
        { name: dict.footer.blog, href: `/${locale}/blog` },
        { name: dict.footer.guides, href: `/${locale}/guides` },
        { name: dict.footer.calculator, href: `/${locale}/tools/calculateur-tjm` },
        { name: dict.footer.templates, href: `/${locale}/templates` },
      ],
    },
    company: {
      title: dict.footer.company,
      links: [
        { name: dict.footer.about, href: `/${locale}/about` },
        { name: dict.footer.contact, href: `/${locale}/contact` },
        { name: dict.footer.legal, href: `/${locale}/legal` },
        { name: dict.footer.privacy, href: `/${locale}/privacy` },
      ],
    },
  };

  return (
    <footer className="bg-[#0D0630] text-white py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
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
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-white/50 hover:text-[#BEF221] text-sm transition-colors"
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
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/30 text-sm">
            {dict.footer.copyright.replace("{year}", new Date().getFullYear().toString())}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/30 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="text-white/30 hover:text-white transition-colors">
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
