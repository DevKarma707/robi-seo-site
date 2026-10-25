import { priceMap, localeCurrencies } from "@/lib/i18n/config";

/**
 * Textes écrits pour chaque marché : titre et description de l'accueil et des
 * tarifs, et l'encart « Robi chez toi » (devise, taxe, identifiant fiscal,
 * règle du pays, phrase d'exemple).
 *
 * Avant le 25/10/2026, les 7 accueils francophones portaient le même titre et
 * les 16 pages tarifs un « Pricing | Robi AI » / « Tarifs | Robi AI » commun.
 *
 * Règles d'écriture :
 * - aucun prix écrit à la main : {monthly}, {yearly}, {launch} sont remplis
 *   depuis priceMap dans la devise du pays ;
 * - seulement des faits sûrs : taux de TVA normaux, seuils et dates vérifiés,
 *   identifiants fiscaux que l'app imprime vraiment (ROBI_APP utils/taxLabel.ts).
 *   Pas de date quand elle a bougé ou n'est pas fixée (Verifactu, e-facture
 *   Maroc) ; jamais « Robi fait X » si l'app ne le fait pas (pas de Peppol,
 *   de Verifactu, de certification AT, de dépôt MTD) ;
 * - titre ≤ 60 caractères, description ≤ 160 (vérifié par le recrawl).
 */

export interface MarketCopy {
  homeTitle: string;
  homeDescription: string;
  pricingTitle: string;
  pricingDescription: string;
  focus: {
    title: string;
    intro: string;
    exampleLabel: string;
    example: string;
    points: { title: string; text: string }[];
  };
}

const COPY: Record<string, MarketCopy> = {
  fr: {
    homeTitle: "Devis et factures gratuits en parlant — Robi AI",
    homeDescription:
      "Gratuit pour commencer : dis ta prestation, Robi AI rédige le devis ou la facture en 30 secondes, au format Factur-X. Relances et paiement en ligne inclus.",
    pricingTitle: "Abonnement Robi AI : gratuit, puis {monthly}/mois",
    pricingDescription:
      "4 devis ou factures gratuits par mois, sans carte bancaire. Ensuite {monthly}/mois sans engagement ou {yearly}/an. Factur-X inclus dans toutes les offres.",
    focus: {
      title: "Fait pour facturer en France",
      intro: "Robi connaît les règles françaises : tu dictes, il applique les mentions obligatoires.",
      exampleLabel: "Tu dis",
      example: "« Facture 3 jours de montage vidéo à 400 € la journée pour l'agence Lumen, paiement à 30 jours »",
      points: [
        { title: "Factur-X natif", text: "Depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques ; l'émission suit en 2027 pour les micro-entreprises. Robi génère déjà le format Factur-X (EN 16931)." },
        { title: "Auto-entrepreneur", text: "En franchise de TVA, la mention « TVA non applicable, art. 293 B du CGI » s'ajoute toute seule — et passe à « art. L. 233-3 du CIBS » pour les factures émises à partir du 1er janvier 2027." },
        { title: "SIRET et numérotation", text: "Ton SIRET, ton numéro de TVA et une numérotation sans trou sur chaque document, TVA à 20 % ou à taux réduit calculée ligne par ligne." },
      ],
    },
  },
  "fr-BE": {
    homeTitle: "Facture en parlant, gratuit en Belgique — Robi AI",
    homeDescription:
      "Indépendant en Belgique ? Dicte ta prestation : Robi AI rédige devis et factures en euros, TVA belge calculée, numéro BCE imprimé. Gratuit pour commencer.",
    pricingTitle: "Abonnement Robi AI en Belgique : dès {monthly}/mois",
    pricingDescription:
      "Facturation IA pour indépendants belges : 4 documents gratuits par mois, puis {monthly}/mois ou {yearly}/an, TVA comprise dans le calcul. Sans engagement.",
    focus: {
      title: "Fait pour les indépendants belges",
      intro: "Les mentions belges sont prêtes : tu dis la prestation, Robi s'occupe du document.",
      exampleLabel: "Tu dis",
      example: "« Devis pour la pose de 25 m² de parquet chez Mme Peeters à Namur, 45 € le m², TVA 6 % rénovation »",
      points: [
        { title: "Numéro BCE et TVA BE", text: "Ton numéro d'entreprise BCE et ton numéro de TVA BE figurent sur chaque devis et facture, avec la TVA à 21 % ou au taux que tu indiques." },
        { title: "Facture électronique", text: "Depuis le 1er janvier 2026, les factures entre entreprises assujetties à la TVA belge doivent être électroniques et structurées (réseau Peppol). Vérifie avec ton comptable le canal d'envoi que tu utilises." },
        { title: "En euros, à la belge", text: "Montants en euros, dates au format belge, relances polies rédigées par l'IA quand un client tarde à payer." },
      ],
    },
  },
  "fr-CH": {
    homeTitle: "Devis et factures en francs, en parlant — Robi AI Suisse",
    homeDescription:
      "Indépendants en Suisse romande : dicte ta prestation, Robi AI rédige devis et factures en francs suisses avec ton numéro IDE. Gratuit pour commencer.",
    pricingTitle: "Abonnement Robi AI en Suisse : dès {monthly} par mois",
    pricingDescription:
      "Facturation IA en francs suisses : 4 devis ou factures gratuits par mois, puis {monthly}/mois sans engagement ou {yearly}/an. Sans engagement.",
    focus: {
      title: "Fait pour facturer en Suisse",
      intro: "Des factures en francs suisses, avec les infos que tes clients romands attendent.",
      exampleLabel: "Tu dis",
      example: "« Facture 6 heures de cours de piano à 90 CHF l'heure pour la famille Rochat à Lausanne »",
      points: [
        { title: "Francs suisses et IDE", text: "Montants en CHF et ton numéro IDE (CHE-…) imprimé sur chaque document." },
        { title: "TVA suisse", text: "Taux normal de 8,1 % depuis le 1er janvier 2024. L'assujettissement devient obligatoire à partir de 100 000 CHF de chiffre d'affaires annuel : en dessous, tu factures sans TVA." },
        { title: "Relances incluses", text: "Robi te dit quand une facture est ouverte et relance poliment les retards à ta place." },
      ],
    },
  },
  "fr-CA": {
    homeTitle: "Factures et soumissions en parlant — Robi AI Canada",
    homeDescription:
      "Travailleur autonome au Québec ? Dis ta prestation : Robi AI rédige ta soumission ou ta facture en dollars canadiens, en 30 secondes. Gratuit pour commencer.",
    pricingTitle: "Abonnement Robi AI au Canada : dès {monthly} par mois",
    pricingDescription:
      "Facturation IA en dollars canadiens : 4 soumissions ou factures gratuites par mois, puis {monthly}/mois ou {yearly}/an. Sans engagement, annulable en un clic.",
    focus: {
      title: "Fait pour les travailleurs autonomes au Canada",
      intro: "Tes soumissions et factures en dollars canadiens, dictées depuis ton cellulaire.",
      exampleLabel: "Tu dis",
      example: "« Soumission pour repeindre un 5 et demi à Laval, 3 jours à 480 $ par jour, peinture incluse »",
      points: [
        { title: "En dollars canadiens", text: "Montants en CAD, numérotation continue, signature de la soumission à distance par ton client." },
        { title: "TPS et TVQ", text: "Au Québec, la TPS (5 %) et la TVQ (9,975 %) s'appliquent dès que tu es inscrit ; l'inscription est obligatoire au-delà de 30 000 $ de revenus taxables. Vérifie les taux de ta province." },
        { title: "Suivi des paiements", text: "Robi te prévient quand le client ouvre la facture et relance les retards avec un courriel poli." },
      ],
    },
  },
  "fr-LU": {
    homeTitle: "Facturation IA au Luxembourg, en parlant — Robi AI",
    homeDescription:
      "Indépendants au Luxembourg : dicte ta prestation, Robi AI rédige devis et factures en euros avec ton numéro RCS et la TVA luxembourgeoise. Gratuit au départ.",
    pricingTitle: "Abonnement Robi AI au Luxembourg : dès {monthly}/mois",
    pricingDescription:
      "Facturation IA pour le Luxembourg : 4 devis ou factures gratuits par mois, puis {monthly}/mois ou {yearly}/an. Sans engagement, annulable en un clic.",
    focus: {
      title: "Fait pour facturer au Luxembourg",
      intro: "Des documents en euros, aux mentions luxembourgeoises, prêts en 30 secondes.",
      exampleLabel: "Tu dis",
      example: "« Facture 2 jours de conseil informatique à 750 € la journée pour la société Kirchberg Data »",
      points: [
        { title: "RCS et TVA LU", text: "Ton numéro RCS et ton numéro de TVA LU sur chaque document, TVA au taux normal de 17 % ou au taux que tu choisis." },
        { title: "Clients frontaliers", text: "Clients en France, en Belgique ou en Allemagne : la facture garde tes mentions et indique le pays du client." },
        { title: "Relances automatiques", text: "Les retards de paiement sont relancés poliment, sans que tu aies à écrire un mail." },
      ],
    },
  },
  "fr-MA": {
    homeTitle: "Devis et factures en dirhams, en parlant — Robi AI Maroc",
    homeDescription:
      "Freelances et créatifs au Maroc : dis ta prestation, Robi AI rédige le devis ou la facture en dirhams, avec ton ICE, en 30 secondes. Gratuit pour commencer.",
    pricingTitle: "Abonnement Robi AI au Maroc : dès {monthly} par mois",
    pricingDescription:
      "Facturation IA en dirhams : 4 devis ou factures gratuits par mois, puis {monthly}/mois ou {yearly}/an. Sans engagement, annulable en un clic.",
    focus: {
      title: "Fait pour les freelances au Maroc",
      intro: "Des devis et factures en dirhams, avec les mentions que tes clients marocains demandent.",
      exampleLabel: "Tu dis",
      example: "« Devis pour un logo et une charte graphique pour le café Zitoun à Casablanca, 4 500 dirhams »",
      points: [
        { title: "ICE sur chaque document", text: "Ton Identifiant Commun de l'Entreprise (ICE) et celui de ton client imprimés sur le devis et la facture." },
        { title: "En dirhams, TVA à 20 %", text: "Montants en MAD, TVA au taux normal de 20 % ou à 0 % si tu n'y es pas soumis (auto-entrepreneur)." },
        { title: "Relances et suivi", text: "Tu sais quand le client a ouvert le devis, et Robi relance les factures en retard à ta place." },
      ],
    },
  },
  "fr-SN": {
    homeTitle: "Facturation IA au Sénégal, en francs CFA — Robi AI",
    homeDescription:
      "Entrepreneurs au Sénégal : dicte ta prestation, Robi AI rédige devis et factures en francs CFA avec ton NINEA, en 30 secondes. Gratuit pour commencer.",
    pricingTitle: "Abonnement Robi AI au Sénégal : dès {monthly}/mois",
    pricingDescription:
      "Facturation IA en francs CFA : 4 devis ou factures gratuits par mois, puis {monthly}/mois ou {yearly}/an. Sans engagement, annulable en un clic.",
    focus: {
      title: "Fait pour facturer au Sénégal",
      intro: "Tes devis et factures en francs CFA, dictés depuis ton téléphone, sur le chantier ou en rendez-vous.",
      exampleLabel: "Tu dis",
      example: "« Devis pour l'installation de 4 climatiseurs chez M. Diop aux Almadies, 180 000 francs CFA l'unité »",
      points: [
        { title: "NINEA imprimé", text: "Ton NINEA figure sur chaque devis et facture, avec une numérotation continue." },
        { title: "TVA à 18 %", text: "Montants en francs CFA (XOF), TVA au taux normal de 18 % ou sans TVA si tu n'y es pas assujetti." },
        { title: "Suivi des paiements", text: "Robi te dit quand le client ouvre le document et relance poliment les factures en retard." },
      ],
    },
  },
  "fr-CI": {
    homeTitle: "Devis et factures en francs CFA, en parlant — Robi AI CI",
    homeDescription:
      "Entrepreneurs en Côte d'Ivoire : dis ta prestation, Robi AI rédige devis et factures en francs CFA avec ton NCC, en 30 secondes. Gratuit pour commencer.",
    pricingTitle: "Abonnement Robi AI en Côte d'Ivoire : {monthly}/mois",
    pricingDescription:
      "Facturation IA en francs CFA pour la Côte d'Ivoire : 4 documents gratuits par mois, puis {monthly}/mois ou {yearly}/an. Sans engagement.",
    focus: {
      title: "Fait pour facturer en Côte d'Ivoire",
      intro: "Des devis et factures en francs CFA, prêts à envoyer depuis Abidjan ou ailleurs.",
      exampleLabel: "Tu dis",
      example: "« Facture la couverture photo du mariage Kouassi à Cocody, 350 000 francs CFA, acompte de 30 % déjà payé »",
      points: [
        { title: "NCC imprimé", text: "Ton numéro de compte contribuable (NCC) sur chaque document, numérotation sans trou." },
        { title: "TVA à 18 %", text: "Montants en francs CFA (XOF), TVA au taux normal de 18 % ou facture sans TVA si tu n'y es pas soumis." },
        { title: "Acomptes et relances", text: "Factures d'acompte, solde, relances polies : Robi suit chaque paiement pour toi." },
      ],
    },
  },
  en: {
    homeTitle: "Free AI Invoice & Quote Maker, by Voice — Robi AI",
    homeDescription:
      "Free to start: say the job out loud and Robi AI writes the quote or invoice in 30 seconds, in pounds, with VAT done. Reminders and online payment built in.",
    pricingTitle: "Robi AI Subscription UK: free, then {monthly}/month",
    pricingDescription:
      "Invoice by voice in pounds: 4 free quotes or invoices a month, no card. Then {monthly}/month, no contract, or {yearly}/year. Cancel anytime.",
    focus: {
      title: "Built for UK sole traders",
      intro: "Invoices in pounds, with the details HMRC and your clients expect.",
      exampleLabel: "You say",
      example: "“Invoice Harper & Co for two days of bathroom tiling at £220 a day, payment in 14 days”",
      points: [
        { title: "VAT, when you need it", text: "Standard rate 20%. You must register once your taxable turnover passes £90,000; below that, Robi leaves VAT off." },
        { title: "Making Tax Digital", text: "MTD for Income Tax starts on 6 April 2026 for sole traders earning over £50,000. Robi keeps every invoice in one clean digital record." },
        { title: "Your UTR and VAT number", text: "Your UTR and GB VAT number printed on every document, numbered in sequence." },
      ],
    },
  },
  "en-US": {
    homeTitle: "Free AI Invoice Generator for Contractors — Robi AI",
    homeDescription:
      "Say the job out loud: Robi AI writes the estimate or invoice in 30 seconds, in dollars, with your EIN. Reminders and online payments built in. Free to start.",
    pricingTitle: "Robi AI Subscription (US): free, then {monthly}/month",
    pricingDescription:
      "AI invoicing in US dollars: 4 free estimates or invoices a month, no credit card. Then {monthly}/month or {yearly}/year. Cancel anytime.",
    focus: {
      title: "Built for US contractors and freelancers",
      intro: "Estimates and invoices in dollars, dictated from the job site.",
      exampleLabel: "You say",
      example: "“Estimate for the Johnsons: replace a 50-gallon water heater, $1,450 parts and labor, due on completion”",
      points: [
        { title: "Estimates, then invoices", text: "Send the estimate for e-signature, then turn the signed estimate into an invoice in one tap." },
        { title: "Sales tax, your way", text: "There is no federal VAT in the US: sales tax depends on your state and what you sell. Add the rate that applies, Robi does the math." },
        { title: "Your EIN, US dates", text: "Your EIN on every document, dates in MM/DD/YYYY, amounts in USD." },
      ],
    },
  },
  "en-AU": {
    homeTitle: "Free AI Invoice App for Tradies, by Voice — Robi AI",
    homeDescription:
      "Say the job out loud: Robi AI writes the quote or tax invoice in 30 seconds, in Australian dollars, with your ABN and GST. Free to start, no card needed.",
    pricingTitle: "Robi AI Subscription Australia: from {monthly}/month",
    pricingDescription:
      "AI invoicing in AUD: 4 free quotes or invoices a month, then {monthly}/month or {yearly}/year. No lock-in contract.",
    focus: {
      title: "Built for Aussie sole traders and tradies",
      intro: "Quotes and tax invoices in AUD, done from the ute.",
      exampleLabel: "You say",
      example: "“Quote for Sarah in Parramatta: re-grout the shower and replace 12 tiles, $680 plus GST”",
      points: [
        { title: "ABN on every invoice", text: "Your ABN printed on every quote and invoice, numbered in sequence." },
        { title: "GST at 10%", text: "Registration is required once your GST turnover reaches $75,000. Once registered, issue tax invoices with GST at 10%; Robi adds it line by line." },
        { title: "Get paid faster", text: "See when the client opens the invoice; Robi sends polite reminders when it's overdue." },
      ],
    },
  },
  "en-IE": {
    homeTitle: "AI Invoicing in Ireland, Free to Start — Robi AI",
    homeDescription:
      "Sole traders in Ireland: say the job, Robi AI writes the quote or invoice in 30 seconds, in euro, with Irish VAT and your CRO number. Free to start.",
    pricingTitle: "Robi AI Subscription Ireland: free, then {monthly}/month",
    pricingDescription:
      "AI invoicing in euro: 4 free quotes or invoices a month, no card. Then {monthly}/month or {yearly}/year. No contract, cancel anytime.",
    focus: {
      title: "Built for Irish sole traders",
      intro: "Quotes and invoices in euro, with the details Irish clients expect.",
      exampleLabel: "You say",
      example: "“Invoice O'Brien Design for three days of web development at €450 a day, 30 days to pay”",
      points: [
        { title: "Irish VAT", text: "Standard rate 23%, or the rate you choose per line. Not registered for VAT? Robi leaves it off." },
        { title: "CRO and VAT number", text: "Your CRO number and IE VAT number on every document, numbered in sequence." },
        { title: "Clients across the EU", text: "Invoice clients in other EU countries from the same account, with their country on the invoice." },
      ],
    },
  },
  "en-NL": {
    homeTitle: "AI Invoicing for ZZP in the Netherlands — Robi AI",
    homeDescription:
      "Freelancers (ZZP) in the Netherlands: say the job, Robi AI writes the quote or invoice in 30 seconds, in euro, with your KVK number and BTW. Free to start.",
    pricingTitle: "Robi AI Subscription Netherlands: from {monthly}/month",
    pricingDescription:
      "AI invoicing in euro for ZZP: 4 free quotes or invoices a month, then {monthly}/month or {yearly}/year. Cancel anytime.",
    focus: {
      title: "Built for ZZP'ers in the Netherlands",
      intro: "Invoices in euro, in English, with the Dutch details your clients need.",
      exampleLabel: "You say",
      example: "“Invoice Studio Van Dijk for 20 hours of UX design at €85 an hour, payment within 14 days”",
      points: [
        { title: "KVK and BTW number", text: "Your KVK number and NL VAT (BTW) number printed on every document." },
        { title: "BTW at 21%", text: "Standard rate 21%, or 9% / 0% per line. Under the small business scheme (KOR, up to €20,000 turnover) you invoice without BTW." },
        { title: "International clients", text: "Invoice clients across the EU in English from one account." },
      ],
    },
  },
  "en-AE": {
    homeTitle: "AI Invoice Generator in the UAE, in AED — Robi AI",
    homeDescription:
      "Freelancers in the UAE: say the job, Robi AI writes the quote or invoice in 30 seconds, in dirhams, with your TRN and 5% VAT. Free to start, no card needed.",
    pricingTitle: "Robi AI Subscription UAE: free, then {monthly}/month",
    pricingDescription:
      "AI invoicing in AED: 4 free quotes or invoices a month, then {monthly}/month or {yearly}/year. No contract, cancel anytime.",
    focus: {
      title: "Built for UAE freelancers",
      intro: "Quotes and invoices in AED, from Dubai, Abu Dhabi or anywhere in the Emirates.",
      exampleLabel: "You say",
      example: "“Quote for Al Noor Events: photography for a 6-hour corporate dinner in Dubai Marina, AED 4,800”",
      points: [
        { title: "VAT at 5%", text: "VAT registration is mandatory above AED 375,000 of taxable supplies. Registered? Robi adds 5% VAT and prints your TRN." },
        { title: "In dirhams", text: "Amounts in AED, numbered in sequence, ready to send by email or link." },
        { title: "Follow-ups included", text: "Know when a client opens the quote; Robi chases late invoices politely." },
      ],
    },
  },
  es: {
    homeTitle: "Facturas y presupuestos gratis hablando — Robi AI",
    homeDescription:
      "Gratis para empezar: di el trabajo y Robi AI redacta el presupuesto o la factura en 30 segundos, con IVA y tu NIF. Recordatorios y pago online incluidos.",
    pricingTitle: "Suscripción a Robi AI: gratis y luego {monthly}/mes",
    pricingDescription:
      "4 presupuestos o facturas gratis al mes, sin tarjeta. Después {monthly}/mes sin permanencia o {yearly}/año. Cancela cuando quieras.",
    focus: {
      title: "Hecho para autónomos en España",
      intro: "Presupuestos y facturas con los datos que pide Hacienda, dictados desde el móvil.",
      exampleLabel: "Tú dices",
      example: "«Presupuesto para reformar el baño de Laura en Valencia: 3 días de obra a 280 € el día, materiales aparte»",
      points: [
        { title: "IVA y NIF", text: "IVA general del 21 % o el tipo que elijas por línea, con tu NIF y el de tu cliente en cada documento." },
        { title: "Retención de IRPF", text: "Si facturas a empresas como profesional, recuerda la retención del 15 % (7 % los primeros años de actividad)." },
        { title: "Verifactu", text: "Hacienda exigirá a los programas de facturación registrar cada factura (Verifactu). Te lo explicamos en nuestra guía." },
      ],
    },
  },
  "pt-PT": {
    homeTitle: "Faturas e orçamentos grátis a falar — Robi AI",
    homeDescription:
      "Grátis para começar: diz o serviço e o Robi AI escreve o orçamento ou a fatura em 30 segundos, em euros, com IVA e o teu NIF. Lembretes e pagamento online.",
    pricingTitle: "Subscrição do Robi AI: grátis, depois {monthly}/mês",
    pricingDescription:
      "4 orçamentos ou faturas grátis por mês, sem cartão. Depois {monthly}/mês sem fidelização ou {yearly}/ano. Cancela quando quiseres.",
    focus: {
      title: "Feito para trabalhadores independentes em Portugal",
      intro: "Orçamentos e faturas em euros, ditados no telemóvel, entre dois clientes.",
      exampleLabel: "Tu dizes",
      example: "«Orçamento para a remodelação da cozinha do Sr. Costa em Braga, 4 dias de trabalho a 220 € por dia»",
      points: [
        { title: "IVA e NIF", text: "IVA à taxa normal de 23 % (Continente) ou a taxa que escolheres por linha, com o teu NIF e o do cliente." },
        { title: "Numeração sequencial", text: "Cada documento numerado em sequência, guardado na nuvem e acessível em qualquer dispositivo." },
        { title: "Lembretes automáticos", text: "Sabes quando o cliente abre o orçamento, e o Robi envia lembretes educados quando uma fatura fica por pagar." },
      ],
    },
  },
};

const INTL: Record<string, string> = {
  fr: "fr-FR", "fr-BE": "fr-BE", "fr-CH": "fr-CH", "fr-CA": "fr-CA", "fr-LU": "fr-LU",
  "fr-MA": "fr-FR", "fr-SN": "fr-FR", "fr-CI": "fr-FR",
  en: "en-GB", "en-US": "en-US", "en-AU": "en-AU", "en-IE": "en-IE", "en-NL": "en-IE", "en-AE": "en-GB",
  es: "es-ES", "pt-PT": "pt-PT",
};

/** Prix formaté dans la devise du marché : 14 €, £12, CHF 14, 59 MAD… */
export function formatPrice(locale: string, amount: number): string {
  const currency = (localeCurrencies[locale] ?? localeCurrencies.fr).currency;
  const s = new Intl.NumberFormat(INTL[locale] ?? "fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
  // Espaces insécables d'Intl → espaces simples (titres et JSON lisibles).
  return s.replace(/[  ]/g, " ");
}

function fill(locale: string, text: string): string {
  const p = priceMap[locale] ?? priceMap.fr;
  return text
    .replace(/\{monthly\}/g, formatPrice(locale, p.monthly))
    .replace(/\{yearly\}/g, formatPrice(locale, p.yearly))
    .replace(/\{launch\}/g, formatPrice(locale, p.launch));
}

/** Textes du marché, prix remplis. Locale inconnue → France. */
export function getMarketCopy(locale: string): MarketCopy {
  const c = COPY[locale] ?? COPY.fr;
  return {
    ...c,
    pricingTitle: fill(locale, c.pricingTitle),
    pricingDescription: fill(locale, c.pricingDescription),
  };
}
