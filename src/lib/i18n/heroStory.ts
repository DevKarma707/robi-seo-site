export interface HeroStoryCopy {
  eyebrow: string;
  photoAlt: string;
  photoCaption: string;
  demoLabel: string;
  voiceLabel: string;
  prompt: string;
  quoteLabel: string;
  invoiceLabel: string;
  service: string;
  draftLabel: string;
  createdLabel: string;
  creatingLabel: string;
  sentLabel: string;
  paidLabel: string;
  sentDetail: string;
  paidDetail: string;
  pauseLabel: string;
  resumeLabel: string;
  reviewLabel: string;
  replayLabel: string;
}

const heroStoryCopy: Record<"fr" | "en" | "es" | "pt", HeroStoryCopy> = {
  fr: {
    eyebrow: "Assistant de facturation IA",
    photoAlt: "Un artisan dans son atelier dicte une demande à Robi",
    photoCaption: "Consacrez votre temps à ce que vous faites de mieux.",
    demoLabel: "Exemple illustratif",
    voiceLabel: "Vous dites",
    prompt: "Prépare une facture pour la rénovation du salon.",
    quoteLabel: "Devis",
    invoiceLabel: "Facture",
    service: "Rénovation du salon",
    draftLabel: "Brouillon créé",
    createdLabel: "Facture créée",
    creatingLabel: "Création en cours",
    sentLabel: "Facture envoyée",
    paidLabel: "Facture payée",
    sentDetail: "Transmise au client",
    paidDetail: "Paiement reçu",
    pauseLabel: "Mettre en pause",
    resumeLabel: "Reprendre",
    reviewLabel: "À vérifier avant l’envoi",
    replayLabel: "Rejouer l’exemple",
  },
  en: {
    eyebrow: "AI invoicing assistant",
    photoAlt: "A craftsperson in their workshop dictates a request to Robi",
    photoCaption: "Your work deserves your full attention.",
    demoLabel: "Illustrative example",
    voiceLabel: "You say",
    prompt: "Prepare an invoice for the living room renovation.",
    quoteLabel: "Quote",
    invoiceLabel: "Invoice",
    service: "Living room renovation",
    draftLabel: "Draft created",
    createdLabel: "Invoice created",
    creatingLabel: "Creating invoice",
    sentLabel: "Invoice sent",
    paidLabel: "Invoice paid",
    sentDetail: "Delivered to the client",
    paidDetail: "Payment received",
    pauseLabel: "Pause",
    resumeLabel: "Resume",
    reviewLabel: "Review before sending",
    replayLabel: "Replay the example",
  },
  es: {
    eyebrow: "Asistente de facturación con IA",
    photoAlt: "Un artesano en su taller dicta una solicitud a Robi",
    photoCaption: "Tu trabajo merece toda tu atención.",
    demoLabel: "Ejemplo ilustrativo",
    voiceLabel: "Tú dices",
    prompt: "Prepara una factura para la renovación del salón.",
    quoteLabel: "Presupuesto",
    invoiceLabel: "Factura",
    service: "Renovación del salón",
    draftLabel: "Borrador creado",
    createdLabel: "Factura creada",
    creatingLabel: "Creación en curso",
    sentLabel: "Factura enviada",
    paidLabel: "Factura pagada",
    sentDetail: "Enviada al cliente",
    paidDetail: "Pago recibido",
    pauseLabel: "Pausar",
    resumeLabel: "Reanudar",
    reviewLabel: "Revisar antes de enviar",
    replayLabel: "Repetir el ejemplo",
  },
  pt: {
    eyebrow: "Assistente de faturação com IA",
    photoAlt: "Um artesão na sua oficina dita um pedido ao Robi",
    photoCaption: "O seu trabalho merece toda a sua atenção.",
    demoLabel: "Exemplo ilustrativo",
    voiceLabel: "Diz",
    prompt: "Prepara uma fatura para a renovação da sala.",
    quoteLabel: "Orçamento",
    invoiceLabel: "Fatura",
    service: "Renovação da sala",
    draftLabel: "Rascunho criado",
    createdLabel: "Fatura criada",
    creatingLabel: "Criação em curso",
    sentLabel: "Fatura enviada",
    paidLabel: "Fatura paga",
    sentDetail: "Enviada ao cliente",
    paidDetail: "Pagamento recebido",
    pauseLabel: "Pausar",
    resumeLabel: "Retomar",
    reviewLabel: "Rever antes de enviar",
    replayLabel: "Repetir o exemplo",
  },
};

export function getHeroStoryCopy(locale: string): HeroStoryCopy {
  const language = locale.split("-")[0].toLowerCase();
  if (language === "fr" || language === "en" || language === "es" || language === "pt") {
    return heroStoryCopy[language];
  }
  return heroStoryCopy.en;
}
