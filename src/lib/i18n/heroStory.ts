export interface HeroStoryCopy {
  eyebrow: string;
  photoAlt: string;
  photoCaption: string;
  demoLabel: string;
  voiceLabel: string;
  prompt: string;
  tracking: { title: string; search: string; create: string; all: string; sent: string; paid: string; draft: string };
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
  /**
   * Les scénarios que la carte enchaîne en boucle : un devis, puis une
   * facture pour une autre prestation. Chaque scénario a sa phrase dictée,
   * sa ligne de prestation et ses quatre états (création, créé, envoyé, fin).
   */
  scenarios?: HeroScenario[];
}

export interface HeroScenario {
  kind: "quote" | "invoice";
  prompt: string;
  service: string;
  /** [en cours, créé, envoyé, final] */
  statuses: [string, string, string, string];
  /** [détail en cours, créé, envoyé, final] */
  details: [string, string, string, string];
}

const heroStoryCopy: Record<"fr" | "en" | "es" | "pt", HeroStoryCopy> = {
  fr: {
    tracking: {"title": "Devis", "search": "Rechercher…", "create": "Créer", "all": "Tout", "sent": "Envoyé", "paid": "Accepté", "draft": "Brouillon"},
    eyebrow: "Assistant de facturation IA",
    photoAlt: "Un artisan dans son atelier dicte une demande à Robi",
    photoCaption: "Consacrez votre temps à ce que vous faites de mieux.",
    demoLabel: "Exemple illustratif",
    voiceLabel: "Vous dites",
    prompt: "Prépare une facture pour la création d’un meuble sur mesure.",
    quoteLabel: "Devis",
    invoiceLabel: "Facture",
    service: "Création d’un meuble sur mesure",
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
    scenarios: [
      { kind: "quote", prompt: "Crée-moi un devis pour un meuble sur mesure en chêne.", service: "Meuble sur mesure en chêne massif",
        statuses: ["Création du devis", "Devis créé", "Devis envoyé", "Devis signé"],
        details: ["Vous dites", "À vérifier avant l’envoi", "Transmis au client", "Signé par le client"] },
      { kind: "invoice", prompt: "Maintenant, une facture pour la pose de la cuisine.", service: "Pose d’une cuisine équipée",
        statuses: ["Création de la facture", "Facture créée", "Facture envoyée", "Facture payée"],
        details: ["Vous dites", "À vérifier avant l’envoi", "Transmise au client", "Paiement reçu"] },
    ],
  },
  en: {
    tracking: {"title": "Quotes", "search": "Search…", "create": "Create", "all": "All", "sent": "Sent", "paid": "Accepted", "draft": "Draft"},
    eyebrow: "AI invoicing assistant",
    photoAlt: "A craftsperson in their workshop dictates a request to Robi",
    photoCaption: "Your work deserves your full attention.",
    demoLabel: "Illustrative example",
    voiceLabel: "You say",
    prompt: "Prepare an invoice for a custom furniture build.",
    quoteLabel: "Quote",
    invoiceLabel: "Invoice",
    service: "Custom furniture build",
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
    scenarios: [
      { kind: "quote", prompt: "Make me a quote for a custom solid oak cabinet.", service: "Custom solid oak cabinet",
        statuses: ["Creating quote", "Quote created", "Quote sent", "Quote signed"],
        details: ["You say", "Review before sending", "Delivered to the client", "Signed by the client"] },
      { kind: "invoice", prompt: "Now an invoice for the kitchen installation.", service: "Fitted kitchen installation",
        statuses: ["Creating invoice", "Invoice created", "Invoice sent", "Invoice paid"],
        details: ["You say", "Review before sending", "Delivered to the client", "Payment received"] },
    ],
  },
  es: {
    tracking: {"title": "Presupuestos", "search": "Buscar…", "create": "Crear", "all": "Todo", "sent": "Enviado", "paid": "Aceptado", "draft": "Borrador"},
    eyebrow: "Asistente de facturación con IA",
    photoAlt: "Un artesano en su taller dicta una solicitud a Robi",
    photoCaption: "Tu trabajo merece toda tu atención.",
    demoLabel: "Ejemplo ilustrativo",
    voiceLabel: "Tú dices",
    prompt: "Prepara una factura para la creación de un mueble a medida.",
    quoteLabel: "Presupuesto",
    invoiceLabel: "Factura",
    service: "Creación de un mueble a medida",
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
    scenarios: [
      { kind: "quote", prompt: "Hazme un presupuesto para un mueble a medida de roble.", service: "Mueble a medida de roble macizo",
        statuses: ["Creando presupuesto", "Presupuesto creado", "Presupuesto enviado", "Presupuesto firmado"],
        details: ["Tú dices", "Revisar antes de enviar", "Enviado al cliente", "Firmado por el cliente"] },
      { kind: "invoice", prompt: "Ahora una factura por la instalación de la cocina.", service: "Instalación de una cocina equipada",
        statuses: ["Creando factura", "Factura creada", "Factura enviada", "Factura pagada"],
        details: ["Tú dices", "Revisar antes de enviar", "Enviada al cliente", "Pago recibido"] },
    ],
  },
  pt: {
    tracking: {"title": "Orçamentos", "search": "Pesquisar…", "create": "Criar", "all": "Tudo", "sent": "Enviado", "paid": "Aceite", "draft": "Rascunho"},
    eyebrow: "Assistente de faturação com IA",
    photoAlt: "Um artesão na sua oficina dita um pedido ao Robi",
    photoCaption: "O seu trabalho merece toda a sua atenção.",
    demoLabel: "Exemplo ilustrativo",
    voiceLabel: "Diz",
    prompt: "Prepara uma fatura para a criação de um móvel por medida.",
    quoteLabel: "Orçamento",
    invoiceLabel: "Fatura",
    service: "Criação de um móvel por medida",
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
    scenarios: [
      { kind: "quote", prompt: "Faz-me um orçamento para um móvel por medida em carvalho.", service: "Móvel por medida em carvalho maciço",
        statuses: ["A criar orçamento", "Orçamento criado", "Orçamento enviado", "Orçamento assinado"],
        details: ["Diz", "Rever antes de enviar", "Enviado ao cliente", "Assinado pelo cliente"] },
      { kind: "invoice", prompt: "Agora uma fatura pela instalação da cozinha.", service: "Instalação de uma cozinha equipada",
        statuses: ["A criar fatura", "Fatura criada", "Fatura enviada", "Fatura paga"],
        details: ["Diz", "Rever antes de enviar", "Enviada ao cliente", "Pagamento recebido"] },
    ],
  },
};

export function getHeroStoryCopy(locale: string): HeroStoryCopy {
  const language = locale.split("-")[0].toLowerCase();
  return language === "fr" ? heroStoryCopy.fr : heroStoryCopy.en;
}
