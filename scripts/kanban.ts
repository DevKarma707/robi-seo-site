/**
 * Le kanban du lancement et sa passation, en ligne de commande.
 *
 * Pour tout agent (Claude, Codex, …) qui arrive sur le projet : à lire AVANT
 * d'agir, à signer APRÈS. Même données que l'onglet Tâches de l'admin.
 *
 *   npx tsx scripts/kanban.ts                    passation + tableau (todo/doing/blocked, done résumé)
 *   npx tsx scripts/kanban.ts --all              idem, avec le détail des tâches faites
 *   npx tsx scripts/kanban.ts --json             tout en JSON (passation + tâches)
 *   npx tsx scripts/kanban.ts note "…"           signe le journal (agent = $KANBAN_AGENT, défaut « claude »)
 *   npx tsx scripts/kanban.ts set <etat|nePasToucher|attention> "…"   réécrit une section (ou --file chemin.md)
 *   npx tsx scripts/kanban.ts done <id|titre>    passe une tâche en « Fait »
 *   npx tsx scripts/kanban.ts move <id|titre> <todo|doing|blocked|done>
 *   npx tsx scripts/kanban.ts add "Titre" [--cat seo] [--owner claude] [--effort M] [--p 2] [--detail "…"]
 *   npx tsx scripts/kanban.ts sync-seed          ajoute au tableau les tâches du backlog (SEED_TASKS) qui en manquent
 *
 * Authentification : FIREBASE_SERVICE_ACCOUNT dans .env.local (le même JSON
 * que sur Vercel). Le compte de service contourne les règles Firestore —
 * ce script n'est donc jamais exposé, il tourne sur le poste.
 */
import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  SEED_TASKS, COLUMN_META, CATEGORY_META, EFFORT_LABEL, isAutomatable,
  type LaunchTask, type TaskColumn, type TaskCategory, type TaskOwner, type TaskEffort,
} from "../src/lib/launchTasks";
import type { Passation, PassationEntry } from "../src/lib/passation";

// ── Accès ─────────────────────────────────────────────────────────────
const loadEnv = () => {
  const f = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
};
loadEnv();

const RAW = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!RAW) {
  console.error("FIREBASE_SERVICE_ACCOUNT manquant dans .env.local (JSON du compte de service robi-ai-website, sur une ligne).");
  process.exit(1);
}
const sa = JSON.parse(RAW) as { private_key?: string; project_id?: string };
if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
const app = getApps()[0] ?? initializeApp({ credential: cert(sa as never) });
const db = getFirestore(app);

const tasksCol = db.collection("launchTasks");
const passationRef = db.doc("launchMeta/passation");
const AGENT = process.env.KANBAN_AGENT || "claude";

// ── Lecture ───────────────────────────────────────────────────────────
const loadTasks = async (): Promise<LaunchTask[]> =>
  (await tasksCol.get()).docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LaunchTask, "id">) }));

const loadPassation = async (): Promise<Passation> => {
  const s = await passationRef.get();
  const d = (s.exists ? s.data() : {}) as Partial<Passation>;
  return { etat: d.etat ?? "", nePasToucher: d.nePasToucher ?? "", attention: d.attention ?? "", journal: d.journal ?? [] };
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const findTask = (rows: LaunchTask[], key: string): LaunchTask => {
  const byId = rows.find((r) => r.id === key);
  if (byId) return byId;
  const k = norm(key);
  const hits = rows.filter((r) => norm(r.title).includes(k));
  if (hits.length === 1) return hits[0];
  if (hits.length === 0) throw new Error(`Aucune tâche ne correspond à « ${key} ».`);
  throw new Error(`Plusieurs tâches correspondent à « ${key} » :\n` + hits.map((h) => `  ${h.id}  ${h.title}`).join("\n"));
};

// ── Affichage ─────────────────────────────────────────────────────────
const sortTasks = (a: LaunchTask, b: LaunchTask) => (a.priority - b.priority) || (a.order - b.order);

const line = (t: LaunchTask, withDetail: boolean) => {
  const tags = [`P${t.priority}`, t.effort, t.owner + (isAutomatable(t) ? "/auto" : ""), CATEGORY_META[t.category]?.label ?? t.category];
  let s = `  [${tags.join("][")}] ${t.title}`;
  if (t.blockedBy) s += `  ⛔ ${t.blockedBy}`;
  s += `\n      id ${t.id}`;
  if (withDetail && t.detail) s += `\n      ↳ ${t.detail.replace(/\s+/g, " ").slice(0, 300)}`;
  return s;
};

const printPassation = (p: Passation) => {
  const block = (title: string, body: string) => {
    console.log(`\n## ${title}`);
    console.log(body.trim() ? body.trim() : "  (vide)");
  };
  console.log("═══ PASSATION DU LANCEMENT — à lire avant d'agir ═══");
  block("Où on en est", p.etat);
  block("Ne pas toucher", p.nePasToucher);
  block("Attention", p.attention);
  console.log("\n## Journal (5 dernières interventions)");
  if (p.journal.length === 0) console.log("  (personne n'a encore signé)");
  for (const e of p.journal.slice(0, 5)) console.log(`  ${e.date.slice(0, 10)}  ${e.agent.padEnd(7)} ${e.note}`);
};

const printBoard = (rows: LaunchTask[], all: boolean) => {
  console.log("\n═══ TABLEAU ═══");
  for (const c of ["doing", "blocked", "todo", "done"] as TaskColumn[]) {
    const list = rows.filter((r) => r.column === c).sort(sortTasks);
    console.log(`\n── ${COLUMN_META[c].label} (${list.length})`);
    if (c === "done" && !all) {
      console.log(`  (${list.length} tâches faites — --all pour le détail)`);
      continue;
    }
    for (const t of list) console.log(line(t, c !== "done"));
  }
  console.log(`\nEfforts : ${Object.entries(EFFORT_LABEL).map(([k, v]) => `${k} = ${v}`).join(" · ")}`);
  console.log("Après ton intervention : npx tsx scripts/kanban.ts note \"…\"  puis  done <tâche>");
};

// ── Écriture ──────────────────────────────────────────────────────────
const addNote = async (note: string) => {
  const p = await loadPassation();
  const entry: PassationEntry = { date: new Date().toISOString(), agent: AGENT, note };
  await passationRef.set(
    { journal: [entry, ...p.journal].slice(0, 200), updatedAt: FieldValue.serverTimestamp(), updatedBy: AGENT },
    { merge: true },
  );
  console.log(`✔ Journal signé (${AGENT}) : ${note}`);
};

const setSection = async (key: string, text: string) => {
  if (!["etat", "nePasToucher", "attention"].includes(key)) throw new Error("set <etat|nePasToucher|attention> \"…\"");
  await passationRef.set({ [key]: text, updatedAt: FieldValue.serverTimestamp(), updatedBy: AGENT }, { merge: true });
  console.log(`✔ Section « ${key} » mise à jour (${text.length} caractères).`);
};

const moveTo = async (key: string, column: TaskColumn) => {
  const rows = await loadTasks();
  const t = findTask(rows, key);
  const inCol = rows.filter((r) => r.column === column && r.id !== t.id);
  const order = inCol.length ? Math.max(...inCol.map((r) => r.order)) + 1 : 0;
  const patch: Record<string, unknown> = { column, order, updatedAt: FieldValue.serverTimestamp() };
  patch.doneAt = column === "done" ? new Date().toISOString() : FieldValue.delete();
  await tasksCol.doc(t.id!).update(patch);
  console.log(`✔ « ${t.title} » → ${COLUMN_META[column].label}`);
};

const addTask = async (title: string, opts: Record<string, string>) => {
  const rows = await loadTasks();
  const category = (opts.cat ?? "lancement") as TaskCategory;
  if (!CATEGORY_META[category]) throw new Error(`Catégorie inconnue : ${category} (${Object.keys(CATEGORY_META).join(", ")})`);
  const owner = (opts.owner ?? "claude") as TaskOwner;
  const effort = (opts.effort ?? "M") as TaskEffort;
  const priority = Number(opts.p ?? 2) as 1 | 2 | 3;
  const todo = rows.filter((r) => r.column === "todo");
  const t: Omit<LaunchTask, "id"> = {
    title, column: "todo", category, owner, effort, priority,
    order: todo.length ? Math.max(...todo.map((r) => r.order)) + 1 : 0,
    ...(opts.detail ? { detail: opts.detail } : {}),
  };
  const ref = await tasksCol.add({ ...t, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  console.log(`✔ Tâche ajoutée (${ref.id}) : ${title}`);
};

/** Même logique que mergeSeedTasks (src/lib/launchTasks.ts) : comparaison sur le titre normalisé. */
const syncSeed = async () => {
  const rows = await loadTasks();
  const seen = new Set(rows.map((r) => norm(r.title)));
  const missing = SEED_TASKS.filter((s) => !seen.has(norm(s.title)));
  if (missing.length === 0) { console.log(`Tableau déjà complet (${rows.length} tâches).`); return; }
  const base = rows.filter((r) => r.column === "todo").reduce((m, r) => Math.max(m, r.order), 0) + 1;
  const batch = db.batch();
  missing.forEach((s, i) => {
    batch.set(tasksCol.doc(), { ...s, column: "todo", order: base + i, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  });
  await batch.commit();
  console.log(`✔ ${missing.length} tâche(s) du backlog ajoutée(s) :`);
  for (const s of missing) console.log(`  + ${s.title}`);
};

// ── CLI ───────────────────────────────────────────────────────────────
const parseOpts = (args: string[]) => {
  const pos: string[] = []; const opts: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) { opts[args[i].slice(2)] = args[i + 1] ?? "true"; i++; }
    else pos.push(args[i]);
  }
  return { pos, opts };
};

const main = async () => {
  const [cmd, ...rest] = process.argv.slice(2);
  const { pos, opts } = parseOpts(rest);
  switch (cmd) {
    case undefined:
    case "--all":
    case "--json": {
      const [p, rows] = await Promise.all([loadPassation(), loadTasks()]);
      if (cmd === "--json") { console.log(JSON.stringify({ passation: p, tasks: rows.sort(sortTasks) }, null, 2)); return; }
      printPassation(p);
      printBoard(rows, cmd === "--all");
      return;
    }
    case "note": {
      if (!pos[0]) throw new Error("note \"texte\"");
      await addNote(pos.join(" "));
      return;
    }
    case "set": {
      const text = opts.file ? fs.readFileSync(opts.file, "utf8") : pos.slice(1).join(" ");
      if (!pos[0] || !text) throw new Error("set <etat|nePasToucher|attention> \"…\"  (ou --file chemin.md)");
      await setSection(pos[0], text.trim());
      return;
    }
    case "done": {
      if (!pos[0]) throw new Error("done <id|titre>");
      await moveTo(pos[0], "done");
      return;
    }
    case "move": {
      const col = pos[1] as TaskColumn;
      if (!pos[0] || !COLUMN_META[col]) throw new Error("move <id|titre> <todo|doing|blocked|done>");
      await moveTo(pos[0], col);
      return;
    }
    case "add": {
      if (!pos[0]) throw new Error("add \"Titre\" [--cat …] [--owner …] [--effort …] [--p …] [--detail …]");
      await addTask(pos[0], opts);
      return;
    }
    case "sync-seed":
      await syncSeed();
      return;
    default:
      throw new Error(`Commande inconnue : ${cmd}. Voir l'en-tête du script.`);
  }
};

main().then(() => process.exit(0)).catch((e) => { console.error("✖", (e as Error).message); process.exit(1); });
