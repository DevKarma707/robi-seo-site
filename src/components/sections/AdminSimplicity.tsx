"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, CheckCircle, RefreshCw, Copy, XCircle, Download } from "lucide-react";

interface AdminSimplicityProps {
  dict: any;
}

export function AdminSimplicity({ dict }: AdminSimplicityProps) {
  const ad = dict.adminSimplicity;

  return (
    <section className="py-14 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text */}
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-[#0D0630] leading-tight mb-4 md:mb-6 tracking-tight">
              {ad.title}
            </h2>
            <p className="text-sm md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
              {ad.description}
            </p>
            <Button href="https://www.robi-app.com" size="sm" className="!text-xs !px-5 !py-2.5 md:!px-8 md:!py-4 md:!text-lg">
              {ad.cta}
              <ArrowRight className="ml-1.5 w-3.5 h-3.5 md:w-5 md:h-5" />
            </Button>
          </div>

          {/* Right - Mockup */}
          <div className="relative">
            <div className="flex flex-col lg:flex-row items-start gap-4">
              {/* Notification feed - Left side (hidden on mobile) */}
              <div className="hidden lg:block space-y-2.5 w-56 flex-shrink-0">
                {[
                  { name: "Jean Delois", amount: "600,00", time: "1 min" },
                  { name: "Anne Lafosse", amount: "520,00", time: "12 min" },
                  { name: "Margot Rigate", amount: "740,00", time: "1 h" },
                  { name: "Baptiste Riu", amount: "987,36", time: "16 h" },
                  { name: "Clara Cask", amount: "630,00", time: "3 j" },
                ].map((notif, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-md px-3 py-2.5 flex items-center gap-2.5 border border-gray-100"
                    style={{
                      opacity: 1 - i * 0.12,
                    }}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#BEF221] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-[#0D0630]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#0D0630] truncate">
                        {notif.name} {ad.acceptedQuote}
                      </p>
                      <p className="text-[9px] text-gray-400">
                        {ad.quoteOf} {notif.amount} &euro; · {ad.ago} {notif.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main card - Document list - Right side */}
              <div className="bg-[#0D0630] rounded-2xl shadow-2xl p-5 flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-base">{ad.documents}</h3>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/10 rounded-lg px-2.5 py-1">
                      <span className="text-white/50 text-[10px]">{ad.searchPlaceholder}</span>
                    </div>
                  </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-4">
                  <span className="bg-[#BEF221] text-[#0D0630] text-[10px] font-bold px-3 py-1 rounded-full">{ad.all}</span>
                  <span className="bg-white/20 text-white text-[10px] font-semibold px-3 py-1 rounded-full">{ad.quotesTab}</span>
                  <span className="bg-white/20 text-white text-[10px] font-semibold px-3 py-1 rounded-full">{ad.invoicesTab}</span>
                </div>

                {/* Document rows */}
                <div className="space-y-2">
                  {[
                    { ref: "Devis #0847", client: "AMAJIO", amount: "390,00", date: "12/10/2024", status: "signed" },
                    { ref: "Facture #1203", client: "AMAJIO", amount: "2 563,00", date: "17/10/2024", status: "paid" },
                    { ref: "Devis #0923", client: "TECHVISION", amount: "1 280,00", date: "22/10/2024", status: "refused" },
                  ].map((doc, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <p className="text-white text-xs font-bold">{doc.ref}</p>
                          <p className="text-white/40 text-[10px]">{doc.client} · {doc.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-sm">{doc.amount} &euro;</p>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                            doc.status === "signed"
                              ? "bg-[#BEF221]/20 text-[#BEF221]"
                              : doc.status === "paid"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-red-500/20 text-red-400"
                          }`}>
                            {doc.status === "signed" ? ad.statusSigned : doc.status === "paid" ? ad.statusPaid : ad.statusRefused}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Context menu */}
                <div className="mt-3 bg-white rounded-xl shadow-lg p-2">
                  <div className="space-y-0.5">
                    {[
                      { icon: RefreshCw, label: ad.convertToInvoice, highlight: true },
                      { icon: Copy, label: ad.duplicate, highlight: false },
                      { icon: XCircle, label: ad.markRefused, highlight: false },
                      { icon: Download, label: ad.export, highlight: false },
                    ].map((action, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs ${
                          action.highlight
                            ? "bg-[#0D0630] text-white font-bold"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <action.icon className="w-3.5 h-3.5" />
                        {action.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full bg-[#BEF221]/10 rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
