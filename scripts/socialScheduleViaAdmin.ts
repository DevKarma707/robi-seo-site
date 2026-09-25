/**
 * Programmer des posts en passant par la route de production de l'admin
 * (/api/social/schedule sur robi-app.com), comme le bouton « Programmer ».
 *
 *   npx tsx scripts/socialScheduleViaAdmin.ts plan.json
 *
 * plan.json = [{ "externalId": "2026-10-01-plombier-ig", "heure": "18:30" }, …]
 *
 * Pourquoi cette variante de socialSchedule.ts : BLOTATO_API_KEY est une
 * variable « sensible » sur Vercel — elle ne se télécharge pas, donc la clé
 * n'existe que sur le serveur. On fait donc ce que fait le navigateur de
 * Ralph : un jeton Firebase d'admin, présenté à la route, qui tient la clé.
 * Le jeton est frappé avec le compte de service (custom token pour le
 * compte admin) puis échangé contre un ID token via l'API Identity Toolkit
 * (clé web publique du projet). Rien ne sort du poste de Ralph.
 */
import fs from "node:fs";
import path from "node:path";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

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
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const ADMIN_EMAIL = process.env.ROBI_ADMIN_EMAIL || "ralphkaram75014@gmail.com";
const SITE = process.env.ROBI_SITE_URL || "https://robi-app.com";
if (!RAW || !API_KEY) { console.error("FIREBASE_SERVICE_ACCOUNT ou NEXT_PUBLIC_FIREBASE_API_KEY manquant dans .env.local."); process.exit(1); }
const sa = JSON.parse(RAW) as { private_key?: string };
if (sa.private_key) sa.private_key = sa.private_key.replace(/\\n/g, "\n");
const app = getApps()[0] ?? initializeApp({ credential: cert(sa as never) });

const fichier = process.argv[2];
if (!fichier) { console.error("Usage : npx tsx scripts/socialScheduleViaAdmin.ts plan.json"); process.exit(1); }

const idTokenAdmin = async (): Promise<string> => {
  const user = await getAuth(app).getUserByEmail(ADMIN_EMAIL);
  const custom = await getAuth(app).createCustomToken(user.uid);
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: custom, returnSecureToken: true }),
  });
  if (!r.ok) throw new Error(`signInWithCustomToken ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const body = (await r.json()) as { idToken: string };
  return body.idToken;
};

const main = async () => {
  const plan = JSON.parse(fs.readFileSync(path.resolve(fichier), "utf8")) as { externalId: string; heure: string }[];
  const idToken = await idTokenAdmin();
  const resultats: Record<string, unknown>[] = [];
  for (const l of plan) {
    const r = await fetch(`${SITE}/api/social/schedule`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ id: l.externalId, heure: l.heure }),
    });
    const body = (await r.json().catch(() => ({}))) as Record<string, unknown>;
    resultats.push({ externalId: l.externalId, http: r.status, ...body });
    console.log(l.externalId, r.status, JSON.stringify(body));
    if (!r.ok && r.status !== 409) break; // on s'arrête à la première panne, pas au « déjà programmé »
  }
  fs.writeFileSync(path.resolve(path.dirname(fichier), "programmation-resultat.json"), JSON.stringify(resultats, null, 2));
};

main().catch((e) => { console.error(e); process.exit(1); });
