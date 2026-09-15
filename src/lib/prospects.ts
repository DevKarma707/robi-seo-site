// Acquisition pipeline for Robi — ported from the Impulse admin, retargeted at
// who actually buys invoicing software.
//
// Prospects live in the `robi-seo` project (this is marketing data, not app
// data). Sending goes through /api/admin/outreach, which uses a SEPARATE SMTP
// account from the one that delivers customers' invoices — see that route.
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy,
  onSnapshot, serverTimestamp, Timestamp,
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
  /** Jeton du lien de désinscription, généré au premier envoi. */
  unsubToken?: string;
  unsubscribedAt?: string;
  lastEmailAt?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

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
const SIGN = `Ralph Karam — Robi AI
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
 * Positionnement : Robi transforme une phrase en facture conforme. L'argument
 * qui ouvre les portes en 2026, c'est l'obligation de facturation électronique
 * au 1er septembre — c'est vrai, daté, et vérifiable, donc utilisable sans
 * exagérer.
 */
export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "all-first", label: "Générique — premier email", segment: "all", channel: "email", templateKey: "first",
    subject: "Vos factures, dictées en 30 secondes",
    body: `Bonjour {{prenom}},

Je suis Ralph, je développe Robi — un outil de facturation où vous dictez ce que vous avez fait et où la facture sort conforme, numérotée, prête à envoyer.

Concrètement : « facture 500 € pour Alice, prestation de conseil ». Trente secondes plus tard le PDF est prêt, la TVA est calculée, la numérotation est séquentielle, les mentions légales sont là.

Pourquoi je vous écris maintenant : la facturation électronique devient obligatoire en France le 1er septembre 2026. Robi génère déjà du Factur-X natif, donc vous serez en règle sans rien changer à vos habitudes.

C'est gratuit pour deux documents par mois, sans carte bancaire — de quoi juger sur pièce en cinq minutes : robi-app.com

${SIGN}`,
  },
  {
    id: "freelance-first", label: "Freelance — premier email", segment: "freelance", channel: "email", templateKey: "first",
    subject: "Facturer sans y passer le dimanche soir",
    body: `Bonjour {{prenom}},

Ralph, je développe Robi — la facturation pour ceux qui facturent seuls.

Le principe : vous dictez ou vous écrivez une phrase, Robi sort la facture. « Facture 1 200 € pour {{societe}}, mission de trois jours. » C'est tout. Numérotation séquentielle, TVA, mentions légales, relances automatiques quand le client ne paie pas.

Un point qui va vous concerner directement : la facture électronique devient obligatoire le 1er septembre 2026. Robi produit déjà du Factur-X, donc le sujet est réglé d'avance.

Deux documents par mois gratuits, sans carte : robi-app.com

Si ça vous parle, dites-moi et je vous fais un accès complet pour tester sans limite.

${SIGN}`,
  },
  {
    id: "artisan-first", label: "Artisan — premier email", segment: "artisan", channel: "email", templateKey: "first",
    subject: "Devis et factures depuis le chantier",
    body: `Bonjour {{prenom}},

Ralph, je développe Robi — un outil de devis et factures qui marche depuis le téléphone, sur le chantier, sans s'asseoir devant un ordinateur.

Vous dictez : « devis pour {{societe}}, pose de 40 m² de carrelage, 3 200 € ». Le devis part par mail, le client le signe en ligne, et vous le transformez en facture en un clic quand le chantier est fini.

Ce qui compte pour vous en 2026 : la facturation électronique devient obligatoire au 1er septembre. Robi est déjà au format Factur-X, donc rien à faire de votre côté.

Gratuit pour commencer, sans carte bancaire : robi-app.com

${SIGN}`,
  },
  {
    id: "comptable-first", label: "Expert-comptable — premier email", segment: "comptable", channel: "email", templateKey: "first",
    subject: "Factur-X pour vos clients TPE — au 1er septembre",
    body: `Bonjour {{prenom}},

Ralph, je développe Robi, un outil de facturation à destination des indépendants et des TPE.

Je vous écris parce que le 1er septembre 2026 va vous tomber dessus autant qu'à eux : vos clients qui facturent encore sur Word ou Excel vont devoir passer au format électronique, et c'est vous qu'ils appelleront.

Robi génère du Factur-X natif — XML EN 16931 embarqué dans un PDF/A-3, validé sur les outils officiels. Le client dicte sa facture, elle sort conforme. Vous récupérez des pièces exploitables au lieu de scans.

Je serais heureux de vous le montrer en quinze minutes, et de voir si un accès pour votre cabinet ou vos clients a du sens. Je peux prévoir des conditions particulières pour un cabinet.

${SIGN}`,
  },
  {
    id: "agence-first", label: "Agence — premier email", segment: "agence", channel: "email", templateKey: "first",
    subject: "Devis et factures pour {{societe}}",
    body: `Bonjour {{prenom}},

Ralph, je développe Robi — devis et factures générés à la voix ou en une phrase.

Pour une structure comme {{societe}}, l'intérêt est surtout dans le volume : un devis dicté en trente secondes, envoyé, signé en ligne par le client, puis transformé en facture en un clic. Les relances d'impayés partent tout seules.

Et le sujet qui arrive : facturation électronique obligatoire au 1er septembre 2026. Robi sort déjà du Factur-X conforme.

Deux documents gratuits par mois pour juger sur pièce : robi-app.com

${SIGN}`,
  },
  {
    id: "coworking-first", label: "Coworking — premier email", segment: "coworking", channel: "email", templateKey: "first",
    subject: "Un outil de facturation pour vos résidents",
    body: `Bonjour {{prenom}},

Ralph, je développe Robi — un outil de facturation pour indépendants : on dicte une phrase, la facture sort conforme.

Je vous écris parce que vos résidents vont tous être concernés par l'obligation de facturation électronique du 1er septembre 2026, et que beaucoup facturent encore sur Word.

Je peux proposer aux membres de {{societe}} un accès à conditions préférentielles, et venir faire une session de trente minutes sur ce que l'obligation change concrètement pour un indépendant. C'est un contenu utile pour votre communauté, et ça ne vous coûte rien.

Ça vous intéresse d'en parler ?

${SIGN}`,
  },
  {
    id: "federation-first", label: "Fédération — premier email", segment: "federation", channel: "email", templateKey: "first",
    subject: "Facturation électronique 2026 — accompagner vos adhérents",
    body: `Bonjour {{prenom}},

Ralph, je développe Robi, un outil de facturation à destination des indépendants et des TPE.

Le 1er septembre 2026, la facturation électronique devient obligatoire. Une partie de vos adhérents n'est pas prête, et beaucoup découvriront le sujet trop tard.

Robi génère du Factur-X natif conforme à la norme EN 16931. Je peux mettre à disposition de {{societe}} de quoi accompagner vos adhérents : un accès à conditions préférentielles, et si vous le souhaitez un webinaire ou une note pédagogique sur ce que l'obligation implique réellement.

Seriez-vous disponible pour en discuter ?

${SIGN}`,
  },

  {
    id: "influenceur-first", label: "Influenceur — premier email", segment: "influenceur", channel: "email", templateKey: "first",
    subject: "Partenariat — un outil de facturation pour votre audience",
    body: `Bonjour {{prenom}},

Ralph, je développe Robi : un outil de facturation où l'on dicte une phrase et où la facture sort conforme. Cible : indépendants, artisans, TPE.

Je vous écris parce qu'une partie de votre audience va se prendre l'obligation de facturation électronique du 1er septembre 2026 en pleine figure, et que la plupart ne le savent pas encore. C'est un sujet utile à traiter, et Robi est déjà conforme.

Ce que je propose :
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

Je viens de lire votre comparatif des logiciels de facturation sur {{societe}} — sélection très complète. Un créneau n'y figure pas encore : la facturation par IA, à la voix.

C'est ce que fait Robi AI (robi-app.com) : on dicte « Prépare une facture de 500 € pour Alice » et le document conforme sort en 30 secondes — numérotation, mentions TVA, format Factur-X prêt pour l'obligation du 1er septembre 2026. Relances d'impayés rédigées par l'IA, paiement en ligne intégré.

Côté prix : gratuit pour 2 documents, puis 14 €/mois ou 89 €/an — et une offre de lancement à vie à 59 €, que je n'ai vue nulle part ailleurs.

Je vous ouvre volontiers un accès complet pour le tester. Et si vous travaillez en affiliation, nous avons un programme.

${SIGN}`,
  },
  {
    id: "backlink-relance1", label: "Backlink — relance courte", segment: "backlink", channel: "email", templateKey: "relance1",
    subject: "Re: Robi AI pour votre comparatif",
    body: `Bonjour {{prenom}},

Je me permets de remonter mon message de la semaine dernière.

Si ça peut faciliter votre évaluation, je vous crée un accès complet en deux minutes — vous pourrez tester la création d'une facture à la voix directement.

Et si l'outil ne correspond pas à votre ligne éditoriale, un simple « non merci » me va très bien.

${SIGN}`,
  },
  {
    id: "backlink-breakup", label: "Backlink — clôture", segment: "backlink", channel: "email", templateKey: "breakup",
    subject: "Je referme le sujet",
    body: `Bonjour {{prenom}},

Je n'insiste pas davantage. Si vous mettez à jour votre comparatif plus tard — notamment avec l'obligation de facturation électronique — je reste disponible pour un accès de test ou des informations sur Robi AI.

Bonne continuation,

${SIGN}`,
  },

  // ── Relances ─────────────────────────────────────────────────────────
  {
    id: "all-relance1", label: "Relance 1 — courte", segment: "all", channel: "email", templateKey: "relance1",
    subject: "Re: vos factures",
    body: `Bonjour {{prenom}},

Je remonte mon message, au cas où il serait passé sous la pile.

Deux documents par mois gratuits, sans carte bancaire, cinq minutes pour se faire une idée : robi-app.com

Si le sujet n'est pas d'actualité, dites-le moi simplement et je ne reviendrai pas.

${SIGN}`,
  },
  {
    id: "all-linkedin", label: "LinkedIn — mot de connexion", segment: "all", channel: "linkedin", templateKey: "linkedin",
    subject: "",
    body: `Bonjour {{prenom}}, Ralph — je développe Robi, un outil de facturation pour indépendants et TPE (facture dictée, Factur-X conforme avant l'obligation de septembre 2026). Je vous ajoute avec plaisir.`,
  },
  {
    id: "all-facturx", label: "Relance 2 — l'angle Factur-X", segment: "all", channel: "email", templateKey: "facturx",
    subject: "Le 1er septembre 2026, votre facture PDF ne suffira plus",
    body: `Bonjour {{prenom}},

Un point concret, même si Robi ne vous intéresse pas.

À partir du 1er septembre 2026, une facture entre entreprises devra être émise au format électronique structuré. Un PDF classique, même envoyé par mail, ne sera plus valable. Le format attendu en France est Factur-X : un PDF qui embarque le XML de la facture.

La plupart des outils annoncent le sujet pour plus tard. Robi le fait déjà, et c'est validé sur les outils officiels de contrôle.

Si vous voulez vérifier où vous en êtes, je réponds volontiers à vos questions même sans que vous testiez l'outil.

${SIGN}`,
  },
  {
    id: "all-breakup", label: "Clôture", segment: "all", channel: "email", templateKey: "breakup",
    subject: "Je vous laisse tranquille",
    body: `Bonjour {{prenom}},

Je n'insiste pas davantage — je referme le sujet de mon côté.

Si un jour la facturation devient un point de friction, ou si l'échéance de septembre 2026 vous pose question, mon adresse reste ouverte.

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

  await updateProspect(p.id, {
    status: p.status === "todo" ? cur.status : p.status,
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
