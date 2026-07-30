// Kanban du lancement Robi.
//
// Le backlog initial n'est pas générique : c'est la liste réelle de ce qui reste
// à faire, constituée pendant les audits (webhook Polar, santé de l'app, SEO,
// stores, conformité). Chaque tâche porte son propriétaire, pour que Ralph voie
// d'un coup d'œil ce qu'il peut déléguer.
import {
  collection, addDoc, updateDoc, deleteDoc, doc, query, orderBy, onSnapshot,
  serverTimestamp, getDocs, writeBatch, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type TaskColumn = "todo" | "doing" | "blocked" | "done";
export type TaskOwner = "ralph" | "claude";
export type TaskEffort = "S" | "M" | "L";
export type TaskCategory =
  | "paiement" | "produit" | "mobile" | "seo" | "acquisition"
  | "influenceurs" | "conformite" | "lancement";

export interface LaunchTask {
  id?: string;
  title: string;
  detail?: string;
  column: TaskColumn;
  category: TaskCategory;
  owner: TaskOwner;
  effort: TaskEffort;
  priority: 1 | 2 | 3;      // 1 = à faire en premier
  /** Rang dans la colonne. Les décimales évitent de réécrire toute la colonne. */
  order: number;
  blockedBy?: string;
  doneAt?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const COLUMN_META: Record<TaskColumn, { label: string; color: string }> = {
  todo:    { label: "À faire",  color: "#94a3b8" },
  doing:   { label: "En cours", color: "#fbbf24" },
  blocked: { label: "Bloqué",   color: "#f87171" },
  done:    { label: "Fait",     color: "#BEF221" },
};

export const COLUMNS: TaskColumn[] = ["todo", "doing", "blocked", "done"];

export const CATEGORY_META: Record<TaskCategory, { label: string; color: string }> = {
  paiement:    { label: "Paiement",    color: "#BEF221" },
  produit:     { label: "Produit",     color: "#60a5fa" },
  mobile:      { label: "Mobile",      color: "#a78bfa" },
  seo:         { label: "SEO",         color: "#34d399" },
  acquisition: { label: "Acquisition", color: "#fb923c" },
  influenceurs:{ label: "Influenceurs",color: "#22d3ee" },
  conformite:  { label: "Conformité",  color: "#f472b6" },
  lancement:   { label: "Lancement",   color: "#fbbf24" },
};

export const CATEGORIES = Object.keys(CATEGORY_META) as TaskCategory[];

export const EFFORT_LABEL: Record<TaskEffort, string> = {
  S: "< 30 min", M: "1-3 h", L: "> 1 jour",
};

const col = () => collection(db, "launchTasks");

export const subscribeToTasks = (
  cb: (rows: LaunchTask[]) => void,
  onError?: (e: unknown) => void
) =>
  onSnapshot(
    query(col(), orderBy("order", "asc")),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LaunchTask))),
    (e) => (onError ? onError(e) : console.error("[subscribeToTasks]", e))
  );

export const addTask = (t: Omit<LaunchTask, "id">) =>
  addDoc(col(), { ...t, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });

export const updateTask = (id: string, patch: Partial<LaunchTask>) =>
  updateDoc(doc(db, "launchTasks", id), { ...patch, updatedAt: serverTimestamp() });

export const deleteTask = (id: string) => deleteDoc(doc(db, "launchTasks", id));

/** Déplace une tâche dans une colonne, à la position voulue. */
export const moveTask = (
  task: LaunchTask,
  column: TaskColumn,
  before: LaunchTask | null,
  after: LaunchTask | null
) => {
  const lo = before?.order ?? (after ? after.order - 2 : 0);
  const hi = after?.order ?? lo + 2;
  return updateTask(task.id!, {
    column,
    order: (lo + hi) / 2,
    ...(column === "done" && !task.doneAt ? { doneAt: new Date().toISOString().slice(0, 10) } : {}),
    ...(column !== "done" ? { doneAt: undefined } : {}),
  });
};

// ─── Backlog initial ──────────────────────────────────────────────────
type Seed = Omit<LaunchTask, "id" | "column" | "order" | "createdAt" | "updatedAt">;

/**
 * Ce qui reste réellement à faire au 30/07/2026. Issu des audits menés sur le
 * webhook Polar, la santé de l'app, le SEO, les stores et la conformité.
 */
export const SEED_TASKS: Seed[] = [
  // ── Paiement — rien d'autre ne compte tant que l'argent n'entre pas ──
  { title: "Cocher `subscription.active` dans le webhook Polar", category: "paiement", owner: "ralph", effort: "S", priority: 1,
    detail: "Polar → Settings → Webhooks → ROBI SUB → Details. C'est le seul event manquant sur les 8 nécessaires." },
  { title: "Faire un achat réel à 59 € de bout en bout", category: "paiement", owner: "ralph", effort: "S", priority: 1,
    detail: "Avec un compte test. C'est le seul test qui prouve toute la chaîne : checkout → paiement → webhook → accès Pro activé. Zéro vente n'a jamais transité." },
  { title: "Vérifier que le compte passe bien en Pro après l'achat", category: "paiement", owner: "claude", effort: "S", priority: 1,
    detail: "Contrôle des logs de la fonction et du flag isPro dans users/{uid}/settings/company." },
  { title: "Créer un token Polar avec le scope orders:read", category: "paiement", owner: "ralph", effort: "S", priority: 2,
    detail: "Débloque le chiffre d'affaires réel, le MRR et les remboursements dans l'onglet Pilotage." },
  { title: "Brancher le revenu réel Polar dans le Pilotage", category: "paiement", owner: "claude", effort: "M", priority: 2,
    blockedBy: "Token Polar avec scope orders:read" },

  // ── Produit ──
  { title: "Rendre le champ pays obligatoire à l'inscription", category: "produit", owner: "claude", effort: "M", priority: 1,
    detail: "16 comptes sur 19 n'ont aucun pays renseigné. Or le pays conditionne la TVA et le Factur-X : la conformité repose sur du vide pour 84 % des comptes. Plus petit changement à fort impact de toute la liste." },
  { title: "Créer le compte PostHog (région EU)", category: "produit", owner: "ralph", effort: "S", priority: 1,
    detail: "posthog.com, région EU, puis me donner la clé. Le code est déjà câblé : une variable d'env et tu récupères erreurs, replays de session et funnel produit." },
  { title: "Ajouter VITE_POSTHOG_KEY dans Vercel", category: "produit", owner: "ralph", effort: "S", priority: 1,
    blockedBy: "Compte PostHog" },
  { title: "Persister les métriques IA", category: "produit", owner: "claude", effort: "M", priority: 2,
    detail: "aiPerformanceLogger garde 100 métriques en mémoire et les perd au rechargement. Latence Gemini et taux d'échec de génération : c'est le cœur du produit et on est aveugle dessus." },
  { title: "Instrumenter le funnel produit dans PostHog", category: "produit", owner: "claude", effort: "M", priority: 2,
    detail: "signup, first_document_created, checkout_started, checkout_completed, pdf_downloaded.", blockedBy: "Clé PostHog" },
  { title: "Supprimer le dossier landing-page/ du repo de l'app", category: "produit", owner: "claude", effort: "S", priority: 3,
    detail: "Ancien site mort, repo séparé, liens en href=\"#\". Il ne sert plus à rien et prête à confusion avec robi-seo-site." },

  // ── Mobile — annoncé partout, publié nulle part ──
  { title: "Corriger la fiche annuaires qui annonce iOS et Android", category: "mobile", owner: "claude", effort: "S", priority: 1,
    detail: "La fiche produit du plan backlinks dit « Disponible sur le web, iOS et Android ». Vérifié : com.robi.app renvoie 0 résultat chez Apple et 404 chez Google. Vérifiable en dix secondes par un annuaire." },
  { title: "Créer les comptes développeur Apple et Google Play", category: "mobile", owner: "ralph", effort: "M", priority: 2,
    detail: "99 $/an chez Apple, 25 $ une fois chez Google." },
  { title: "Préparer les captures et fiches store (FR/EN/ES)", category: "mobile", owner: "claude", effort: "M", priority: 2 },
  { title: "Soumettre l'app iOS à la revue", category: "mobile", owner: "ralph", effort: "M", priority: 2,
    blockedBy: "Compte développeur Apple" },
  { title: "Publier l'app Android", category: "mobile", owner: "ralph", effort: "M", priority: 2,
    blockedBy: "Compte Google Play" },
  { title: "Rebrancher les boutons stores sur le site", category: "mobile", owner: "claude", effort: "S", priority: 3,
    blockedBy: "Apps publiées" },

  // ── SEO — la seule source d'acquisition qui fonctionne déjà ──
  { title: "Exporter les requêtes Search Console des 30 derniers jours", category: "seo", owner: "ralph", effort: "S", priority: 1,
    detail: "Deux clients sont arrivés par le SEO sans qu'on sache sur quelle requête. C'est l'inconnue la plus chère du moment." },
  { title: "Analyser l'export et identifier la veine à creuser", category: "seo", owner: "claude", effort: "M", priority: 1,
    blockedBy: "Export Search Console" },
  { title: "Écrire le cluster Factur-X / facture électronique 2026", category: "seo", owner: "claude", effort: "L", priority: 1,
    detail: "Avantage n°1 : obligation au 1er septembre 2026, et Robi est déjà conforme. Cinq mois d'avance sur les concurrents à convertir en trafic." },
  { title: "Page de comparaison Robi vs Facture.net / Henrri / Abby", category: "seo", owner: "claude", effort: "M", priority: 2,
    detail: "Avec JSON-LD SoftwareApplication et le prix." },
  { title: "Exécuter le plan de backlinks", category: "seo", owner: "ralph", effort: "L", priority: 2,
    detail: "Le plan existe déjà dans RALPH X SPACE/Robi/Plan Backlinks SEO Facture AI.md." },
  { title: "Vérifier l'indexation des 22 pages du sitemap", category: "seo", owner: "claude", effort: "S", priority: 3 },

  // ── Acquisition ──
  { title: "Créer le sous-domaine d'envoi mail.robi-app.com", category: "acquisition", owner: "ralph", effort: "M", priority: 1,
    detail: "Avec ses propres SPF, DKIM et DMARC, isolé du SMTP transactionnel. Sans ça, du démarchage marqué comme spam ferait cesser l'arrivée des factures de tes clients." },
  { title: "Renseigner les variables SMTP_OUTREACH_* dans Vercel", category: "acquisition", owner: "ralph", effort: "S", priority: 1,
    blockedBy: "Sous-domaine d'envoi" },
  { title: "Constituer une première liste de 30 experts-comptables", category: "acquisition", owner: "claude", effort: "M", priority: 1,
    detail: "Segment à effet de levier maximal : un cabinet recommande l'outil à des dizaines de clients TPE d'un coup." },
  { title: "Constituer une liste de 50 artisans et freelances", category: "acquisition", owner: "claude", effort: "M", priority: 2 },
  { title: "Envoyer les 30 premiers emails de prospection", category: "acquisition", owner: "ralph", effort: "M", priority: 2,
    blockedBy: "SMTP de prospection configuré" },
  { title: "Contacter 5 coworkings pour une session Factur-X", category: "acquisition", owner: "ralph", effort: "M", priority: 3,
    detail: "Contenu utile pour leur communauté, accès groupé pour toi." },

  // ── Influenceurs ──
  { title: "Créer 3 codes promo dans Polar", category: "influenceurs", owner: "ralph", effort: "S", priority: 2,
    detail: "Polar → Products → Discounts. Puis coller les codes dans les fiches de l'onglet Influenceurs." },
  { title: "Repérer 10 créateurs qui parlent aux indépendants", category: "influenceurs", owner: "claude", effort: "M", priority: 2,
    detail: "LinkedIn, YouTube et TikTok « freelance / auto-entrepreneur / gestion ». À importer dans le segment Influenceurs." },
  { title: "Négocier les 3 premiers partenariats", category: "influenceurs", owner: "ralph", effort: "M", priority: 3 },

  // ── Conformité ──
  { title: "Double-contrôle Factur-X sur le validateur FNFE-MPE", category: "conformite", owner: "ralph", effort: "S", priority: 1,
    detail: "Upload manuel sur services.fnfe-mpe.org. veraPDF et le schematron CEN passent déjà ; c'est le dernier contrôle avant la beta." },
  { title: "Relire les CGV et la politique de confidentialité", category: "conformite", owner: "ralph", effort: "M", priority: 2,
    detail: "Les pages existent et répondent en 200, mais leur contenu n'a jamais été audité." },
  { title: "Vérifier la conformité du bandeau cookies", category: "conformite", owner: "claude", effort: "S", priority: 3,
    detail: "GA4 est chargé sur le site : il faut un consentement préalable pour les cookies analytiques." },

  // ── Lancement ──
  { title: "Fixer la date limite de l'offre de lancement", category: "lancement", owner: "ralph", effort: "S", priority: 1,
    detail: "Onglet Lancement. C'est le levier d'urgence honnête — et il débloque l'affichage du compteur sur le site." },
  { title: "Brancher le compteur de places sur le site et dans l'app", category: "lancement", owner: "claude", effort: "M", priority: 1,
    blockedBy: "Date limite fixée" },
  { title: "Préparer le lancement Product Hunt", category: "lancement", owner: "claude", effort: "M", priority: 3,
    detail: "Visuels, tagline, premier commentaire, liste de soutiens à prévenir." },
  { title: "Écrire 10 posts réseaux sociaux sur l'échéance de septembre", category: "lancement", owner: "claude", effort: "M", priority: 2,
    detail: "Le sujet Factur-X est pédagogique : il se partage tout seul." },
  { title: "Mettre en place une page de statut publique", category: "lancement", owner: "claude", effort: "M", priority: 3,
    detail: "Les données de l'onglet Santé existent déjà, il suffit de les exposer en lecture." },
];

/** Charge le backlog. Ne fait rien si des tâches existent déjà. */
export const seedTasks = async (): Promise<{ created: number; skipped: boolean }> => {
  const existing = await getDocs(col());
  if (!existing.empty) return { created: 0, skipped: true };

  const batch = writeBatch(db);
  SEED_TASKS.forEach((t, i) => {
    const ref = doc(col());
    batch.set(ref, {
      ...t,
      column: "todo" as TaskColumn,
      // Priorité d'abord, ordre de déclaration ensuite.
      order: t.priority * 1000 + i,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
  return { created: SEED_TASKS.length, skipped: false };
};
