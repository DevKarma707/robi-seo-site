/**
 * Programmer des posts chez Blotato depuis le Mac — même geste que le bouton
 * « Programmer » de l'admin (route /api/social/schedule), sans passer par le
 * navigateur de Ralph.
 *
 *   npx tsx scripts/socialSchedule.ts plan.json            # programme
 *   npx tsx scripts/socialSchedule.ts plan.json --dry-run  # montre sans envoyer
 *
 * plan.json = [{ "externalId": "2026-10-01-plombier-ig", "heure": "18:30" }, …]
 * (l'id du document Firestore EST l'externalId pour les posts importés).
 *
 * Il faut BLOTATO_API_KEY dans .env.local (la même clé que sur Vercel) et
 * FIREBASE_SERVICE_ACCOUNT. Un post déjà programmé (scheduledVia = blotato)
 * ou publié est sauté : reprogrammer se fait dans l'admin (« Renvoyer »).
 * Chaque post part avec SON heure, heure de Paris.
 */
import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { listerComptes, preparer, publier, scheduledTimeParis } from "../src/lib/blotato";

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
const API_KEY = process.env.BLOTATO_API_KEY;
if (!RAW) { console.error("FIREBASE_SERVICE_ACCOUNT manquant dans .env.local."); process.exit(1); }
const sa = JSON.parse(RAW) as { private_key?: string };
if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
const app = getApps()[0] ?? initializeApp({ credential: cert(sa as never) });
const db = getFirestore(app);

const fichier = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
if (!fichier) { console.error("Usage : npx tsx scripts/socialSchedule.ts plan.json [--dry-run]"); process.exit(1); }
if (!API_KEY && !dryRun) {
  console.error("BLOTATO_API_KEY manquant dans .env.local (même valeur que sur Vercel, projet robi-seo-site). Utilise --dry-run pour voir le plan.");
  process.exit(1);
}

const lireForces = (): Record<string, string> => {
  try { return JSON.parse(process.env.BLOTATO_ACCOUNTS || "{}"); } catch { return {}; }
};

type Ligne = { externalId: string; heure: string };

const main = async () => {
  const plan = JSON.parse(fs.readFileSync(path.resolve(fichier), "utf8")) as Ligne[];
  const comptes = dryRun && !API_KEY ? [] : await listerComptes(API_KEY!);
  const resultats: Record<string, unknown>[] = [];

  for (const ligne of plan) {
    const ref = db.collection("socialPosts").doc(ligne.externalId);
    const snap = await ref.get();
    if (!snap.exists) { resultats.push({ externalId: ligne.externalId, erreur: "introuvable" }); continue; }
    const p = snap.data() as Record<string, unknown>;
    if (p.status === "published") { resultats.push({ externalId: ligne.externalId, saute: "déjà publié" }); continue; }
    if (p.scheduledVia === "blotato" && p.blotatoSubmissionId) { resultats.push({ externalId: ligne.externalId, saute: "déjà programmé", scheduledFor: p.scheduledFor }); continue; }
    if (!p.imageUrl) { resultats.push({ externalId: ligne.externalId, erreur: "visuel manquant" }); continue; }

    const scheduledTime = scheduledTimeParis(String(p.date), ligne.heure);
    if (dryRun && !API_KEY) {
      resultats.push({ externalId: ligne.externalId, scheduledFor: scheduledTime, caption: String(p.caption).split("\n")[0], dryRun: true });
      continue;
    }
    // `market` n'existe dans PostAPublier qu'avec le chantier multi-marchés
    // (pas encore commité) : passé par une variable pour compiler dans les deux cas.
    const aPublier = { id: snap.id, channel: String(p.channel), market: typeof p.market === "string" ? p.market : null, caption: String(p.caption ?? ""), hashtags: (p.hashtags as string) ?? null, imageUrl: p.imageUrl as string };
    const prep = preparer(
      aPublier as Parameters<typeof preparer>[0],
      comptes,
      { forces: lireForces(), facebookPageId: process.env.BLOTATO_FACEBOOK_PAGE_ID }
    );
    if (!prep.ok) { resultats.push({ externalId: ligne.externalId, erreur: prep.motif }); continue; }
    if (dryRun) { resultats.push({ externalId: ligne.externalId, scheduledFor: scheduledTime, accountId: prep.corps.post.accountId, dryRun: true }); continue; }

    try {
      const res = await publier(API_KEY!, { ...prep.corps, scheduledTime });
      await ref.update({
        status: "ready", scheduledVia: "blotato", scheduledAt: new Date().toISOString(), scheduledFor: scheduledTime,
        publishedUrl: `https://my.blotato.com/posts/${res.postSubmissionId}`, blotatoSubmissionId: res.postSubmissionId,
        blotatoStatus: "scheduled", blotatoCheckedAt: null, publishError: null, publishAttempts: 0, claimId: null, claimedAt: null,
      });
      resultats.push({ externalId: ligne.externalId, ok: true, scheduledFor: scheduledTime, submissionId: res.postSubmissionId });
    } catch (e) {
      const erreur = (e as Error).message;
      await ref.update({ publishError: erreur }).catch(() => undefined);
      resultats.push({ externalId: ligne.externalId, erreur });
    }
  }
  console.log(JSON.stringify(resultats, null, 2));
};

main().catch((e) => { console.error(e); process.exit(1); });
