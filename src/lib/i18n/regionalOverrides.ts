/**
 * Retouches par marché, fusionnées par getDictionary par-dessus le fichier de
 * langue (fr.json, en.json…). Jusqu'au 25/10/2026, un Belge, un Suisse ou un
 * Marocain lisait dans la FAQ « Cerfa 1301-SD », « art. 293 B du CGI » et
 * « réglementation française » : ces réponses ne valent que pour la France.
 *
 * Même voix que la FAQ d'origine (vouvoiement en français). Aucun fait
 * inventé : identifiants fiscaux = ceux que l'app imprime (ROBI_APP
 * utils/taxLabel.ts), taux de TVA normaux, et renvoi au comptable quand la
 * règle dépend du régime de chacun.
 */

type Faq = Partial<Record<`q${number}` | `a${number}`, string>>;
type Override = { faq?: Faq };

const FR_TEAM = "Oui, une vraie équipe répond à vos questions en moins de 24 h. Pas de chatbot : de vrais humains qui connaissent le quotidien des indépendants.";

function frFaq(o: { country: string; rates: string; ids: string; exempt: string; extra?: string }): Override {
  return {
    faq: {
      q4: `Robi gère-t-il la TVA ${o.country} ?`,
      a4: `Oui. Indiquez le taux applicable (${o.rates}) : Robi calcule la taxe ligne par ligne et les totaux du document.`,
      a5: FR_TEAM,
      q7: "Je ne facture pas de TVA. Comment ça se passe ?",
      a7: o.exempt,
      q9: `Mes factures respectent-elles les règles ${o.country} ?`,
      a9: `Chaque facture porte une numérotation continue, la date d'émission, ${o.ids}, les coordonnées du client, le détail des prestations, la taxe et les conditions de paiement.${o.extra ? ` ${o.extra}` : ""}`,
    },
  };
}

const EXEMPT_FR = "Mettez la TVA à 0 % : aucune taxe n'est calculée. La mention d'exonération dépend de votre régime ; vérifiez avec votre comptable celle à faire figurer.";

export const regionalOverrides: Record<string, Override> = {
  "fr-BE": frFaq({
    country: "belge",
    rates: "21 %, 12 %, 6 % ou 0 %",
    ids: "votre numéro d'entreprise BCE et votre numéro de TVA",
    exempt: "Mettez la TVA à 0 % : aucune taxe n'est calculée. Si vous relevez du régime de franchise des petites entreprises, vérifiez avec votre comptable la mention à faire figurer.",
    extra: "Depuis le 1er janvier 2026, les factures entre entreprises assujetties à la TVA belge doivent être électroniques et structurées (Peppol) : vérifiez avec votre comptable votre canal d'envoi.",
  }),
  "fr-CH": frFaq({
    country: "suisse",
    rates: "8,1 %, taux réduits ou 0 %",
    ids: "votre numéro IDE",
    exempt: "En dessous de 100 000 CHF de chiffre d'affaires annuel, l'assujettissement à la TVA n'est pas obligatoire : mettez la TVA à 0 % et Robi ne calcule aucune taxe.",
  }),
  "fr-CA": frFaq({
    country: "canadienne",
    rates: "TPS 5 %, TVQ 9,975 % au Québec, ou le taux de votre province",
    ids: "vos coordonnées d'entreprise",
    exempt: "Sous 30 000 $ de revenus taxables, l'inscription aux taxes n'est pas obligatoire : mettez la taxe à 0 % et Robi n'en calcule aucune.",
  }),
  "fr-LU": frFaq({
    country: "luxembourgeoise",
    rates: "17 %, taux réduits ou 0 %",
    ids: "votre numéro RCS et votre numéro de TVA",
    exempt: EXEMPT_FR,
  }),
  "fr-MA": frFaq({
    country: "marocaine",
    rates: "20 %, taux réduits ou 0 %",
    ids: "votre ICE et celui de votre client",
    exempt: "Auto-entrepreneur ou non assujetti ? Mettez la TVA à 0 % : aucune taxe n'est calculée sur le devis ni sur la facture.",
  }),
  "fr-SN": frFaq({
    country: "sénégalaise",
    rates: "18 % ou 0 %",
    ids: "votre NINEA",
    exempt: "Non assujetti à la TVA ? Mettez la TVA à 0 % : aucune taxe n'est calculée sur le document.",
  }),
  "fr-CI": frFaq({
    country: "ivoirienne",
    rates: "18 % ou 0 %",
    ids: "votre numéro de compte contribuable (NCC)",
    exempt: "Non assujetti à la TVA ? Mettez la TVA à 0 % : aucune taxe n'est calculée sur le document.",
  }),
  "en-US": {
    faq: {
      q4: "Does Robi handle sales tax?",
      a4: "Yes. Add the sales tax rate that applies in your state, and Robi calculates the tax and totals on every estimate and invoice.",
      q7: "I'm a sole proprietor. Do I have to charge tax?",
      a7: "It depends on your state and what you sell. If no sales tax applies, set the rate to 0% and Robi leaves it off.",
      q9: "What's on every invoice?",
      a9: "Sequential numbering, issue date, your business details and EIN, your client's details, line items, tax and payment terms.",
    },
  },
  "en-AU": {
    faq: {
      q4: "Does Robi handle GST?",
      a4: "Yes. Once you're registered for GST, Robi adds 10% GST line by line and totals it on every tax invoice.",
      q7: "I'm not registered for GST. Is that a problem?",
      a7: "No. Registration is required once your GST turnover reaches $75,000. Until then, set GST to 0% and Robi leaves it off.",
      q9: "What's on every invoice?",
      a9: "Sequential numbering, issue date, your ABN, your client's details, line items, GST and payment terms.",
    },
  },
  "en-IE": {
    faq: {
      q4: "Does Robi handle Irish VAT?",
      a4: "Yes. Choose 23%, a reduced rate or 0% per line, and Robi calculates VAT and totals on every document.",
      q9: "What's on every invoice?",
      a9: "Sequential numbering, issue date, your CRO and VAT numbers, your client's details, line items, VAT and payment terms.",
    },
  },
  "en-NL": {
    faq: {
      q4: "Does Robi handle Dutch VAT (BTW)?",
      a4: "Yes. Choose 21%, 9% or 0% per line, and Robi calculates BTW and totals on every document.",
      q7: "I use the small business scheme (KOR). Can I invoice without BTW?",
      a7: "Yes. Set BTW to 0% and Robi leaves it off. Check with your accountant which KOR notice to add.",
      q9: "What's on every invoice?",
      a9: "Sequential numbering, issue date, your KVK and VAT numbers, your client's details, line items, BTW and payment terms.",
    },
  },
  "en-AE": {
    faq: {
      q4: "Does Robi handle UAE VAT?",
      a4: "Yes. Once you're registered, Robi adds 5% VAT and prints your TRN on every invoice.",
      q7: "I'm not VAT-registered yet. Can I still invoice?",
      a7: "Yes. Registration is mandatory above AED 375,000 of taxable supplies. Below that, set VAT to 0% and Robi leaves it off.",
      q9: "What's on every invoice?",
      a9: "Sequential numbering, issue date, your TRN when registered, your client's details, line items, VAT and payment terms.",
    },
  },
};
