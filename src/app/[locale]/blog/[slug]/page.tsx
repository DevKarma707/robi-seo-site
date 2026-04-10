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
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

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
    
    "pt-BR": `## Introdução

Parabéns! Você acaba de conquistar seu primeiro cliente como freelancer. Agora vem a pergunta crucial: como faturar corretamente?

Este guia acompanha você passo a passo para emitir sua primeira fatura de forma totalmente legal.

## 1. Verifique sua situação legal

Antes de faturar, certifique-se de ter uma estrutura jurídica:
- **Autônomo/MEI** : a forma mais simples de começar
- **Microempresa (ME)** : para receitas maiores
- **Cooperativa** : se preferir evitar a burocracia contábil

## 2. Informações obrigatórias

Sua fatura deve obrigatoriamente conter:
- Seu nome/razão social e endereço
- Cadastro Nacional (CNPJ/CPF)
- Nome e endereço do cliente
- Data da fatura e de vencimento
- Número sequencial único
- Descrição detalhada do serviço
- Valores base e totais
- Taxas e tributos (ou isenção, caso MEI)
- Condições de pagamento

## 3. Defina seus prazos de pagamento

Prazos padrão no mercado:
- **Pagamento à vista** : ideal para valores menores
- **30 dias (30 ddl)** : padrão profissional corporativo
- **45 a 60 dias** : para grandes multinacionais

## 4. Envie sua fatura

Várias opções:
- Por e-mail com PDF em anexo
- Usando um software inteligente como o Robi AI
- Por correspondência (para montantes públicos muito altos)

## 5. Acompanhe os pagamentos

Não deixe que os pagamentos atrasados se acumulem:
- Envie um lembrete educado após 7 dias
- Envie uma notificação formal após 30 dias
- Considere medidas legais se estritamente necessário

## Conclusão

Faturar corretamente desde o primeiro dia evitará muitas dores de cabeça no futuro. Com uma ferramenta ágil como o Robi AI, você automatiza todo esse processo chato e foca apenas no que faz de melhor.`,
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
    
    "pt-BR": `## Informações obrigatórias em faturas 2024

A legislação exige informações específicas nas suas faturas. Aqui está a lista completa para manter a conformidade legal.

## Informações da sua empresa

1. **Nome ou Razão Social**
2. **Endereço da sede social**
3. **CNPJ (ou CPF para autônomos sem CNPJ)**
4. **CNAE (Código de atividade)**
5. **Forma jurídica** (para empresas)
6. **Inscrição Municipal/Estadual** (conforme o caso)

## Informações do cliente

1. **Nome ou Razão Social**
2. **Endereço de faturamento**
3. **CNPJ/CPF do cliente**

## Detalhes da fatura / Nota Fiscal

1. **Número da fatura único** e sequencial
2. **Data de emissão**
3. **Data da prestação do serviço**
4. **Quantidade e descrição precisa** dos produtos/serviços
5. **Preço unitário bruto**
6. **Taxas e Impostos aplicáveis** (ISS, ICMS, etc. ou aviso de optante pelo Simples Nacional)
7. **Valor total líquido e bruto**
8. **Descontos aplicados**

## Informações de pagamento

1. **Data de vencimento**
2. **Condições de desconto por pagamento antecipado** (se houver)
3. **Taxa de juros e multas por atraso**
4. **Dados bancários / Chave PIX**

## Casos especiais

### MEI (Microempreendedor Individual)
Adicionar: "Documento emitido por MEI - Optante pelo SIMEI. Não gera direito a crédito fiscal de IPI."

### Profissional Liberal
Adicionar: Número de registro no respectivo conselho (CRM, OAB, CREA, etc.)

## Penalidades

Uma nota fiscal ou fatura irregular pode resultar em:
- Multas pesadas por sonegação ou erro na emissão
- Processos por quebra de conformidade fiscal
- Rejeição na dedutibilidade de despesas para o cliente

## Conclusão

Com o Robi AI, as informações vitais são preenchidas automaticamente. Você foca no seu negócio com conformidade total.`,
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
    
    "pt-BR": `## Como cobrar com eficácia um cliente inadimplente

Pagamentos atrasados são o pesadelo de todo freelancer. Aqui estão 5 métodos para recuperar seu dinheiro sem destruir o relacionamento com seu cliente.

## 1. O lembrete amigável (Dia +7)

**Tom** : Empático, presuma que foi um esquecimento

Envie um e-mail curto e educado lembrando a fatura e sua data de vencimento. Anexe a fatura novamente para facilitar.

## 2. A cobrança formal (Dia +15)

**Tom** : Profissional, direto

Escreva uma mensagem mais assertiva, referenciando o número da fatura, os itens e solicitando o pagamento com urgência.

## 3. A ligação de contato (Dia +20)

Às vezes, telefonar é melhor do que um e-mail:
- Peça para falar com o departamento financeiro
- Mantenha a calma e seja objetivo
- Ofereça soluções alternativas (parcelamento, etc.)
- Faça anotações e envie um e-mail formalizando o que foi acordado

## 4. A notificação extrajudicial (Dia +30)

Este é o último passo antes de medidas judiciais:
- Envie por correspondência registrada com Aviso de Recebimento (AR)
- Mencione os juros de mora e as multas por atraso
- Defina um prazo legal irredutível (ex: 5 dias úteis)
- Guarde uma via assinada

## 5. Ação Legal / Protesto (Dia +45)

Se nada funcionar:
- **Protesto em cartório** : rápido e bloqueia o crédito da empresa
- **Empresa de cobrança** : útil para valores muito expressivos
- **Juizado Especial Cível** : como última barreira institucional

## Dicas para evitar calotes

1. Sempre exija um sinal (30-50%) antes de começar a trabalhar
2. Fature e avise o vencimento rapidamente e de forma clara
3. Verifique a credibilidade e solvência de novos clientes
4. Use links de pagamento online para facilitar

## Automatize com o Robi AI

O Robi é capaz de:
- Detectar pagamentos vencidos de forma inteligente
- Disparar lembretes totalmente personalizados
- Rastrear se o e-mail foi aberto pelo cliente
- Avisar quando uma notificação formal é inevitável`,
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
    
    "pt-BR": `## Diária Freelance 2024: Quanto cobrar?

O valor da diária de trabalho é a grande dúvida de todo freelancer. Aqui está um guia prático para ajudá-lo a definir a sua.

## Média de diárias por área em 2024 (Brasil)

### Tech & Inovação
- Desenvolvedor(a) Web: R$300-800, dependendo da senioridade
- Cientista de Dados: R$450-1.200
- Engenheiro(a) DevOps: R$400-950
- Designer UX/UI: R$350-900

### Consultoria e Negócios
- Consultor(a) de Marketing: R$350-1.000
- Consultor(a) de RH: R$300-900
- Coach Executivo: R$400-1.500

### Criação Visual
- Diretor de Arte / Designer: R$250-700
- Motion Designer: R$350-1.000
- Fotógrafo(a): R$300-1.100

## Como calcular a sua Diária?

### Método reverso

1. **Salário líquido anual desejado** : R$ 100.000
2. **Encargos e impostos** (~15%) : R$ 15.000
3. **Receita bruta necessária** : R$ 115.000
4. **Dias de trabalho faturáveis** (~200 ao ano) : 200 dias
5. **Sua diária (Valor/Dia)** = 115.000 / 200 = **R$ 575/dia**

### Lembre-se de contabilizar o seguinte:

- Férias (25-30 dias)
- Licença saúde / Imprevistos (5-10 dias)
- Prospecção e reuniões (20-30 dias)
- Atualização e Cursos (10 dias)
- Obrigações administrativas (10 dias)

## Fatores que elevam a sua diária

- Conhecimento altamente específico e escasso (nichos rentáveis)
- Portfólio renomado e cases com ROI claro
- Urgência dramática por parte do cliente
- Contratos de altíssimo risco e longos prazos

## Dicas cruciais de negociação

1. **Nunca forneça uma "faixa" ou estimativa genérica**: indique o número exato, justificado
2. **Baseie seu valor no Retorno**: Mostre o ROI direto que o seu parceiro vai ter
3. **Ofereça opções flexíveis**: Preço fixo da obra vs Diária solta vs Contrato recorrente
4. **Tenha coragem para dizer NÃO**: Aceitar diárias ruins por medo sai muito caro a longo prazo

## Conclusão

Sua diária deve arcar com todas as suas despesas, proteger sua saúde bancária e possibilitar um estilo de vida excelente. Use a Calculadora Inteligente do Robi AI para projetá-la com base em robótica de dados e impostos do Brasil!`,
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
    
    "pt-BR": `## MEI vs Empresa Individual/Simples: Qual modelo adotar?

Está formalizando sua atuação freelance no Brasil e não sabe se abre um MEI (Microempreendedor Individual) ou parte direto para uma Microempresa (ME) no Simples Nacional? Veja as diferenças e escolha com segurança.

## Comparativo Direto

Diferenças essenciais entre MEI e ME (Simples):
- **Custo de abertura** : Gratuito e on-line (MEI) vs Demanda Contador e taxas (~R$500 a R$1000 para ME)
- **Obrigações contábeis** : Declaração simplificada anual (MEI) vs Contabilidade Mensal rigorosa (ME)
- **Tributos** : Taxa única mensal (DAS MEI ~R$75) vs Alíquotas percentuais progressivas (iniciando em 6% sobre faturamento no Simples/Anexo III)
- **Limite de Faturamento Bruto** : R$ 81.000 ao ano (MEI) vs Até R$ 4,8 milhões (EPP/Simples)
- **Emissão NFs** : Emitidas via portal único sem entraves

## MEI: Para quem vale a pena?

### Vantagens do MEI
- Abertura imediata pelo Portal do Empreendedor
- Sem necessidade exigida de contador
- Imposto fixo minúsculo, independente da renda e dos serviços (desde que no limite)
- Garantia de Direitos Previdenciários (Aposentadoria, auxílio-doença)
- Alvará facilitado e rápido

### Desvantagens
- Teto de faturamento extremamente baixo (R$ 6.750 em média por mês)
- Não abrange muitas atividades intelectuais ou categorias regulamentadas (Advogados, Programadores, Arquitetos, Publicitários)
- Máximo de 1 funcionário contratado

### Ideal para
- Testar um negócio secundário ou nova frente
- Atendimentos muito simples ou manuais previstos na tabela
- Expectativa inicial de faturamento controlada

## ME (Simples Nacional): Para quem é?

### Vantagens
- Inúmeras profissões autorizadas (Tech, Finanças, Saúde, Marketing)
- Limite elástico (Microempresa fatura até R$ 360 mil/ano)
- Possibilidade de contratação robusta de equipe
- Mais credibilidade diante de multinacionais (fornecimento homologado)

### Desvantagens
- Abertura lenta, dependente da Junta Comercial
- Você é obrigado a ter contador mensal (fator de custo fixo)
- O imposto sobe com a variação do Cnae e faixas de faturamento
- Declarações acessórias de muita complexidade, sujeitas a multas se o contador errar

## Quando migrar?

1. **Faturamento ultrapassa R$ 81k/ano** → Desvinculação do MEI obigatória
2. **Sua profissão não consta no MEI** → Abra sua ME e garanta a CNAE correta (ex: Programador)
3. **Plano de negócios agressivo** → A empresa vai contratar e crescer agressivamente
4. **Grandes B2Bs não contratam MEIs** → Migração forçada pela complacência do cliente Corporativo

## Conclusão

Sua modalidade depende estritamente das suas projeções anuais de CA (vendas) e do Cadastro de sua profissão no Brasil (CNAE). 

Com ou sem MEI, o importante é ser legalizado! Use o **Robi AI** para centralizar suas Notas Fiscais e pagamentos corporativos facilmente em toda a américa latina.`,
  },
  "facturacion-electronica-mexico-guia-cfdi": {
    es: `## Introducción a la Facturación Electrónica en México

Si eres freelance o emprendedor en México, seguramente has escuchado hablar del **CFDI 4.0**. Desde 2023, esta es la única versión válida para emitir comprobantes fiscales ante el **SAT**.

Entender cómo funciona no solo es una obligación legal, sino que también transmite profesionalismo a tus clientes y te permite cobrar tus honorarios sin retrasos.

## 1. ¿Qué es el CFDI 4.0?

El **Comprobante Fiscal Digital por Internet (CFDI)** es la factura electrónica que avala una transacción comercial. La versión 4.0 introdujo cambios importantes en la validación de datos:
- **RFC exacto**: Debe coincidir con tu Constancia de Situación Fiscal.
- **Nombre o Razón Social**: Debe escribirse tal cual aparece en la constancia (en mayúsculas y sin régimen capital como S.A. de C.V.).
- **Código Postal**: El domicilio fiscal de quien emite y quien recibe es ahora obligatorio y debe estar validado.

## 2. Requisitos para Facturar como Freelance

Para empezar a emitir facturas, necesitas:
1. **RFC**: Estar inscrito en el Registro Federal de Contribuyentes.
2. **e.firma (Firma Electrónica)**: Tus archivos .cer y .key vigentes.
3. **Certificado de Sello Digital (CSD)**: Indispensable para sellar las facturas.
4. **Régimen Fiscal**: Generalmente, los freelances tributan bajo el **RESICO** (Régimen Simplificado de Confianza) o **Actividad Empresarial y Profesional**.

## 3. El SAT y los PACs

Puedes facturar directamente en el portal del SAT (gratuito pero a veces lento) o utilizar un **PAC** (Proveedor Autorizado de Certificación) integrado en herramientas como **Robi AI**. Esto automatiza el proceso y te permite enviar la factura en PDF y XML a tu cliente con un solo clic.

## 4. Conceptos y Claves de Producto

Un error común es usar claves de producto incorrectas. Asegúrate de:
- Elegir la clave de servicio que mejor describa tu actividad profesional.
- Indicar correctamente la **Forma de Pago** (ej. Transferencia electrónica) y el **Uso del CFDI** (ej. Gastos en general).

## 5. Complementos de Pago

Si emites una factura con método de pago "PPD" (Pago en Parcialidades o Diferido), recuerda que es obligatorio emitir un **Complemento de Recepción de Pagos** una vez que tu cliente te deposite. Sin esto, la factura no es deducible para ellos.

## Conclusión

La facturation electrónica en México puede parecer compleja, pero con el orden adecuado y las herramientas correctas, se vuelve un proceso de pocos minutos. ¡Usa **Robi AI** para simplificar tu administración y enfocarte en lo que mejor sabes hacer!`,
    fr: `## Introduction à la Facturation Électronique au Mexique

Si vous êtes freelance ou entrepreneur au Mexique, vous avez sûrement entendu parler du **CFDI 4.0**. Depuis 2023, c'est la seule version valide pour émettre des justificatifs fiscaux auprès du **SAT**.

## 1. Qu'est-ce que le CFDI 4.0 ?

Le **Comprobante Fiscal Digital por Internet (CFDI)** est la facture électronique au Mexique. La version 4.0 impose des règles strictes sur le nom, le code postal et le régime fiscal du destinataire.

## 2. Les pré-requis pour les Freelances

Pour facturer, vous devez posséder :
- Un **RFC** valide.
- Votre **e.firma** (signature électronique).
- Un **Certificat de Sceau Numérique (CSD)**.

## 3. Simplifier avec Robi AI

Plutôt que d'utiliser le portail complexe du SAT, **Robi AI** vous permet de générer vos documents conformes rapidement et de les envoyer au format XML et PDF à vos clients mexicains.`,
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
  
  // Smart fallback logic
  let fallbackLocale = "fr";
  if (locale.startsWith("es")) fallbackLocale = "es";
  if (locale === "pt-BR") fallbackLocale = "en"; // English is better than French for BR fallback
  
  const content = localeContent?.[locale] || localeContent?.[fallbackLocale] || localeContent?.fr || "";
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
            "@id": `https://robi-app.com/${locale}/blog/${slug}`,
            headline: t(post.title, locale),
            description: t(post.description, locale),
            articleBody: content,
            inLanguage: locale,
            keywords: post.keywords?.join(", ") || "",
            author: {
              "@type": "Organization",
              name: "Robi AI",
              url: "https://robi-app.com",
            },
            publisher: {
              "@type": "Organization",
              name: "Robi AI",
              url: "https://robi-app.com",
              logo: {
                "@type": "ImageObject",
                url: "https://robi-app.com/logo.png",
                width: 200,
                height: 60,
              },
            },
            image: {
              "@type": "ImageObject",
              url: "https://robi-app.com/og.png",
              width: 1200,
              height: 630,
            },
            datePublished: "2024-02-15",
            dateModified: "2024-02-15",
            articleSection: post.category,
          }),
        }}
      />

      {/* JSON-LD for BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Accueil",
                item: `https://robi-app.com/${locale}`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: `https://robi-app.com/${locale}/blog`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: t(post.title, locale),
                item: `https://robi-app.com/${locale}/blog/${slug}`,
              },
            ],
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

          <Breadcrumbs
            locale={locale}
            items={[
              { label: "Blog", href: `/${locale}/blog` },
              { label: t(post.title, locale) },
            ]}
          />

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
            <Button href="https://go.robi-app.com">{dict.pages.industries.tryFree}</Button>
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
