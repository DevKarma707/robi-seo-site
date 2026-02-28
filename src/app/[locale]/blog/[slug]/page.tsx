import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts, t } from "@/data/seo-config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/config";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/sections/CTA";
import { ArrowLeft, Calendar, Clock, Share2, BookOpen } from "lucide-react";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Article non trouvé" };
  }

  return {
    title: t(post.title, locale),
    description: t(post.description, locale),
    keywords: post.keywords,
    openGraph: {
      title: t(post.title, locale),
      description: t(post.description, locale),
      type: "article",
    },
  };
}

const categoryColors: Record<string, string> = {
  guides: "bg-blue-500/10 text-blue-400",
  legal: "bg-purple-500/10 text-purple-400",
  tips: "bg-green-500/10 text-green-400",
  business: "bg-amber-500/10 text-amber-400",
};

// Multilingual article content
const articleContent: Record<string, Record<string, string>> = {
  "comment-facturer-premier-client": {
    fr: `## Introduction

Félicitations ! Vous venez de décrocher votre premier client en tant que freelance. Maintenant vient la question cruciale : comment facturer correctement ?

Ce guide vous accompagne étape par étape pour émettre votre première facture en toute conformité.

## 1. Vérifiez votre statut juridique

Avant de facturer, assurez-vous d'avoir un statut légal :
- **Micro-entreprise** : le plus simple pour démarrer
- **SASU/EURL** : pour des revenus plus importants
- **Portage salarial** : si vous préférez éviter l'administratif

## 2. Les mentions obligatoires

Votre facture doit obligatoirement contenir :
- Votre nom/raison sociale et adresse
- Numéro SIRET
- Nom et adresse du client
- Date de la facture
- Numéro de facture unique
- Description détaillée de la prestation
- Montant HT et TTC
- Taux de TVA (ou mention "TVA non applicable, art. 293 B du CGI")
- Conditions de paiement

## 3. Fixez vos conditions de paiement

Les délais standards :
- **Paiement à réception** : idéal pour les petits montants
- **30 jours** : standard professionnel
- **45 jours fin de mois** : pour les grandes entreprises

## 4. Envoyez votre facture

Plusieurs options :
- Par email avec PDF en pièce jointe
- Via un logiciel de facturation comme Robi AI
- Par courrier recommandé (pour les montants importants)

## 5. Suivez les paiements

Ne laissez pas traîner les impayés :
- Relancez poliment après 7 jours de retard
- Envoyez une mise en demeure après 30 jours
- Envisagez l'injonction de payer si nécessaire

## Conclusion

Facturer correctement dès le départ vous évitera bien des problèmes. Avec un outil comme Robi AI, vous pouvez automatiser tout ce processus et vous concentrer sur votre cœur de métier.`,

    en: `## Introduction

Congratulations! You've just landed your first client as a freelancer. Now comes the crucial question: how do you invoice correctly?

This guide walks you through each step to issue your first invoice in full compliance.

## 1. Check your legal status

Before invoicing, make sure you have a legal business structure:
- **Sole proprietorship** : the simplest way to start
- **LLC/Corporation** : for higher revenues
- **Umbrella company** : if you prefer to avoid paperwork

## 2. Mandatory invoice information

Your invoice must include:
- Your name/business name and address
- Business registration number
- Client name and address
- Invoice date
- Unique invoice number
- Detailed description of services
- Subtotal and total amounts
- Tax rate (or tax exemption notice)
- Payment terms

## 3. Set your payment terms

Standard deadlines:
- **Due on receipt** : ideal for small amounts
- **Net 30** : professional standard
- **Net 45** : for large companies

## 4. Send your invoice

Several options:
- By email with PDF attachment
- Through invoicing software like Robi AI
- By registered mail (for large amounts)

## 5. Track payments

Don't let unpaid invoices pile up:
- Send a polite reminder after 7 days
- Send a formal notice after 30 days
- Consider legal action if necessary

## Conclusion

Getting your invoicing right from the start will save you many headaches. With a tool like Robi AI, you can automate the entire process and focus on what you do best.`,

    es: `## Introducción

¡Felicidades! Acabas de conseguir tu primer cliente como freelancer. Ahora viene la pregunta crucial: ¿cómo facturar correctamente?

Esta guía te acompaña paso a paso para emitir tu primera factura en total conformidad.

## 1. Verifica tu estatus legal

Antes de facturar, asegúrate de tener una estructura legal:
- **Autónomo** : la forma más sencilla de empezar
- **Sociedad Limitada** : para ingresos más importantes
- **Cooperativa de trabajo** : si prefieres evitar el papeleo

## 2. Información obligatoria

Tu factura debe contener obligatoriamente:
- Tu nombre/razón social y dirección
- Número de identificación fiscal
- Nombre y dirección del cliente
- Fecha de la factura
- Número de factura único
- Descripción detallada del servicio
- Importes sin y con IVA
- Tipo de IVA (o mención de exención)
- Condiciones de pago

## 3. Establece tus condiciones de pago

Los plazos estándar:
- **Pago al recibo** : ideal para importes pequeños
- **30 días** : estándar profesional
- **45 días** : para grandes empresas

## 4. Envía tu factura

Varias opciones:
- Por email con PDF adjunto
- A través de un software de facturación como Robi AI
- Por correo certificado (para importes grandes)

## 5. Haz seguimiento de los pagos

No dejes que se acumulen los impagos:
- Envía un recordatorio cortés después de 7 días
- Envía una notificación formal después de 30 días
- Considera acciones legales si es necesario

## Conclusión

Facturar correctamente desde el principio te ahorrará muchos problemas. Con una herramienta como Robi AI, puedes automatizar todo el proceso y concentrarte en lo que mejor sabes hacer.`,
  },

  "mentions-obligatoires-facture": {
    fr: `## Les mentions obligatoires en 2024

La réglementation française impose des mentions précises sur vos factures. Voici la liste complète pour être en conformité.

## Mentions concernant votre entreprise

1. **Nom ou raison sociale**
2. **Adresse du siège social**
3. **Numéro SIRET** (14 chiffres)
4. **Code APE/NAF**
5. **Forme juridique** (pour les sociétés)
6. **Capital social** (pour les sociétés)

## Mentions concernant le client

1. **Nom ou raison sociale**
2. **Adresse de facturation**
3. **Numéro de TVA intracommunautaire** (si applicable)

## Mentions concernant la facture

1. **Numéro de facture unique** et chronologique
2. **Date d'émission**
3. **Date de la prestation** ou livraison
4. **Quantité et dénomination précise** des produits/services
5. **Prix unitaire HT**
6. **Taux de TVA applicable** (ou mention d'exonération)
7. **Montant total HT et TTC**
8. **Remises éventuelles**

## Mentions de paiement

1. **Date d'échéance**
2. **Conditions d'escompte** (ou mention "pas d'escompte")
3. **Taux de pénalités de retard**
4. **Indemnité forfaitaire de recouvrement** (40€)

## Cas particuliers

### Micro-entrepreneur
Ajoutez : "TVA non applicable, art. 293 B du CGI"

### Artisan
Ajoutez : Numéro d'inscription au répertoire des métiers

### Professionnel réglementé
Ajoutez : Références de l'assurance professionnelle

## Les sanctions

Une facture non conforme peut entraîner :
- Amende de 15€ par mention manquante
- Jusqu'à 75 000€ pour les cas graves
- Rejet de la déduction de TVA pour le client

## Conclusion

Avec Robi AI, toutes ces mentions sont ajoutées automatiquement. Vous n'avez plus qu'à vous concentrer sur votre activité.`,

    en: `## Mandatory Invoice Information in 2024

Regulations require specific information on your invoices. Here's the complete checklist to stay compliant.

## Your business information

1. **Business name or company name**
2. **Registered address**
3. **Business registration number**
4. **Industry classification code**
5. **Legal form** (for companies)
6. **Share capital** (for companies)

## Client information

1. **Name or company name**
2. **Billing address**
3. **Tax identification number** (if applicable)

## Invoice details

1. **Unique sequential invoice number**
2. **Issue date**
3. **Service or delivery date**
4. **Quantity and precise description** of goods/services
5. **Unit price before tax**
6. **Applicable tax rate** (or exemption notice)
7. **Total before and after tax**
8. **Any discounts applied**

## Payment information

1. **Due date**
2. **Early payment discount terms** (or "no discount")
3. **Late payment penalty rate**
4. **Fixed recovery fee** (€40)

## Special cases

### Sole proprietor (under threshold)
Add: "VAT not applicable, article 293 B of the CGI"

### Trades professional
Add: Trade register number

### Regulated profession
Add: Professional insurance references

## Penalties

A non-compliant invoice can lead to:
- €15 fine per missing item
- Up to €75,000 for serious cases
- Client's VAT deduction rejected

## Conclusion

With Robi AI, all mandatory information is added automatically. You can focus on your business while staying fully compliant.`,

    es: `## Información obligatoria en facturas 2024

La normativa exige menciones específicas en tus facturas. Aquí tienes la lista completa para estar en conformidad.

## Información de tu empresa

1. **Nombre o razón social**
2. **Dirección del domicilio social**
3. **Número de identificación fiscal**
4. **Código de actividad**
5. **Forma jurídica** (para sociedades)
6. **Capital social** (para sociedades)

## Información del cliente

1. **Nombre o razón social**
2. **Dirección de facturación**
3. **Número de IVA intracomunitario** (si aplica)

## Detalles de la factura

1. **Número de factura único** y cronológico
2. **Fecha de emisión**
3. **Fecha del servicio** o entrega
4. **Cantidad y descripción precisa** de productos/servicios
5. **Precio unitario sin IVA**
6. **Tipo de IVA aplicable** (o mención de exención)
7. **Importe total sin y con IVA**
8. **Descuentos aplicados**

## Información de pago

1. **Fecha de vencimiento**
2. **Condiciones de pronto pago** (o "sin descuento")
3. **Tipo de penalización por retraso**
4. **Indemnización fija de cobro** (40€)

## Casos especiales

### Autónomo (bajo umbral)
Añadir: "IVA no aplicable, artículo 293 B del CGI"

### Profesional artesano
Añadir: Número de registro profesional

### Profesión regulada
Añadir: Referencias del seguro profesional

## Sanciones

Una factura no conforme puede conllevar:
- Multa de 15€ por mención faltante
- Hasta 75.000€ en casos graves
- Rechazo de la deducción del IVA para el cliente

## Conclusión

Con Robi AI, toda la información obligatoria se añade automáticamente. Puedes concentrarte en tu negocio con total conformidad.`,
  },

  "relancer-client-impaye": {
    fr: `## Comment relancer efficacement un client qui ne paie pas

Les retards de paiement sont le cauchemar des freelances. Voici 5 techniques pour récupérer votre argent sans détruire la relation client.

## 1. Le rappel amical (J+7)

**Ton** : Bienveillant, supposez une erreur

Envoyez un email court et poli rappelant la facture et sa date d'échéance. Joignez à nouveau la facture en pièce jointe.

## 2. La relance formelle (J+15)

**Ton** : Professionnel, direct

Rédigez un courrier plus formel mentionnant le numéro de facture et demandant le règlement dans les meilleurs délais.

## 3. L'appel téléphonique (J+20)

Parfois, un appel vaut mieux qu'un email :
- Demandez à parler au service comptabilité
- Restez calme et factuel
- Proposez des solutions (échelonnement, etc.)
- Prenez des notes et confirmez par email

## 4. La mise en demeure (J+30)

C'est la dernière étape avant les actions légales :
- Envoyez en recommandé avec AR
- Mentionnez les pénalités de retard
- Fixez un délai de 8 jours
- Conservez une copie

## 5. L'action légale (J+45)

Si rien ne fonctionne :
- **Injonction de payer** : rapide et peu coûteuse
- **Société de recouvrement** : pour les gros montants
- **Tribunal de commerce** : en dernier recours

## Conseils pour éviter les impayés

1. Demandez un acompte de 30-50%
2. Facturez rapidement
3. Vérifiez la solvabilité des nouveaux clients
4. Utilisez des liens de paiement en ligne

## Automatisez avec Robi AI

Robi peut :
- Détecter automatiquement les retards
- Envoyer des relances personnalisées
- Suivre les ouvertures d'email
- Vous alerter si besoin d'action manuelle`,

    en: `## How to Effectively Chase Unpaid Invoices

Late payments are every freelancer's nightmare. Here are 5 techniques to recover your money without damaging the client relationship.

## 1. The friendly reminder (Day +7)

**Tone** : Kind, assume it's an oversight

Send a short, polite email reminding them of the invoice and due date. Reattach the invoice for convenience.

## 2. The formal follow-up (Day +15)

**Tone** : Professional, direct

Write a more formal message referencing the invoice number and requesting prompt payment.

## 3. The phone call (Day +20)

Sometimes a call is better than an email:
- Ask to speak with accounts payable
- Stay calm and factual
- Offer solutions (payment plan, etc.)
- Take notes and confirm by email

## 4. The formal demand (Day +30)

This is the last step before legal action:
- Send by registered mail
- Mention late payment penalties
- Set an 8-day deadline
- Keep a copy

## 5. Legal action (Day +45)

If nothing works:
- **Payment order** : fast and affordable
- **Collection agency** : for large amounts
- **Small claims court** : as a last resort

## Tips to prevent unpaid invoices

1. Ask for a 30-50% deposit upfront
2. Invoice promptly
3. Check new clients' creditworthiness
4. Use online payment links

## Automate with Robi AI

Robi can:
- Automatically detect late payments
- Send personalized reminders
- Track email opens
- Alert you when manual action is needed`,

    es: `## Cómo reclamar eficazmente a un cliente que no paga

Los retrasos en los pagos son la pesadilla de todo freelancer. Aquí tienes 5 técnicas para recuperar tu dinero sin destruir la relación con el cliente.

## 1. El recordatorio amable (Día +7)

**Tono** : Amable, asume que es un olvido

Envía un email corto y educado recordando la factura y su fecha de vencimiento. Adjunta de nuevo la factura.

## 2. El seguimiento formal (Día +15)

**Tono** : Profesional, directo

Redacta un mensaje más formal mencionando el número de factura y solicitando el pago lo antes posible.

## 3. La llamada telefónica (Día +20)

A veces, una llamada vale más que un email:
- Pide hablar con el departamento de contabilidad
- Mantén la calma y sé objetivo
- Propón soluciones (fraccionamiento, etc.)
- Toma notas y confirma por email

## 4. El requerimiento formal (Día +30)

Es el último paso antes de acciones legales:
- Envía por correo certificado
- Menciona las penalizaciones por retraso
- Fija un plazo de 8 días
- Guarda una copia

## 5. Acción legal (Día +45)

Si nada funciona:
- **Orden de pago** : rápida y económica
- **Empresa de cobros** : para grandes importes
- **Tribunal mercantil** : como último recurso

## Consejos para evitar impagos

1. Pide un anticipo del 30-50%
2. Factura rápidamente
3. Verifica la solvencia de nuevos clientes
4. Usa enlaces de pago online

## Automatiza con Robi AI

Robi puede:
- Detectar automáticamente los retrasos
- Enviar recordatorios personalizados
- Hacer seguimiento de aperturas de email
- Alertarte cuando se necesita acción manual`,
  },

  "tarif-journalier-moyen-freelance": {
    fr: `## TJM Freelance 2024 : Quel tarif pratiquer ?

Le Tarif Journalier Moyen (TJM) est LA question que se pose tout freelance. Voici un guide complet pour fixer le vôtre.

## Les TJM moyens par métier en 2024

### Tech & Digital
- Développeur Web : 300-800€ selon séniorité
- Data Scientist : 400-1000€
- DevOps : 400-900€
- UX Designer : 350-850€

### Conseil & Stratégie
- Consultant Marketing : 350-1000€
- Consultant RH : 300-850€
- Coach Business : 400-1500€

### Création
- Graphiste : 250-700€
- Motion Designer : 350-900€
- Photographe : 300-1000€

## Comment calculer votre TJM ?

### Méthode simple

1. **Salaire net annuel souhaité** : 50 000€
2. **Charges sociales** (~25% micro) : 16 667€
3. **CA nécessaire** : 66 667€
4. **Jours facturables** (~200/an) : 200 jours
5. **TJM** = 66 667 / 200 = **333€**

### N'oubliez pas

- Les congés (25-30 jours)
- La maladie (5-10 jours)
- La prospection (20-30 jours)
- La formation (10 jours)
- L'administratif (10 jours)

## Facteurs qui influencent le TJM

### À la hausse
- Expertise rare
- Références prestigieuses
- Certifications
- Urgence du projet
- Mission longue

### À la baisse
- Marché saturé
- Client récurrent
- Mission formatrice
- Télétravail intégral

## Négocier son TJM

1. **Ne donnez jamais de fourchette** : indiquez un chiffre précis
2. **Justifiez votre valeur** : ROI, références, expertise
3. **Proposez des options** : forfait vs régie, engagement durée
4. **Sachez dire non** : un mauvais tarif coûte plus qu'il ne rapporte

## Conclusion

Votre TJM doit couvrir vos charges, financer votre protection sociale, et vous permettre de vivre confortablement. Utilisez notre calculateur gratuit pour trouver le vôtre !`,

    en: `## Freelance Day Rates 2024: What Should You Charge?

Your daily rate is THE question every freelancer asks. Here's a complete guide to setting yours.

## Average day rates by profession in 2024

### Tech & Digital
- Web Developer: €300-800 depending on seniority
- Data Scientist: €400-1,000
- DevOps Engineer: €400-900
- UX Designer: €350-850

### Consulting & Strategy
- Marketing Consultant: €350-1,000
- HR Consultant: €300-850
- Business Coach: €400-1,500

### Creative
- Graphic Designer: €250-700
- Motion Designer: €350-900
- Photographer: €300-1,000

## How to calculate your day rate

### Simple method

1. **Desired net annual salary** : €50,000
2. **Social charges** (~25%) : €16,667
3. **Required revenue** : €66,667
4. **Billable days** (~200/year) : 200 days
5. **Day rate** = 66,667 / 200 = **€333**

### Don't forget

- Holidays (25-30 days)
- Sick days (5-10 days)
- Business development (20-30 days)
- Training (10 days)
- Admin tasks (10 days)

## Factors that influence your rate

### Upward pressure
- Rare expertise
- Prestigious references
- Certifications
- Project urgency
- Long-term contracts

### Downward pressure
- Saturated market
- Recurring client
- Learning opportunity
- Full remote work

## Negotiating your rate

1. **Never give a range** : state a precise number
2. **Justify your value** : ROI, references, expertise
3. **Offer options** : fixed price vs time-based, commitment length
4. **Learn to say no** : a bad rate costs more than it earns

## Conclusion

Your day rate should cover your expenses, fund your social protection, and let you live comfortably. Use our free calculator to find yours!`,

    es: `## Tarifas Freelance 2024: ¿Cuánto deberías cobrar?

Tu tarifa diaria es LA pregunta que se hace todo freelancer. Aquí tienes una guía completa para fijar la tuya.

## Tarifas medias por profesión en 2024

### Tech & Digital
- Desarrollador Web: 300-800€ según experiencia
- Data Scientist: 400-1.000€
- Ingeniero DevOps: 400-900€
- Diseñador UX: 350-850€

### Consultoría & Estrategia
- Consultor de Marketing: 350-1.000€
- Consultor de RRHH: 300-850€
- Coach de Negocios: 400-1.500€

### Creativo
- Diseñador Gráfico: 250-700€
- Motion Designer: 350-900€
- Fotógrafo: 300-1.000€

## Cómo calcular tu tarifa diaria

### Método simple

1. **Salario neto anual deseado** : 50.000€
2. **Cargas sociales** (~25%) : 16.667€
3. **Facturación necesaria** : 66.667€
4. **Días facturables** (~200/año) : 200 días
5. **Tarifa diaria** = 66.667 / 200 = **333€**

### No olvides

- Vacaciones (25-30 días)
- Días de enfermedad (5-10 días)
- Prospección comercial (20-30 días)
- Formación (10 días)
- Tareas administrativas (10 días)

## Factores que influyen en tu tarifa

### Al alza
- Experiencia rara
- Referencias prestigiosas
- Certificaciones
- Urgencia del proyecto
- Contratos largos

### A la baja
- Mercado saturado
- Cliente recurrente
- Oportunidad de aprendizaje
- Teletrabajo completo

## Negociar tu tarifa

1. **Nunca des un rango** : indica un número preciso
2. **Justifica tu valor** : ROI, referencias, experiencia
3. **Ofrece opciones** : precio fijo vs por horas, compromiso de duración
4. **Aprende a decir no** : una mala tarifa cuesta más de lo que aporta

## Conclusión

Tu tarifa diaria debe cubrir tus gastos, financiar tu protección social y permitirte vivir cómodamente. ¡Usa nuestra calculadora gratuita para encontrar la tuya!`,
  },

  "micro-entreprise-vs-sasu": {
    fr: `## Micro-Entreprise vs SASU : Quel statut choisir ?

Vous lancez votre activité freelance et hésitez entre micro-entreprise et SASU ? Voici un comparatif détaillé pour vous aider.

## Tableau comparatif

Les principales différences entre Micro-Entreprise et SASU :
- **Création** : Simple et gratuit vs Complexe (~300€)
- **Comptabilité** : Livre des recettes vs Comptabilité complète
- **Charges** : 22-25% du CA vs ~45% du salaire
- **Plafond CA** : 77 700€ (services) vs Illimité
- **TVA** : Franchise possible vs Obligatoire
- **Responsabilité** : Personnelle vs Limitée aux apports
- **Chômage** : Non vs Oui (sous conditions)

## Micro-Entreprise : pour qui ?

### Avantages
- Création en 10 minutes
- Pas de comptabilité complexe
- Charges calculées sur le CA réel
- CFE réduite la première année
- Versement libératoire possible

### Inconvénients
- Plafond de CA (77 700€ services)
- Pas de déduction des charges
- Protection sociale limitée
- Patrimoine personnel exposé

### Idéal pour
- Activité secondaire
- Test d'un projet
- CA < 50 000€/an
- Peu de frais professionnels

## SASU : pour qui ?

### Avantages
- Responsabilité limitée
- Déduction des frais
- Optimisation fiscale (dividendes)
- Image professionnelle
- Pas de plafond de CA

### Inconvénients
- Formalités de création
- Comptabilité obligatoire (~2000€/an)
- Charges sociales élevées
- Obligations déclaratives

### Idéal pour
- CA > 70 000€/an
- Frais importants (locaux, matériel)
- Associés potentiels
- Levée de fonds prévue

## Comment choisir ?

1. **CA prévu < 50k€** → Micro-entreprise
2. **CA prévu 50-70k€** → À calculer précisément
3. **CA prévu > 70k€** → SASU probable
4. **Beaucoup de frais** → SASU
5. **Besoin de chômage** → SASU
6. **Test d'activité** → Micro-entreprise

## Conclusion

Le bon statut dépend de votre situation personnelle. N'hésitez pas à consulter un expert-comptable pour une simulation personnalisée.

Avec Robi AI, quelle que soit votre structure, vous pouvez facturer facilement et en conformité !`,

    en: `## Sole Proprietorship vs Corporation: Which Structure to Choose?

Starting your freelance business and unsure which legal structure to pick? Here's a detailed comparison to help you decide.

## Quick comparison

Key differences between Sole Proprietorship and Corporation:
- **Setup** : Simple and free vs Complex (~€300)
- **Accounting** : Basic records vs Full accounting
- **Charges** : 22-25% of revenue vs ~45% of salary
- **Revenue cap** : €77,700 (services) vs Unlimited
- **VAT** : Exemption possible vs Mandatory
- **Liability** : Personal vs Limited to contributions
- **Unemployment** : No vs Yes (under conditions)

## Sole Proprietorship: for whom?

### Advantages
- Set up in 10 minutes
- No complex accounting
- Charges based on actual revenue
- Reduced business tax in year one
- Simplified tax payment option

### Disadvantages
- Revenue cap (€77,700 for services)
- No expense deductions
- Limited social protection
- Personal assets exposed

### Ideal for
- Side business
- Testing a project
- Revenue < €50,000/year
- Low business expenses

## Corporation (SASU): for whom?

### Advantages
- Limited liability
- Expense deductions
- Tax optimization (dividends)
- Professional image
- No revenue cap

### Disadvantages
- Setup formalities
- Mandatory accounting (~€2,000/year)
- Higher social charges
- Reporting obligations

### Ideal for
- Revenue > €70,000/year
- Significant expenses (office, equipment)
- Potential partners
- Fundraising planned

## How to choose?

1. **Expected revenue < €50k** → Sole proprietorship
2. **Expected revenue €50-70k** → Calculate precisely
3. **Expected revenue > €70k** → Corporation likely
4. **Many expenses** → Corporation
5. **Need unemployment benefits** → Corporation
6. **Testing a business idea** → Sole proprietorship

## Conclusion

The right structure depends on your personal situation. Don't hesitate to consult an accountant for a personalized simulation.

With Robi AI, whatever your structure, you can invoice easily and stay compliant!`,

    es: `## Autónomo vs Sociedad: ¿Qué estructura elegir?

¿Empiezas tu actividad freelance y dudas entre ser autónomo o crear una sociedad? Aquí tienes una comparación detallada para ayudarte.

## Comparación rápida

Principales diferencias entre Autónomo y Sociedad:
- **Creación** : Simple y gratuita vs Compleja (~300€)
- **Contabilidad** : Registros básicos vs Contabilidad completa
- **Cargas** : 22-25% de la facturación vs ~45% del salario
- **Límite de facturación** : 77.700€ (servicios) vs Ilimitado
- **IVA** : Exención posible vs Obligatorio
- **Responsabilidad** : Personal vs Limitada a las aportaciones
- **Desempleo** : No vs Sí (bajo condiciones)

## Autónomo: ¿para quién?

### Ventajas
- Alta en 10 minutos
- Sin contabilidad compleja
- Cargas basadas en la facturación real
- Impuesto reducido el primer año
- Pago simplificado posible

### Desventajas
- Límite de facturación (77.700€ servicios)
- Sin deducción de gastos
- Protección social limitada
- Patrimonio personal expuesto

### Ideal para
- Actividad secundaria
- Probar un proyecto
- Facturación < 50.000€/año
- Pocos gastos profesionales

## Sociedad (SL/SA): ¿para quién?

### Ventajas
- Responsabilidad limitada
- Deducción de gastos
- Optimización fiscal (dividendos)
- Imagen profesional
- Sin límite de facturación

### Desventajas
- Trámites de constitución
- Contabilidad obligatoria (~2.000€/año)
- Cargas sociales elevadas
- Obligaciones declarativas

### Ideal para
- Facturación > 70.000€/año
- Gastos importantes (local, material)
- Socios potenciales
- Ronda de financiación prevista

## ¿Cómo elegir?

1. **Facturación prevista < 50k€** → Autónomo
2. **Facturación prevista 50-70k€** → Calcular con precisión
3. **Facturación prevista > 70k€** → Sociedad probable
4. **Muchos gastos** → Sociedad
5. **Necesitas prestación por desempleo** → Sociedad
6. **Probar una actividad** → Autónomo

## Conclusión

La estructura correcta depende de tu situación personal. No dudes en consultar a un contable para una simulación personalizada.

¡Con Robi AI, sea cual sea tu estructura, puedes facturar fácilmente y con total conformidad!`,
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const localeContent = articleContent[slug];
  const content = localeContent?.[locale] || localeContent?.fr || "";
  const otherPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  // Simple markdown to HTML
  const htmlContent = content
    .split("\n")
    .map((line) => {
      if (line.startsWith("## ")) return `<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4">${line.slice(3)}</h2>`;
      if (line.startsWith("### ")) return `<h3 class="text-xl font-semibold text-gray-900 mt-8 mb-3">${line.slice(4)}</h3>`;
      if (line.startsWith("- **")) {
        const match = line.match(/- \*\*(.+?)\*\*\s*:?\s*(.*)/);
        if (match) return `<li class="text-gray-500 mb-2"><strong class="text-gray-900">${match[1]}</strong>${match[2] ? " : " + match[2] : ""}</li>`;
      }
      if (line.startsWith("- ")) return `<li class="text-gray-500 mb-2">${line.slice(2)}</li>`;
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ") || line.startsWith("5. ") || line.startsWith("6. ") || line.startsWith("7. ") || line.startsWith("8. ")) {
        const text = line.replace(/^\d+\.\s/, "");
        const boldMatch = text.match(/\*\*(.+?)\*\*(.*)/);
        if (boldMatch) return `<li class="text-gray-500 mb-2 list-decimal ml-4"><strong class="text-gray-900">${boldMatch[1]}</strong>${boldMatch[2]}</li>`;
        return `<li class="text-gray-500 mb-2 list-decimal ml-4">${text}</li>`;
      }
      if (line.startsWith("> ")) return `<blockquote class="border-l-4 border-[#BEF221]/40 pl-4 my-4 text-gray-500 italic">${line.slice(2)}</blockquote>`;
      if (line.trim() === "") return "";
      // Bold inline
      const processed = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-gray-900">$1</strong>');
      return `<p class="text-gray-500 mb-4 leading-relaxed">${processed}</p>`;
    })
    .join("\n");

  return (
    <>
      {/* JSON-LD for Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: t(post.title, locale),
            description: t(post.description, locale),
            inLanguage: locale,
            author: {
              "@type": "Organization",
              name: "Robi AI",
            },
            publisher: {
              "@type": "Organization",
              name: "Robi AI",
              logo: "https://robi.ai/logo.png",
            },
            datePublished: "2024-02-15",
            dateModified: "2024-02-15",
          }),
        }}
      />

      <article className="pt-32 pb-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#BEF221] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.pages.blog.backToBlog}
          </Link>

          {/* Header */}
          <header className="mb-12">
            <Badge className={categoryColors[post.category]}>
              {dict.pages.blog.categories[post.category as keyof typeof dict.pages.blog.categories]}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mt-4 mb-6 leading-tight">
              {t(post.title, locale)}
            </h1>
            <p className="text-xl text-gray-500 mb-6">{t(post.description, locale)}</p>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                15 février 2024
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                8 {dict.pages.blog.readTime}
              </span>
              <button className="flex items-center gap-2 hover:text-[#BEF221] transition-colors">
                <Share2 className="w-4 h-4" />
                {dict.pages.blog.share}
              </button>
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* CTA Box */}
          <Card variant="accent" className="mt-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-900 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {dict.pages.blog.putInPractice}
            </h3>
            <p className="text-gray-500 mb-6">
              {dict.pages.blog.putInPracticeDesc}
            </p>
            <Button href={`/${locale}/signup`}>{dict.pages.industries.tryFree}</Button>
          </Card>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {dict.pages.blog.relatedPosts}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherPosts.map((relatedPost) => (
              <Link key={relatedPost.slug} href={`/${locale}/blog/${relatedPost.slug}`}>
                <Card className="h-full group cursor-pointer">
                  <Badge className={categoryColors[relatedPost.category]}>
                    {dict.pages.blog.categories[relatedPost.category as keyof typeof dict.pages.blog.categories]}
                  </Badge>
                  <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2 group-hover:text-[#BEF221] transition-colors line-clamp-2">
                    {t(relatedPost.title, locale)}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2">
                    {t(relatedPost.description, locale)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA
        title={dict.pages.blog.ctaTitle}
        subtitle={dict.pages.blog.ctaSubtitle}
        ctaText={dict.cta.button}
        secondaryText={dict.cta.subtext}
      />
    </>
  );
}
