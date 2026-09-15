import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Accès Firestore privilégié, réservé aux automatisations sans humain devant
 * l'écran.
 *
 * Les règles de `socialPosts` exigent un admin authentifié : le SDK client ne
 * peut rien lire depuis un serveur, faute de session. Une Routine qui publie
 * les posts du jour tourne sans personne pour se connecter — d'où le SDK
 * d'administration, seul chemin qui ne demande pas de stocker le mot de passe
 * d'un compte humain quelque part.
 *
 * Ce module contourne donc les règles Firestore. Tout appelant doit avoir
 * vérifié son autorisation AVANT : ici, le jeton de `api/social/queue`.
 */

const RAW = process.env.FIREBASE_SERVICE_ACCOUNT;

let cached: Firestore | null = null;

/** `null` si le compte de service n'est pas configuré — l'appelant le dit. */
export const adminDb = (): Firestore | null => {
  if (cached) return cached;
  if (!RAW) return null;

  let app: App;
  try {
    // Le JSON arrive par variable d'environnement, sur une seule ligne. Les
    // sauts de ligne de la clé privée y sont échappés : les restaurer est
    // indispensable, sinon la signature échoue avec une erreur cryptique.
    const parsed = JSON.parse(RAW) as { private_key?: string };
    if (parsed.private_key) parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    app = getApps().length ? getApp() : initializeApp({ credential: cert(parsed as never) });
  } catch (e) {
    console.error("[firebaseAdmin] compte de service illisible:", (e as Error).message);
    return null;
  }

  cached = getFirestore(app);
  return cached;
};

/**
 * Le bucket de la médiathèque, ou `null` si rien n'est configuré.
 *
 * Même compte de service que Firestore : `partage/` est en lecture admin
 * seulement (storage.rules), donc inaccessible au SDK client depuis un
 * serveur, faute de session.
 */
export const adminBucket = () => {
  const nom = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!nom) return null;
  // adminDb() porte l'initialisation de l'app : l'appeler d'abord évite de
  // dupliquer la lecture du compte de service et sa gestion d'erreur.
  if (!adminDb()) return null;
  try {
    return getStorage(getApp()).bucket(nom);
  } catch (e) {
    console.error("[firebaseAdmin] bucket illisible:", (e as Error).message);
    return null;
  }
};

const ADMINS = ["ralphkaram75014@gmail.com", "robi@robi-app.com"];

/**
 * L'e-mail de l'admin qui présente ce jeton Firebase, ou null.
 *
 * Sert aux routes que l'admin appelle depuis le navigateur (programmer chez
 * Blotato) : le SDK client ne peut pas porter la clé Blotato, la route le
 * fait à sa place — mais seulement pour un humain identifié comme admin,
 * la même liste que les règles Firestore.
 *
 * Vérifié par l'API Identity Toolkit (accounts:lookup) plutôt que par
 * `firebase-admin/auth` : ce dernier tire `jwks-rsa` → `jose` en ESM, que le
 * Node de Vercel refuse de `require` — la route tombait en 500 avant même
 * de lire la requête. Google ne rend un utilisateur que pour un jeton
 * valide, non expiré, émis pour ce projet (clé web publique du projet).
 */
export const adminDepuisJeton = async (idToken: string): Promise<string | null> => {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const body = (await r.json()) as { users?: { email?: string; emailVerified?: boolean }[] };
    const u = body.users?.[0];
    const email = u?.email ?? "";
    return ADMINS.includes(email) ? email : null;
  } catch {
    return null;
  }
};
