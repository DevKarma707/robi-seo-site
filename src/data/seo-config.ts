// AGENT SEO - Configuration et Keywords
// Ce fichier contient toutes les données SEO pour les 50+ pages
// Multilingual support: fr, en, es

import { Locale } from "@/lib/i18n/config";

export const siteConfig = {
  name: "Robi AI",
  description: "Logiciel de facturation IA pour freelances et indépendants",
  url: "https://robi-app.com",
  ogImage: "https://robi-app.com/og.png",
  links: {
    instagram: "https://instagram.com/robi.ai.app",
    twitter: "https://x.com/iamrobiai",
    linkedin: "https://linkedin.com/company/robi-ai",
  },
};

// ===== INDUSTRY CATEGORIES =====
type LocaleStrings = Record<Locale, string>;

interface IndustryCategory {
  id: string;
  name: LocaleStrings;
  icon: string;
}

export const industryCategories: IndustryCategory[] = [
  { id: "btp", name: { fr: "Métiers du BTP", en: "Construction & Trades", es: "Construcción y Oficios" }, icon: "Hammer" },
  { id: "tech", name: { fr: "Tech & Digital", en: "Tech & Digital", es: "Tech & Digital" }, icon: "Code" },
  { id: "creatif", name: { fr: "Créatifs", en: "Creatives", es: "Creativos" }, icon: "Palette" },
  { id: "evenementiel", name: { fr: "Événementiel", en: "Events", es: "Eventos" }, icon: "PartyPopper" },
  { id: "conseil", name: { fr: "Conseil & Services", en: "Consulting & Services", es: "Consultoría y Servicios" }, icon: "Briefcase" },
  { id: "sante", name: { fr: "Santé & Bien-être", en: "Health & Wellness", es: "Salud y Bienestar" }, icon: "Heart" },
];

// ===== INDUSTRY TYPE =====
interface Industry {
  slug: string;
  name: LocaleStrings;
  category: string;
  title: LocaleStrings;
  description: LocaleStrings;
  keywords: string[];
  heroTitle: LocaleStrings;
  painPoints: LocaleStrings[];
  features: LocaleStrings[];
}

// ===== INDUSTRIES =====
export const industries: Industry[] = [
  // ==================== MÉTIERS DU BTP ====================
  {
    slug: "plombier",
    name: { fr: "Plombiers", en: "Plumbers", es: "Fontaneros" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Plombiers | Robi AI", en: "Invoicing Software for Plumbers | Robi AI", es: "Software de Facturación para Fontaneros | Robi AI" },
    description: { fr: "Créez vos devis et factures de plomberie en 30 secondes avec l'IA.", en: "Create your plumbing quotes and invoices in 30 seconds with AI.", es: "Crea tus presupuestos y facturas de fontanería en 30 segundos con IA." },
    keywords: ["facturation plombier", "devis plomberie", "logiciel plombier"],
    heroTitle: { fr: "Facturez vos interventions de plomberie en 30 secondes", en: "Invoice your plumbing jobs in 30 seconds", es: "Factura tus trabajos de fontanería en 30 segundos" },
    painPoints: [
      { fr: "Paperasse après chaque intervention", en: "Paperwork after every job", es: "Papeleo después de cada trabajo" },
      { fr: "Oubli de facturer des pièces", en: "Forgetting to bill for parts", es: "Olvido de facturar piezas" },
      { fr: "Relances clients chronophages", en: "Time-consuming client follow-ups", es: "Seguimiento de clientes que consume tiempo" },
    ],
    features: [
      { fr: "Catalogue pièces détachées", en: "Spare parts catalog", es: "Catálogo de repuestos" },
      { fr: "Calcul auto main d'œuvre", en: "Auto labor calculation", es: "Cálculo automático de mano de obra" },
      { fr: "Photos intervention", en: "Job site photos", es: "Fotos de intervención" },
    ],
  },
  {
    slug: "electricien",
    name: { fr: "Électriciens", en: "Electricians", es: "Electricistas" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Électriciens | Robi AI", en: "Invoicing Software for Electricians | Robi AI", es: "Software de Facturación para Electricistas | Robi AI" },
    description: { fr: "Facturez vos travaux électriques instantanément.", en: "Invoice your electrical work instantly.", es: "Factura tus trabajos eléctricos al instante." },
    keywords: ["facturation électricien", "devis électricité"],
    heroTitle: { fr: "Devis électriques conformes en quelques clics", en: "Compliant electrical quotes in a few clicks", es: "Presupuestos eléctricos conformes en pocos clics" },
    painPoints: [
      { fr: "Normes complexes à respecter", en: "Complex standards to follow", es: "Normas complejas a cumplir" },
      { fr: "Suivi des chantiers difficile", en: "Difficult site tracking", es: "Seguimiento de obras difícil" },
      { fr: "Facturation fin de mois", en: "End-of-month invoicing", es: "Facturación a fin de mes" },
    ],
    features: [
      { fr: "Templates conformes NF C 15-100", en: "NF C 15-100 compliant templates", es: "Plantillas conformes NF C 15-100" },
      { fr: "Suivi multi-chantiers", en: "Multi-site tracking", es: "Seguimiento multi-obras" },
      { fr: "Calcul automatique TVA", en: "Automatic VAT calculation", es: "Cálculo automático de IVA" },
    ],
  },
  {
    slug: "macon",
    name: { fr: "Maçons", en: "Masons", es: "Albañiles" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Maçons | Robi AI", en: "Invoicing Software for Masons | Robi AI", es: "Software de Facturación para Albañiles | Robi AI" },
    description: { fr: "Facturez vos chantiers de maçonnerie facilement.", en: "Invoice your masonry projects easily.", es: "Factura tus proyectos de albañilería fácilmente." },
    keywords: ["facturation maçon", "devis maçonnerie"],
    heroTitle: { fr: "Gérez vos chantiers de maçonnerie sans paperasse", en: "Manage your masonry projects without paperwork", es: "Gestiona tus proyectos de albañilería sin papeleo" },
    painPoints: [
      { fr: "Chantiers multiples à gérer", en: "Multiple sites to manage", es: "Múltiples obras que gestionar" },
      { fr: "Calcul des matériaux", en: "Material calculations", es: "Cálculo de materiales" },
      { fr: "Acomptes et situations", en: "Deposits and progress billing", es: "Anticipos y certificaciones" },
    ],
    features: [
      { fr: "Devis par lots", en: "Batch quotes", es: "Presupuestos por lotes" },
      { fr: "Calcul matériaux", en: "Material calculation", es: "Cálculo de materiales" },
      { fr: "Situations de travaux", en: "Progress billing", es: "Certificaciones de obra" },
    ],
  },
  {
    slug: "peintre",
    name: { fr: "Peintres en bâtiment", en: "House Painters", es: "Pintores de edificios" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Peintres | Robi AI", en: "Invoicing Software for Painters | Robi AI", es: "Software de Facturación para Pintores | Robi AI" },
    description: { fr: "Créez des devis de peinture en quelques clics.", en: "Create painting quotes in a few clicks.", es: "Crea presupuestos de pintura en pocos clics." },
    keywords: ["facturation peintre", "devis peinture"],
    heroTitle: { fr: "Devis peinture calculés automatiquement", en: "Auto-calculated painting quotes", es: "Presupuestos de pintura calculados automáticamente" },
    painPoints: [
      { fr: "Calcul des surfaces fastidieux", en: "Tedious surface calculations", es: "Cálculo de superficies tedioso" },
      { fr: "Estimation fournitures", en: "Supply estimation", es: "Estimación de suministros" },
      { fr: "Concurrence sur les prix", en: "Price competition", es: "Competencia de precios" },
    ],
    features: [
      { fr: "Calcul auto surfaces", en: "Auto surface calculation", es: "Cálculo automático de superficies" },
      { fr: "Catalogue peintures", en: "Paint catalog", es: "Catálogo de pinturas" },
      { fr: "Comparatif fournisseurs", en: "Supplier comparison", es: "Comparativa de proveedores" },
    ],
  },
  {
    slug: "menuisier",
    name: { fr: "Menuisiers", en: "Carpenters", es: "Carpinteros" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Menuisiers | Robi AI", en: "Invoicing Software for Carpenters | Robi AI", es: "Software de Facturación para Carpinteros | Robi AI" },
    description: { fr: "Facturez vos travaux de menuiserie et pose.", en: "Invoice your carpentry and installation work.", es: "Factura tus trabajos de carpintería e instalación." },
    keywords: ["facturation menuisier", "devis menuiserie"],
    heroTitle: { fr: "Devis menuiserie sur-mesure en minutes", en: "Custom carpentry quotes in minutes", es: "Presupuestos de carpintería a medida en minutos" },
    painPoints: [
      { fr: "Projets sur-mesure complexes", en: "Complex custom projects", es: "Proyectos a medida complejos" },
      { fr: "Délais de fabrication", en: "Manufacturing delays", es: "Plazos de fabricación" },
      { fr: "Commandes fournisseurs", en: "Supplier orders", es: "Pedidos a proveedores" },
    ],
    features: [
      { fr: "Configurateur sur-mesure", en: "Custom configurator", es: "Configurador a medida" },
      { fr: "Suivi fabrication", en: "Manufacturing tracking", es: "Seguimiento de fabricación" },
      { fr: "Bon de commande auto", en: "Auto purchase orders", es: "Pedidos automáticos" },
    ],
  },
  {
    slug: "chauffagiste",
    name: { fr: "Chauffagistes", en: "Heating Engineers", es: "Calefactores" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Chauffagistes | Robi AI", en: "Invoicing Software for Heating Engineers | Robi AI", es: "Software de Facturación para Calefactores | Robi AI" },
    description: { fr: "Gérez vos installations et dépannages de chauffage.", en: "Manage your heating installations and repairs.", es: "Gestiona tus instalaciones y reparaciones de calefacción." },
    keywords: ["facturation chauffagiste", "devis chauffage"],
    heroTitle: { fr: "Facturez vos interventions chauffage instantanément", en: "Invoice your heating jobs instantly", es: "Factura tus trabajos de calefacción al instante" },
    painPoints: [
      { fr: "Contrats d'entretien annuels", en: "Annual maintenance contracts", es: "Contratos de mantenimiento anuales" },
      { fr: "Pièces détachées à facturer", en: "Spare parts to bill", es: "Repuestos que facturar" },
      { fr: "Urgences à gérer", en: "Emergencies to handle", es: "Urgencias que gestionar" },
    ],
    features: [
      { fr: "Contrats récurrents", en: "Recurring contracts", es: "Contratos recurrentes" },
      { fr: "Stock pièces", en: "Parts inventory", es: "Stock de repuestos" },
      { fr: "Planning interventions", en: "Job scheduling", es: "Planificación de intervenciones" },
    ],
  },
  {
    slug: "serrurier",
    name: { fr: "Serruriers", en: "Locksmiths", es: "Cerrajeros" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Serruriers | Robi AI", en: "Invoicing Software for Locksmiths | Robi AI", es: "Software de Facturación para Cerrajeros | Robi AI" },
    description: { fr: "Facturez vos interventions de serrurerie sur place.", en: "Invoice your locksmith jobs on-site.", es: "Factura tus trabajos de cerrajería en el lugar." },
    keywords: ["facturation serrurier", "devis serrurerie"],
    heroTitle: { fr: "Facturez sur place après chaque intervention", en: "Invoice on-site after every job", es: "Factura en el lugar después de cada trabajo" },
    painPoints: [
      { fr: "Interventions urgentes", en: "Emergency calls", es: "Intervenciones urgentes" },
      { fr: "Devis sur place", en: "On-site quotes", es: "Presupuestos en el lugar" },
      { fr: "Encaissement immédiat", en: "Immediate payment collection", es: "Cobro inmediato" },
    ],
    features: [
      { fr: "Devis mobile express", en: "Express mobile quotes", es: "Presupuestos móviles express" },
      { fr: "Catalogue serrures", en: "Lock catalog", es: "Catálogo de cerraduras" },
      { fr: "Paiement CB sur place", en: "On-site card payment", es: "Pago con tarjeta en el lugar" },
    ],
  },
  {
    slug: "carreleur",
    name: { fr: "Carreleurs", en: "Tilers", es: "Alicatadores" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Carreleurs | Robi AI", en: "Invoicing Software for Tilers | Robi AI", es: "Software de Facturación para Alicatadores | Robi AI" },
    description: { fr: "Créez des devis carrelage précis.", en: "Create precise tiling quotes.", es: "Crea presupuestos de alicatado precisos." },
    keywords: ["facturation carreleur", "devis carrelage"],
    heroTitle: { fr: "Devis carrelage calculés au m² près", en: "Tiling quotes calculated to the m²", es: "Presupuestos de alicatado calculados al m²" },
    painPoints: [
      { fr: "Calcul surfaces complexes", en: "Complex surface calculations", es: "Cálculo de superficies complejas" },
      { fr: "Chutes à prévoir", en: "Waste to plan for", es: "Desperdicios a prever" },
      { fr: "Fournitures multiples", en: "Multiple supplies", es: "Múltiples suministros" },
    ],
    features: [
      { fr: "Calcul auto m²", en: "Auto m² calculation", es: "Cálculo automático de m²" },
      { fr: "Gestion chutes", en: "Waste management", es: "Gestión de desperdicios" },
      { fr: "Catalogue carreaux", en: "Tile catalog", es: "Catálogo de azulejos" },
    ],
  },
  {
    slug: "couvreur",
    name: { fr: "Couvreurs", en: "Roofers", es: "Techadores" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Couvreurs | Robi AI", en: "Invoicing Software for Roofers | Robi AI", es: "Software de Facturación para Techadores | Robi AI" },
    description: { fr: "Gérez vos chantiers de toiture.", en: "Manage your roofing projects.", es: "Gestiona tus proyectos de tejados." },
    keywords: ["facturation couvreur", "devis toiture"],
    heroTitle: { fr: "Devis toiture professionnels en minutes", en: "Professional roofing quotes in minutes", es: "Presupuestos de tejados profesionales en minutos" },
    painPoints: [
      { fr: "Accès chantier difficile", en: "Difficult site access", es: "Acceso difícil a obra" },
      { fr: "Météo imprévisible", en: "Unpredictable weather", es: "Clima impredecible" },
      { fr: "Matériaux lourds", en: "Heavy materials", es: "Materiales pesados" },
    ],
    features: [
      { fr: "Photos drone", en: "Drone photos", es: "Fotos con dron" },
      { fr: "Devis par zone", en: "Zone-based quotes", es: "Presupuestos por zona" },
      { fr: "Planning météo", en: "Weather planning", es: "Planificación meteorológica" },
    ],
  },
  {
    slug: "architecte",
    name: { fr: "Architectes", en: "Architects", es: "Arquitectos" },
    category: "btp",
    title: { fr: "Logiciel de Facturation pour Architectes | Robi AI", en: "Invoicing Software for Architects | Robi AI", es: "Software de Facturación para Arquitectos | Robi AI" },
    description: { fr: "Gérez vos honoraires d'architecture.", en: "Manage your architecture fees.", es: "Gestiona tus honorarios de arquitectura." },
    keywords: ["facturation architecte", "honoraires architecture"],
    heroTitle: { fr: "Gérez vos honoraires d'architecte simplement", en: "Manage your architect fees simply", es: "Gestiona tus honorarios de arquitecto fácilmente" },
    painPoints: [
      { fr: "Phases multiples", en: "Multiple phases", es: "Múltiples fases" },
      { fr: "Avenants fréquents", en: "Frequent amendments", es: "Modificaciones frecuentes" },
      { fr: "Suivi chantier long", en: "Long project tracking", es: "Seguimiento largo de obras" },
    ],
    features: [
      { fr: "Facturation par phases", en: "Phase-based billing", es: "Facturación por fases" },
      { fr: "Gestion avenants", en: "Amendment management", es: "Gestión de modificaciones" },
      { fr: "Suivi % avancement", en: "% progress tracking", es: "Seguimiento % avance" },
    ],
  },
  // ==================== TECH & DIGITAL ====================
  {
    slug: "developpeur",
    name: { fr: "Développeurs", en: "Developers", es: "Desarrolladores" },
    category: "tech",
    title: { fr: "Logiciel de Facturation pour Développeurs | Robi AI", en: "Invoicing Software for Developers | Robi AI", es: "Software de Facturación para Desarrolladores | Robi AI" },
    description: { fr: "Facturez vos projets de développement.", en: "Invoice your development projects.", es: "Factura tus proyectos de desarrollo." },
    keywords: ["facturation développeur", "facturation freelance dev"],
    heroTitle: { fr: "Facturez vos projets dev comme un pro", en: "Invoice your dev projects like a pro", es: "Factura tus proyectos de desarrollo como un profesional" },
    painPoints: [
      { fr: "Estimation des projets", en: "Project estimation", es: "Estimación de proyectos" },
      { fr: "Facturation des sprints", en: "Sprint billing", es: "Facturación de sprints" },
      { fr: "Maintenance récurrente", en: "Recurring maintenance", es: "Mantenimiento recurrente" },
    ],
    features: [
      { fr: "Facturation TJM/sprint", en: "Day rate/sprint billing", es: "Facturación tarifa diaria/sprint" },
      { fr: "Contrats maintenance", en: "Maintenance contracts", es: "Contratos de mantenimiento" },
      { fr: "Timetracking Git", en: "Git time tracking", es: "Seguimiento de tiempo Git" },
    ],
  },
  {
    slug: "designer-ux",
    name: { fr: "Designers UX/UI", en: "UX/UI Designers", es: "Diseñadores UX/UI" },
    category: "tech",
    title: { fr: "Logiciel de Facturation pour Designers UX/UI | Robi AI", en: "Invoicing Software for UX/UI Designers | Robi AI", es: "Software de Facturación para Diseñadores UX/UI | Robi AI" },
    description: { fr: "Facturez vos projets de design digital.", en: "Invoice your digital design projects.", es: "Factura tus proyectos de diseño digital." },
    keywords: ["facturation designer ux", "devis ui design"],
    heroTitle: { fr: "Facturez vos projets UX/UI professionnellement", en: "Invoice your UX/UI projects professionally", es: "Factura tus proyectos UX/UI profesionalmente" },
    painPoints: [
      { fr: "Itérations multiples", en: "Multiple iterations", es: "Múltiples iteraciones" },
      { fr: "Livrables à définir", en: "Deliverables to define", es: "Entregables por definir" },
      { fr: "Feedback clients", en: "Client feedback", es: "Feedback de clientes" },
    ],
    features: [
      { fr: "Gestion itérations", en: "Iteration management", es: "Gestión de iteraciones" },
      { fr: "Livrables définis", en: "Defined deliverables", es: "Entregables definidos" },
      { fr: "Feedback intégré", en: "Built-in feedback", es: "Feedback integrado" },
    ],
  },
  {
    slug: "data-scientist",
    name: { fr: "Data Scientists", en: "Data Scientists", es: "Data Scientists" },
    category: "tech",
    title: { fr: "Logiciel de Facturation pour Data Scientists | Robi AI", en: "Invoicing Software for Data Scientists | Robi AI", es: "Software de Facturación para Data Scientists | Robi AI" },
    description: { fr: "Facturez vos missions data.", en: "Invoice your data projects.", es: "Factura tus proyectos de datos." },
    keywords: ["facturation data scientist", "freelance data"],
    heroTitle: { fr: "Facturez vos missions data en toute simplicité", en: "Invoice your data projects with ease", es: "Factura tus proyectos de datos con facilidad" },
    painPoints: [
      { fr: "Projets longs", en: "Long projects", es: "Proyectos largos" },
      { fr: "Livrables techniques", en: "Technical deliverables", es: "Entregables técnicos" },
      { fr: "Communication client", en: "Client communication", es: "Comunicación con clientes" },
    ],
    features: [
      { fr: "Jalons projet", en: "Project milestones", es: "Hitos del proyecto" },
      { fr: "Rapports auto", en: "Auto reports", es: "Informes automáticos" },
      { fr: "Facturation étapes", en: "Stage billing", es: "Facturación por etapas" },
    ],
  },
  {
    slug: "devops",
    name: { fr: "DevOps & SRE", en: "DevOps & SRE", es: "DevOps & SRE" },
    category: "tech",
    title: { fr: "Logiciel de Facturation pour DevOps | Robi AI", en: "Invoicing Software for DevOps | Robi AI", es: "Software de Facturación para DevOps | Robi AI" },
    description: { fr: "Facturez vos missions DevOps et infrastructure.", en: "Invoice your DevOps and infrastructure projects.", es: "Factura tus proyectos DevOps e infraestructura." },
    keywords: ["facturation devops", "freelance devops"],
    heroTitle: { fr: "Gérez vos missions DevOps efficacement", en: "Manage your DevOps projects efficiently", es: "Gestiona tus proyectos DevOps eficientemente" },
    painPoints: [
      { fr: "Interventions urgentes", en: "Emergency interventions", es: "Intervenciones urgentes" },
      { fr: "Support continu", en: "Continuous support", es: "Soporte continuo" },
      { fr: "Projets complexes", en: "Complex projects", es: "Proyectos complejos" },
    ],
    features: [
      { fr: "Astreintes facturables", en: "Billable on-call", es: "Guardias facturables" },
      { fr: "Support récurrent", en: "Recurring support", es: "Soporte recurrente" },
      { fr: "Rapports SLA", en: "SLA reports", es: "Informes SLA" },
    ],
  },
  {
    slug: "product-manager",
    name: { fr: "Product Managers", en: "Product Managers", es: "Product Managers" },
    category: "tech",
    title: { fr: "Logiciel de Facturation pour Product Managers | Robi AI", en: "Invoicing Software for Product Managers | Robi AI", es: "Software de Facturación para Product Managers | Robi AI" },
    description: { fr: "Facturez vos missions de product management.", en: "Invoice your product management projects.", es: "Factura tus proyectos de product management." },
    keywords: ["facturation product manager", "freelance pm"],
    heroTitle: { fr: "Facturez vos missions produit simplement", en: "Invoice your product work simply", es: "Factura tu trabajo de producto fácilmente" },
    painPoints: [
      { fr: "Missions longues", en: "Long engagements", es: "Proyectos largos" },
      { fr: "Périmètre évolutif", en: "Evolving scope", es: "Alcance cambiante" },
      { fr: "Multi-stakeholders", en: "Multiple stakeholders", es: "Múltiples stakeholders" },
    ],
    features: [
      { fr: "Facturation mensuelle", en: "Monthly billing", es: "Facturación mensual" },
      { fr: "Rapports d'avancement", en: "Progress reports", es: "Informes de avance" },
      { fr: "Timetracking", en: "Time tracking", es: "Seguimiento de tiempo" },
    ],
  },
  // ==================== CRÉATIFS ====================
  {
    slug: "graphiste",
    name: { fr: "Graphistes & Designers", en: "Graphic Designers", es: "Diseñadores Gráficos" },
    category: "creatif",
    title: { fr: "Logiciel de Facturation pour Graphistes | Robi AI", en: "Invoicing Software for Graphic Designers | Robi AI", es: "Software de Facturación para Diseñadores Gráficos | Robi AI" },
    description: { fr: "Créez des devis créatifs et facturez vos projets design.", en: "Create creative quotes and invoice your design projects.", es: "Crea presupuestos creativos y factura tus proyectos de diseño." },
    keywords: ["facturation graphiste", "devis design"],
    heroTitle: { fr: "Facturez vos créations graphiques professionnellement", en: "Invoice your graphic creations professionally", es: "Factura tus creaciones gráficas profesionalmente" },
    painPoints: [
      { fr: "Révisions non facturées", en: "Unbilled revisions", es: "Revisiones no facturadas" },
      { fr: "Droits d'auteur oubliés", en: "Forgotten copyrights", es: "Derechos de autor olvidados" },
      { fr: "Suivi des projets créatifs", en: "Creative project tracking", es: "Seguimiento de proyectos creativos" },
    ],
    features: [
      { fr: "Gestion des révisions", en: "Revision management", es: "Gestión de revisiones" },
      { fr: "Cession de droits", en: "Rights transfer", es: "Cesión de derechos" },
      { fr: "Portfolio clients", en: "Client portfolio", es: "Portfolio de clientes" },
    ],
  },
  {
    slug: "photographe",
    name: { fr: "Photographes", en: "Photographers", es: "Fotógrafos" },
    category: "creatif",
    title: { fr: "Logiciel de Facturation pour Photographes | Robi AI", en: "Invoicing Software for Photographers | Robi AI", es: "Software de Facturación para Fotógrafos | Robi AI" },
    description: { fr: "Facturez vos shootings et prestations photo.", en: "Invoice your photo shoots and services.", es: "Factura tus sesiones y servicios fotográficos." },
    keywords: ["facturation photographe", "devis photographie"],
    heroTitle: { fr: "Gérez vos prestations photo de A à Z", en: "Manage your photo services from A to Z", es: "Gestiona tus servicios fotográficos de la A a la Z" },
    painPoints: [
      { fr: "Packages complexes à expliquer", en: "Complex packages to explain", es: "Paquetes complejos de explicar" },
      { fr: "Droits d'image mal gérés", en: "Poorly managed image rights", es: "Derechos de imagen mal gestionados" },
      { fr: "Retouches non facturées", en: "Unbilled retouching", es: "Retoques no facturados" },
    ],
    features: [
      { fr: "Packages personnalisables", en: "Customizable packages", es: "Paquetes personalizables" },
      { fr: "Gestion droits d'image", en: "Image rights management", es: "Gestión de derechos de imagen" },
      { fr: "Galeries clients", en: "Client galleries", es: "Galerías de clientes" },
    ],
  },
  {
    slug: "videaste",
    name: { fr: "Vidéastes", en: "Videographers", es: "Videógrafos" },
    category: "creatif",
    title: { fr: "Logiciel de Facturation pour Vidéastes | Robi AI", en: "Invoicing Software for Videographers | Robi AI", es: "Software de Facturación para Videógrafos | Robi AI" },
    description: { fr: "Facturez vos productions vidéo.", en: "Invoice your video productions.", es: "Factura tus producciones de video." },
    keywords: ["facturation vidéaste", "devis vidéo"],
    heroTitle: { fr: "Facturez vos productions vidéo simplement", en: "Invoice your video productions simply", es: "Factura tus producciones de video fácilmente" },
    painPoints: [
      { fr: "Projets multi-étapes", en: "Multi-stage projects", es: "Proyectos multi-etapa" },
      { fr: "Révisions montage", en: "Editing revisions", es: "Revisiones de edición" },
      { fr: "Droits d'exploitation", en: "Usage rights", es: "Derechos de explotación" },
    ],
    features: [
      { fr: "Étapes production", en: "Production stages", es: "Etapas de producción" },
      { fr: "Versions montage", en: "Edit versions", es: "Versiones de edición" },
      { fr: "Cession droits", en: "Rights transfer", es: "Cesión de derechos" },
    ],
  },
  {
    slug: "illustrateur",
    name: { fr: "Illustrateurs", en: "Illustrators", es: "Ilustradores" },
    category: "creatif",
    title: { fr: "Logiciel de Facturation pour Illustrateurs | Robi AI", en: "Invoicing Software for Illustrators | Robi AI", es: "Software de Facturación para Ilustradores | Robi AI" },
    description: { fr: "Facturez vos illustrations et créations.", en: "Invoice your illustrations and creations.", es: "Factura tus ilustraciones y creaciones." },
    keywords: ["facturation illustrateur", "devis illustration"],
    heroTitle: { fr: "Gérez vos commandes d'illustrations facilement", en: "Manage your illustration orders easily", es: "Gestiona tus encargos de ilustración fácilmente" },
    painPoints: [
      { fr: "Droits à négocier", en: "Rights to negotiate", es: "Derechos a negociar" },
      { fr: "Révisions illimitées", en: "Unlimited revisions", es: "Revisiones ilimitadas" },
      { fr: "Usage commercial", en: "Commercial usage", es: "Uso comercial" },
    ],
    features: [
      { fr: "Licences configurables", en: "Configurable licenses", es: "Licencias configurables" },
      { fr: "Limite révisions", en: "Revision limits", es: "Límite de revisiones" },
      { fr: "Catalogue œuvres", en: "Works catalog", es: "Catálogo de obras" },
    ],
  },
  {
    slug: "redacteur-web",
    name: { fr: "Rédacteurs Web", en: "Web Writers", es: "Redactores Web" },
    category: "creatif",
    title: { fr: "Logiciel de Facturation pour Rédacteurs Web | Robi AI", en: "Invoicing Software for Web Writers | Robi AI", es: "Software de Facturación para Redactores Web | Robi AI" },
    description: { fr: "Facturez vos contenus rédactionnels.", en: "Invoice your written content.", es: "Factura tu contenido redactado." },
    keywords: ["facturation rédacteur web", "devis rédaction"],
    heroTitle: { fr: "Facturez vos contenus au mot ou au forfait", en: "Invoice your content by word or flat rate", es: "Factura tu contenido por palabra o tarifa plana" },
    painPoints: [
      { fr: "Tarification variable", en: "Variable pricing", es: "Tarificación variable" },
      { fr: "Révisions clients", en: "Client revisions", es: "Revisiones de clientes" },
      { fr: "Délais serrés", en: "Tight deadlines", es: "Plazos ajustados" },
    ],
    features: [
      { fr: "Facturation au mot", en: "Per-word billing", es: "Facturación por palabra" },
      { fr: "Compteur automatique", en: "Auto counter", es: "Contador automático" },
      { fr: "Révisions limitées", en: "Limited revisions", es: "Revisiones limitadas" },
    ],
  },
  {
    slug: "community-manager",
    name: { fr: "Community Managers", en: "Community Managers", es: "Community Managers" },
    category: "creatif",
    title: { fr: "Logiciel de Facturation pour Community Managers | Robi AI", en: "Invoicing Software for Community Managers | Robi AI", es: "Software de Facturación para Community Managers | Robi AI" },
    description: { fr: "Facturez vos prestations social media.", en: "Invoice your social media services.", es: "Factura tus servicios de redes sociales." },
    keywords: ["facturation community manager", "devis social media"],
    heroTitle: { fr: "Facturez vos prestations social media", en: "Invoice your social media services", es: "Factura tus servicios de redes sociales" },
    painPoints: [
      { fr: "Forfaits mensuels", en: "Monthly packages", es: "Paquetes mensuales" },
      { fr: "Prestations additionnelles", en: "Additional services", es: "Servicios adicionales" },
      { fr: "Reporting client", en: "Client reporting", es: "Informes para clientes" },
    ],
    features: [
      { fr: "Abonnements mensuels", en: "Monthly subscriptions", es: "Suscripciones mensuales" },
      { fr: "Extras facturables", en: "Billable extras", es: "Extras facturables" },
      { fr: "Rapports auto", en: "Auto reports", es: "Informes automáticos" },
    ],
  },
  // ==================== ÉVÉNEMENTIEL ====================
  {
    slug: "traiteur",
    name: { fr: "Traiteurs", en: "Caterers", es: "Catering" },
    category: "evenementiel",
    title: { fr: "Logiciel de Facturation pour Traiteurs | Robi AI", en: "Invoicing Software for Caterers | Robi AI", es: "Software de Facturación para Catering | Robi AI" },
    description: { fr: "Gérez vos devis et factures de traiteur.", en: "Manage your catering quotes and invoices.", es: "Gestiona tus presupuestos y facturas de catering." },
    keywords: ["facturation traiteur", "devis traiteur"],
    heroTitle: { fr: "Devis traiteur personnalisés en minutes", en: "Custom catering quotes in minutes", es: "Presupuestos de catering personalizados en minutos" },
    painPoints: [
      { fr: "Menus personnalisés", en: "Custom menus", es: "Menús personalizados" },
      { fr: "Nombre convives variable", en: "Variable guest count", es: "Número de invitados variable" },
      { fr: "Logistique complexe", en: "Complex logistics", es: "Logística compleja" },
    ],
    features: [
      { fr: "Configurateur menus", en: "Menu configurator", es: "Configurador de menús" },
      { fr: "Prix par personne", en: "Price per person", es: "Precio por persona" },
      { fr: "Options extras", en: "Extra options", es: "Opciones extras" },
    ],
  },
  {
    slug: "dj",
    name: { fr: "DJs & Animateurs", en: "DJs & Entertainers", es: "DJs y Animadores" },
    category: "evenementiel",
    title: { fr: "Logiciel de Facturation pour DJs | Robi AI", en: "Invoicing Software for DJs | Robi AI", es: "Software de Facturación para DJs | Robi AI" },
    description: { fr: "Facturez vos prestations DJ et animation.", en: "Invoice your DJ and entertainment services.", es: "Factura tus servicios de DJ y animación." },
    keywords: ["facturation dj", "devis dj mariage"],
    heroTitle: { fr: "Facturez vos soirées en quelques clics", en: "Invoice your events in a few clicks", es: "Factura tus eventos en pocos clics" },
    painPoints: [
      { fr: "Tarifs variables", en: "Variable rates", es: "Tarifas variables" },
      { fr: "Options matériel", en: "Equipment options", es: "Opciones de equipo" },
      { fr: "Acomptes événements", en: "Event deposits", es: "Anticipos de eventos" },
    ],
    features: [
      { fr: "Packages soirées", en: "Event packages", es: "Paquetes de eventos" },
      { fr: "Location matériel", en: "Equipment rental", es: "Alquiler de equipo" },
      { fr: "Acomptes 30%", en: "30% deposits", es: "Anticipos del 30%" },
    ],
  },
  {
    slug: "wedding-planner",
    name: { fr: "Wedding Planners", en: "Wedding Planners", es: "Wedding Planners" },
    category: "evenementiel",
    title: { fr: "Logiciel de Facturation pour Wedding Planners | Robi AI", en: "Invoicing Software for Wedding Planners | Robi AI", es: "Software de Facturación para Wedding Planners | Robi AI" },
    description: { fr: "Gérez vos mariages de A à Z.", en: "Manage your weddings from A to Z.", es: "Gestiona tus bodas de la A a la Z." },
    keywords: ["facturation wedding planner", "devis mariage"],
    heroTitle: { fr: "Gérez vos mariages sans stress administratif", en: "Manage your weddings without admin stress", es: "Gestiona tus bodas sin estrés administrativo" },
    painPoints: [
      { fr: "Budget global à gérer", en: "Overall budget to manage", es: "Presupuesto global que gestionar" },
      { fr: "Multiples prestataires", en: "Multiple vendors", es: "Múltiples proveedores" },
      { fr: "Paiements échelonnés", en: "Installment payments", es: "Pagos fraccionados" },
    ],
    features: [
      { fr: "Budget tracking", en: "Budget tracking", es: "Seguimiento de presupuesto" },
      { fr: "Carnet prestataires", en: "Vendor directory", es: "Directorio de proveedores" },
      { fr: "Échéancier paiements", en: "Payment schedule", es: "Calendario de pagos" },
    ],
  },
  {
    slug: "decorateur-evenementiel",
    name: { fr: "Décorateurs Événementiels", en: "Event Decorators", es: "Decoradores de Eventos" },
    category: "evenementiel",
    title: { fr: "Logiciel de Facturation pour Décorateurs | Robi AI", en: "Invoicing Software for Event Decorators | Robi AI", es: "Software de Facturación para Decoradores de Eventos | Robi AI" },
    description: { fr: "Facturez vos prestations de décoration événementielle.", en: "Invoice your event decoration services.", es: "Factura tus servicios de decoración de eventos." },
    keywords: ["facturation décorateur", "devis décoration événement"],
    heroTitle: { fr: "Devis décoration événementielle sur-mesure", en: "Custom event decoration quotes", es: "Presupuestos de decoración de eventos a medida" },
    painPoints: [
      { fr: "Stock à gérer", en: "Inventory to manage", es: "Stock que gestionar" },
      { fr: "Installation/démontage", en: "Setup/teardown", es: "Montaje/desmontaje" },
      { fr: "Location matériel", en: "Equipment rental", es: "Alquiler de material" },
    ],
    features: [
      { fr: "Gestion stock", en: "Inventory management", es: "Gestión de stock" },
      { fr: "Planning équipes", en: "Team scheduling", es: "Planificación de equipos" },
      { fr: "Location tracking", en: "Rental tracking", es: "Seguimiento de alquileres" },
    ],
  },
  {
    slug: "photographe-mariage",
    name: { fr: "Photographes de Mariage", en: "Wedding Photographers", es: "Fotógrafos de Bodas" },
    category: "evenementiel",
    title: { fr: "Logiciel de Facturation pour Photographes de Mariage | Robi AI", en: "Invoicing Software for Wedding Photographers | Robi AI", es: "Software de Facturación para Fotógrafos de Bodas | Robi AI" },
    description: { fr: "Gérez vos reportages mariage.", en: "Manage your wedding photography.", es: "Gestiona tus reportajes de boda." },
    keywords: ["facturation photographe mariage", "devis photo mariage"],
    heroTitle: { fr: "Facturez vos mariages professionnellement", en: "Invoice your weddings professionally", es: "Factura tus bodas profesionalmente" },
    painPoints: [
      { fr: "Packages complexes", en: "Complex packages", es: "Paquetes complejos" },
      { fr: "Albums à produire", en: "Albums to produce", es: "Álbumes que producir" },
      { fr: "Délais livraison", en: "Delivery timelines", es: "Plazos de entrega" },
    ],
    features: [
      { fr: "Packages tout-en-un", en: "All-in-one packages", es: "Paquetes todo en uno" },
      { fr: "Suivi albums", en: "Album tracking", es: "Seguimiento de álbumes" },
      { fr: "Galeries livraison", en: "Delivery galleries", es: "Galerías de entrega" },
    ],
  },
  // ==================== CONSEIL & SERVICES ====================
  {
    slug: "consultant",
    name: { fr: "Consultants", en: "Consultants", es: "Consultores" },
    category: "conseil",
    title: { fr: "Logiciel de Facturation pour Consultants | Robi AI", en: "Invoicing Software for Consultants | Robi AI", es: "Software de Facturación para Consultores | Robi AI" },
    description: { fr: "Gérez vos missions de consulting avec l'IA.", en: "Manage your consulting projects with AI.", es: "Gestiona tus proyectos de consultoría con IA." },
    keywords: ["facturation consultant", "timetracking consultant"],
    heroTitle: { fr: "Facturez vos heures de consulting sans effort", en: "Invoice your consulting hours effortlessly", es: "Factura tus horas de consultoría sin esfuerzo" },
    painPoints: [
      { fr: "Suivi du temps passé", en: "Time tracking", es: "Seguimiento de tiempo" },
      { fr: "Facturation multi-clients", en: "Multi-client billing", es: "Facturación multi-cliente" },
      { fr: "Justification des honoraires", en: "Fee justification", es: "Justificación de honorarios" },
    ],
    features: [
      { fr: "Timetracking intégré", en: "Built-in time tracking", es: "Seguimiento de tiempo integrado" },
      { fr: "Facturation horaire/forfait", en: "Hourly/flat rate billing", es: "Facturación por hora/forfait" },
      { fr: "Rapports d'activité", en: "Activity reports", es: "Informes de actividad" },
    ],
  },
  {
    slug: "coach",
    name: { fr: "Coachs & Formateurs", en: "Coaches & Trainers", es: "Coaches y Formadores" },
    category: "conseil",
    title: { fr: "Logiciel de Facturation pour Coachs | Robi AI", en: "Invoicing Software for Coaches | Robi AI", es: "Software de Facturación para Coaches | Robi AI" },
    description: { fr: "Facturez vos séances de coaching et formations.", en: "Invoice your coaching sessions and training.", es: "Factura tus sesiones de coaching y formación." },
    keywords: ["facturation coach", "logiciel coaching"],
    heroTitle: { fr: "Automatisez la facturation de vos coachings", en: "Automate your coaching billing", es: "Automatiza la facturación de tus coachings" },
    painPoints: [
      { fr: "Gestion des packs séances", en: "Session pack management", es: "Gestión de packs de sesiones" },
      { fr: "Conventions de formation", en: "Training agreements", es: "Convenios de formación" },
      { fr: "Suivi des clients", en: "Client tracking", es: "Seguimiento de clientes" },
    ],
    features: [
      { fr: "Packs & abonnements", en: "Packs & subscriptions", es: "Packs y suscripciones" },
      { fr: "Conventions Qualiopi", en: "Qualiopi agreements", es: "Convenios Qualiopi" },
      { fr: "Rappels automatiques", en: "Auto reminders", es: "Recordatorios automáticos" },
    ],
  },
  {
    slug: "avocat",
    name: { fr: "Avocats", en: "Lawyers", es: "Abogados" },
    category: "conseil",
    title: { fr: "Logiciel de Facturation pour Avocats | Robi AI", en: "Invoicing Software for Lawyers | Robi AI", es: "Software de Facturación para Abogados | Robi AI" },
    description: { fr: "Facturez vos prestations juridiques.", en: "Invoice your legal services.", es: "Factura tus servicios legales." },
    keywords: ["facturation avocat", "logiciel avocat"],
    heroTitle: { fr: "Facturez vos honoraires en toute conformité", en: "Invoice your fees in full compliance", es: "Factura tus honorarios con total conformidad" },
    painPoints: [
      { fr: "Timetracking précis", en: "Precise time tracking", es: "Seguimiento de tiempo preciso" },
      { fr: "Provisions clients", en: "Client retainers", es: "Provisiones de clientes" },
      { fr: "Conformité Ordre", en: "Bar compliance", es: "Conformidad del Colegio" },
    ],
    features: [
      { fr: "Facturation horaire", en: "Hourly billing", es: "Facturación por hora" },
      { fr: "Gestion provisions", en: "Retainer management", es: "Gestión de provisiones" },
      { fr: "Notes de frais", en: "Expense reports", es: "Notas de gastos" },
    ],
  },
  {
    slug: "agent-immobilier",
    name: { fr: "Agents Immobiliers", en: "Real Estate Agents", es: "Agentes Inmobiliarios" },
    category: "conseil",
    title: { fr: "Logiciel de Facturation pour Agents Immobiliers | Robi AI", en: "Invoicing Software for Real Estate Agents | Robi AI", es: "Software de Facturación para Agentes Inmobiliarios | Robi AI" },
    description: { fr: "Gérez vos commissions immobilières.", en: "Manage your real estate commissions.", es: "Gestiona tus comisiones inmobiliarias." },
    keywords: ["facturation agent immobilier", "logiciel immobilier"],
    heroTitle: { fr: "Gérez vos commissions immobilières facilement", en: "Manage your real estate commissions easily", es: "Gestiona tus comisiones inmobiliarias fácilmente" },
    painPoints: [
      { fr: "Calcul commissions", en: "Commission calculations", es: "Cálculo de comisiones" },
      { fr: "Suivi des mandats", en: "Mandate tracking", es: "Seguimiento de mandatos" },
      { fr: "Partage honoraires", en: "Fee sharing", es: "Reparto de honorarios" },
    ],
    features: [
      { fr: "Calcul auto commissions", en: "Auto commission calculation", es: "Cálculo automático de comisiones" },
      { fr: "Gestion mandats", en: "Mandate management", es: "Gestión de mandatos" },
      { fr: "Split honoraires", en: "Fee splitting", es: "Reparto de honorarios" },
    ],
  },
  {
    slug: "expert-comptable",
    name: { fr: "Experts-Comptables", en: "Accountants", es: "Contables" },
    category: "conseil",
    title: { fr: "Logiciel de Facturation pour Experts-Comptables | Robi AI", en: "Invoicing Software for Accountants | Robi AI", es: "Software de Facturación para Contables | Robi AI" },
    description: { fr: "Facturez vos missions comptables.", en: "Invoice your accounting services.", es: "Factura tus servicios contables." },
    keywords: ["facturation expert comptable", "logiciel cabinet comptable"],
    heroTitle: { fr: "Gérez vos honoraires comptables efficacement", en: "Manage your accounting fees efficiently", es: "Gestiona tus honorarios contables eficientemente" },
    painPoints: [
      { fr: "Lettres de mission", en: "Engagement letters", es: "Cartas de encargo" },
      { fr: "Forfaits annuels", en: "Annual packages", es: "Paquetes anuales" },
      { fr: "Missions ponctuelles", en: "Ad-hoc assignments", es: "Misiones puntuales" },
    ],
    features: [
      { fr: "Lettres de mission auto", en: "Auto engagement letters", es: "Cartas de encargo automáticas" },
      { fr: "Facturation récurrente", en: "Recurring billing", es: "Facturación recurrente" },
      { fr: "Suivi dossiers", en: "Case tracking", es: "Seguimiento de expedientes" },
    ],
  },
  {
    slug: "traducteur",
    name: { fr: "Traducteurs", en: "Translators", es: "Traductores" },
    category: "conseil",
    title: { fr: "Logiciel de Facturation pour Traducteurs | Robi AI", en: "Invoicing Software for Translators | Robi AI", es: "Software de Facturación para Traductores | Robi AI" },
    description: { fr: "Facturez vos traductions au mot ou au feuillet.", en: "Invoice your translations by word or page.", es: "Factura tus traducciones por palabra o página." },
    keywords: ["facturation traducteur", "devis traduction"],
    heroTitle: { fr: "Facturez vos traductions professionnellement", en: "Invoice your translations professionally", es: "Factura tus traducciones profesionalmente" },
    painPoints: [
      { fr: "Comptage mots/feuillets", en: "Word/page counting", es: "Conteo de palabras/páginas" },
      { fr: "Combinaisons langues", en: "Language combinations", es: "Combinaciones de idiomas" },
      { fr: "Révisions natives", en: "Native revisions", es: "Revisiones nativas" },
    ],
    features: [
      { fr: "Compteur automatique", en: "Auto counter", es: "Contador automático" },
      { fr: "Tarifs par langue", en: "Per-language rates", es: "Tarifas por idioma" },
      { fr: "Gestion révisions", en: "Revision management", es: "Gestión de revisiones" },
    ],
  },
  // ==================== SANTÉ & BIEN-ÊTRE ====================
  {
    slug: "kinesitherapeute",
    name: { fr: "Kinésithérapeutes", en: "Physiotherapists", es: "Fisioterapeutas" },
    category: "sante",
    title: { fr: "Logiciel de Facturation pour Kinésithérapeutes | Robi AI", en: "Invoicing Software for Physiotherapists | Robi AI", es: "Software de Facturación para Fisioterapeutas | Robi AI" },
    description: { fr: "Facturez vos séances de kinésithérapie.", en: "Invoice your physiotherapy sessions.", es: "Factura tus sesiones de fisioterapia." },
    keywords: ["facturation kiné", "logiciel kinésithérapeute"],
    heroTitle: { fr: "Simplifiez votre facturation kiné", en: "Simplify your physio billing", es: "Simplifica tu facturación de fisioterapia" },
    painPoints: [
      { fr: "Télétransmission complexe", en: "Complex remote transmission", es: "Teletransmisión compleja" },
      { fr: "Tiers payant", en: "Third-party payment", es: "Pago por terceros" },
      { fr: "Suivi ordonnances", en: "Prescription tracking", es: "Seguimiento de recetas" },
    ],
    features: [
      { fr: "Télétransmission intégrée", en: "Built-in remote transmission", es: "Teletransmisión integrada" },
      { fr: "Tiers payant auto", en: "Auto third-party payment", es: "Pago por terceros automático" },
      { fr: "Dossier patient", en: "Patient file", es: "Expediente del paciente" },
    ],
  },
  {
    slug: "osteopathe",
    name: { fr: "Ostéopathes", en: "Osteopaths", es: "Osteópatas" },
    category: "sante",
    title: { fr: "Logiciel de Facturation pour Ostéopathes | Robi AI", en: "Invoicing Software for Osteopaths | Robi AI", es: "Software de Facturación para Osteópatas | Robi AI" },
    description: { fr: "Gérez votre cabinet d'ostéopathie.", en: "Manage your osteopathy practice.", es: "Gestiona tu consulta de osteopatía." },
    keywords: ["facturation ostéopathe", "logiciel ostéopathie"],
    heroTitle: { fr: "Gérez votre cabinet ostéo sans paperasse", en: "Manage your osteo practice without paperwork", es: "Gestiona tu consulta de osteopatía sin papeleo" },
    painPoints: [
      { fr: "Notes d'honoraires", en: "Fee notes", es: "Notas de honorarios" },
      { fr: "Suivi patients", en: "Patient tracking", es: "Seguimiento de pacientes" },
      { fr: "Agenda cabinet", en: "Practice schedule", es: "Agenda de consulta" },
    ],
    features: [
      { fr: "Factures conformes", en: "Compliant invoices", es: "Facturas conformes" },
      { fr: "Fiche patient", en: "Patient record", es: "Ficha del paciente" },
      { fr: "Agenda intégré", en: "Built-in calendar", es: "Agenda integrada" },
    ],
  },
  {
    slug: "psychologue",
    name: { fr: "Psychologues", en: "Psychologists", es: "Psicólogos" },
    category: "sante",
    title: { fr: "Logiciel de Facturation pour Psychologues | Robi AI", en: "Invoicing Software for Psychologists | Robi AI", es: "Software de Facturación para Psicólogos | Robi AI" },
    description: { fr: "Facturez vos consultations psychologiques.", en: "Invoice your psychological consultations.", es: "Factura tus consultas psicológicas." },
    keywords: ["facturation psychologue", "logiciel psychologue"],
    heroTitle: { fr: "Facturation confidentielle pour psychologues", en: "Confidential billing for psychologists", es: "Facturación confidencial para psicólogos" },
    painPoints: [
      { fr: "Confidentialité stricte", en: "Strict confidentiality", es: "Confidencialidad estricta" },
      { fr: "Annulations tardives", en: "Late cancellations", es: "Cancelaciones tardías" },
      { fr: "Suivi séances", en: "Session tracking", es: "Seguimiento de sesiones" },
    ],
    features: [
      { fr: "RGPD compliant", en: "GDPR compliant", es: "Conforme RGPD" },
      { fr: "Politique annulation", en: "Cancellation policy", es: "Política de cancelación" },
      { fr: "Historique anonymisé", en: "Anonymized history", es: "Historial anonimizado" },
    ],
  },
  {
    slug: "dieteticien",
    name: { fr: "Diététiciens", en: "Dietitians", es: "Dietistas" },
    category: "sante",
    title: { fr: "Logiciel de Facturation pour Diététiciens | Robi AI", en: "Invoicing Software for Dietitians | Robi AI", es: "Software de Facturación para Dietistas | Robi AI" },
    description: { fr: "Gérez vos consultations nutrition.", en: "Manage your nutrition consultations.", es: "Gestiona tus consultas de nutrición." },
    keywords: ["facturation diététicien", "logiciel nutritionniste"],
    heroTitle: { fr: "Facturez vos consultations nutrition facilement", en: "Invoice your nutrition consultations easily", es: "Factura tus consultas de nutrición fácilmente" },
    painPoints: [
      { fr: "Forfaits suivi", en: "Follow-up packages", es: "Paquetes de seguimiento" },
      { fr: "Bilans initiaux", en: "Initial assessments", es: "Evaluaciones iniciales" },
      { fr: "Programmes personnalisés", en: "Custom programs", es: "Programas personalizados" },
    ],
    features: [
      { fr: "Packages suivi", en: "Follow-up packages", es: "Paquetes de seguimiento" },
      { fr: "Bilan initial", en: "Initial assessment", es: "Evaluación inicial" },
      { fr: "Fiches conseils", en: "Advice sheets", es: "Fichas de consejos" },
    ],
  },
  {
    slug: "sophrologue",
    name: { fr: "Sophrologues", en: "Sophrologists", es: "Sofrólogos" },
    category: "sante",
    title: { fr: "Logiciel de Facturation pour Sophrologues | Robi AI", en: "Invoicing Software for Sophrologists | Robi AI", es: "Software de Facturación para Sofrólogos | Robi AI" },
    description: { fr: "Facturez vos séances de sophrologie.", en: "Invoice your sophrology sessions.", es: "Factura tus sesiones de sofrología." },
    keywords: ["facturation sophrologue", "logiciel sophrologie"],
    heroTitle: { fr: "Gérez vos séances sophro en toute sérénité", en: "Manage your sophrology sessions serenely", es: "Gestiona tus sesiones de sofrología con tranquilidad" },
    painPoints: [
      { fr: "Tarifs variés", en: "Various rates", es: "Tarifas variadas" },
      { fr: "Séances groupe", en: "Group sessions", es: "Sesiones grupales" },
      { fr: "Ateliers entreprise", en: "Corporate workshops", es: "Talleres de empresa" },
    ],
    features: [
      { fr: "Tarifs multiples", en: "Multiple rates", es: "Tarifas múltiples" },
      { fr: "Gestion groupes", en: "Group management", es: "Gestión de grupos" },
      { fr: "Facturation B2B", en: "B2B billing", es: "Facturación B2B" },
    ],
  },
  {
    slug: "naturopathe",
    name: { fr: "Naturopathes", en: "Naturopaths", es: "Naturópatas" },
    category: "sante",
    title: { fr: "Logiciel de Facturation pour Naturopathes | Robi AI", en: "Invoicing Software for Naturopaths | Robi AI", es: "Software de Facturación para Naturópatas | Robi AI" },
    description: { fr: "Facturez vos consultations naturopathie.", en: "Invoice your naturopathy consultations.", es: "Factura tus consultas de naturopatía." },
    keywords: ["facturation naturopathe", "logiciel naturopathie"],
    heroTitle: { fr: "Facturez vos consultations naturo simplement", en: "Invoice your naturo consultations simply", es: "Factura tus consultas de naturopatía fácilmente" },
    painPoints: [
      { fr: "Bilans complets", en: "Complete assessments", es: "Evaluaciones completas" },
      { fr: "Cures longues", en: "Long treatments", es: "Tratamientos largos" },
      { fr: "Vente compléments", en: "Supplement sales", es: "Venta de suplementos" },
    ],
    features: [
      { fr: "Bilan vitalité", en: "Vitality assessment", es: "Evaluación de vitalidad" },
      { fr: "Suivi cure", en: "Treatment tracking", es: "Seguimiento de tratamiento" },
      { fr: "Catalogue produits", en: "Product catalog", es: "Catálogo de productos" },
    ],
  },
];

// ===== COMPARISONS =====
export const comparisons = [
  { slug: "vs-excel", competitor: "Excel", title: { fr: "Robi AI vs Excel : Pourquoi passer à l'IA ?", en: "Robi AI vs Excel: Why switch to AI?", es: "Robi AI vs Excel: ¿Por qué cambiar a la IA?" }, description: { fr: "Comparez Excel et Robi AI pour votre facturation.", en: "Compare Excel and Robi AI for your invoicing.", es: "Compara Excel y Robi AI para tu facturación." }, keywords: ["alternative excel facturation"] },
  { slug: "vs-henrri", competitor: "Henrri", title: { fr: "Robi AI vs Henrri : Comparatif Complet 2024", en: "Robi AI vs Henrri: Complete Comparison 2024", es: "Robi AI vs Henrri: Comparativa Completa 2024" }, description: { fr: "Henrri ou Robi AI ? Comparez les fonctionnalités.", en: "Henrri or Robi AI? Compare the features.", es: "¿Henrri o Robi AI? Compara las funciones." }, keywords: ["alternative henrri"] },
  { slug: "vs-freebe", competitor: "Freebe", title: { fr: "Robi AI vs Freebe : Le Match des Logiciels Freelance", en: "Robi AI vs Freebe: The Freelance Software Match", es: "Robi AI vs Freebe: El Match de Software Freelance" }, description: { fr: "Freebe ou Robi AI ? Découvrez les différences.", en: "Freebe or Robi AI? Discover the differences.", es: "¿Freebe o Robi AI? Descubre las diferencias." }, keywords: ["alternative freebe"] },
  { slug: "vs-facture-net", competitor: "Facture.net", title: { fr: "Robi AI vs Facture.net : Comparatif Détaillé", en: "Robi AI vs Facture.net: Detailed Comparison", es: "Robi AI vs Facture.net: Comparativa Detallada" }, description: { fr: "Facture.net ou Robi AI ? Comparez ces deux solutions.", en: "Facture.net or Robi AI? Compare these two solutions.", es: "¿Facture.net o Robi AI? Compara estas dos soluciones." }, keywords: ["alternative facture.net"] },
  { slug: "vs-pennylane", competitor: "Pennylane", title: { fr: "Robi AI vs Pennylane : Quel Outil Choisir ?", en: "Robi AI vs Pennylane: Which Tool to Choose?", es: "Robi AI vs Pennylane: ¿Qué Herramienta Elegir?" }, description: { fr: "Pennylane ou Robi AI ? Découvrez les forces de chaque solution.", en: "Pennylane or Robi AI? Discover each solution's strengths.", es: "¿Pennylane o Robi AI? Descubre las fortalezas de cada solución." }, keywords: ["alternative pennylane"] },
];

// ===== FEATURES =====
export const features = [
  { slug: "facturation-ia", name: { fr: "Facturation par IA", en: "AI Invoicing", es: "Facturación con IA" }, title: { fr: "Facturation par Intelligence Artificielle | Robi AI", en: "AI-Powered Invoicing | Robi AI", es: "Facturación con Inteligencia Artificial | Robi AI" }, description: { fr: "Créez des factures en parlant.", en: "Create invoices by speaking.", es: "Crea facturas hablando." }, keywords: ["facturation ia", "facture intelligence artificielle"] },
  { slug: "devis-automatique", name: { fr: "Devis Automatiques", en: "Automatic Quotes", es: "Presupuestos Automáticos" }, title: { fr: "Générateur de Devis Automatique | Robi AI", en: "Automatic Quote Generator | Robi AI", es: "Generador de Presupuestos Automático | Robi AI" }, description: { fr: "Générez des devis professionnels en quelques secondes.", en: "Generate professional quotes in seconds.", es: "Genera presupuestos profesionales en segundos." }, keywords: ["devis automatique", "générateur devis"] },
  { slug: "relance-automatique", name: { fr: "Relances Automatiques", en: "Automatic Reminders", es: "Recordatorios Automáticos" }, title: { fr: "Relances de Factures Automatiques | Robi AI", en: "Automatic Invoice Reminders | Robi AI", es: "Recordatorios de Facturas Automáticos | Robi AI" }, description: { fr: "Fini les impayés. Robi relance vos clients automatiquement.", en: "No more unpaid invoices. Robi follows up automatically.", es: "Se acabaron los impagos. Robi hace seguimiento automáticamente." }, keywords: ["relance facture", "relance automatique"] },
  { slug: "paiement-en-ligne", name: { fr: "Paiement en Ligne", en: "Online Payments", es: "Pagos Online" }, title: { fr: "Paiement en Ligne Stripe & PayPal | Robi AI", en: "Online Payments Stripe & PayPal | Robi AI", es: "Pagos Online Stripe & PayPal | Robi AI" }, description: { fr: "Soyez payé 2x plus vite avec les liens de paiement intégrés.", en: "Get paid 2x faster with integrated payment links.", es: "Cobra 2 veces más rápido con links de pago integrados." }, keywords: ["paiement en ligne facture", "stripe facturation"] },
  { slug: "tableau-de-bord", name: { fr: "Tableau de Bord", en: "Dashboard", es: "Panel de Control" }, title: { fr: "Tableau de Bord Freelance | Robi AI", en: "Freelance Dashboard | Robi AI", es: "Panel de Control Freelance | Robi AI" }, description: { fr: "Visualisez votre CA en un coup d'œil.", en: "Visualize your revenue at a glance.", es: "Visualiza tu facturación de un vistazo." }, keywords: ["tableau de bord freelance", "dashboard facturation"] },
];

// ===== BLOG POSTS =====
export const blogPosts = [
  {
    slug: "comment-facturer-premier-client",
    title: { fr: "Comment Facturer Son Premier Client : Guide Complet 2025", en: "How to Invoice Your First Client: Complete Guide 2025", es: "Cómo Facturar a Tu Primer Cliente: Guía Completa 2025" },
    description: { fr: "Tout ce que vous devez savoir pour émettre votre première facture conforme et être payé rapidement.", en: "Everything you need to know to issue your first compliant invoice and get paid fast.", es: "Todo lo que necesitas saber para emitir tu primera factura conforme y cobrar rápido." },
    keywords: ["première facture freelance", "comment facturer client", "facture auto-entrepreneur"],
    category: "guides",
    date: "2025-03-10",
    readTime: { fr: 8, en: 8, es: 8 },
    author: "Équipe Robi AI",
  },
  {
    slug: "mentions-obligatoires-facture",
    title: { fr: "Les Mentions Obligatoires sur une Facture en 2025", en: "Mandatory Information on an Invoice in 2025", es: "Información Obligatoria en una Factura en 2025" },
    description: { fr: "Liste complète et à jour des mentions légales obligatoires sur vos factures pour éviter tout litige.", en: "Complete and up-to-date list of mandatory legal mentions on your invoices to avoid disputes.", es: "Lista completa y actualizada de las menciones legales obligatorias en tus facturas." },
    keywords: ["mentions obligatoires facture", "facture légale", "facture conforme 2025"],
    category: "legal",
    date: "2025-02-20",
    readTime: { fr: 6, en: 6, es: 6 },
    author: "Équipe Robi AI",
  },
  {
    slug: "relancer-client-impaye",
    title: { fr: "Comment Relancer un Client qui ne Paie Pas ? (5 Méthodes)", en: "How to Follow Up on an Unpaid Client? (5 Methods)", es: "¿Cómo Reclamar a un Cliente que No Paga? (5 Métodos)" },
    description: { fr: "5 techniques éprouvées pour relancer efficacement vos clients en retard sans abîmer la relation.", en: "5 proven techniques to effectively follow up on late clients without damaging the relationship.", es: "5 técnicas probadas para reclamar eficazmente a tus clientes morosos sin dañar la relación." },
    keywords: ["relance client impayé", "recouvrement freelance", "facture impayée"],
    category: "tips",
    date: "2025-02-05",
    readTime: { fr: 5, en: 5, es: 5 },
    author: "Équipe Robi AI",
  },
  {
    slug: "tarif-journalier-moyen-freelance",
    title: { fr: "TJM Freelance 2025 : Quel Tarif Journalier Moyen ?", en: "Freelance Day Rate 2025: What's the Average?", es: "Tarifa Diaria Freelance 2025: ¿Cuál es la Media?" },
    description: { fr: "Découvrez les TJM par métier et région en 2025 pour fixer votre tarif au juste prix et booster vos revenus.", en: "Discover 2025 day rates by profession and region to set the right price and boost your income.", es: "Descubre las tarifas diarias 2025 por profesión y región para fijar el precio correcto." },
    keywords: ["tjm freelance", "tarif journalier moyen 2025", "salaire freelance"],
    category: "business",
    date: "2025-01-15",
    readTime: { fr: 10, en: 10, es: 10 },
    author: "Équipe Robi AI",
  },
  {
    slug: "micro-entreprise-vs-sasu",
    title: { fr: "Micro-Entreprise vs SASU : Quel Statut Choisir en 2025 ?", en: "Sole Trader vs LLC: Which Status to Choose in 2025?", es: "Autónomo vs Sociedad: ¿Qué Estatus Elegir en 2025?" },
    description: { fr: "Comparatif complet des statuts juridiques micro-entreprise et SASU : charges, avantages et inconvénients.", en: "Complete comparison of sole trader and LLC legal statuses: taxes, pros and cons.", es: "Comparativa completa de estatus legales autónomo y sociedad: impuestos, ventajas e inconvenientes." },
    keywords: ["micro entreprise vs sasu", "statut juridique freelance", "auto entrepreneur 2025"],
    category: "legal",
    date: "2025-01-03",
    readTime: { fr: 12, en: 12, es: 12 },
    author: "Équipe Robi AI",
  },
];

// ===== TOOLS =====
export const tools = [
  { slug: "calculateur-tjm", name: { fr: "Calculateur de TJM", en: "Day Rate Calculator", es: "Calculadora de Tarifa Diaria" }, title: { fr: "Calculateur de Tarif Journalier Moyen Gratuit | Robi AI", en: "Free Day Rate Calculator | Robi AI", es: "Calculadora de Tarifa Diaria Gratis | Robi AI" }, description: { fr: "Calculez votre TJM idéal.", en: "Calculate your ideal day rate.", es: "Calcula tu tarifa diaria ideal." }, keywords: ["calculateur tjm"] },
  { slug: "simulateur-charges", name: { fr: "Simulateur de Charges", en: "Tax Simulator", es: "Simulador de Impuestos" }, title: { fr: "Simulateur de Charges Freelance Gratuit | Robi AI", en: "Free Freelance Tax Simulator | Robi AI", es: "Simulador de Impuestos Freelance Gratis | Robi AI" }, description: { fr: "Estimez vos charges sociales et fiscales.", en: "Estimate your social and tax charges.", es: "Estima tus cargas sociales y fiscales." }, keywords: ["simulateur charges freelance"] },
  { slug: "generateur-mentions-legales", name: { fr: "Générateur de Mentions Légales", en: "Legal Notice Generator", es: "Generador de Aviso Legal" }, title: { fr: "Générateur de Mentions Légales Gratuit | Robi AI", en: "Free Legal Notice Generator | Robi AI", es: "Generador de Aviso Legal Gratis | Robi AI" }, description: { fr: "Créez vos mentions légales conformes RGPD.", en: "Create your GDPR compliant legal notices.", es: "Crea tus avisos legales conformes con RGPD." }, keywords: ["générateur mentions légales"] },
];

// ===== SCHEMA TEMPLATES =====
export const schemaTemplates = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Robi AI",
    url: "https://robi-app.com",
    logo: "https://robi-app.com/logo.png",
    description: "AI invoicing software for freelancers",
    sameAs: [
      "https://instagram.com/robi.ai.app",
      "https://x.com/iamrobiai",
      "https://linkedin.com/company/robi-ai",
    ],
  },
  softwareApplication: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Robi AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    offers: {
      "@type": "Offer",
      price: "14.99",
      priceCurrency: "EUR",
    },
  },
};

// ===== HELPER: Get localized string =====
export function t(obj: LocaleStrings | string, locale: Locale): string {
  if (typeof obj === "string") return obj;
  return obj[locale] || obj.fr;
}
