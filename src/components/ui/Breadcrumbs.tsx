"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Locale } from "@/lib/i18n/config";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  locale: Locale;
  /** `dark` : posé sur l'Amethyst, dans le héros des pages intérieures. */
  tone?: "light" | "dark";
}

export function Breadcrumbs({ items, locale, tone = "light" }: BreadcrumbsProps) {
  const dark = tone === "dark";
  const link = dark ? "text-white/45 hover:text-white" : "text-gray-400 hover:text-[#0D0630]";
  return (
    <nav className={`flex max-w-full overflow-x-auto hide-scrollbar ${dark ? "" : "mb-8"}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 whitespace-nowrap">
        <li>
          <div className="flex items-center">
            <Link
              href={`/${locale}`}
              className={`${link} transition-colors`}
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className={`w-4 h-4 mx-1 flex-shrink-0 ${dark ? "text-white/25" : "text-gray-400"}`} />
              {item.href ? (
                <Link
                  href={item.href}
                  className={`text-sm font-medium ${link} transition-colors`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`text-sm font-medium cursor-default ${dark ? "text-white/75" : "text-gray-600"}`}>
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
