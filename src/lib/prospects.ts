// Acquisition pipeline for Robi — ported from the Impulse admin, retargeted at
// who actually buys invoicing software.
//
// Prospects live in the `robi-seo` project (this is marketing data, not app
// data). Sending goes through /api/admin/outreach, which uses a SEPARATE SMTP
// account from the one that delivers customers' invoices — see that route.
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy,
  onSnapshot, serverTimestamp, Timestamp, deleteField,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Model ────────────────────────────────────────────────────────────
export type ProspectSegment =
  | "freelance"    // indépendants, consultants
  | "artisan"      // BTP, métiers manuels
  | "agence"       // petites agences créa / com / event
  | "comptable"    // experts-comptables — un contact = plusieurs dizaines d'utilisateurs
  | "coworking"    // coworkings, incubateurs, pépinières
  | "federation"   // fédérations, syndicats, CCI, chambres de métiers
  | "tpe"          // TPE de services
  | "influenceur"  // créateurs de contenu à recruter au programme
  | "backlink";    // comparatifs, annuaires, médias — objectif : un lien, pas une vente

export type ProspectStatus =
  | "todo" | "contacted" | "followup" | "interested" | "signup" | "customer" | "lost";

export type ProspectChannel = "email" | "linkedin" | "phone" | "other";

export interface ProspectTouch {
  date: string;   // yyyy-mm-dd
  channel: ProspectChannel;
  note?: string;
  /**
   * Copie exacte de ce qui est parti. Sans elle, la fiche avance à l'étape
   * suivante dès l'envoi et le panneau montre la relance : on ne sait plus
   * ce que le prospect a reçu, ni comment le retoucher la prochaine fois.
   */
  subject?: string;
  body?: string;
}

export interface ProspectDraft {
  key: "A" | "B";
  /** Id d'angle de la bibliothèque de la skill (ex. `in-code`) — sert au suivi des résultats. */
  angle: string;
  subject: string;
  body: string;
}

export interface ProspectDrafts {
  generatedAt?: string;
  recommended: "A" | "B";
  reason: string;
  variants: ProspectDraft[];
}

export interface Prospect {
  id?: string;
  company: string;          // seul champ obligatoire
  contactName?: string;
  role?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  city?: string;
  segment: ProspectSegment;
  status: ProspectStatus;
  priority?: 1 | 2 | 3;     // 1 = A … 3 = C
  source?: string;
  notes?: string;
  touches?: ProspectTouch[];
  seqStep?: number;
  nextActionDate?: string;  // yyyy-mm-dd
  nextActionLabel?: string;
  lostReason?: string;
  /** Plus haut palier atteint : sans ça un prospect perdu disparaît de l'entonnoir. */
  maxStage?: ProspectStatus;
  /**
   * Brouillons rédigés par la skill robi-outreach, directement sur la fiche :
   * deux variantes d'angle différent + une recommandation. Ralph choisit dans
   * l'admin ; le brouillon choisi remplace le modèle générique à l'envoi.
   */
  drafts?: ProspectDrafts;
  /** Variante retenue (A ou B). Sans choix, la recommandation s'applique. */
  chosenDraft?: "A" | "B";
  /**
   * Retouches faites à la main dans le panneau, non encore envoyées, par
   * clé `variante:étape`. Sans ça, changer de fiche perdait la retouche.
   */
  edits?: Record<string, { subject: string; body: string }>;
  /** Jeton du lien de désinscription, généré au premier envoi. */
  unsubToken?: string;
  unsubscribedAt?: string;
  lastEmailAt?: string;
  /**
   * Ce que Brevo a réellement fait du dernier mail — rapporté par webhook.
   * Le bouton « Envoyer » ne sait que si Brevo a accepté le message ; la
   * livraison, le rebond ou le signalement en spam arrivent après coup.
   */
  delivery?: {
    status: "sent" | "delivered" | "opened" | "clicked" | "soft_bounce" | "hard_bounce" | "spam" | "blocked" | "replied";
    at: string;
    reason?: string;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const DELIVERY_META: Record<NonNullable<Prospect["delivery"]>["status"], { label: string; color: string }> = {
  sent:        { label: "Accepté",        color: "#94a3b8" },
  delivered:   { label: "Livré",          color: "#10b981" },
  opened:      { label: "Ouvert",         color: "#10b981" },
  clicked:     { label: "Lien cliqué",    color: "#BEF221" },
  replied:     { label: "A répondu",      color: "#BEF221" },
  soft_bounce: { label: "Rebond doux",    color: "#f59e0b" },
  blocked:     { label: "Bloqué",         color: "#ef4444" },
  hard_bounce: { label: "Adresse invalide", color: "#ef4444" },
  spam:        { label: "Signalé spam",   color: "#ef4444" },
};

export const SEGMENT_META: Record<ProspectSegment, { label: string; hint: string; color: string }> = {
  freelance:  { label: "Freelances",       hint: "Cœur de cible : ils facturent seuls, sans outil",              color: "#BEF221" },
  artisan:    { label: "Artisans / BTP",   hint: "Devis puis facture, souvent sur papier ou Excel",              color: "#fbbf24" },
  agence:     { label: "Petites agences",  hint: "Volume de devis, plusieurs interlocuteurs",                    color: "#60a5fa" },
  comptable:  { label: "Experts-comptables", hint: "Levier maximal : un cabinet = des dizaines de clients",      color: "#f472b6" },
  coworking:  { label: "Coworkings",       hint: "Accès groupé à une communauté d'indépendants",                 color: "#a78bfa" },
  federation: { label: "Fédérations / CCI", hint: "Relais institutionnel, crédibilité Factur-X",                 color: "#34d399" },
  tpe:        { label: "TPE de services",  hint: "Petites structures sans service administratif",                color: "#fb923c" },
  influenceur:{ label: "Influenceurs",     hint: "Créateurs à recruter — convertis la fiche en partenariat",      color: "#22d3ee" },
  backlink:   { label: "Backlinks / SEO",  hint: "Comparatifs et annuaires — objectif : un lien vers robi-app.com", color: "#e879f9" },
};

export const SEGMENTS = Object.keys(SEGMENT_META) as ProspectSegment[];

export const STATUS_META: Record<ProspectStatus, { label: string; color: string; open: boolean }> = {
  todo:       { label: "À contacter",  color: "#94a3b8", open: true },
  contacted:  { label: "Contacté",     color: "#60a5fa", open: true },
  followup:   { label: "En relance",   color: "#fbbf24", open: true },
  interested: { label: "Intéressé",    color: "#a78bfa", open: true },
  signup:     { label: "Inscrit",      color: "#34d399", open: true },
  customer:   { label: "Client",       color: "#BEF221", open: false },
  lost:       { label: "Perdu",        color: "#f87171", open: false },
};

export const PIPELINE: ProspectStatus[] = [
  "todo", "contacted", "followup", "interested", "signup", "customer",
];

// Un site qui publie un lien n'« achète » rien : mêmes statuts en base (le
// pipeline et maxStage restent valables), libellés adaptés à l'écran.
const BACKLINK_STATUS_LABEL: Partial<Record<ProspectStatus, string>> = {
  interested: "En discussion",
  signup:     "Lien promis",
  customer:   "Lien obtenu",
  lost:       "Refus",
};

export const statusLabel = (s: ProspectStatus, segment?: ProspectSegment | "all") =>
  (segment === "backlink" && BACKLINK_STATUS_LABEL[s]) || STATUS_META[s].label;

export const CHANNEL_LABEL: Record<ProspectChannel, string> = {
  email: "Email", linkedin: "LinkedIn", phone: "Téléphone", other: "Autre",
};

// ─── Sequence ─────────────────────────────────────────────────────────
export type SeqStep = {
  label: string;
  channel: ProspectChannel;
  delay: number;            // jours avant l'étape suivante
  status: ProspectStatus;
  templateKey: string;
};

export const SEQUENCE: SeqStep[] = [
  { label: "Premier email",                 channel: "email",    delay: 4,  status: "contacted", templateKey: "first" },
  { label: "Relance 1 — courte",            channel: "email",    delay: 5,  status: "followup",  templateKey: "relance1" },
  { label: "Connexion + mot LinkedIn",      channel: "linkedin", delay: 5,  status: "followup",  templateKey: "linkedin" },
  { label: "Relance 2 — l'angle Factur-X",  channel: "email",    delay: 8,  status: "followup",  templateKey: "facturx" },
  { label: "Dernière relance (clôture)",    channel: "email",    delay: 0,  status: "followup",  templateKey: "breakup" },
];

// Pas de LinkedIn ni d'angle Factur-X « commercial » pour un rédacteur de
// comparatif : un pitch, une relance une semaine après, puis on clôt.
export const BACKLINK_SEQUENCE: SeqStep[] = [
  { label: "Pitch (email ou formulaire)",   channel: "email", delay: 7, status: "contacted", templateKey: "first" },
  { label: "Relance courte",                channel: "email", delay: 10, status: "followup", templateKey: "relance1" },
  { label: "Dernière relance (clôture)",    channel: "email", delay: 0, status: "followup",  templateKey: "breakup" },
];

export const sequenceFor = (segment: ProspectSegment): SeqStep[] =>
  segment === "backlink" ? BACKLINK_SEQUENCE : SEQUENCE;

export const stepOf = (p: Prospect): SeqStep => {
  const seq = sequenceFor(p.segment);
  return seq[Math.min(p.seqStep ?? 0, seq.length - 1)];
};
export const hasNextStep = (p: Prospect) => (p.seqStep ?? 0) + 1 < sequenceFor(p.segment).length;

// ─── Templates ────────────────────────────────────────────────────────
// Voix : « l'équipe Robi AI », jamais un prénom (règle du 29/09/2026).
const SIGN = `L'équipe Robi AI
robi-app.com · Dites-le. Robi facture.`;

export interface MessageTemplate {
  id: string;
  label: string;
  segment: ProspectSegment | "all";
  channel: ProspectChannel;
  templateKey: string;
  subject: string;
  body: string;
}

/**
 * Positionnement : Robi transforme une phrase en facture conforme.
 * Facture électronique — dates exactes, à ne pas durcir : depuis le
 * 1er septembre 2026 toutes les entreprises doivent pouvoir RECEVOIR des
 * factures électroniques ; l'ÉMISSION devient obligatoire pour les TPE,
 * PME et indépendants au 1er septembre 2027 (grandes entreprises et ETI dès
 * 2026). Vrai, daté, vérifiable : utilisable sans exagérer.
 */
export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "all-first", label: "Générique — premier email", segment: "all", channel: "email", templateKey: "first",
    subject: "Vos factures, dictées en 30 secondes",
    body: `Bonjour {{prenom}},

Ici l'équipe Robi AI. Robi est un outil de facturation où vous dictez ce que vous avez fait et où la facture sort conforme, numérotée, prête à envoyer.

Concrètement : « facture 500 € pour Alice, prestation de conseil ». Trente secondes plus tard le PDF est prêt, la TVA est calculée, la numérotation est séquentielle, les mentions légales sont là.

Pourquoi maintenant : depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques, et l'émission devient obligatoire pour les TPE et indépendants en septembre 2027. Robi produit déjà du Factur-X natif : vous serez en règle sans changer vos habitudes.

C'est gratuit pour quatre factures ou devis par mois, sans carte bancaire — de quoi juger sur pièce en cinq minutes : robi-app.com

${SIGN}`,
  },
  {
    id: "freelance-first", label: "Freelance — premier email", segment: "freelance", channel: "email", templateKey: "first",
    subject: "Facturer sans y passer le dimanche soir",
    body: `Bonjour {{prenom}},

Ici l'équipe Robi AI — la facturation pour ceux qui facturent seuls.

Le principe : vous dictez ou vous écrivez une phrase, Robi sort la facture. « Facture 1 200 € pour {{societe}}, mission de trois jours. » C'est tout. Numérotation séquentielle, TVA, mentions légales, relances automatiques quand le client ne paie pas.

Un point qui va vous concerner : l'émission de factures électroniques devient obligatoire pour les indépendants en septembre 2027. Robi produit déjà du Factur-X, le sujet est réglé d'avance.

Quatre factures ou devis gratuits par mois, sans carte : robi-app.com

Si ça vous parle, répondez-nous et nous vous ouvrons un accès complet pour tester sans limite.

${SIGN}`,
  },
  {
    id: "artisan-first", label: "Artisan — premier email", segment: "artisan", channel: "email", templateKey: "first",
    subject: "Devis et factures depuis le chantier",
    body: `Bonjour {{prenom}},

Ici l'équipe Robi AI. Robi est un outil de devis et factures qui marche depuis le téléphone, sur le chantier, sans s'asseoir devant un ordinateur.

Vous dictez : « devis pour {{societe}}, pose de 40 m² de carrelage, 3 200 € ». Le devis part par mail, le client le signe en ligne, et vous le transformez en facture en un clic quand le chantier est fini.

Ce qui arrive : l'émission de factures électroniques devient obligatoire pour les artisans et TPE en septembre 2027. Robi est déjà au format Factur-X, rien à faire de votre côté.

Gratuit pour commencer, sans carte bancaire : robi-app.com

${SIGN}`,
  },
  {
    id: "comptable-first", label: "Expert-comptable — premier email", segment: "comptable", channel: "email", templateKey: "first",
    subject: "Factur-X pour vos clients TPE, avant 2027",
    body: `Bonjour {{prenom}},

Ici l'équipe Robi AI. Robi est un outil de facturation pensé pour les indépendants et les TPE.

Nous vous écrivons parce que l'échéance va vous concerner autant qu'eux : depuis le 1er septembre 2026 vos clients doivent pouvoir recevoir des factures électroniques, et en septembre 2027 ils devront en émettre. Ceux qui facturent encore sur Word ou Excel vous appelleront.

Robi génère du Factur-X natif — XML EN 16931 embarqué dans un PDF/A-3, validé sur les outils officiels. Le client dicte sa facture, elle sort conforme. Vous récupérez des pièces exploitables au lieu de scans.

Nous serions heureux de vous le montrer en quinze minutes, et de voir si un accès pour votre cabinet ou vos clients a du sens. Des conditions particulières sont possibles pour un cabinet.

${SIGN}`,
  },
  {
    id: "agence-first", label: "Agence — premier email", segment: "agence", channel: "email", templateKey: "first",
    subject: "Devis et factures pour {{societe}}",
    body: `Bonjour {{prenom}},

Ici l'équipe Robi AI — devis et factures générés à la voix ou en une phrase.

Pour une structure comme {{societe}}, l'intérêt est surtout dans le volume : un devis dicté en trente secondes, envoyé, signé en ligne par le client, puis transformé en facture en un clic. Les relances d'impayés partent toutes seules.

Et le sujet qui arrive : l'émission de factures électroniques devient obligatoire pour les PME en septembre 2027. Robi sort déjà du Factur-X conforme.

Quatre factures ou devis gratuits par mois pour juger sur pièce : robi-app.com

${SIGN}`,
  },
  {
    id: "coworking-first", label: "Coworking — premier email", segment: "coworking", channel: "email", templateKey: "first",
    subject: "Un outil de facturation pour vos résidents",
    body: `Bonjour {{prenom}},

Ici l'équipe Robi AI. Robi est un outil de facturation pour indépendants : on dicte une phrase, la facture sort conforme.

Nous vous écrivons parce que vos résidents sont tous concernés par la facture électronique — réception obligatoire depuis septembre 2026, émission en septembre 2027 — et que beaucoup facturent encore sur Word.

Nous pouvons proposer aux membres de {{societe}} un accès à conditions préférentielles, et venir animer une session de trente minutes sur ce que l'obligation change concrètement pour un indépendant. Un contenu utile pour votre communauté, qui ne vous coûte rien.

Ça vous intéresse d'en parler ?

${SIGN}`,
  },
  {
    id: "federation-first", label: "Fédération — premier email", segment: "federation", channel: "email", templateKey: "first",
    subject: "Facturation électronique — accompagner vos adhérents",
    body: `Bonjour {{prenom}},

Ici l'équipe Robi AI. Robi est un outil de facturation pour les indépendants et les TPE.

Depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques, et l'émission devient obligatoire pour les TPE en septembre 2027. Une partie de vos adhérents n'est pas prête, et beaucoup découvriront le sujet trop tard.

Robi génère du Factur-X natif conforme à la norme EN 16931. Nous pouvons mettre à disposition de {{societe}} de quoi accompagner vos adhérents : un accès à conditions préférentielles et, si vous le souhaitez, un webinaire ou une note pédagogique sur ce que l'obligation implique réellement.

Seriez-vous disponible pour en discuter ?

${SIGN}`,
  },

  {
    id: "influenceur-first", label: "Influenceur — premier email", segment: "influenceur", channel: "email", templateKey: "first",
    subject: "Partenariat — un outil de facturation pour votre audience",
    body: `Bonjour {{prenom}},

Ici l'équipe Robi AI. Robi est un outil de facturation où l'on dicte une phrase et où la facture sort conforme. Cible : indépendants, artisans, TPE.

Nous vous écrivons parce qu'une partie de votre audience va devoir passer à la facture électronique (émission obligatoire pour les indépendants en septembre 2027), et que la plupart ne le savent pas encore. C'est un sujet utile à traiter, et Robi est déjà conforme.

Ce que nous proposons :
— un code promo à votre nom, qui donne une vraie remise à votre audience
— une commission sur chaque vente réalisée avec ce code
— un accès complet gratuit pour vous, pour que vous en parliez en connaissance de cause

Pas d'exclusivité, pas d'engagement de durée. Si le format vous va, on cadre en quinze minutes.

${SIGN}`,
  },

  // ── Backlinks : rédacteurs de comparatifs, annuaires, médias ──────────
  // On ne vend rien : on propose un outil qui manque à leur sélection.
  // Prix repris de la page pricing live — ne pas en inventer d'autres.
  {
    id: "backlink-first", label: "Backlink — pitch comparatif", segment: "backlink", channel: "email", templateKey: "first",
    subject: "Un outil de facturation vocale / IA pour votre comparatif ?",
    body: `Bonjour {{prenom}},

Nous venons de lire votre comparatif des logiciels de facturation sur {{societe}} — sélection très complète. Un créneau n'y figure pas encore : la facturation par IA, à la voix.

C'est ce que fait Robi AI (robi-app.com) : on dicte « Prépare une facture de 500 € pour Alice » et le document conforme sort en 30 secondes — numérotation, mentions TVA, format Factur-X prêt pour la facture électronique. Relances d'impayés rédigées par l'IA, paiement en ligne intégré.

Côté prix : gratuit pour 4 factures ou devis par mois, puis 14 €/mois ou 89 €/an — et une offre de lancement à vie à 59 €.

Nous vous ouvrons volontiers un accès complet pour le tester. Et si vous travaillez en affiliation, nous avons un programme.

${SIGN}`,
  },
  {
    id: "backlink-relance1", label: "Backlink — relance courte", segment: "backlink", channel: "email", templateKey: "relance1",
    subject: "Re: Robi AI pour votre comparatif",
    body: `Bonjour {{prenom}},

Nous nous permettons de remonter notre message de la semaine dernière.

Si ça peut faciliter votre évaluation, nous vous créons un accès complet en deux minutes — vous pourrez tester la création d'une facture à la voix directement.

Et si l'outil ne correspond pas à votre ligne éditoriale, un simple « non merci » nous va très bien.

${SIGN}`,
  },
  {
    id: "backlink-breakup", label: "Backlink — clôture", segment: "backlink", channel: "email", templateKey: "breakup",
    subject: "Nous refermons le sujet",
    body: `Bonjour {{prenom}},

Nous n'insistons pas davantage. Si vous mettez à jour votre comparatif plus tard — notamment sur la facture électronique — nous restons disponibles pour un accès de test ou des informations sur Robi AI.

Bonne continuation,

${SIGN}`,
  },

  // ── Relances ─────────────────────────────────────────────────────────
  {
    id: "all-relance1", label: "Relance 1 — courte", segment: "all", channel: "email", templateKey: "relance1",
    subject: "Re: vos factures",
    body: `Bonjour {{prenom}},

Nous remontons notre message, au cas où il serait passé sous la pile.

Quatre factures ou devis gratuits par mois, sans carte bancaire, cinq minutes pour se faire une idée : robi-app.com

Si le sujet n'est pas d'actualité, dites-le-nous simplement et nous ne reviendrons pas.

${SIGN}`,
  },
  {
    id: "all-linkedin", label: "LinkedIn — mot de connexion", segment: "all", channel: "linkedin", templateKey: "linkedin",
    subject: "",
    body: `Bonjour {{prenom}}, ici l'équipe Robi AI — un outil de facturation pour indépendants et TPE (facture dictée, Factur-X conforme avant l'obligation d'émission de 2027). Au plaisir d'échanger.`,
  },
  {
    id: "all-facturx", label: "Relance 2 — l'angle Factur-X", segment: "all", channel: "email", templateKey: "facturx",
    subject: "En 2027, votre facture PDF ne suffira plus",
    body: `Bonjour {{prenom}},

Un point concret, même si Robi ne vous intéresse pas.

Depuis le 1er septembre 2026, toutes les entreprises doivent pouvoir recevoir des factures électroniques. Au 1er septembre 2027, les TPE, PME et indépendants devront aussi en émettre : un PDF classique envoyé par mail ne suffira plus entre entreprises. Le format attendu en France est Factur-X : un PDF qui embarque les données de la facture.

Beaucoup d'outils annoncent le sujet pour plus tard. Robi le fait déjà, validé sur les outils officiels de contrôle.

Si vous voulez vérifier où vous en êtes, nous répondons volontiers à vos questions, même sans que vous testiez l'outil.

${SIGN}`,
  },
  {
    id: "all-breakup", label: "Clôture", segment: "all", channel: "email", templateKey: "breakup",
    subject: "Nous vous laissons tranquille",
    body: `Bonjour {{prenom}},

Nous n'insistons pas davantage — nous refermons le sujet de notre côté.

Si un jour la facturation devient un point de friction, ou si l'échéance de 2027 vous pose question, notre adresse reste ouverte.

Bonne continuation,

${SIGN}`,
  },
];

export const resolveTemplate = (
  p: Prospect,
  templateKey: string,
  templates: MessageTemplate[] = DEFAULT_TEMPLATES
): MessageTemplate | undefined =>
  templates.find((t) => t.templateKey === templateKey && t.segment === p.segment) ??
  templates.find((t) => t.templateKey === templateKey && t.segment === "all");

export const renderTemplate = (text: string, p: Prospect): string =>
  text
    .replace(/\{\{prenom\}\}/g, (p.contactName || "").trim().split(/\s+/)[0] || "")
    .replace(/\{\{contact\}\}/g, p.contactName || "")
    .replace(/\{\{societe\}\}/g, p.company || "")
    .replace(/\{\{role\}\}/g, p.role || "")
    .replace(/\{\{ville\}\}/g, p.city || "")
    // « Bonjour , » quand le prénom manque
    .replace(/[ \t]+([,.])/g, "$1")
    .replace(/[ \t]{2,}/g, " ");

// ─── Firestore ────────────────────────────────────────────────────────
const col = () => collection(db, "prospects");

export const todayStr = () => new Date().toISOString().slice(0, 10);

export const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

export const relativeDay = (iso?: string): { label: string; late: boolean } => {
  if (!iso) return { label: "—", late: false };
  const diff = Math.round(
    (Date.parse(`${iso}T12:00:00Z`) - Date.parse(`${todayStr()}T12:00:00Z`)) / 86_400_000
  );
  if (diff < 0) return { label: `en retard de ${-diff} j`, late: true };
  if (diff === 0) return { label: "aujourd'hui", late: true };
  if (diff === 1) return { label: "demain", late: false };
  return { label: `dans ${diff} j`, late: false };
};

export const subscribeToProspects = (
  cb: (rows: Prospect[]) => void,
  onError?: (e: unknown) => void
) =>
  onSnapshot(
    query(col(), orderBy("createdAt", "desc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Prospect))),
    (e) => (onError ? onError(e) : console.error("[subscribeToProspects]", e))
  );

/**
 * Tokens that have opted out. The suppression list is the source of truth: the
 * public opt-out page cannot write to `prospects` (admin-only), so sending must
 * always be checked against this set rather than against a flag on the prospect.
 */
export const subscribeToUnsubscribes = (cb: (tokens: Set<string>) => void) =>
  onSnapshot(collection(db, "unsubscribes"), (snap) => {
    const set = new Set<string>();
    snap.docs.forEach((d) => {
      const t = (d.data() as { token?: string }).token;
      if (t) set.add(t);
    });
    cb(set);
  }, (e) => console.warn("[subscribeToUnsubscribes]", e));

/** Opaque, unguessable, and stable once emitted — it lives in emails already sent. */
export const makeUnsubToken = () =>
  `u_${crypto.randomUUID().replace(/-/g, "")}`;

export const addProspect = (p: Omit<Prospect, "id">) =>
  addDoc(col(), { ...p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

const rank = (s?: ProspectStatus) => (s ? PIPELINE.indexOf(s) : -1);

export const updateProspect = async (id: string, patch: Partial<Prospect>, current?: Prospect) => {
  const next: Partial<Prospect> = { ...patch, updatedAt: serverTimestamp() as never };
  // maxStage ne redescend jamais : sinon un prospect perdu sort de l'entonnoir
  // et le taux de conversion paraît pire qu'en réalité.
  if (patch.status && rank(patch.status) > rank(current?.maxStage ?? current?.status)) {
    next.maxStage = patch.status;
  }
  return updateDoc(doc(db, "prospects", id), next);
};

export const deleteProspect = (id: string) => deleteDoc(doc(db, "prospects", id));

/**
 * Résultats par angle, calculés depuis les fiches : chaque envoi trace
 * `angle:<id>` dans une touche, et l'issue se lit sur la fiche (livraison,
 * réponse, palier atteint). C'est ce qui permet à la recommandation de
 * s'appuyer sur les chiffres plutôt que sur une intuition.
 */
export interface AngleStat {
  angle: string;
  sent: number;
  opened: number;
  replied: number;
  interested: number;
  signup: number;
}

const ANGLE_RE = /angle:([a-z0-9-]+)/i;

export const angleStats = (rows: Prospect[]): AngleStat[] => {
  const by = new Map<string, AngleStat>();
  const get = (a: string) => by.get(a) || by.set(a, { angle: a, sent: 0, opened: 0, replied: 0, interested: 0, signup: 0 }).get(a)!;
  for (const p of rows) {
    const angles = (p.touches || []).map((t) => t.note?.match(ANGLE_RE)?.[1]).filter((a): a is string => !!a);
    if (!angles.length) continue;
    // L'issue est attribuée au dernier angle envoyé : c'est lui qui a
    // déclenché la réponse, ou qui n'a pas su la déclencher.
    const last = angles[angles.length - 1];
    for (const a of angles) get(a).sent++;
    const st = get(last);
    if (p.delivery && ["opened", "clicked", "replied"].includes(p.delivery.status)) st.opened++;
    if (p.delivery?.status === "replied" || (p.touches || []).some((t) => t.note?.startsWith("Réponse reçue"))) st.replied++;
    if (rank(p.maxStage ?? p.status) >= rank("interested")) st.interested++;
    if (rank(p.maxStage ?? p.status) >= rank("signup")) st.signup++;
  }
  return [...by.values()].sort((a, b) => b.sent - a.sent);
};

/** Efface les brouillons consommés — `undefined` n'est pas accepté par Firestore. */
export const clearDrafts = (id: string) =>
  updateDoc(doc(db, "prospects", id), { drafts: deleteField(), chosenDraft: deleteField(), updatedAt: serverTimestamp() });

/** Enregistre un contact et programme l'étape suivante de la séquence. */
export const advanceProspect = async (
  p: Prospect,
  note?: string,
  sent?: { subject: string; body: string }
) => {
  if (!p.id) return;
  const seq = sequenceFor(p.segment);
  const cur = stepOf(p);
  const nextIndex = Math.min((p.seqStep ?? 0) + 1, seq.length - 1);
  const touch: ProspectTouch = { date: todayStr(), channel: cur.channel, note, ...sent };

  // Le statut suit la séquence tant qu'on est dans la mécanique d'envoi
  // (à contacter → contacté → en relance). Au-delà — intéressé, inscrit,
  // client, perdu — c'est Ralph qui décide, on n'y touche pas.
  const auto: ProspectStatus[] = ["todo", "contacted", "followup"];
  const status = auto.includes(p.status) && rank(cur.status) > rank(p.status) ? cur.status : p.status;
  await updateProspect(p.id, {
    status,
    seqStep: nextIndex,
    touches: [...(p.touches || []), touch],
    nextActionDate: cur.delay > 0 ? addDays(todayStr(), cur.delay) : undefined,
    nextActionLabel: cur.delay > 0 ? seq[nextIndex].label : undefined,
  }, p);
};

/**
 * Importe des prospects depuis un JSON — même schéma que la skill
 * impulse-acquisition, pour que le même format serve aux deux.
 * Les doublons d'email sont ignorés.
 */
export const importProspectsFromJson = async (
  jsonStr: string
): Promise<{ imported: number; skipped: number; errors: string[] }> => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error(`JSON invalide : ${(e as Error).message}`);
  }
  const items = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  const errors: string[] = [];

  // Les sites contactés via un formulaire n'ont pas d'email : on dédoublonne
  // aussi sur le domaine, sinon chaque réimport crée des copies.
  const hostOf = (url?: string) => {
    if (!url) return "";
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      return "";
    }
  };

  const existing = await getDocs(col());
  const seen = new Set<string>();
  const seenHosts = new Set<string>();
  existing.docs.forEach((d) => {
    const data = d.data() as Prospect;
    if (data.email) seen.add(data.email.toLowerCase());
    const h = hostOf(data.website);
    if (h) seenHosts.add(h);
  });

  let imported = 0;
  let skipped = 0;
  const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

  for (const [i, raw] of items.entries()) {
    const company = typeof raw.company === "string" ? raw.company.trim() : "";
    if (!company) {
      errors.push(`#${i + 1} : champ "company" requis.`);
      continue;
    }
    const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
    const host = hostOf(typeof raw.website === "string" ? raw.website : undefined);
    if ((email && seen.has(email)) || (host && seenHosts.has(host))) {
      skipped++;
      continue;
    }

    const seg = String(raw.segment || "") as ProspectSegment;
    const segment: ProspectSegment = SEGMENTS.includes(seg) ? seg : "freelance";
    const seq = sequenceFor(segment);
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

    // Optionnel : reprendre une fiche déjà entamée (ex. un pitch déjà envoyé à la main).
    const status = typeof raw.status === "string" && raw.status in STATUS_META ? (raw.status as ProspectStatus) : "todo";
    const seqStep = typeof raw.seqStep === "number" ? Math.max(0, Math.min(raw.seqStep, seq.length - 1)) : 0;
    const touches = Array.isArray(raw.touches)
      ? (raw.touches as Record<string, unknown>[])
          .filter((t) => isDate(t.date))
          .map((t) => ({
            date: t.date as string,
            channel: (typeof t.channel === "string" && t.channel in CHANNEL_LABEL ? t.channel : "other") as ProspectChannel,
            ...(typeof t.note === "string" && t.note ? { note: t.note } : {}),
          }))
      : undefined;

    const p: Omit<Prospect, "id"> = {
      company,
      contactName: str(raw.contactName),
      role: str(raw.role),
      email: email || undefined,
      phone: str(raw.phone),
      website: str(raw.website),
      linkedin: str(raw.linkedin),
      city: str(raw.city),
      segment,
      status,
      maxStage: status === "lost" ? undefined : status,
      priority: raw.priority === 1 || raw.priority === 2 || raw.priority === 3 ? raw.priority : 2,
      source: str(raw.source),
      notes: str(raw.notes),
      touches: touches?.length ? touches : undefined,
      seqStep,
      nextActionDate: isDate(raw.nextActionDate) ? raw.nextActionDate : todayStr(),
      nextActionLabel: seq[seqStep].label,
    };
    // Firestore refuse `undefined`.
    const clean = Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined)) as Omit<Prospect, "id">;

    await addProspect(clean);
    if (email) seen.add(email);
    if (host) seenHosts.add(host);
    imported++;
  }

  return { imported, skipped, errors };
};
