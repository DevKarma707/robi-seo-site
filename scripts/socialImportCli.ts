/**
 * Importer un lot de posts réseaux depuis le Mac — même contrat que le bouton
 * « Importer du JSON » de l'onglet Réseaux (validateImportPost + planSocialImport).
 *
 *   npx tsx scripts/socialImportCli.ts chemin/import-reseaux-2026-10-lot1.json
 *
 * Écrit avec le compte de service (FIREBASE_SERVICE_ACCOUNT dans .env.local).
 * Ne crée que des brouillons, comme l'admin : le passage en « prêt » et la
 * programmation restent un geste de Ralph (ou scripts/socialSchedule.ts).
 * Idempotent : un post déjà présent (même externalId) est enrichi, jamais
 * dupliqué.
 */
import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { parseSocialImport, validateImportPost, planSocialImport, type ImportPost, type ExistingPost } from "../src/lib/socialImport";

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
if (!RAW) { console.error("FIREBASE_SERVICE_ACCOUNT manquant dans .env.local."); process.exit(1); }
const sa = JSON.parse(RAW) as { private_key?: string };
if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
const app = getApps()[0] ?? initializeApp({ credential: cert(sa as never) });
const db = getFirestore(app);

const fichier = process.argv[2];
if (!fichier) { console.error("Usage : npx tsx scripts/socialImportCli.ts lot.json"); process.exit(1); }

const main = async () => {
  const lu = parseSocialImport(fs.readFileSync(path.resolve(fichier), "utf8"));
  if (!lu.ok) throw new Error(lu.error);
  const errors: string[] = [];
  const posts: ImportPost[] = [];
  lu.items.forEach((raw, i) => {
    const r = validateImportPost(raw, i);
    if (r.ok) posts.push(r.post); else errors.push(r.error);
  });

  const col = db.collection("socialPosts");
  const snap = await col.get();
  const existing: ExistingPost[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ExistingPost, "id">) }));
  const { actions, errors: planErrors } = planSocialImport(posts, existing);
  errors.push(...planErrors);

  let imported = 0, updated = 0, skipped = actions.filter((a) => a.action === "skip").length;
  await db.runTransaction(async (tx) => {
    const cibles = actions
      .filter((a) => a.action !== "skip")
      .map((a) => ({ a, ref: a.action === "create" ? col.doc(a.post.externalId) : col.doc((a as { id: string }).id) }));
    const lus = await Promise.all(cibles.map((c) => tx.get(c.ref)));
    cibles.forEach(({ a, ref }, i) => {
      const dejaLa = lus[i].exists;
      if (a.action === "create") {
        if (dejaLa) { skipped++; errors.push(`"${a.post.externalId}" existait déjà — rien remplacé.`); return; }
        const { statusIgnored, id: _id, ...champs } = a.post;
        void statusIgnored; void _id;
        tx.set(ref, { ...champs, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
        imported++;
        return;
      }
      if (a.action === "enrich") {
        if (!dejaLa) { skipped++; errors.push(`${ref.id} n'existe plus.`); return; }
        tx.update(ref, { ...a.patch, updatedAt: FieldValue.serverTimestamp() });
        updated++;
      }
    });
  });
  console.log(JSON.stringify({ imported, updated, skipped, errors }, null, 2));
};

main().catch((e) => { console.error(e); process.exit(1); });
