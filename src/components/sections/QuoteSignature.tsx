"use client";

import { ArrowRight, FileText, PenTool, Eye, CheckCircle, Clock, Send, Bell } from "lucide-react";

interface QuoteSignatureProps {
  dict: any;
}

export function QuoteSignature({ dict }: QuoteSignatureProps) {
  const qs = dict.quoteSignature;

  return (
    <section className="py-14 md:py-32 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Mockup */}
          <div className="relative order-2 lg:order-1">
            {/* Main card - Quote document */}
            <div className="bg-white rounded-2xl shadow-xl p-6 relative z-10 max-w-md mx-auto">
              {/* Quote header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0D0630] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#BEF221]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0D0630]">{qs.mockupQuoteTitle}</p>
                    <p className="text-[10px] text-gray-400">REF-2024-0847</p>
                  </div>
                </div>
                <span className="bg-[#BEF221]/20 text-[#0D0630] text-[10px] font-bold px-2 py-1 rounded-full">
                  2 450,00 &euro;
                </span>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{qs.stepCreated}</p>
                    <p className="text-[10px] text-gray-400">12/10/2024 - 13:42</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Send className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{qs.stepSent}</p>
                    <p className="text-[10px] text-gray-400">12/10/2024 - 13:43</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{qs.stepViewed}</p>
                    <p className="text-[10px] text-gray-400">12/10/2024 - 13:58</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-[#BEF221]/10 rounded-xl p-3 border border-[#BEF221]/30">
                  <div className="w-7 h-7 rounded-full bg-[#BEF221] flex items-center justify-center flex-shrink-0">
                    <PenTool className="w-3.5 h-3.5 text-[#0D0630]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0D0630]">{qs.stepSigned}</p>
                    <p className="text-[10px] text-gray-500">12/10/2024 - 14:07</p>
                  </div>
                </div>
              </div>

              {/* Signature preview */}
              <div className="bg-[#0D0630] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#BEF221] flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#0D0630]" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">{qs.signedRemotely}</p>
                    <p className="text-white/50 text-[10px]">12/10/2024 - 14:07</p>
                  </div>
                </div>
                <svg width="60" height="24" viewBox="0 0 60 24" className="text-[#BEF221]">
                  <path d="M5 18 C 10 8, 15 4, 25 10 C 35 16, 40 6, 55 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Floating notification */}
            <div className="absolute -top-3 -right-3 lg:right-4 z-20 bg-white rounded-xl shadow-lg p-3 flex items-center gap-2 border border-gray-100 animate-float">
              <div className="w-6 h-6 rounded-full bg-[#BEF221] flex items-center justify-center flex-shrink-0">
                <Bell className="w-3 h-3 text-[#0D0630]" />
              </div>
              <p className="text-[10px] font-medium text-gray-700">{qs.notification}</p>
            </div>

            {/* Background decoration */}
            <div className="absolute -z-10 top-8 left-8 w-full h-full bg-[#BEF221]/10 rounded-2xl" />
          </div>

          {/* Right - Text */}
          <div className="order-1 lg:order-2">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-[#0D0630] leading-tight mb-4 md:mb-6 tracking-tight">
              {qs.title}
            </h2>
            <p className="text-sm md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
              {qs.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
