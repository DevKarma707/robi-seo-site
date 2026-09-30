/**
 * Textes du héros « ordinateur 3D » (01/10/2026, version bureau du téléphone).
 *
 * L'écran reproduit l'app web de Robi en mode clair, telle que la montre le
 * mode démo (go.robi-app.com/?demo) : menu latéral Amethyst, cartes du
 * tableau de bord (Santé, Objectif, Moyenne mensuelle, Panier moyen,
 * Nouvelle facture, Top clients, Ventes), vue « Robi AI » (conversation à
 * gauche, éditeur à droite), liste des factures avec son panneau de détail.
 * Les libellés sont ceux des locales de ROBI_APP.
 *
 * L'histoire, les clients, les montants et les règles par pays (devise,
 * Factur-X en France seulement, pas de Stripe au Maroc) viennent de la démo
 * du téléphone : `getHeroDeviceCopy`.
 */
import { getHeroDeviceCopy, type HeroDeviceCopy } from "./heroDevice";

export interface HeroLaptopDesk {
  nav: { dashboard: string; robi: string; documents: string; quotes: string; invoices: string; management: string; clients: string; products: string; settings: string; darkMode: string };
  cards: {
    health: string; toCollect: string; invoicesCount: string; late: string; pending: string; waiting: string; lateShort: string;
    goal: string; goalMonth: string; reached: string; remaining: string;
    avg: string; avgMonth: string; caTotal: string;
    basket: string; basketSub: string; basketCount: string;
    newInvoice: string; newInvoiceDesc: string; create: string;
    sales: string; total: string; paid: string; pendingLegend: string; topClients: string;
  };
  robi: {
    greeting: string; invoice: string; quote: string; placeholder: string; newInvoice: string; newQuote: string; ready: string;
    recipient: string; issuer: string; issuerAddress: string; clientAddress: string; dates: string; number: string; issueDate: string; due: string; terms: string; termsValue: string;
    desc: string; qty: string; price: string; vat: string; amount: string; addLine: string; totalHt: string; totalTtc: string; message: string;
  };
  list: { cols: [string, string, string, string, string, string, string]; emptyTitle: string; emptyDesc: string; preview: string };
  /** Nom de l'app dans la notification du Mac. */
  notifApp: string;
  stageAlt: string;
}

export interface HeroLaptopCopy extends HeroDeviceCopy {
  desk: HeroLaptopDesk;
}

const desk: Record<"fr" | "en" | "es" | "pt", HeroLaptopDesk> = {
  fr: {
    nav: { dashboard: "Tableau de bord", robi: "Robi AI", documents: "Documents", quotes: "Devis", invoices: "Factures", management: "Gestion", clients: "Clients", products: "Produits", settings: "Paramètres", darkMode: "Mode sombre" },
    cards: {
      health: "Santé", toCollect: "À encaisser", invoicesCount: "{n} factures", late: "{n} en retard", pending: "{n} en attente", waiting: "Attente", lateShort: "Retard",
      goal: "Objectif", goalMonth: "Objectif / mois", reached: "atteint", remaining: "Reste",
      avg: "Moyenne mensuelle", avgMonth: "Moyenne / mois", caTotal: "CA total",
      basket: "Panier moyen", basketSub: "TTC / facture", basketCount: "{n} factures",
      newInvoice: "Nouvelle facture", newInvoiceDesc: "Créez une facture client", create: "Créer",
      sales: "Ventes", total: "Total", paid: "Encaissé", pendingLegend: "En attente", topClients: "Top clients",
    },
    robi: {
      greeting: "Bonsoir ! Sur quoi travaillons-nous aujourd’hui ?", invoice: "Facture", quote: "Devis", placeholder: "Décrivez votre document…",
      newInvoice: "Nouvelle facture", newQuote: "Nouveau devis", ready: "Prêt",
      recipient: "Destinataire", issuer: "Émetteur", issuerAddress: "14 rue de la Charité, Lyon", clientAddress: "8 avenue Foch, Lyon",
      dates: "Dates & conditions", number: "Numéro", issueDate: "Date d’émission", due: "Échéance", terms: "Conditions", termsValue: "30 jours",
      desc: "Description", qty: "Qté", price: "Prix", vat: "TVA", amount: "Montant", addLine: "Ajouter une ligne",
      totalHt: "Total HT", totalTtc: "Total TTC", message: "Message pour le client",
    },
    list: { cols: ["Numéro", "Client", "Créé le", "Échéance", "Payée", "Total TTC", "Statut"], emptyTitle: "Aucun document sélectionné", emptyDesc: "Cliquez sur une ligne pour voir les détails.", preview: "Aperçu" },
    notifApp: "Robi AI",
    stageAlt: "Un ordinateur portable flottant montre l’app Robi : on dicte une facture, elle se remplit, part au client, le client l’ouvre, le paiement arrive et le tableau de bord monte",
  },
  en: {
    nav: { dashboard: "Dashboard", robi: "Robi AI", documents: "Documents", quotes: "Quotes", invoices: "Invoices", management: "Management", clients: "Clients", products: "Products", settings: "Settings", darkMode: "Dark mode" },
    cards: {
      health: "Health", toCollect: "To collect", invoicesCount: "{n} invoices", late: "{n} overdue", pending: "{n} pending", waiting: "Pending", lateShort: "Overdue",
      goal: "Goal", goalMonth: "Goal / month", reached: "reached", remaining: "Remaining",
      avg: "Monthly average", avgMonth: "Average / month", caTotal: "Total revenue",
      basket: "Average invoice", basketSub: "Incl. tax / invoice", basketCount: "{n} invoices",
      newInvoice: "New invoice", newInvoiceDesc: "Create a client invoice", create: "Create",
      sales: "Sales", total: "Total", paid: "Cashed", pendingLegend: "Pending", topClients: "Top clients",
    },
    robi: {
      greeting: "Good evening! What are we working on today?", invoice: "Invoice", quote: "Quote", placeholder: "Describe your document…",
      newInvoice: "New invoice", newQuote: "New quote", ready: "Ready",
      recipient: "Recipient", issuer: "Issuer", issuerAddress: "14 rue de la Charité, Lyon", clientAddress: "8 avenue Foch, Lyon",
      dates: "Dates & conditions", number: "Number", issueDate: "Issue date", due: "Due date", terms: "Terms", termsValue: "30 days",
      desc: "Description", qty: "Qty", price: "Price", vat: "VAT", amount: "Amount", addLine: "Add a line",
      totalHt: "Subtotal", totalTtc: "Total incl. tax", message: "Message for the client",
    },
    list: { cols: ["Number", "Client", "Created on", "Due date", "Paid", "Total", "Status"], emptyTitle: "No document selected", emptyDesc: "Click on a row to see the details.", preview: "Preview" },
    notifApp: "Robi AI",
    stageAlt: "A floating laptop shows the Robi app: you dictate an invoice, it fills itself in, goes to the client, the client opens it, the payment arrives and the dashboard goes up",
  },
  es: {
    nav: { dashboard: "Panel de control", robi: "Robi AI", documents: "Documentos", quotes: "Presupuestos", invoices: "Facturas", management: "Gestión", clients: "Clientes", products: "Productos", settings: "Ajustes", darkMode: "Modo oscuro" },
    cards: {
      health: "Salud", toCollect: "Por cobrar", invoicesCount: "{n} facturas", late: "{n} con retraso", pending: "{n} pendientes", waiting: "Pendiente", lateShort: "Retraso",
      goal: "Objetivo", goalMonth: "Objetivo / mes", reached: "alcanzado", remaining: "Restante",
      avg: "Promedio mensual", avgMonth: "Promedio / mes", caTotal: "Facturación total",
      basket: "Ticket medio", basketSub: "IVA incl. / factura", basketCount: "{n} facturas",
      newInvoice: "Nueva factura", newInvoiceDesc: "Crear factura cliente", create: "Crear",
      sales: "Ventas", total: "Total", paid: "Cobrado", pendingLegend: "Pendiente", topClients: "Mejores clientes",
    },
    robi: {
      greeting: "¡Buenas noches! ¿En qué trabajamos hoy?", invoice: "Factura", quote: "Presupuesto", placeholder: "Describe tu documento…",
      newInvoice: "Nueva factura", newQuote: "Nuevo presupuesto", ready: "Listo",
      recipient: "Destinatario", issuer: "Emisor", issuerAddress: "14 rue de la Charité, Lyon", clientAddress: "8 avenue Foch, Lyon",
      dates: "Fechas y condiciones", number: "Número", issueDate: "Fecha de emisión", due: "Vencimiento", terms: "Condiciones", termsValue: "30 días",
      desc: "Descripción", qty: "Cant.", price: "Precio", vat: "IVA", amount: "Importe", addLine: "Añadir una línea",
      totalHt: "Base imponible", totalTtc: "Total con IVA", message: "Mensaje para el cliente",
    },
    list: { cols: ["Número", "Cliente", "Creado el", "Vencimiento", "Pagado", "Total", "Estado"], emptyTitle: "Ningún documento seleccionado", emptyDesc: "Haz clic en una fila para ver los detalles.", preview: "Vista previa" },
    notifApp: "Robi AI",
    stageAlt: "Un portátil flotante muestra la app Robi: dictas una factura, se rellena, llega al cliente, el cliente la abre, llega el pago y el panel sube",
  },
  pt: {
    nav: { dashboard: "Painel", robi: "Robi AI", documents: "Documentos", quotes: "Orçamentos", invoices: "Faturas", management: "Gestão", clients: "Clientes", products: "Produtos", settings: "Configurações", darkMode: "Modo escuro" },
    cards: {
      health: "Saúde", toCollect: "A receber", invoicesCount: "{n} faturas", late: "{n} em atraso", pending: "{n} pendentes", waiting: "Pendente", lateShort: "Atraso",
      goal: "Meta", goalMonth: "Meta / mês", reached: "alcançada", remaining: "Restante",
      avg: "Média mensal", avgMonth: "Média / mês", caTotal: "Faturação total",
      basket: "Ticket médio", basketSub: "C/ impostos / fatura", basketCount: "{n} faturas",
      newInvoice: "Nova fatura", newInvoiceDesc: "Crie uma fatura para o cliente", create: "Criar",
      sales: "Vendas", total: "Total", paid: "Recebido", pendingLegend: "Pendente", topClients: "Melhores clientes",
    },
    robi: {
      greeting: "Boa noite! Em que vamos trabalhar hoje?", invoice: "Fatura", quote: "Orçamento", placeholder: "Descreva o seu documento…",
      newInvoice: "Nova fatura", newQuote: "Novo orçamento", ready: "Pronto",
      recipient: "Destinatário", issuer: "Emissor", issuerAddress: "14 rue de la Charité, Lyon", clientAddress: "8 avenue Foch, Lyon",
      dates: "Datas & condições", number: "Número", issueDate: "Data de emissão", due: "Vencimento", terms: "Condições", termsValue: "30 dias",
      desc: "Descrição", qty: "Qtd", price: "Preço", vat: "IVA", amount: "Valor", addLine: "Adicionar linha",
      totalHt: "Total s/ impostos", totalTtc: "Total c/ impostos", message: "Mensagem para o cliente",
    },
    list: { cols: ["Número", "Cliente", "Criado em", "Vencimento", "Pago", "Total", "Status"], emptyTitle: "Nenhum documento selecionado", emptyDesc: "Clique numa linha para ver os detalhes.", preview: "Pré-visualização" },
    notifApp: "Robi AI",
    stageAlt: "Um portátil flutuante mostra a app Robi: dita uma fatura, ela preenche-se, segue para o cliente, o cliente abre-a, o pagamento chega e o painel sobe",
  },
};

/** La démo du pays pour l'ordinateur : la même histoire que le téléphone, les libellés de l'app web en plus. */
export function getHeroLaptopCopy(locale: string): HeroLaptopCopy {
  const language = locale.split("-")[0].toLowerCase() as keyof typeof desk;
  return { ...getHeroDeviceCopy(locale), desk: desk[language] ?? desk.en };
}
