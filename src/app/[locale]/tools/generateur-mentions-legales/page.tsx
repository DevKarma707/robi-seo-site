"use client";

import { useState } from "react";
import { Hero } from "@/components/sections/Hero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CTA } from "@/components/sections/CTA";
import { FileText, Copy, Check, Download } from "lucide-react";

type TypeStructure = "micro" | "sasu" | "eurl" | "sarl" | "sa";

export default function GenerateurMentionsLegalesPage() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    nomSite: "",
    urlSite: "",
    typeStructure: "micro" as TypeStructure,
    raisonSociale: "",
    siret: "",
    adresse: "",
    telephone: "",
    email: "",
    directeurPublication: "",
    hebergeur: "Vercel",
    hebergeurAdresse: "440 N Barranca Ave, Covina, CA 91723, USA",
  });

  const updateForm = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generateMentions = () => {
    const structureLabels: Record<TypeStructure, string> = {
      micro: "Micro-entreprise",
      sasu: "SASU",
      eurl: "EURL",
      sarl: "SARL",
      sa: "SA",
    };

    return `
# Mentions Légales

## 1. Éditeur du site

**${formData.raisonSociale}**
${structureLabels[formData.typeStructure]}
SIRET : ${formData.siret}

**Siège social :**
${formData.adresse}

**Contact :**
- Téléphone : ${formData.telephone}
- Email : ${formData.email}

**Directeur de la publication :**
${formData.directeurPublication}

---

## 2. Hébergement

Le site ${formData.nomSite} est hébergé par :

**${formData.hebergeur}**
${formData.hebergeurAdresse}

---

## 3. Propriété intellectuelle

L'ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes) est protégé par les lois relatives à la propriété intellectuelle.

Toute reproduction, représentation, modification ou exploitation, partielle ou totale, du contenu de ce site est interdite sans autorisation écrite préalable de ${formData.raisonSociale}.

---

## 4. Données personnelles et RGPD

### Responsable du traitement
${formData.raisonSociale}
${formData.adresse}
Email : ${formData.email}

### Données collectées
Dans le cadre de notre activité, nous pouvons être amenés à collecter les données suivantes :
- Nom et prénom
- Adresse email
- Numéro de téléphone
- Adresse postale
- Données de navigation (cookies)

### Finalités du traitement
Les données collectées sont utilisées pour :
- La gestion de la relation client
- L'envoi de communications commerciales (avec consentement)
- L'amélioration de nos services
- Le respect de nos obligations légales

### Base légale
Le traitement des données repose sur :
- L'exécution d'un contrat
- Le consentement de l'utilisateur
- L'intérêt légitime de l'entreprise
- Le respect d'obligations légales

### Durée de conservation
Les données sont conservées pendant une durée n'excédant pas celle nécessaire aux finalités pour lesquelles elles sont collectées, conformément à la réglementation en vigueur.

### Vos droits
Conformément au RGPD, vous disposez des droits suivants :
- Droit d'accès à vos données
- Droit de rectification
- Droit à l'effacement
- Droit à la limitation du traitement
- Droit à la portabilité
- Droit d'opposition

Pour exercer ces droits, contactez-nous à : ${formData.email}

Vous pouvez également introduire une réclamation auprès de la CNIL : www.cnil.fr

---

## 5. Cookies

Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic.

### Types de cookies utilisés
- **Cookies essentiels** : nécessaires au fonctionnement du site
- **Cookies analytiques** : pour comprendre l'utilisation du site
- **Cookies marketing** : pour personnaliser les publicités (si applicable)

Vous pouvez gérer vos préférences de cookies à tout moment via le bandeau cookies ou les paramètres de votre navigateur.

---

## 6. Limitation de responsabilité

${formData.raisonSociale} s'efforce d'assurer l'exactitude des informations diffusées sur ce site. Toutefois, elle ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations.

${formData.raisonSociale} décline toute responsabilité :
- Pour toute imprécision, inexactitude ou omission
- Pour tous dommages résultant d'une intrusion frauduleuse d'un tiers
- Pour tout dommage causé à l'utilisateur, à ses équipements informatiques et aux données qui y sont stockées

---

## 7. Liens hypertextes

Ce site peut contenir des liens vers d'autres sites. ${formData.raisonSociale} n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.

---

## 8. Droit applicable

Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.

---

*Dernière mise à jour : ${new Date().toLocaleDateString("fr-FR")}*
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMentions());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generateMentions()], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mentions-legales.md";
    a.click();
  };

  return (
    <>
      <Hero
        badge="Outil gratuit"
        title="Générateur de Mentions Légales"
        subtitle="Créez vos mentions légales conformes RGPD en quelques clics."
        variant="centered"
      />

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {step === 1 && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-[#0D0630] mb-8 flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#BEF221]" />
                Informations sur votre site
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du site
                    </label>
                    <input
                      type="text"
                      value={formData.nomSite}
                      onChange={(e) => updateForm("nomSite", e.target.value)}
                      placeholder="Mon Super Site"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL du site
                    </label>
                    <input
                      type="url"
                      value={formData.urlSite}
                      onChange={(e) => updateForm("urlSite", e.target.value)}
                      placeholder="https://monsite.fr"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de structure
                  </label>
                  <select
                    value={formData.typeStructure}
                    onChange={(e) => updateForm("typeStructure", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                  >
                    <option value="micro">Micro-entreprise</option>
                    <option value="sasu">SASU</option>
                    <option value="eurl">EURL</option>
                    <option value="sarl">SARL</option>
                    <option value="sa">SA</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison sociale
                    </label>
                    <input
                      type="text"
                      value={formData.raisonSociale}
                      onChange={(e) => updateForm("raisonSociale", e.target.value)}
                      placeholder="Ma Société SAS"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro SIRET
                    </label>
                    <input
                      type="text"
                      value={formData.siret}
                      onChange={(e) => updateForm("siret", e.target.value)}
                      placeholder="123 456 789 00001"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse du siège social
                  </label>
                  <textarea
                    value={formData.adresse}
                    onChange={(e) => updateForm("adresse", e.target.value)}
                    placeholder="123 rue de Paris&#10;75001 Paris"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => updateForm("telephone", e.target.value)}
                      placeholder="01 23 45 67 89"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="contact@monsite.fr"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Directeur de la publication
                  </label>
                  <input
                    type="text"
                    value={formData.directeurPublication}
                    onChange={(e) => updateForm("directeurPublication", e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BEF221] focus:border-transparent"
                  />
                </div>

                <Button onClick={() => setStep(2)} className="w-full" size="lg">
                  Générer les mentions légales
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#0D0630] flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#BEF221]" />
                    Vos mentions légales
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : (
                        <Copy className="w-4 h-4 mr-2" />
                      )}
                      {copied ? "Copié !" : "Copier"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {generateMentions()}
                  </pre>
                </div>
              </Card>

              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="w-full"
              >
                ← Modifier les informations
              </Button>
            </div>
          )}
        </div>
      </section>

      <CTA
        title="Facturez en toute conformité"
        subtitle="Robi génère des factures avec toutes les mentions obligatoires"
      />
    </>
  );
}
