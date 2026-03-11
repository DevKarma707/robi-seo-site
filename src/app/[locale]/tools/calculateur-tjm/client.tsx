"use client";

import { useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CTA } from "@/components/sections/CTA";
import { Calculator, TrendingUp, PiggyBank, Clock } from "lucide-react";

interface CalculateurTJMClientProps {
  dict: any;
  freeTool: string;
  ctaDict: any;
  locale: string;
}

export function CalculateurTJMClient({ dict, freeTool, ctaDict, locale }: CalculateurTJMClientProps) {
  const [salaireSouhaite, setSalaireSouhaite] = useState(50000);
  const [joursConges, setJoursConges] = useState(25);
  const [joursMaladie, setJoursMaladie] = useState(5);
  const [joursFormation, setJoursFormation] = useState(5);
  const [joursProspection, setJoursProspection] = useState(20);
  const [charges, setCharges] = useState(25);

  // Calculs
  const joursOuvrables = 365 - 104 - 11;
  const joursNonFactures = joursConges + joursMaladie + joursFormation + joursProspection;
  const joursFacturables = joursOuvrables - joursNonFactures;
  const salaireAvantCharges = salaireSouhaite / (1 - charges / 100);
  const tjmCalcule = Math.round(salaireAvantCharges / joursFacturables);

  return (
    <>
      <Hero
        badge={freeTool}
        title={dict.title || "Calculateur de TJM"}
        subtitle={dict.subtitle || ""}
        variant="centered"
      />

      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Calculator className="w-6 h-6 text-[#BEF221]" />
                {dict.params || "Vos paramètres"}
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    {dict.salary || "Salaire net souhaité (€/an)"}
                  </label>
                  <input
                    type="range"
                    min="20000"
                    max="150000"
                    step="5000"
                    value={salaireSouhaite}
                    onChange={(e) => setSalaireSouhaite(Number(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#BEF221]"
                  />
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>20k€</span>
                    <span className="font-bold text-gray-900">
                      {salaireSouhaite.toLocaleString()}€
                    </span>
                    <span>150k€</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    {dict.holidays || "Jours de congés par an"}
                  </label>
                  <input
                    type="number"
                    value={joursConges}
                    onChange={(e) => setJoursConges(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    {dict.sickDays || "Jours maladie estimés"}
                  </label>
                  <input
                    type="number"
                    value={joursMaladie}
                    onChange={(e) => setJoursMaladie(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    {dict.trainingDays || "Jours de formation/veille"}
                  </label>
                  <input
                    type="number"
                    value={joursFormation}
                    onChange={(e) => setJoursFormation(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    {dict.prospectingDays || "Jours de prospection/admin"}
                  </label>
                  <input
                    type="number"
                    value={joursProspection}
                    onChange={(e) => setJoursProspection(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    {dict.chargesRate || "Taux de charges (%)"}
                  </label>
                  <select
                    value={charges}
                    onChange={(e) => setCharges(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                  >
                    <option value={22}>{dict.microBnc || "Micro-entreprise"} ({dict.microBncRate || "22%"})</option>
                    <option value={25}>{dict.microBic || "Micro-entreprise BNC"} ({dict.microBicRate || "25%"})</option>
                    <option value={45}>{dict.sasu || "SASU/EURL"} ({dict.sasuRate || "45%"})</option>
                    <option value={50}>{dict.sasuDiv || "SASU avec dividendes"} ({dict.sasuDivRate || "50%"})</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Results */}
            <div className="space-y-6">
              <Card variant="dark" className="p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {dict.recommended || "Votre TJM recommandé"}
                </h2>
                <div className="text-6xl font-black text-[#BEF221] mb-4">
                  {tjmCalcule}€
                  <span className="text-xl text-gray-500">/jour</span>
                </div>
                <p className="text-gray-600">
                  {(dict.toReach || "Pour atteindre votre objectif de {amount} net/an").replace("{amount}", salaireSouhaite.toLocaleString() + "€")}
                </p>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <Clock className="w-8 h-8 text-[#BEF221] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">
                    {joursFacturables}
                  </p>
                  <p className="text-sm text-gray-500">{dict.billableDays || "Jours facturables/an"}</p>
                </Card>
                <Card className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-[#BEF221] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(salaireAvantCharges).toLocaleString()}€
                  </p>
                  <p className="text-sm text-gray-500">{dict.requiredRevenue || "CA nécessaire/an"}</p>
                </Card>
                <Card className="p-6 text-center">
                  <PiggyBank className="w-8 h-8 text-[#BEF221] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(tjmCalcule * 5).toLocaleString()}€
                  </p>
                  <p className="text-sm text-gray-500">{dict.weeklyRevenue || "CA/semaine"}</p>
                </Card>
                <Card className="p-6 text-center">
                  <Calculator className="w-8 h-8 text-[#BEF221] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-gray-900">
                    {Math.round(tjmCalcule * 20).toLocaleString()}€
                  </p>
                  <p className="text-sm text-gray-500">{dict.monthlyRevenue || "CA/mois"}</p>
                </Card>
              </div>

              <Card className="p-6 bg-[#BEF221]/10 border-[#BEF221]/30">
                <h3 className="font-bold text-gray-900 mb-2">
                  💡 {dict.tip || "Conseil Robi"}
                </h3>
                <p className="text-sm text-gray-500">
                  {(dict.tipText || "N'oubliez pas d'ajouter une marge de 10-15% pour les imprévus et l'épargne. Un TJM de {amount} serait plus sécurisant.").replace("{amount}", Math.round(tjmCalcule * 1.1) + "€")}
                </p>
              </Card>

              <Button href="https://www.robi-app.com" className="w-full" size="lg">
                {dict.ctaButton || "Facturer avec Robi AI"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <CTA
        title={dict.ctaTitle || ctaDict.title}
        subtitle={dict.ctaSubtitle || ctaDict.subtitle}
      />
    </>
  );
}
