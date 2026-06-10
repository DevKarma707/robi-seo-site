// Contenu éditorial UNIQUE par métier (intro + FAQ) pour enrichir les pages
// industries et résoudre le "Explorée, actuellement non indexée".
// Les métiers absents de ce map gardent le template de base.
// → Étendre lot par lot.

type L = { fr: string; en: string; es: string };
export type IndustryRich = {
  intro: L;
  faq: { q: L; a: L }[];
};

export const industryContent: Record<string, IndustryRich> = {
  plombier: {
    intro: {
      fr: "Entre deux interventions, sortir un devis de plomberie clair et facturer vite n'est pas toujours simple. Déplacement, fourniture de pièces, main d'œuvre, TVA, urgences le week-end… un plombier jongle avec des lignes qui changent à chaque chantier. Robi AI te laisse dicter ta prestation à voix haute depuis ton camion et génère en quelques secondes un devis ou une facture conforme, prêt à envoyer au client.",
      en: "Between two call-outs, producing a clear plumbing quote and invoicing fast isn't always easy. Travel, parts, labour, VAT, weekend emergencies… a plumber juggles line items that change on every job. Robi AI lets you dictate the job out loud from your van and generates a compliant quote or invoice in seconds, ready to send.",
      es: "Entre dos intervenciones, sacar un presupuesto de fontanería claro y facturar rápido no siempre es fácil. Desplazamiento, piezas, mano de obra, IVA, urgencias de fin de semana… un fontanero combina líneas que cambian en cada obra. Robi AI te deja dictar el trabajo en voz alta desde tu furgoneta y genera un presupuesto o factura conforme en segundos.",
    },
    faq: [
      {
        q: { fr: "Comment faire un devis de plomberie rapidement ?", en: "How to create a plumbing quote quickly?", es: "¿Cómo hacer un presupuesto de fontanería rápido?" },
        a: { fr: "Avec Robi AI, tu décris la prestation à l'oral (déplacement, pièces, main d'œuvre) et le devis est généré en quelques secondes, avec les mentions obligatoires et la TVA. Tu l'envoies directement depuis ton téléphone.", en: "With Robi AI you describe the job out loud (call-out, parts, labour) and the quote is generated in seconds with mandatory mentions and VAT, ready to send from your phone.", es: "Con Robi AI describes el trabajo en voz alta (desplazamiento, piezas, mano de obra) y el presupuesto se genera en segundos con las menciones obligatorias e IVA." },
      },
      {
        q: { fr: "Un plombier auto-entrepreneur doit-il facturer la TVA ?", en: "Does a self-employed plumber charge VAT?", es: "¿Un fontanero autónomo cobra IVA?" },
        a: { fr: "Sous le régime de la franchise en base, non : tu factures en HT avec la mention « TVA non applicable » (référence au CIBS à partir du 1er septembre 2026). Au-delà des seuils, tu collectes la TVA.", en: "Under the VAT exemption regime, no: you invoice without VAT with the exemption mention. Above the thresholds you collect VAT.", es: "Con la franquicia de IVA, no: facturas sin IVA con la mención de exención. Por encima de los umbrales, cobras IVA." },
      },
      {
        q: { fr: "Comment être payé plus vite après un dépannage ?", en: "How to get paid faster after a repair?", es: "¿Cómo cobrar más rápido tras una reparación?" },
        a: { fr: "Ajoute un lien de paiement en ligne à ta facture et active les relances automatiques de Robi : le client paie en un clic et l'IA relance toute seule en cas de retard.", en: "Add an online payment link to your invoice and turn on Robi's automatic reminders: the client pays in one click and the AI follows up on late payments.", es: "Añade un link de pago a tu factura y activa los recordatorios automáticos de Robi: el cliente paga en un clic y la IA reclama los retrasos." },
      },
    ],
  },
  electricien: {
    intro: {
      fr: "Tableau électrique, mise aux normes, dépannage urgent : un électricien facture des prestations très variées, souvent dans l'urgence. Robi AI te permet de créer un devis ou une facture conforme en parlant, directement sur le chantier — numérotation, mentions légales et TVA gérées pour toi, document au format structuré prêt pour la réforme 2026.",
      en: "Consumer units, bringing installations up to code, emergency repairs: an electrician invoices very varied jobs, often under time pressure. Robi AI lets you create a compliant quote or invoice by voice, right on site — numbering, legal mentions and VAT handled for you.",
      es: "Cuadro eléctrico, adaptación a normativa, reparación urgente: un electricista factura trabajos muy variados, a menudo con prisa. Robi AI te permite crear un presupuesto o factura conforme hablando, en la propia obra — numeración, menciones legales e IVA gestionados por ti.",
    },
    faq: [
      {
        q: { fr: "Comment facturer une intervention électrique d'urgence ?", en: "How to invoice an emergency electrical job?", es: "¿Cómo facturar una intervención eléctrica urgente?" },
        a: { fr: "Dicte la prestation à Robi dès la fin de l'intervention : la facture est générée sur place, avec le déplacement, la main d'œuvre et les fournitures, prête à être envoyée et payée en ligne.", en: "Dictate the job to Robi as soon as you finish: the invoice is generated on the spot, ready to send and be paid online.", es: "Dicta el trabajo a Robi al terminar: la factura se genera en el momento, lista para enviar y cobrar online." },
      },
      {
        q: { fr: "Quelles mentions sur un devis d'électricien ?", en: "What must an electrician's quote include?", es: "¿Qué debe incluir un presupuesto de electricista?" },
        a: { fr: "Identité et SIREN, coordonnées du client, détail des prestations et fournitures, prix unitaires, total, durée de validité du devis et conditions de paiement. Robi les ajoute automatiquement.", en: "Your identity and registration number, client details, itemised work and parts, unit prices, total, quote validity and payment terms. Robi adds them automatically.", es: "Tu identidad y número, datos del cliente, detalle de trabajos y piezas, precios unitarios, total, validez y condiciones de pago. Robi los añade automáticamente." },
      },
      {
        q: { fr: "Robi AI gère-t-il les acomptes sur gros chantiers ?", en: "Does Robi AI handle deposits on big jobs?", es: "¿Robi AI gestiona los anticipos en obras grandes?" },
        a: { fr: "Oui : tu peux émettre une facture d'acompte puis la facture de solde, avec une numérotation continue et conforme.", en: "Yes: you can issue a deposit invoice then the balance invoice, with continuous compliant numbering.", es: "Sí: puedes emitir una factura de anticipo y luego la del saldo, con numeración continua y conforme." },
      },
    ],
  },
  graphiste: {
    intro: {
      fr: "Un graphiste facture des univers très différents : création de logo, charte, déclinaisons, cessions de droits. Entre les allers-retours clients et les acomptes, garder une facturation propre prend du temps. Robi AI génère tes devis et factures en quelques secondes à partir d'une simple phrase, gère les acomptes et relance les impayés à ta place.",
      en: "A designer invoices very different deliverables: logo creation, brand guidelines, variations, usage rights. Between client back-and-forth and deposits, keeping invoicing clean takes time. Robi AI generates your quotes and invoices in seconds from a single sentence, handles deposits and chases late payments for you.",
      es: "Un diseñador factura entregables muy distintos: creación de logo, manual de marca, variaciones, cesión de derechos. Entre revisiones y anticipos, mantener una facturación limpia lleva tiempo. Robi AI genera tus presupuestos y facturas en segundos a partir de una frase.",
    },
    faq: [
      {
        q: { fr: "Comment facturer une cession de droits en design ?", en: "How to invoice usage rights as a designer?", es: "¿Cómo facturar la cesión de derechos en diseño?" },
        a: { fr: "Ajoute une ligne dédiée « cession de droits » avec son montant et sa portée (durée, supports). Robi structure la facture et conserve l'historique pour tes futurs renouvellements.", en: "Add a dedicated « usage rights » line with its amount and scope (duration, media). Robi structures the invoice and keeps the history for renewals.", es: "Añade una línea « cesión de derechos » con su importe y alcance (duración, soportes). Robi estructura la factura y guarda el histórico." },
      },
      {
        q: { fr: "Comment demander un acompte avant de commencer un projet ?", en: "How to ask for a deposit before starting a project?", es: "¿Cómo pedir un anticipo antes de empezar?" },
        a: { fr: "Émets une facture d'acompte (souvent 30 à 50 %) à la commande. Robi la génère et tu peux y joindre un lien de paiement pour sécuriser le projet.", en: "Issue a deposit invoice (often 30–50%) at order. Robi generates it with a payment link to secure the project.", es: "Emite una factura de anticipo (30–50%) al encargar. Robi la genera con un link de pago para asegurar el proyecto." },
      },
      {
        q: { fr: "Robi AI fonctionne-t-il pour un graphiste freelance débutant ?", en: "Does Robi AI work for a beginner freelance designer?", es: "¿Robi AI sirve para un diseñador freelance principiante?" },
        a: { fr: "Oui, c'est même pensé pour ça : aucune connaissance comptable nécessaire, les mentions légales et la TVA sont gérées automatiquement.", en: "Yes, it's built for that: no accounting knowledge needed, legal mentions and VAT handled automatically.", es: "Sí, está pensado para eso: sin conocimientos contables, menciones legales e IVA automáticos." },
      },
    ],
  },
  photographe: {
    intro: {
      fr: "Séances, livraison de fichiers, frais de déplacement, droits d'utilisation : un photographe facture des prestations à géométrie variable. Robi AI te permet de créer un devis clair avant la séance et une facture nette après livraison, en parlant — avec acomptes, relances automatiques et paiement en ligne intégrés.",
      en: "Shoots, file delivery, travel costs, usage rights: a photographer invoices flexible deliverables. Robi AI lets you create a clear quote before the shoot and a clean invoice after delivery, by voice — with deposits, automatic reminders and online payment built in.",
      es: "Sesiones, entrega de archivos, desplazamientos, derechos de uso: un fotógrafo factura entregables variables. Robi AI te permite crear un presupuesto claro antes de la sesión y una factura limpia tras la entrega, hablando — con anticipos, recordatorios y pago online.",
    },
    faq: [
      {
        q: { fr: "Comment faire un devis pour une séance photo ?", en: "How to quote a photo shoot?", es: "¿Cómo presupuestar una sesión de fotos?" },
        a: { fr: "Décris la prestation à Robi (durée, livrables, déplacement, droits) : le devis est généré avec les mentions obligatoires et une durée de validité, prêt à être signé en ligne.", en: "Describe the job to Robi (duration, deliverables, travel, rights): the quote is generated with mandatory mentions and a validity period, ready for e-signature.", es: "Describe el trabajo a Robi (duración, entregables, desplazamiento, derechos): el presupuesto se genera listo para firmar online." },
      },
      {
        q: { fr: "Comment facturer les droits d'utilisation des photos ?", en: "How to invoice photo usage rights?", es: "¿Cómo facturar los derechos de uso de las fotos?" },
        a: { fr: "Crée une ligne distincte précisant la portée (supports, durée, territoire). Robi conserve l'historique pour faciliter les renouvellements.", en: "Create a separate line stating the scope (media, duration, territory). Robi keeps the history for renewals.", es: "Crea una línea aparte indicando el alcance (soportes, duración, territorio). Robi guarda el histórico." },
      },
      {
        q: { fr: "Peut-on demander un acompte pour un mariage ?", en: "Can I take a deposit for a wedding?", es: "¿Se puede pedir un anticipo para una boda?" },
        a: { fr: "Oui, c'est recommandé : émets une facture d'acompte à la réservation avec un lien de paiement, puis le solde après livraison des photos.", en: "Yes, recommended: issue a deposit invoice at booking with a payment link, then the balance after delivery.", es: "Sí, recomendado: emite una factura de anticipo al reservar con link de pago, y el saldo tras la entrega." },
      },
    ],
  },
  developpeur: {
    intro: {
      fr: "Forfait, régie au TJM, abonnement de maintenance : un développeur freelance facture sous plusieurs formats, souvent à des clients à l'étranger. Robi AI génère des factures conformes en quelques secondes, gère plusieurs devises et pays, et automatise les relances pour que tu te concentres sur le code, pas sur l'administratif.",
      en: "Fixed price, daily-rate contracting, maintenance retainer: a freelance developer invoices in several formats, often to clients abroad. Robi AI generates compliant invoices in seconds, handles multiple currencies and countries, and automates reminders so you focus on code, not admin.",
      es: "Precio cerrado, tarifa diaria, mantenimiento por suscripción: un desarrollador freelance factura en varios formatos, a menudo a clientes en el extranjero. Robi AI genera facturas conformes en segundos, gestiona varias divisas y países y automatiza los recordatorios.",
    },
    faq: [
      {
        q: { fr: "Comment facturer un client étranger en tant que développeur ?", en: "How to invoice a foreign client as a developer?", es: "¿Cómo facturar a un cliente extranjero siendo desarrollador?" },
        a: { fr: "Robi AI gère 16 pays avec tarification et règles locales, et la mention d'autoliquidation de TVA pour les prestations intracommunautaires. Tu factures dans la bonne devise sans te tromper.", en: "Robi AI supports 16 countries with local rules and the VAT reverse-charge mention for intra-EU services. You invoice in the right currency without mistakes.", es: "Robi AI gestiona 16 países con reglas locales y la mención de inversión del sujeto pasivo para servicios intracomunitarios." },
      },
      {
        q: { fr: "Comment facturer au TJM ?", en: "How to invoice at a daily rate?", es: "¿Cómo facturar por tarifa diaria?" },
        a: { fr: "Indique le nombre de jours et ton TJM : Robi calcule le total, applique la TVA et génère la facture. Tu peux aussi estimer ton TJM idéal avec notre calculateur.", en: "Enter the number of days and your daily rate: Robi computes the total, applies VAT and generates the invoice.", es: "Indica los días y tu tarifa diaria: Robi calcula el total, aplica el IVA y genera la factura." },
      },
      {
        q: { fr: "Robi AI convient-il à la maintenance récurrente ?", en: "Is Robi AI good for recurring maintenance?", es: "¿Robi AI sirve para mantenimiento recurrente?" },
        a: { fr: "Oui : tu génères facilement des factures mensuelles récurrentes et suis les paiements depuis le tableau de bord.", en: "Yes: you can easily generate recurring monthly invoices and track payments from the dashboard.", es: "Sí: generas fácilmente facturas mensuales recurrentes y sigues los pagos desde el panel." },
      },
    ],
  },
  osteopathe: {
    intro: {
      fr: "Un ostéopathe doit remettre une note d'honoraires claire à chaque consultation, gérer les forfaits, parfois les déplacements à domicile. Robi AI te permet de générer ta note d'honoraires conforme en quelques secondes après chaque séance, avec les mentions obligatoires, et de suivre tes encaissements sans logiciel comptable compliqué.",
      en: "An osteopath must give a clear fee note after each consultation, manage packages and sometimes home visits. Robi AI lets you generate a compliant fee note in seconds after each session, with the mandatory mentions, and track your income without complex accounting software.",
      es: "Un osteópata debe entregar una nota de honorarios clara en cada consulta, gestionar bonos y a veces visitas a domicilio. Robi AI te permite generar tu nota de honorarios conforme en segundos tras cada sesión y seguir tus cobros sin software contable complicado.",
    },
    faq: [
      {
        q: { fr: "Une note d'honoraires d'ostéopathe doit-elle mentionner la TVA ?", en: "Does an osteopath's fee note mention VAT?", es: "¿La nota de honorarios de un osteópata menciona IVA?" },
        a: { fr: "Les actes d'ostéopathie sont généralement exonérés ou sous franchise de TVA ; la note porte alors la mention adaptée. Robi applique automatiquement la bonne mention selon ta situation.", en: "Osteopathy services are generally VAT-exempt; the note then carries the appropriate mention. Robi applies the right one automatically.", es: "Los actos de osteopatía suelen estar exentos de IVA; la nota lleva la mención adecuada. Robi aplica la correcta automáticamente." },
      },
      {
        q: { fr: "Comment facturer rapidement entre deux patients ?", en: "How to invoice quickly between two patients?", es: "¿Cómo facturar rápido entre dos pacientes?" },
        a: { fr: "Dicte le montant et le nom du patient à Robi : la note d'honoraires est générée en quelques secondes, prête à remettre ou à envoyer par email.", en: "Dictate the amount and patient name to Robi: the fee note is generated in seconds, ready to hand over or email.", es: "Dicta el importe y el nombre del paciente a Robi: la nota se genera en segundos, lista para entregar o enviar por email." },
      },
      {
        q: { fr: "Peut-on gérer plusieurs cabinets avec Robi AI ?", en: "Can I manage several practices with Robi AI?", es: "¿Se pueden gestionar varias consultas con Robi AI?" },
        a: { fr: "Oui, la gestion multi-entreprise permet de séparer plusieurs cabinets ou activités depuis un seul compte.", en: "Yes, multi-company management lets you separate several practices from one account.", es: "Sí, la gestión multiempresa permite separar varias consultas desde una sola cuenta." },
      },
    ],
  },
};
