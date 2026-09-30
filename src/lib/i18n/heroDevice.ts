/**
 * Textes du héros « téléphone 3D » (30/09/2026). L'écran reproduit les vrais
 * écrans mobiles de l'app (captures du mode démo, sombre) : dashboard
 * (chiffre d'affaires du mois, tuiles, Ventes 12 mois, Objectif), liste des
 * factures / devis, fiche du document avec son historique. Les libellés
 * sont ceux de l'app (locales de ROBI_APP) : « E-mail ouvert », « Document
 * ouvert », « 💰 Paiement reçu via Stripe », « ✍️ Devis signé
 * électroniquement », « Marquer comme payée »…
 *
 * Montants : ceux du site et de la démo de l'app (Maison Laurent 1 240 €,
 * Atelier Dubois 2 274 €, Studio Vernier, Boulangerie Lefèvre, Sophie
 * Nadaud), objectif du dashboard des pubs (2 390 € sur 4 800 €).
 */
export interface HeroDeviceRow { client: string; number: string; amount: number; badge: "sent" | "paid" | "late" | "draft" | "accepted" }

export interface HeroDeviceScenario {
  kind: "invoice" | "quote";
  prompt: string;
  client: string;
  service: string;
  amount: number;
  number: string;
  docLabel: string;
  created: string;
  sent: string;
  sentChip: string;
  /** Réponse de Robi dans une bulle lime, quand le document s'ouvre. */
  reply: string;
  /** Sous le document : Robi propose l'envoi, l'utilisateur répond. */
  ask: string;
  yes: string;
  /** Notification « Document ouvert » : ligne. */
  openedLine: string;
  /** Notification finale : titre et ligne (paiement reçu / devis signé). */
  doneTitle: string;
  doneLine: string;
  /** Entrée d'historique finale. */
  doneHistory: string;
  doneBadge: "paid" | "accepted";
  /** Les autres lignes de la liste (démo de l'app). */
  rows: HeroDeviceRow[];
  tabs: [string, string, string, string];
  tabCounts: [number, number, number, number];
}

export interface HeroDeviceCopy {
  locale: string;
  currency: string;
  app: string;
  now: string;
  youSay: string;
  fields: { client: string; service: string; total: string };
  writing: [string, string];
  review: string;
  sending: [string, string];
  dashboard: {
    revenueMonth: string;
    pendingInvoices: string;
    openQuotes: string;
    sales12m: string;
    goal: string;
    avgMonth: string;
    avgMonthSub: string;
    months: string[];
  };
  list: { create: string; search: string; invoices: string; quotes: string };
  /** Aperçu PDF du document : l'émetteur est une entreprise fictive de démo. */
  pdf: { billTo: string; date: string; designation: string; amount: string; issuer: string; issuerLine: string; payOnline: string; approve: string;
    /** Les quatre boutons de l'app sous l'aperçu : PDF, Envoyer, Approuvé / Brouillon, Payée / Approuver. */
    actions: { pdf: string; send: string; approved: string; paid: string; draft: string; approveBtn: string } };
  /** Troisième scénario : les relances d'impayés. `{total}` = somme des trois factures. */
  reminder: { prompt: string; answer: string; ask: string; yes: string; sentChip: string; rows: HeroDeviceRow[] };
  detail: {
    view: string; more: string; totalHt: string; vat: string; total: string; markPaid: string; paid: string;
    createdOn: string; due: string; history: string; lines: string; on: string; at: string;
    emailOpen: string; emailSent: string;
  };
  badges: { sent: string; paid: string; late: string; draft: string; accepted: string };
  nav: [string, string, string, string];
  openedTitle: string;
  goalFrom: number;
  goalTotal: number;
  facturX?: string;
  /** Chip « Encaissez par carte » (Visa · Mastercard · Stripe, paiement en ligne de l'app). */
  stripe: string;
  stageAlt: string;
  scenarios: HeroDeviceScenario[];
}

/**
 * Ventes des 11 mois passés (encaissé) et ce qui reste en attente sur les
 * derniers mois : le graphique « Ventes (12 mois) » de l'app empile l'encaissé
 * (lime) et l'en-attente (gris). Le 12e mois est le chiffre d'affaires du mois.
 * La moyenne mensuelle se calcule sur ces 12 valeurs, elle n'est pas écrite en dur.
 */
export const SALES_PAID = [1850, 2100, 1640, 2480, 2210, 2760, 2340, 2590, 2120, 2680, 2950];
export const SALES_PENDING = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 792, 1620];
export const SALES_SCALE = 4800;

const copy: Record<"fr" | "en" | "es" | "pt", HeroDeviceCopy> = {
  fr: {
    locale: "fr-FR", currency: "EUR",
    app: "Robi AI", now: "maintenant", youSay: "Vous dites",
    fields: { client: "Client", service: "Prestation", total: "Total" },
    writing: ["Robi rédige…", "D’après votre dictée"],
    review: "À vérifier avant l’envoi",
    sending: ["Envoi en cours", "Robi relancera si besoin"],
    dashboard: {
      revenueMonth: "Chiffre d’affaires du mois", pendingInvoices: "Factures en attente", openQuotes: "Devis en cours",
      sales12m: "Ventes (12 mois)", goal: "Objectif", avgMonth: "Moyenne mensuelle", avgMonthSub: "/ Objectif / mois",
      months: ["oct.", "nov.", "déc.", "janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept."],
    },
    pdf: { billTo: "Facturé à", date: "Date", designation: "Désignation", amount: "Montant", issuer: "Menuiserie Martin", issuerLine: "Artisan menuisier · Lyon", payOnline: "Payer en ligne", approve: "Bon pour accord", actions: { pdf: "PDF", send: "Envoyer", approved: "Approuvé", paid: "Payée", draft: "Brouillon", approveBtn: "Approuver" } },
    reminder: {
      prompt: "Robi, combien j’ai de factures impayées ce mois-ci ?", answer: "Il y en a trois, pour {total}.", ask: "Je les relance ?", yes: "Oui, relance-les.", sentChip: "3 relances envoyées",
      rows: [
        { client: "Sophie Nadaud", number: "FAC-2026-001", amount: 312, badge: "late" },
        { client: "Studio Bernard", number: "FAC-2026-003", amount: 480, badge: "late" },
        { client: "Studio Vernier", number: "FAC-2026-002", amount: 1620, badge: "sent" },
      ],
    },
    list: { create: "Créer", search: "Rechercher…", invoices: "Factures", quotes: "Devis" },
    detail: {
      view: "Afficher", more: "Plus", totalHt: "Total HT", vat: "TVA", total: "Total", markPaid: "Marquer comme payée", paid: "Payée",
      createdOn: "Créé le", due: "Échéance", history: "Historique", lines: "Lignes", on: "le", at: "à",
      emailOpen: "E-mail ouvert", emailSent: "envoyée par e-mail",
    },
    badges: { sent: "Envoyé", paid: "Payé", late: "Retard", draft: "Brouillon", accepted: "Accepté" },
    nav: ["Factures", "Devis", "Clients", "Produits"],
    openedTitle: "Document ouvert",
    goalFrom: 2390, goalTotal: 4800,
    facturX: "Conforme Factur-X",
    stripe: "Encaissez par carte",
    stageAlt: "Un téléphone flottant montre Robi : on dicte, la facture se remplit, part au client, le client l’ouvre, le paiement arrive",
    scenarios: [
      { kind: "invoice", prompt: "Facture pour Maison Laurent, meuble en chêne, mille deux cent quarante euros.",
        client: "Maison Laurent", service: "Meuble sur mesure en chêne", amount: 1240, number: "FAC-2026-004", docLabel: "Facture",
        created: "Facture créée", sent: "Facture envoyée", sentChip: "Envoyée à Maison Laurent",
        reply: "C’est noté ! Voici votre facture pour Maison Laurent.",
        ask: "C’est fait ! Je l’envoie à Maison Laurent ?", yes: "Oui, envoie.",
        openedLine: "Maison Laurent a ouvert la facture à 20:30",
        doneTitle: "Paiement reçu", doneLine: "Maison Laurent · 1 240,00 € via Stripe", doneHistory: "💰 Paiement reçu via Stripe", doneBadge: "paid",
        rows: [
          { client: "Studio Vernier", number: "FAC-2026-002", amount: 1620, badge: "sent" },
          { client: "Boulangerie Lefèvre", number: "FAC-2026-003", amount: 1248, badge: "paid" },
          { client: "Sophie Nadaud", number: "FAC-2026-001", amount: 312, badge: "late" },
        ],
        tabs: ["Tout", "Non payées", "Payées", "Brouillons"], tabCounts: [4, 3, 1, 0] },
      { kind: "quote", prompt: "Devis pour Atelier Dubois, pose d’une cuisine, deux mille deux cent soixante-quatorze euros.",
        client: "Atelier Dubois", service: "Pose d’une cuisine équipée", amount: 2274, number: "DEV-2026-003", docLabel: "Devis",
        created: "Devis créé", sent: "Devis envoyé", sentChip: "Envoyé à Atelier Dubois",
        reply: "Je m’en occupe ! Voici le devis pour Atelier Dubois.",
        ask: "C’est fait ! Je l’envoie à Atelier Dubois ?", yes: "Oui, envoie.",
        openedLine: "Atelier Dubois a ouvert le devis à 20:30",
        doneTitle: "Devis signé", doneLine: "Atelier Dubois · 2 274,00 €", doneHistory: "✍️ Devis signé électroniquement", doneBadge: "accepted",
        rows: [
          { client: "Studio Vernier", number: "DEV-2026-002", amount: 2304, badge: "accepted" },
          { client: "Boulangerie Lefèvre", number: "DEV-2026-001", amount: 960, badge: "draft" },
        ],
        tabs: ["Tout", "Brouillons", "Acceptés", "Refusés"], tabCounts: [3, 1, 1, 0] },
    ],
  },
  en: {
    locale: "en-GB", currency: "EUR",
    app: "Robi AI", now: "now", youSay: "You say",
    fields: { client: "Client", service: "Service", total: "Total" },
    writing: ["Robi is writing…", "From your dictation"],
    review: "Review before sending",
    sending: ["Sending", "Robi will follow up if needed"],
    dashboard: {
      revenueMonth: "Revenue this month", pendingInvoices: "Pending invoices", openQuotes: "Open quotes",
      sales12m: "Sales (12 months)", goal: "Goal", avgMonth: "Monthly average", avgMonthSub: "/ goal / month",
      months: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
    },
    pdf: { billTo: "Bill to", date: "Date", designation: "Description", amount: "Amount", issuer: "Martin Woodworks", issuerLine: "Custom carpentry · Lyon", payOnline: "Pay online", approve: "Approved by", actions: { pdf: "PDF", send: "Send", approved: "Approved", paid: "Paid", draft: "Draft", approveBtn: "Approve" } },
    reminder: {
      prompt: "Robi, how many unpaid invoices do I have this month?", answer: "Three, for {total}.", ask: "Shall I send reminders?", yes: "Yes, remind them.", sentChip: "3 reminders sent",
      rows: [
        { client: "Sophie Nadaud", number: "INV-2026-001", amount: 312, badge: "late" },
        { client: "Studio Bernard", number: "INV-2026-003", amount: 480, badge: "late" },
        { client: "Studio Vernier", number: "INV-2026-002", amount: 1620, badge: "sent" },
      ],
    },
    list: { create: "Create", search: "Search…", invoices: "Invoices", quotes: "Quotes" },
    detail: {
      view: "View", more: "More", totalHt: "Subtotal", vat: "VAT", total: "Total", markPaid: "Mark as paid", paid: "Paid",
      createdOn: "Created", due: "Due", history: "History", lines: "Lines", on: "on", at: "at",
      emailOpen: "Email opened", emailSent: "sent by email",
    },
    badges: { sent: "Sent", paid: "Paid", late: "Late", draft: "Draft", accepted: "Accepted" },
    nav: ["Invoices", "Quotes", "Clients", "Products"],
    openedTitle: "Document opened",
    goalFrom: 2390, goalTotal: 4800,
    stripe: "Accept card payments",
    stageAlt: "A floating phone shows Robi: you dictate, the invoice fills in, goes to the client, the client opens it, the payment arrives",
    scenarios: [
      { kind: "invoice", prompt: "Invoice for Maison Laurent, oak cabinet, one thousand two hundred forty euros.",
        client: "Maison Laurent", service: "Custom oak cabinet", amount: 1240, number: "INV-2026-004", docLabel: "Invoice",
        created: "Invoice created", sent: "Invoice sent", sentChip: "Sent to Maison Laurent",
        reply: "Got it! Here’s your invoice for Maison Laurent.",
        ask: "Done! Shall I send it to Maison Laurent?", yes: "Yes, send it.",
        openedLine: "Maison Laurent opened the invoice at 8:30 pm",
        doneTitle: "Payment received", doneLine: "Maison Laurent · €1,240.00 via Stripe", doneHistory: "💰 Payment received via Stripe", doneBadge: "paid",
        rows: [
          { client: "Studio Vernier", number: "INV-2026-002", amount: 1620, badge: "sent" },
          { client: "Boulangerie Lefèvre", number: "INV-2026-003", amount: 1248, badge: "paid" },
          { client: "Sophie Nadaud", number: "INV-2026-001", amount: 312, badge: "late" },
        ],
        tabs: ["All", "Unpaid", "Paid", "Drafts"], tabCounts: [4, 3, 1, 0] },
      { kind: "quote", prompt: "Quote for Atelier Dubois, kitchen installation, two thousand two hundred seventy-four euros.",
        client: "Atelier Dubois", service: "Fitted kitchen installation", amount: 2274, number: "QUO-2026-003", docLabel: "Quote",
        created: "Quote created", sent: "Quote sent", sentChip: "Sent to Atelier Dubois",
        reply: "On it! Here’s the quote for Atelier Dubois.",
        ask: "Done! Shall I send it to Atelier Dubois?", yes: "Yes, send it.",
        openedLine: "Atelier Dubois opened the quote at 8:30 pm",
        doneTitle: "Quote signed", doneLine: "Atelier Dubois · €2,274.00", doneHistory: "✍️ Quote signed electronically", doneBadge: "accepted",
        rows: [
          { client: "Studio Vernier", number: "QUO-2026-002", amount: 2304, badge: "accepted" },
          { client: "Boulangerie Lefèvre", number: "QUO-2026-001", amount: 960, badge: "draft" },
        ],
        tabs: ["All", "Drafts", "Accepted", "Refused"], tabCounts: [3, 1, 1, 0] },
    ],
  },
  es: {
    locale: "es-ES", currency: "EUR",
    app: "Robi AI", now: "ahora", youSay: "Tú dices",
    fields: { client: "Cliente", service: "Servicio", total: "Total" },
    writing: ["Robi redacta…", "Según tu dictado"],
    review: "Revisar antes de enviar",
    sending: ["Enviando", "Robi hará el seguimiento si hace falta"],
    dashboard: {
      revenueMonth: "Facturación del mes", pendingInvoices: "Facturas pendientes", openQuotes: "Presupuestos en curso",
      sales12m: "Ventas (12 meses)", goal: "Objetivo", avgMonth: "Media mensual", avgMonthSub: "/ objetivo / mes",
      months: ["oct.", "nov.", "dic.", "ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept."],
    },
    pdf: { billTo: "Facturado a", date: "Fecha", designation: "Concepto", amount: "Importe", issuer: "Carpintería Martín", issuerLine: "Carpintería a medida · Lyon", payOnline: "Pagar en línea", approve: "Conforme", actions: { pdf: "PDF", send: "Enviar", approved: "Aprobado", paid: "Pagada", draft: "Borrador", approveBtn: "Aprobar" } },
    reminder: {
      prompt: "Robi, ¿cuántas facturas sin pagar tengo este mes?", answer: "Hay tres, por {total}.", ask: "¿Les envío un recordatorio?", yes: "Sí, recuérdaselo.", sentChip: "3 recordatorios enviados",
      rows: [
        { client: "Sophie Nadaud", number: "FAC-2026-001", amount: 312, badge: "late" },
        { client: "Studio Bernard", number: "FAC-2026-003", amount: 480, badge: "late" },
        { client: "Studio Vernier", number: "FAC-2026-002", amount: 1620, badge: "sent" },
      ],
    },
    list: { create: "Crear", search: "Buscar…", invoices: "Facturas", quotes: "Presupuestos" },
    detail: {
      view: "Ver", more: "Más", totalHt: "Base", vat: "IVA", total: "Total", markPaid: "Marcar como pagada", paid: "Pagada",
      createdOn: "Creada el", due: "Vencimiento", history: "Historial", lines: "Líneas", on: "el", at: "a las",
      emailOpen: "E-mail abierto", emailSent: "enviada por e-mail",
    },
    badges: { sent: "Enviado", paid: "Pagado", late: "Retraso", draft: "Borrador", accepted: "Aceptado" },
    nav: ["Facturas", "Presupuestos", "Clientes", "Productos"],
    openedTitle: "Documento abierto",
    goalFrom: 2390, goalTotal: 4800,
    stripe: "Cobra con tarjeta",
    stageAlt: "Un teléfono flotante muestra Robi: dictas, la factura se rellena, llega al cliente, el cliente la abre, entra el pago",
    scenarios: [
      { kind: "invoice", prompt: "Factura para Maison Laurent, mueble de roble, mil doscientos cuarenta euros.",
        client: "Maison Laurent", service: "Mueble a medida de roble", amount: 1240, number: "FAC-2026-004", docLabel: "Factura",
        created: "Factura creada", sent: "Factura enviada", sentChip: "Enviada a Maison Laurent",
        reply: "¡Anotado! Aquí tienes tu factura para Maison Laurent.",
        ask: "¡Listo! ¿La envío a Maison Laurent?", yes: "Sí, envíala.",
        openedLine: "Maison Laurent abrió la factura a las 20:30",
        doneTitle: "Pago recibido", doneLine: "Maison Laurent · 1.240,00 € vía Stripe", doneHistory: "💰 Pago recibido vía Stripe", doneBadge: "paid",
        rows: [
          { client: "Studio Vernier", number: "FAC-2026-002", amount: 1620, badge: "sent" },
          { client: "Boulangerie Lefèvre", number: "FAC-2026-003", amount: 1248, badge: "paid" },
          { client: "Sophie Nadaud", number: "FAC-2026-001", amount: 312, badge: "late" },
        ],
        tabs: ["Todo", "No pagadas", "Pagadas", "Borradores"], tabCounts: [4, 3, 1, 0] },
      { kind: "quote", prompt: "Presupuesto para Atelier Dubois, instalación de cocina, dos mil doscientos setenta y cuatro euros.",
        client: "Atelier Dubois", service: "Instalación de cocina equipada", amount: 2274, number: "PRE-2026-003", docLabel: "Presupuesto",
        created: "Presupuesto creado", sent: "Presupuesto enviado", sentChip: "Enviado a Atelier Dubois",
        reply: "¡Me encargo! Aquí está el presupuesto para Atelier Dubois.",
        ask: "¡Listo! ¿Lo envío a Atelier Dubois?", yes: "Sí, envíalo.",
        openedLine: "Atelier Dubois abrió el presupuesto a las 20:30",
        doneTitle: "Presupuesto firmado", doneLine: "Atelier Dubois · 2.274,00 €", doneHistory: "✍️ Presupuesto firmado electrónicamente", doneBadge: "accepted",
        rows: [
          { client: "Studio Vernier", number: "PRE-2026-002", amount: 2304, badge: "accepted" },
          { client: "Boulangerie Lefèvre", number: "PRE-2026-001", amount: 960, badge: "draft" },
        ],
        tabs: ["Todo", "Borradores", "Aceptados", "Rechazados"], tabCounts: [3, 1, 1, 0] },
    ],
  },
  pt: {
    locale: "pt-PT", currency: "EUR",
    app: "Robi AI", now: "agora", youSay: "Diz",
    fields: { client: "Cliente", service: "Serviço", total: "Total" },
    writing: ["O Robi redige…", "A partir do que ditou"],
    review: "Rever antes de enviar",
    sending: ["A enviar", "O Robi faz o seguimento se preciso"],
    dashboard: {
      revenueMonth: "Faturação do mês", pendingInvoices: "Faturas pendentes", openQuotes: "Orçamentos em curso",
      sales12m: "Vendas (12 meses)", goal: "Objetivo", avgMonth: "Média mensal", avgMonthSub: "/ objetivo / mês",
      months: ["out.", "nov.", "dez.", "jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set."],
    },
    pdf: { billTo: "Faturado a", date: "Data", designation: "Descrição", amount: "Valor", issuer: "Carpintaria Martins", issuerLine: "Carpintaria por medida · Lyon", payOnline: "Pagar online", approve: "De acordo", actions: { pdf: "PDF", send: "Enviar", approved: "Aprovado", paid: "Paga", draft: "Rascunho", approveBtn: "Aprovar" } },
    reminder: {
      prompt: "Robi, quantas faturas por pagar tenho este mês?", answer: "São três, no total de {total}.", ask: "Envio um lembrete?", yes: "Sim, lembra-os.", sentChip: "3 lembretes enviados",
      rows: [
        { client: "Sophie Nadaud", number: "FAT-2026-001", amount: 312, badge: "late" },
        { client: "Studio Bernard", number: "FAT-2026-003", amount: 480, badge: "late" },
        { client: "Studio Vernier", number: "FAT-2026-002", amount: 1620, badge: "sent" },
      ],
    },
    list: { create: "Criar", search: "Pesquisar…", invoices: "Faturas", quotes: "Orçamentos" },
    detail: {
      view: "Ver", more: "Mais", totalHt: "Subtotal", vat: "IVA", total: "Total", markPaid: "Marcar como paga", paid: "Paga",
      createdOn: "Criada a", due: "Vencimento", history: "Histórico", lines: "Linhas", on: "a", at: "às",
      emailOpen: "E-mail aberto", emailSent: "enviada por e-mail",
    },
    badges: { sent: "Enviado", paid: "Pago", late: "Atraso", draft: "Rascunho", accepted: "Aceite" },
    nav: ["Faturas", "Orçamentos", "Clientes", "Produtos"],
    openedTitle: "Documento aberto",
    goalFrom: 2390, goalTotal: 4800,
    stripe: "Receba por cartão",
    stageAlt: "Um telemóvel flutuante mostra o Robi: dita, a fatura preenche-se, segue para o cliente, o cliente abre-a, o pagamento chega",
    scenarios: [
      { kind: "invoice", prompt: "Fatura para Maison Laurent, móvel em carvalho, mil duzentos e quarenta euros.",
        client: "Maison Laurent", service: "Móvel por medida em carvalho", amount: 1240, number: "FAT-2026-004", docLabel: "Fatura",
        created: "Fatura criada", sent: "Fatura enviada", sentChip: "Enviada a Maison Laurent",
        reply: "Anotado! Aqui está a sua fatura para a Maison Laurent.",
        ask: "Feito! Envio para a Maison Laurent?", yes: "Sim, envia.",
        openedLine: "Maison Laurent abriu a fatura às 20:30",
        doneTitle: "Pagamento recebido", doneLine: "Maison Laurent · 1 240,00 € via Stripe", doneHistory: "💰 Pagamento recebido via Stripe", doneBadge: "paid",
        rows: [
          { client: "Studio Vernier", number: "FAT-2026-002", amount: 1620, badge: "sent" },
          { client: "Boulangerie Lefèvre", number: "FAT-2026-003", amount: 1248, badge: "paid" },
          { client: "Sophie Nadaud", number: "FAT-2026-001", amount: 312, badge: "late" },
        ],
        tabs: ["Tudo", "Por pagar", "Pagas", "Rascunhos"], tabCounts: [4, 3, 1, 0] },
      { kind: "quote", prompt: "Orçamento para Atelier Dubois, instalação de cozinha, dois mil duzentos e setenta e quatro euros.",
        client: "Atelier Dubois", service: "Instalação de cozinha equipada", amount: 2274, number: "ORC-2026-003", docLabel: "Orçamento",
        created: "Orçamento criado", sent: "Orçamento enviado", sentChip: "Enviado a Atelier Dubois",
        reply: "Trato disso! Aqui está o orçamento para a Atelier Dubois.",
        ask: "Feito! Envio para a Atelier Dubois?", yes: "Sim, envia.",
        openedLine: "Atelier Dubois abriu o orçamento às 20:30",
        doneTitle: "Orçamento assinado", doneLine: "Atelier Dubois · 2 274,00 €", doneHistory: "✍️ Orçamento assinado eletronicamente", doneBadge: "accepted",
        rows: [
          { client: "Studio Vernier", number: "ORC-2026-002", amount: 2304, badge: "accepted" },
          { client: "Boulangerie Lefèvre", number: "ORC-2026-001", amount: 960, badge: "draft" },
        ],
        tabs: ["Tudo", "Rascunhos", "Aceites", "Recusados"], tabCounts: [3, 1, 1, 0] },
    ],
  },
};

export function getHeroDeviceCopy(locale: string): HeroDeviceCopy {
  const language = locale.split("-")[0].toLowerCase() as keyof typeof copy;
  return copy[language] ?? copy.en;
}
