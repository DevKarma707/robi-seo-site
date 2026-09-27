/**
 * Synchronise la bibliothèque des créas de l'onglet Ads avec le dossier des
 * créas validées.
 *
 *   npx tsx scripts/syncCreas.ts                 lit ~/Desktop/ROBI/ROBI_DOC/VALIDÉ/README.md
 *   npx tsx scripts/syncCreas.ts --dossier <chemin>
 *   npx tsx scripts/syncCreas.ts --dry           affiche ce qui serait écrit, sans rien déposer
 *   npx tsx scripts/syncCreas.ts --lier <fichier.mp4> <id de pub Meta>   relie une créa à sa pub (onglet Ads)
 *   npx tsx scripts/syncCreas.ts --lier <fichier.mp4> aucun              retire le lien
 *
 * Pour chaque ligne du tableau du README : dépose la vidéo et sa couverture
 * dans Storage (`creas/<nom>`), lit la légende à côté, puis écrit
 * `adCreatives/<nom de la vidéo>` en fusion — `metaAdId`, posé depuis
 * l'admin, n'est jamais écrasé.
 *
 * Une vidéo déjà déposée avec la même taille n'est pas renvoyée : on garde
 * son jeton, la synchro peut tourner après chaque ajout au dossier. Sans
 * couverture (les pubs peintre), une image est tirée de la vidéo avec ffmpeg
 * dans un dossier temporaire — rien n'est écrit dans VALIDÉ.
 *
 * Même accès que scripts/deposerMedia.ts : FIREBASE_SERVICE_ACCOUNT dans
 * .env.local, jamais exposé, jamais en cloud.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
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

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const iDossier = args.indexOf("--dossier");
const DOSSIER = iDossier >= 0 ? path.resolve(args[iDossier + 1]) : path.join(os.homedir(), "Desktop/ROBI/ROBI_DOC/VALIDÉ");

const iLier = args.indexOf("--lier");
const lier = iLier >= 0 ? { fichier: path.basename(args[iLier + 1] ?? ""), adId: args[iLier + 2] ?? "" } : null;
if (lier && (!lier.fichier || !lier.adId)) {
  console.error("Usage : npx tsx scripts/syncCreas.ts --lier <fichier.mp4> <id de pub Meta | aucun>");
  process.exit(1);
}

const RAW = process.env.FIREBASE_SERVICE_ACCOUNT;
const BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
if (!dry && (!RAW || !BUCKET)) {
  console.error("FIREBASE_SERVICE_ACCOUNT ou NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET manquant dans .env.local.");
  process.exit(1);
}

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".mp4": "video/mp4", ".mov": "video/quicktime",
};

// ── Lecture du README ─────────────────────────────────────────────────
/** Retire le gras et les backticks : l'admin affiche du texte, pas du markdown. */
const clean = (s: string) => s.replace(/\*\*/g, "").replace(/`/g, "").trim();

interface Ligne { fichier: string; valideeLe: string; usage: string; statut: string; format: string; aSavoir: string; source: string }

const lireReadme = (): Ligne[] => {
  const md = fs.readFileSync(path.join(DOSSIER, "README.md"), "utf8");
  const lignes: Ligne[] = [];
  for (const l of md.split("\n")) {
    if (!l.startsWith("|")) continue;
    const cells = l.split("|").slice(1, -1).map((c) => c.trim());
    const fichier = clean(cells[0] ?? "");
    // En-tête et filet : seule une ligne qui nomme une vidéo est une créa.
    if (!/\.(mp4|mov)$/i.test(fichier)) continue;
    const [, valideeLe, usage, statut, format, aSavoir, source] = cells.map(clean);
    lignes.push({ fichier, valideeLe, usage, statut, format, aSavoir, source });
  }
  return lignes;
};

/** AAAA-MM-JJ_robi-<nom>_<langue>_<format>_<durée>.<ext> */
const decoder = (fichier: string) => {
  const base = fichier.replace(/\.[^.]+$/, "");
  const m = base.match(/^(\d{4}-\d{2}-\d{2})_robi-(.+)_([A-Z]{2})_([0-9x]+)_(\d+)s$/);
  if (!m) return null;
  const [, date, nom, langue, format, duree] = m;
  const genre = nom.split("-")[0];
  const reste = nom.slice(genre.length + 1) || nom;
  const titre = reste.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
  return { base, date, genre, titre, langue, format: format.replace("x", ":"), duree: Number(duree) };
};

// ── Storage ───────────────────────────────────────────────────────────
const app = dry ? null : getApps()[0] ?? initializeApp({ credential: cert((() => {
  const sa = JSON.parse(RAW!) as { private_key?: string };
  if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
  return sa as never;
})()) });
const bucket = app ? getStorage(app).bucket(BUCKET) : null;
const db = app ? getFirestore(app) : null;

const urlDe = (destination: string, jeton: string) =>
  `https://firebasestorage.googleapis.com/v0/b/${bucket!.name}/o/${encodeURIComponent(destination)}?alt=media&token=${jeton}`;

/** Dépose un fichier, ou réutilise celui déjà en place s'il a la même taille. */
const deposer = async (chemin: string, nom = path.basename(chemin)): Promise<{ url: string; envoye: boolean }> => {
  const type = TYPES[path.extname(chemin).toLowerCase()];
  if (!type) throw new Error(`type refusé : ${chemin}`);
  const destination = `creas/${nom}`;
  const f = bucket!.file(destination);
  const taille = fs.statSync(chemin).size;
  const [existe] = await f.exists();
  if (existe) {
    const [meta] = await f.getMetadata();
    const jeton = (meta.metadata?.firebaseStorageDownloadTokens as string | undefined)?.split(",")[0];
    if (jeton && Number(meta.size) === taille) return { url: urlDe(destination, jeton), envoye: false };
  }
  const jeton = crypto.randomUUID();
  await f.save(fs.readFileSync(chemin), {
    contentType: type,
    metadata: { metadata: { firebaseStorageDownloadTokens: jeton } },
  });
  return { url: urlDe(destination, jeton), envoye: true };
};

/** Couverture tirée de la vidéo (à 1,5 s : après le noir d'entrée éventuel). */
const extraireCouverture = (video: string, nom: string) => {
  const out = path.join(os.tmpdir(), nom);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "1.5", "-i", video, "-frames:v", "1", "-vf", "scale=720:-2", "-q:v", "3", out]);
  return out;
};

// ── Synchro ───────────────────────────────────────────────────────────
/** Même champ que le menu « Relier à une pub Meta » de l'onglet Ads. */
const lierPub = async ({ fichier, adId }: { fichier: string; adId: string }) => {
  const ref = db!.doc(`adCreatives/${fichier}`);
  if (!(await ref.get()).exists) {
    console.error(`Créa inconnue : ${fichier}. Lancer d'abord la synchro (sans --lier).`);
    process.exit(1);
  }
  const retirer = adId === "aucun";
  if (!retirer && !/^\d+$/.test(adId)) {
    console.error(`« ${adId} » n'est pas un id de pub Meta (chiffres uniquement, ex. 120212345678901234).`);
    process.exit(1);
  }
  await ref.update({ metaAdId: retirer ? FieldValue.delete() : adId });
  console.log(retirer ? `✓ ${fichier} — lien retiré` : `✓ ${fichier} — reliée à la pub ${adId}`);
};

const main = async () => {
  if (lier) return lierPub(lier);
  const lignes = lireReadme();
  if (!lignes.length) {
    console.error(`Aucune ligne de créa lue dans ${path.join(DOSSIER, "README.md")}.`);
    process.exit(1);
  }

  const bilan: { fichier: string; etat: string }[] = [];
  for (const l of lignes) {
    const d = decoder(l.fichier);
    const video = path.join(DOSSIER, l.fichier);
    if (!d) { bilan.push({ fichier: l.fichier, etat: "nom hors convention, ignoré" }); continue; }
    if (!fs.existsSync(video)) { bilan.push({ fichier: l.fichier, etat: "listé au README mais absent du dossier" }); continue; }

    const couvertureLocale = path.join(DOSSIER, `${d.base}_couverture.jpg`);
    const legendeLocale = path.join(DOSSIER, `${d.base}_legende.txt`);
    const legende = fs.existsSync(legendeLocale) ? fs.readFileSync(legendeLocale, "utf8").trim() : null;

    // Nom affiché dans l'onglet Ads : l'accroche (1re ligne de la légende), pour que deux
    // créas du même sujet (ex. App mobile FR / EN) ne portent pas le même nom. Sans légende,
    // on garde le nom tiré du fichier.
    const accroche = legende?.split("\n")[0].trim().replace(/[.…]+$/, "").slice(0, 70);

    const doc = {
      fichier: l.fichier,
      titre: accroche || d.titre,
      genre: d.genre,
      date: d.date,
      langue: d.langue,
      format: d.format,
      duree: d.duree,
      usages: l.usage.split("/").map((u) => u.trim()).filter(Boolean),
      statut: l.statut,
      aSavoir: l.aSavoir,
      source: l.source,
      legende,
    };

    if (dry) {
      bilan.push({ fichier: l.fichier, etat: `${doc.usages.join(" + ")} · ${doc.statut}${fs.existsSync(couvertureLocale) ? "" : " · couverture à extraire"}` });
      continue;
    }

    try {
      const v = await deposer(video);
      const c = fs.existsSync(couvertureLocale)
        ? await deposer(couvertureLocale)
        : await deposer(extraireCouverture(video, `${d.base}_couverture.jpg`));
      await db!.doc(`adCreatives/${l.fichier}`).set(
        { ...doc, videoUrl: v.url, coverUrl: c.url, syncedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
      bilan.push({ fichier: l.fichier, etat: v.envoye || c.envoye ? "déposé + fiche à jour" : "fiche à jour (médias déjà en place)" });
    } catch (e) {
      bilan.push({ fichier: l.fichier, etat: `ERREUR : ${(e as Error).message}` });
    }
  }

  // Ce qui a quitté le README reste dans la base : on le signale sans le supprimer.
  if (db) {
    const connus = new Set(lignes.map((l) => l.fichier));
    const snap = await db.collection("adCreatives").get();
    for (const d of snap.docs) if (!connus.has(d.id)) bilan.push({ fichier: d.id, etat: "en base mais plus au README (non supprimé)" });
  }

  for (const b of bilan) console.log(`${b.etat.startsWith("ERREUR") ? "✗" : "✓"} ${b.fichier} — ${b.etat}`);
  if (bilan.some((b) => b.etat.startsWith("ERREUR"))) process.exit(2);
};

main().catch((e) => { console.error(e); process.exit(1); });
