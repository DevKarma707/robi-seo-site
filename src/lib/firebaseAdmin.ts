import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

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
