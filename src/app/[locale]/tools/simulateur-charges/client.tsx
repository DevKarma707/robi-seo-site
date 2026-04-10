"use client";

import { useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CTA } from "@/components/sections/CTA";
import { Scale, TrendingDown, PiggyBank, AlertCircle } from "lucide-react";

type Statut = "micro-bnc" | "micro-bic" | "sasu" | "eurl-is" | "eurl-ir";

interface SimulateurChargesClientProps {
  dict: any;
  freeTool: string;
  ctaDict: any;
  locale: string;
}

export function SimulateurChargesClient({ dict, freeTool, ctaDict, locale }: SimulateurChargesClientProps) {
  const statutsConfig: Record<Statut, { label: string; tauxCharges: number; description: string }> = {
    "micro-bnc": {
      label: dict.microBnc || "Micro-entreprise BNC",
      tauxCharges: 0.246,
      description: dict.microBncDesc || "Professions libérales (consultant, coach, formateur...)",
    },
    "micro-bic": {
      label: dict.microBic || "Micro-entreprise BIC Services",
      tauxCharges: 0.216,
      description: dict.microBicDesc || "Prestations de services commerciales ou artisanales",
    },
    sasu: {
      label: dict.sasu || "SASU",
      tauxCharges: 0.45,
      description: dict.sasuDesc || "Charges sur salaire, optimisation possible via dividendes",
    },
    "eurl-is": {
      label: dict.eurlIs || "EURL à l'IS",
      tauxCharges: 0.45,
      description: dict.eurlIsDesc || "Comme la SASU mais statut TNS possible",
    },
    "eurl-ir": {
      label: dict.eurlIr || "EURL à l'IR",
      tauxCharges: 0.35,
      description: dict.eurlIrDesc || "Bénéfices imposés directement à l'IR",
    },
  };

  const [ca, setCa] = useState(60000);
  const [statut, setStatut] = useState<Statut>("micro-bnc");
  const [frais, setFrais] = useState(5000);

  const config = statutsConfig[statut];
  const isMicro = statut.startsWith("micro");

  // Calculs
  const baseCharges = isMicro ? ca : ca - frais;
  const charges = baseCharges * config.tauxCharges;
  const netAvantIR = isMicro ? ca - charges : ca - frais - charges;

  // IR simplifié (tranches 2024)
  const calculerIR = (revenu: number) => {
    if (revenu <= 11294) return 0;
    if (revenu <= 28797) return (revenu - 11294) * 0.11;
    if (revenu <= 82341) return 1925 + (revenu - 28797) * 0.30;
    return 1925 + 16063 + (revenu - 82341) * 0.41;
  };

  const ir = calculerIR(netAvantIR);
  const netFinal = netAvantIR - ir;
  const tauxEffectif = ((charges + ir) / ca * 100).toFixed(1);

  return (
    <>
      <Hero
        badge={freeTool}
        title={dict.title || "Simulateur de Charges"}
        subtitle={dict.subtitle || ""}
        variant="centered"
      />

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Scale className="w-6 h-6 text-[#BEF221]" />
                {dict.params || "Vos paramètres"}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    {dict.annualRevenue || "Chiffre d'affaires annuel (€)"}
                  </label>
                  <input
                    type="range"
                    min="10000"
                    max="200000"
                    step="5000"
                    value={ca}
                    onChange={(e) => setCa(Number(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#BEF221]"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>10k€</span>
                    <span className="font-bold text-gray-900">
                      {ca.toLocaleString()}€
                    </span>
                    <span>200k€</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    {dict.legalStatus || "Statut juridique"}
                  </label>
                  <div className="space-y-2">
                    {(Object.keys(statutsConfig) as Statut[]).map((key) => (
                      <label
                        key={key}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          statut === key
                            ? "border-[#BEF221] bg-[#BEF221]/10"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="statut"
                          value={key}
                          checked={statut === key}
                          onChange={(e) => setStatut(e.target.value as Statut)}
                          className="mt-1 accent-[#BEF221]"
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {statutsConfig[key].label}
                          </p>
                          <p className="text-sm text-gray-400">
                            {statutsConfig[key].description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {!isMicro && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      {dict.expenses || "Frais professionnels annuels (€)"}
                    </label>
                    <input
                      type="number"
                      value={frais}
                      onChange={(e) => setFrais(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {dict.expensesHint || "Matériel, déplacements, formations, etc."}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              <Card variant="dark" className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {dict.simulation || "Votre simulation"}
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">{dict.revenue || "Chiffre d'affaires"}</span>
                    <span className="text-gray-900 font-bold">{ca.toLocaleString()}€</span>
                  </div>

                  {!isMicro && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">{dict.deductExpenses || "- Frais professionnels"}</span>
                      <span className="text-gray-900 font-bold">-{frais.toLocaleString()}€</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">
                      {(dict.socialCharges || "- Charges sociales ({rate}%)").replace("{rate}", (config.tauxCharges * 100).toFixed(1))}
                    </span>
                    <span className="text-red-400 font-bold">-{Math.round(charges).toLocaleString()}€</span>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">{dict.incomeTax || "- Impôt sur le revenu (estimé)"}</span>
                    <span className="text-red-400 font-bold">-{Math.round(ir).toLocaleString()}€</span>
                  </div>

                  <div className="flex justify-between items-center py-4">
                    <span className="text-gray-900 font-bold text-lg">{dict.netIncome || "Revenu net"}</span>
                    <span className="text-[#BEF221] font-black text-3xl">
                      {Math.round(netFinal).toLocaleString()}€
                    </span>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <TrendingDown className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">{tauxEffectif}%</p>
                  <p className="text-sm text-gray-500">{dict.effectiveRate || "Taux de prélèvement"}</p>
                </Card>
                <Card className="p-6 text-center">
                  <PiggyBank className="w-8 h-8 text-[#BEF221] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(netFinal / 12).toLocaleString()}€
                  </p>
                  <p className="text-sm text-gray-500">{dict.monthlyNet || "Net mensuel"}</p>
                </Card>
              </div>

              <Card className="p-6 bg-amber-500/10 border-amber-500/30">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-amber-300 mb-1">
                      {dict.disclaimer || "Simulation indicative"}
                    </h3>
                    <p className="text-sm text-amber-200/70">
                      {dict.disclaimerText || "Cette simulation est une estimation. Les montants réels peuvent varier selon votre situation personnelle. Consultez un expert-comptable pour un calcul précis."}
                    </p>
                  </div>
                </div>
              </Card>

              <Button href="https://app.robi-app.com" className="w-full" size="lg">
                {dict.ctaButton || "Facturer avec Robi AI"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CTA
        title={dict.ctaTitle || ctaDict.title}
        subtitle={dict.ctaSubtitle || ctaDict.subtitle}
        ctaText={ctaDict.button}
        secondaryText={ctaDict.subtext}
      />
    </>
  );
}
