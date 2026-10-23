import { AMBASSADEUR, PROGRAMME } from "@/lib/partenaires";

/**
 * Textes de la page /partenaires. Trois langues (fr, en, es) pour le
 * programme partenaires, et une page à part sur fr-MA : le programme
 * Ambassadeurs Robi Maroc (23/10/2026), en français du Maroc + un bloc en
 * darija latin.
 */

export interface PartnerCopy {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  steps: { title: string; text: string }[];
  numbers: { value: string; label: string }[];
  who: { title: string; items: string[] };
  faq: { q: string; a: string }[];
  form: {
    title: string; subtitle: string;
    name: string; email: string; platform: string; handle: string; url: string; country: string; audience: string;
    payoutMethod: string; payoutDetails: string; payoutHint: string; message: string;
    submit: string; sending: string; success: string; already: string; error: string;
    platforms: Record<string, string>;
    methods: Record<string, string>;
  };
  darija?: { title: string; lines: string[] };
}

const d = PROGRAMME.discountPct;
const c = PROGRAMME.commissionPct;
const m = PROGRAMME.minPayoutEur;

const fr: PartnerCopy = {
  metaTitle: "Programme partenaires Robi AI — gagne une commission sur chaque vente",
  metaDescription: `Tu parles à des artisans, des indépendants, des pros du BTP ? Ton code offre ${d} % à ton audience, tu touches ${c} % de chaque vente. Inscription en 2 minutes, sans engagement.`,
  badge: "Partenaires",
  title: "Parle de Robi.",
  titleAccent: `Touche ${c} % de chaque vente.`,
  subtitle: `Robi transforme la voix d'un artisan en devis et en facture. Ton audience gagne ${d} % avec ton code, toi tu gagnes ${c} % de ce qu'ils paient. Rien à avancer, rien à vendre toi-même.`,
  steps: [
    { title: "1. Tu t'inscris", text: "Deux minutes, en bas de cette page. On regarde ton compte, on active ton code sous 24 h." },
    { title: "2. Tu reçois ton lien et ton code", text: "Un lien pour ta bio, un code à dire dans tes vidéos. Les deux appliquent la remise tout seuls." },
    { title: "3. Tu es payé chaque mois", text: `Un mail à chaque vente, un récap le 1er du mois, virement ou PayPal dès ${m} € cumulés.` },
  ],
  numbers: [
    { value: `${c} %`, label: "de commission sur chaque vente" },
    { value: `${d} %`, label: "de remise pour ton audience" },
    { value: `${PROGRAMME.cookieDays} j`, label: "d'attribution après un clic" },
  ],
  who: {
    title: "Pour qui ?",
    items: [
      "Créateurs BTP, artisans, rénovation, métiers manuels",
      "Comptes qui parlent aux indépendants et aux petites entreprises",
      "Freelances, formateurs, coachs business",
      "Petits comptes bienvenus : 2 000 abonnés engagés valent mieux que 200 000 qui scrollent",
    ],
  },
  faq: [
    { q: "Combien je gagne exactement ?", a: `${c} % du montant net encaissé par Robi sur chaque vente faite avec ton code ou ton lien, remise déduite, hors remboursements.` },
    { q: "Quand est-ce que je suis payé ?", a: `Chaque début de mois, dès que ton solde atteint ${m} €. En dessous, il est reporté au mois suivant.` },
    { q: "Comment je suis payé ?", a: "Virement bancaire, PayPal ou Wise, selon ce que tu indiques à l'inscription. Tu peux changer en nous répondant par mail." },
    { q: "Est-ce que je dois faire une facture ?", a: "Si tu as un statut (auto-entrepreneur, société), oui, une facture de commission par versement. Sinon on t'explique la marche à suivre par mail." },
    { q: "Je dois poster quoi ?", a: "Ce que tu veux : une story, un reel, une vidéo où tu utilises Robi. On te fournit des visuels et l'app est gratuite pour toi." },
    { q: "Il y a un engagement ?", a: "Aucun. Tu arrêtes quand tu veux, on désactive ton code, on te verse ce qui reste." },
  ],
  form: {
    title: "Je m'inscris",
    subtitle: "On te répond sous 24 h avec ton lien et ton code.",
    name: "Ton nom", email: "Ton email", platform: "Réseau principal", handle: "Ton pseudo", url: "Lien vers ton compte",
    country: "Pays", audience: "Abonnés (environ)",
    payoutMethod: "Comment tu veux être payé", payoutDetails: "Email PayPal ou IBAN", payoutHint: "Tu peux le remplir plus tard.",
    message: "Un mot sur ton audience (facultatif)",
    submit: "Envoyer ma demande", sending: "Envoi…",
    success: "C'est reçu. Tu reçois ton lien et ton code par mail sous 24 h.",
    already: "Cette adresse est déjà inscrite. Réponds au mail que tu as reçu si tu n'as pas ton code.",
    error: "Ça n'a pas marché. Réessaie, ou écris-nous à hello@robi-app.com.",
    platforms: { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn", x: "X", blog: "Blog / newsletter", podcast: "Podcast", autre: "Autre" },
    methods: { paypal: "PayPal", virement: "Virement bancaire", wise: "Wise" },
  },
};

const en: PartnerCopy = {
  metaTitle: "Robi AI partner programme — earn a commission on every sale",
  metaDescription: `Do you talk to tradespeople, freelancers, contractors? Your code gives your audience ${d}% off, you earn ${c}% of every sale. Sign up in 2 minutes, no commitment.`,
  badge: "Partners",
  title: "Talk about Robi.",
  titleAccent: `Earn ${c}% of every sale.`,
  subtitle: `Robi turns a tradesperson's voice into quotes and invoices. Your audience gets ${d}% off with your code, you get ${c}% of what they pay. Nothing to pay upfront, nothing to sell yourself.`,
  steps: [
    { title: "1. You sign up", text: "Two minutes, at the bottom of this page. We look at your account and activate your code within 24 h." },
    { title: "2. You get your link and code", text: "A link for your bio, a code to say in your videos. Both apply the discount automatically." },
    { title: "3. You get paid monthly", text: `An email for every sale, a recap on the 1st, bank transfer or PayPal once you reach €${m}.` },
  ],
  numbers: [
    { value: `${c}%`, label: "commission on every sale" },
    { value: `${d}%`, label: "off for your audience" },
    { value: `${PROGRAMME.cookieDays} d`, label: "attribution after a click" },
  ],
  who: {
    title: "Who is it for?",
    items: [
      "Trades, construction, renovation and hands-on creators",
      "Accounts that speak to freelancers and small businesses",
      "Freelancers, trainers, business coaches",
      "Small accounts welcome: 2,000 engaged followers beat 200,000 who scroll past",
    ],
  },
  faq: [
    { q: "How much do I earn exactly?", a: `${c}% of the net amount Robi receives on every sale made with your code or link, after discount, refunds excluded.` },
    { q: "When do I get paid?", a: `At the start of each month, once your balance reaches €${m}. Below that it rolls over to the next month.` },
    { q: "How do I get paid?", a: "Bank transfer, PayPal or Wise, whatever you choose at sign-up. Reply to any of our emails to change it." },
    { q: "Do I need to invoice you?", a: "If you have a business status, yes, one commission invoice per payout. If not, we explain what to do by email." },
    { q: "What do I have to post?", a: "Whatever you like: a story, a reel, a video where you use Robi. We provide visuals, and the app is free for you." },
    { q: "Any commitment?", a: "None. Stop whenever you want, we deactivate your code and pay out what is left." },
  ],
  form: {
    title: "Sign me up",
    subtitle: "We reply within 24 h with your link and code.",
    name: "Your name", email: "Your email", platform: "Main platform", handle: "Your handle", url: "Link to your account",
    country: "Country", audience: "Followers (roughly)",
    payoutMethod: "How you want to be paid", payoutDetails: "PayPal email or IBAN", payoutHint: "You can fill this in later.",
    message: "A word about your audience (optional)",
    submit: "Send my application", sending: "Sending…",
    success: "Got it. You will receive your link and code by email within 24 h.",
    already: "This address is already registered. Reply to the email you received if you do not have your code.",
    error: "That did not work. Try again, or write to hello@robi-app.com.",
    platforms: { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn", x: "X", blog: "Blog / newsletter", podcast: "Podcast", autre: "Other" },
    methods: { paypal: "PayPal", virement: "Bank transfer", wise: "Wise" },
  },
};

const es: PartnerCopy = {
  metaTitle: "Programa de socios Robi AI — gana una comisión por cada venta",
  metaDescription: `¿Hablas con autónomos, artesanos, profesionales de la construcción? Tu código da un ${d} % de descuento a tu audiencia y tú ganas el ${c} % de cada venta. Registro en 2 minutos, sin compromiso.`,
  badge: "Socios",
  title: "Habla de Robi.",
  titleAccent: `Gana el ${c} % de cada venta.`,
  subtitle: `Robi convierte la voz de un autónomo en presupuestos y facturas. Tu audiencia obtiene un ${d} % con tu código, tú ganas el ${c} % de lo que pagan. Nada que adelantar, nada que vender tú mismo.`,
  steps: [
    { title: "1. Te registras", text: "Dos minutos, al final de esta página. Miramos tu cuenta y activamos tu código en 24 h." },
    { title: "2. Recibes tu enlace y tu código", text: "Un enlace para tu bio, un código para decir en tus vídeos. Los dos aplican el descuento solos." },
    { title: "3. Cobras cada mes", text: `Un correo por cada venta, un resumen el día 1, transferencia o PayPal a partir de ${m} €.` },
  ],
  numbers: [
    { value: `${c} %`, label: "de comisión por cada venta" },
    { value: `${d} %`, label: "de descuento para tu audiencia" },
    { value: `${PROGRAMME.cookieDays} d`, label: "de atribución tras un clic" },
  ],
  who: {
    title: "¿Para quién?",
    items: [
      "Creadores de construcción, reformas, oficios manuales",
      "Cuentas que hablan a autónomos y pequeñas empresas",
      "Freelances, formadores, coaches de negocio",
      "Cuentas pequeñas bienvenidas: 2.000 seguidores fieles valen más que 200.000 que pasan de largo",
    ],
  },
  faq: [
    { q: "¿Cuánto gano exactamente?", a: `El ${c} % del importe neto que Robi cobra en cada venta hecha con tu código o enlace, descuento aplicado, sin reembolsos.` },
    { q: "¿Cuándo cobro?", a: `A principio de cada mes, cuando tu saldo llega a ${m} €. Por debajo, pasa al mes siguiente.` },
    { q: "¿Cómo cobro?", a: "Transferencia, PayPal o Wise, lo que indiques al registrarte. Responde a cualquiera de nuestros correos para cambiarlo." },
    { q: "¿Tengo que facturar?", a: "Si tienes un estatus (autónomo, empresa), sí, una factura de comisión por pago. Si no, te explicamos por correo qué hacer." },
    { q: "¿Qué tengo que publicar?", a: "Lo que quieras: una story, un reel, un vídeo usando Robi. Te damos visuales y la app es gratis para ti." },
    { q: "¿Hay compromiso?", a: "Ninguno. Paras cuando quieras, desactivamos tu código y te pagamos lo que quede." },
  ],
  form: {
    title: "Me registro",
    subtitle: "Te respondemos en 24 h con tu enlace y tu código.",
    name: "Tu nombre", email: "Tu correo", platform: "Red principal", handle: "Tu usuario", url: "Enlace a tu cuenta",
    country: "País", audience: "Seguidores (aprox.)",
    payoutMethod: "Cómo quieres cobrar", payoutDetails: "Correo de PayPal o IBAN", payoutHint: "Puedes rellenarlo más tarde.",
    message: "Unas palabras sobre tu audiencia (opcional)",
    submit: "Enviar mi solicitud", sending: "Enviando…",
    success: "Recibido. Recibirás tu enlace y tu código por correo en 24 h.",
    already: "Esta dirección ya está registrada. Responde al correo que recibiste si no tienes tu código.",
    error: "No ha funcionado. Inténtalo de nuevo o escríbenos a hello@robi-app.com.",
    platforms: { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn", x: "X", blog: "Blog / newsletter", podcast: "Podcast", autre: "Otro" },
    methods: { paypal: "PayPal", virement: "Transferencia bancaria", wise: "Wise" },
  },
};

// ─── fr-MA : Ambassadeurs Robi Maroc ──────────────────────────────────
const A = AMBASSADEUR;
const aPrime = `${A.bonus.montant} DH`;
const aMin = `${A.minPayout.EUR} € (ou ${A.minPayout.MAD} DH)`;

/**
 * Exemple chiffré : uniquement avec la grille en dirhams validée le 28/09/2026
 * (59 DH/mois, 590 DH/an — ROBI_APP components/settings/SubscriptionTab.tsx, PRICE_MAP_BY_CURRENCY),
 * présentée comme les tarifs prévus pour le Maroc : au 23/10/2026, Polar n'a
 * encore aucun prix en MAD, un client marocain paie en euros. Calculs vérifiés
 * par scripts/checkCommissions.ts (208,86 DH et 141,60 DH).
 */
const exempleMensuel = "208,86 DH";
const exempleAnnuel = "141,60 DH";
const exempleDix = "2 088,60 DH";

const frMA: PartnerCopy = {
  metaTitle: `Ambassadeurs Robi Maroc — ${A.commissionPct} % pendant ${A.commissionMonths} mois sur chaque client`,
  metaDescription: `Comptable, fiduciaire, freelance : recommande Robi à tes clients. Ils ont ${A.discountPct} % sur leur premier paiement, tu touches ${A.commissionPct} % de tout ce qu'ils paient pendant ${A.commissionMonths} mois, et ${aPrime} de prime à ton ${A.bonus.seuil}e client payant.`,
  badge: "Ambassadeurs Maroc",
  title: "Recommande Robi.",
  titleAccent: `Touche ${A.commissionPct} % pendant ${A.commissionMonths} mois.`,
  subtitle: `Robi transforme la voix d'un indépendant en devis et en facture. Tes clients ont ${A.discountPct} % sur leur premier paiement avec ton code. Toi, tu touches ${A.commissionPct} % de tout ce qu'ils paient pendant ${A.commissionMonths} mois, renouvellements compris. Rien à avancer, rien à encaisser toi-même.`,
  steps: [
    { title: "1. Tu t'inscris", text: "Deux minutes, en bas de cette page. On regarde ton profil et on active ton code sous 24 h." },
    { title: "2. Tu reçois ton lien et ton code", text: "Un lien à envoyer à tes clients sur WhatsApp ou par mail, un code à donner de vive voix. Les deux appliquent la remise tout seuls." },
    { title: "3. Tu es payé chaque mois", text: `Un mail à chaque paiement d'un de tes clients, un récap le 1er du mois, virement, PayPal ou Wise dès ${aMin} cumulés.` },
  ],
  numbers: [
    { value: `${A.commissionPct} %`, label: `de tout ce que paie ton client pendant ${A.commissionMonths} mois` },
    { value: aPrime, label: `de prime à ton ${A.bonus.seuil}e client payant` },
    { value: `${A.discountPct} %`, label: "de remise pour ton client sur son premier paiement" },
  ],
  who: {
    title: "Pour qui ?",
    items: [
      "Comptables et fiduciaires qui suivent des indépendants, des auto-entrepreneurs et des TPE",
      "Freelances qui ont un réseau d'autres freelances (graphistes, développeurs, photographes, consultants)",
      "Formateurs, coachs, espaces de coworking qui parlent aux indépendants",
      "Créateurs qui parlent aux freelances marocains",
    ],
  },
  faq: [
    { q: "Combien je gagne exactement ?", a: `${A.commissionPct} % de tout ce que paie chaque client que tu amènes, pendant ${A.commissionMonths} mois à partir de son premier paiement : abonnement mensuel ou annuel, renouvellements compris. Pour l'accès à vie, ${A.commissionPct} % du paiement unique. Toujours sur le montant hors taxes, remise déduite, remboursements exclus.` },
    { q: "Un exemple ?", a: `Avec les tarifs en dirhams prévus pour le Maroc (59 DH par mois, 590 DH par an) : un client au mensuel qui reste 12 mois te rapporte ${exempleMensuel} (14,16 DH sur son premier mois remisé, puis 17,70 DH par mois). Un client à l'année : ${exempleAnnuel}. Dix clients au mensuel : ${exempleDix}, plus la prime de ${aPrime}. Tant que le paiement en dirhams n'est pas ouvert, ton client paie en euros : même règle, ${A.commissionPct} % de ce qu'il paie vraiment.` },
    { q: "C'est quoi la prime ?", a: `Le jour où ${A.bonus.seuil} clients différents ont payé grâce à toi, on ajoute ${aPrime} à ton solde. Une seule fois.` },
    { q: "Quand est-ce que je suis payé ?", a: `Chaque début de mois, dès que ton solde atteint ${aMin}. En dessous, il est reporté au mois suivant.` },
    { q: "Comment je suis payé ?", a: "Virement bancaire, PayPal ou Wise, selon ce que tu indiques à l'inscription. Tu peux changer en nous répondant par mail." },
    { q: "Est-ce que je dois faire une facture ?", a: "Si tu as un statut (auto-entrepreneur, société, cabinet), oui, une facture de commission par versement. Sinon on t'explique la marche à suivre par mail." },
    { q: "Il y a un engagement ?", a: "Aucun. Tu arrêtes quand tu veux, on désactive ton code, on te verse ce qui reste." },
  ],
  form: {
    ...fr.form,
    subtitle: "On te répond sous 24 h avec ton lien et ton code.",
    platform: "Où tu parles à tes clients", handle: "Ton pseudo (si tu en as un)", url: "Ton site, ta page ou ton compte",
    message: "Un mot sur tes clients (combien, quels métiers) — facultatif",
  },
};

/**
 * Bloc darija (lettres latines) de fr-MA.
 * À FAIRE RELIRE PAR UN NATIF avant de le pousser en pub (écrit le 23/10/2026,
 * non relu) : orthographe latine et tournures.
 */
const darija = {
  title: "Bel darija : chno kayn ?",
  lines: [
    "Robi kaybeddel sout dyal l'freelance wla l'artisan l devis w facture f thawani.",
    `Kat3ref nass khddamin 3la rassehom wla charikat sghar ? 3tihom l code dyalek : ${A.discountPct} % remise 3la awwel khlass.`,
    `W nta katakhod ${A.commissionPct} % men ga3 dakchi li kaykhellsou ${A.commissionMonths} chhar, m3a tajdid l'abonnement.`,
    `F l'client l 3achr li khelles, katzid lik Robi prime dyal ${aPrime}.`,
    `Kol chhar f l'awwel, kansiftou lik flousek b virement, PayPal wla Wise, men ${A.minPayout.EUR} € wla ${A.minPayout.MAD} DH lfou9.`,
    "Sajjel lta7t, kanjawbouk f 24 sa3a b l'link w l code dyalek.",
  ],
};

export const partnerCopy = (locale: string): PartnerCopy => {
  const base = (locale || "fr").slice(0, 2).toLowerCase();
  const copy = base === "en" ? en : base === "es" ? es : fr;
  return locale === "fr-MA" ? { ...frMA, darija } : copy;
};
