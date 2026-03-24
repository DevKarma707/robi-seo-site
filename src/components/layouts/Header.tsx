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
    { name: dict.nav.pricing, href: `/${locale}/pricing` },
    { name: dict.nav.blog, href: `/${locale}/blog` },
  ];

  return (
    <header className="fixed w-full z-50 bg-[#0D0630]/95 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-8">

          {/* Left — Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#BEF221]" />
              <span className="text-base font-bold text-white">
                Robi <span className="text-[#BEF221]">AI</span>
              </span>
            </div>
          </Link>

          {/* Center — Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
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

          {/* Right — Language + Single CTA */}
          <div className="hidden lg:flex items-center gap-4 flex-shrink-0 ml-auto">
            <LanguageSwitcher currentLocale={locale} />
            <Button href="https://www.robi-app.com" size="sm">
              {dict.nav.login}
            </Button>
          </div>

          {/* Mobile — Language + App button + Hamburger */}
          <div className="flex lg:hidden items-center gap-2 ml-auto">
            <LanguageSwitcher currentLocale={locale} />
            <Button href="https://www.robi-app.com" size="sm" className="text-xs px-3 py-1.5">
              {dict.nav.login}
            </Button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-white"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
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
                    <div className="pl-4 mt-1 space-y-1">
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
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
