/**
 * Dépose un fichier (image OU vidéo) dans la médiathèque de l'admin, depuis le Mac.
 *
 *   npx tsx scripts/deposerMedia.ts chemin/robi_post_2026-10-01-plombier-ig.mp4 [autre.jpg ...]
 *   npx tsx scripts/deposerMedia.ts --dossier reseaux fichier.mp4
 *
 * Écrit dans `partage/<dossier>/<nom>` du bucket, avec le même jeton de
 * téléchargement que la route /api/social/media : l'URL renvoyée est celle à
 * mettre dans `imageUrl` du post.
 *
 * Pourquoi ce script existe alors que compose/deposer.mjs (skill
 * robi-social-media) fait déjà le dépôt : la route /api/social/media refuse
 * la vidéo (images seulement, 25 Mo) et un reel est un MP4 de 10 à 20 Mo qui
 * ne passe pas le corps de requête de Vercel. Ici on écrit directement dans
 * Storage avec le compte de service local (FIREBASE_SERVICE_ACCOUNT dans
 * .env.local, comme scripts/kanban.ts). Jamais exposé, jamais en cloud.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

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
const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!RAW || !BUCKET) {
  console.error("FIREBASE_SERVICE_ACCOUNT ou NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET manquant dans .env.local.");
  process.exit(1);
}
const sa = JSON.parse(RAW) as { private_key?: string };
if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
const app = getApps()[0] ?? initializeApp({ credential: cert(sa as never) });
const bucket = getStorage(app).bucket(BUCKET);

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".mp4": "video/mp4", ".mov": "video/quicktime",
};
/** Instagram refuse au-delà : un reel de 8 s en 1080p tient largement sous 30 Mo. */
const TAILLE_MAX = 100 * 1024 * 1024;

const nomSur = (brut: string) =>
  (brut.split("/").pop() ?? "").replace(/[^A-Za-z0-9._-]/g, "-").replace(/^\.+/, "").slice(0, 120);

const args = process.argv.slice(2);
let dossier = "reseaux";
const fichiers: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--dossier") dossier = nomSur(args[++i] ?? "reseaux");
  else fichiers.push(args[i]);
}
if (!fichiers.length) {
  console.error("Usage : npx tsx scripts/deposerMedia.ts [--dossier reseaux] fichier.mp4 [fichier.jpg ...]");
  process.exit(1);
}

const main = async () => {
  const resultats: { fichier: string; url?: string; erreur?: string }[] = [];
  for (const f of fichiers) {
    const chemin = path.resolve(f);
    const ext = path.extname(chemin).toLowerCase();
    const type = TYPES[ext];
    if (!fs.existsSync(chemin)) { resultats.push({ fichier: f, erreur: "introuvable" }); continue; }
    if (!type) { resultats.push({ fichier: f, erreur: `type refusé (${ext})` }); continue; }
    const octets = fs.readFileSync(chemin);
    if (octets.length > TAILLE_MAX) { resultats.push({ fichier: f, erreur: `trop gros (${Math.round(octets.length / 1048576)} Mo)` }); continue; }
    const nom = nomSur(path.basename(chemin));
    const destination = `partage/${dossier}/${nom}`;
    const jeton = crypto.randomUUID();
    try {
      await bucket.file(destination).save(octets, {
        contentType: type,
        metadata: { metadata: { firebaseStorageDownloadTokens: jeton } },
      });
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(destination)}?alt=media&token=${jeton}`;
      resultats.push({ fichier: f, url });
    } catch (e) {
      resultats.push({ fichier: f, erreur: (e as Error).message });
    }
  }
  console.log(JSON.stringify(resultats, null, 2));
  if (resultats.some((r) => r.erreur)) process.exit(2);
};

main().catch((e) => { console.error(e); process.exit(1); });
