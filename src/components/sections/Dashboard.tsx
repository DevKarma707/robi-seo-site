"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, FileText } from "lucide-react";

interface DashboardProps {
  dict: any;
}

export function Dashboard({ dict }: DashboardProps) {
  const d = dict.dashboard;

  return (
    <section className="py-14 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Text */}
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-[#0D0630] leading-tight mb-4 md:mb-6 tracking-tight">
              {d.title}
            </h2>
            <p className="text-sm md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
              {d.description}
            </p>
          </div>

          {/* Right - Dashboard Mockup */}
          <div className="relative">
            <div className="bg-[#0D0630] rounded-3xl p-6 shadow-2xl shadow-[#0D0630]/20">
              {/* Tabs */}
              <div className="flex gap-6 mb-6">
                <span className="text-white font-bold text-lg border-b-2 border-[#BEF221] pb-2">{d.quotes}</span>
                <span className="text-white/50 font-medium text-lg pb-2">{d.invoices}</span>
              </div>

              {/* Status Cards Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* En attente de signature */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {d.awaitingSignature}
                    </span>
                  </div>
                  <p className="text-white font-bold text-xl">17 635,78 &euro;</p>
                </div>

                {/* En attente de paiement */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {d.awaitingPayment}
                    </span>
                  </div>
                  <p className="text-white font-bold text-xl">9 180,12 &euro;</p>
                </div>

                {/* Signe */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {d.signed}
                    </span>
                  </div>
                  <p className="text-white font-bold text-xl">53 211,09 &euro;</p>
                </div>

                {/* Paye */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {d.paid}
                    </span>
                  </div>
                  <p className="text-white font-bold text-xl">37 283,49 &euro;</p>
                </div>

                {/* Refuse */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {d.rejected}
                    </span>
                  </div>
                  <p className="text-white font-bold text-xl">840,00 &euro;</p>
                </div>

                {/* En retard */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {d.overdue}
                    </span>
                  </div>
                  <p className="text-white font-bold text-xl">3 450,00 &euro;</p>
                </div>
              </div>

              {/* Chart Area */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#BEF221]" />
                    <span className="text-white/70 text-sm font-medium">{d.revenueChart}</span>
                  </div>
                </div>
                {/* SVG Chart */}
                <div className="h-32 relative">
                  <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="25" x2="400" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="0" y1="75" x2="400" y2="75" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                    {/* Chart line */}
                    <path
                      d="M 0,70 C 20,65 40,55 66,50 C 90,45 110,60 133,55 C 155,50 175,30 200,25 C 225,20 245,35 266,40 C 290,45 310,30 333,35 C 355,40 375,45 400,50"
                      fill="none"
                      stroke="#BEF221"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Glow effect */}
                    <path
                      d="M 0,70 C 20,65 40,55 66,50 C 90,45 110,60 133,55 C 155,50 175,30 200,25 C 225,20 245,35 266,40 C 290,45 310,30 333,35 C 355,40 375,45 400,50 L 400,100 L 0,100 Z"
                      fill="url(#chartGradient)"
                    />
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#BEF221" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#BEF221" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Tooltip dot */}
                    <circle cx="200" cy="25" r="4" fill="#BEF221" />
                    <circle cx="200" cy="25" r="8" fill="#BEF221" opacity="0.3" />
                  </svg>

                  {/* Tooltip */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-[#0D0630] border border-white/20 rounded-lg px-3 py-1.5 shadow-lg">
                    <p className="text-white/60 text-[10px]">{d.tooltipMonth}</p>
                    <p className="text-[#BEF221] font-bold text-sm">14 765,91 &euro;</p>
                  </div>
                </div>

                {/* Month labels */}
                <div className="flex justify-between mt-2">
                  {["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"].map((month) => (
                    <span key={month} className="text-white/30 text-[9px]">{month}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 -top-4 -right-4 w-full h-full bg-[#BEF221]/10 rounded-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
