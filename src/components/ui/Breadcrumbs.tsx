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
}

export function Breadcrumbs({ items, locale }: BreadcrumbsProps) {
  return (
    <nav className="flex mb-8 overflow-x-auto hide-scrollbar" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 whitespace-nowrap">
        <li>
          <div className="flex items-center">
            <Link
              href={`/${locale}`}
              className="text-gray-400 hover:text-[#BEF221] transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-400 hover:text-[#BEF221] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-600 cursor-default">
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
