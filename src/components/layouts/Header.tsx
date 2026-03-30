"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { Locale } from "@/lib/i18n/config";

interface HeaderProps {
  locale: Locale;
  dict: any;
}

export function Header({ locale, dict }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const indCat = dict.footer.industryCategories;

  const navigation = [
    {
      name: dict.nav.features,
      href: `/${locale}/features`,
      children: [
        { name: dict.features.aiInvoicing.title, href: `/${locale}/features/facturation-ia` },
        { name: dict.features.automation.title, href: `/${locale}/features/devis-automatique` },
        { name: dict.features.emails.title, href: `/${locale}/features/relance-automatique` },
        { name: dict.features.payments.title, href: `/${locale}/features/paiement-en-ligne` },
      ],
    },
    {
      name: dict.nav.industries,
      href: `/${locale}/industries`,
      children: [
        { name: `🔧 ${indCat.btp}`, href: `/${locale}/industries`, isCategory: true },
        { name: `💻 ${indCat.tech}`, href: `/${locale}/industries`, isCategory: true },
        { name: `🎨 ${indCat.creatif}`, href: `/${locale}/industries`, isCategory: true },
        { name: `🎉 ${indCat.evenementiel}`, href: `/${locale}/industries`, isCategory: true },
        { name: `💼 ${indCat.conseil}`, href: `/${locale}/industries`, isCategory: true },
        { name: `❤️ ${indCat.sante}`, href: `/${locale}/industries`, isCategory: true },
        { name: dict.nav.allIndustries, href: `/${locale}/industries` },
      ],
    },
    { name: dict.nav.pricing, href: `/${locale}/pricing` },
    { name: dict.nav.blog, href: `/${locale}/blog` },
  ];

  return (
    <header className="fixed w-full z-50 bg-[#0D0630]/95 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Language Switcher - Left */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher currentLocale={locale} />
          </div>

          {/* Logo - Center */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full flex items-center gap-2">
              <Bot className="w-6 h-6 text-[#BEF221]" />
              <span className="text-lg font-bold text-white">
                Robi <span className="text-[#BEF221]">AI</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-medium text-white/70 hover:text-[#BEF221] transition-colors"
                >
                  {item.name}
                  {item.children && <ChevronDown className="w-4 h-4" />}
                </Link>

                {/* Dropdown */}
                {item.children && openDropdown === item.name && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0D0630]"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons - Right */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://www.robi-app.com/login"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {dict.nav.login}
            </a>
            <Button href="https://www.robi-app.com/signup" size="sm">
              {dict.nav.signup}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="block text-white/80 font-medium py-2"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.children && (
                    <div className="pl-4 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block text-white/50 text-sm py-1"
                          onClick={() => setIsOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                <a
                  href="https://www.robi-app.com/login"
                  className="text-center py-2 text-white/70"
                  onClick={() => setIsOpen(false)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {dict.nav.login}
                </a>
                <Button href="https://www.robi-app.com/signup" className="w-full">
                  {dict.nav.signup}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
