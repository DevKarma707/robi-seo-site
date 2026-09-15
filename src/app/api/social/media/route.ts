import { NextResponse } from "next/server";
import { verifierJeton } from "@/lib/apiToken";
import { adminBucket, adminDepuisJeton } from "@/lib/firebaseAdmin";
import type { Bucket, File as FichierStorage } from "@google-cloud/storage";

export const dynamic = "force-dynamic";

/**
 * La médiathèque, atteignable par une automatisation.
 *
 * GET  → ce qu'il y a dans `partage/`
 * POST → y déposer une image : depuis son URL (JSON) ou en la joignant
 *        (multipart/form-data, champ `fichier`)
 *
 * Pourquoi cette route existe : les visuels produits par un agent devaient
 * jusqu'ici transiter par un humain — télécharger, glisser dans l'onglet
 * Fichiers — et c'est l'étape qui casse la chaîne. L'alternative était de
 * confier la clé du compte de service à l'agent, ce qui lui donnerait un
 * accès total à Firestore pour un besoin qui tient en deux verbes.
 *
 * Deux façons d'entrer, et la seconde est la bonne pour l'admin :
 *
 * - le jeton d'automatisation, pour un agent qui tourne sans personne ;
 * - le jeton Firebase de l'admin connecté, présenté par l'onglet Réseaux.
 *
 * Le second ne demande AUCUN secret partagé : c'est la session de Ralph, déjà
 * ouverte dans son navigateur, qui autorise la copie. La clé du compte de
 * service ne quitte jamais le serveur.
 */

/** `null` si autorisé — par le jeton d'automatisation ou par un admin connecté. */
const autoriser = async (req: Request): Promise<NextResponse | null> => {
  const refusJeton = verifierJeton(req);
  if (!refusJeton) return null;

  const entete = req.headers.get("authorization") || "";
  const idToken = entete.startsWith("Bearer ") ? entete.slice(7) : "";
  if (idToken && (await adminDepuisJeton(idToken))) return null;

  // On renvoie le refus du jeton : il distingue « pas configuré » de
  // « refusé », ce qu'un 401 sec ne dirait pas.
  return refusJeton;
};

const RACINE = "partage";
const DOSSIER_DEFAUT = "reseaux";

/** Ce qu'on accepte de déposer. Un exécutable ne sert à rien dans une médiathèque. */
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** 25 Mo : au-delà, ce n'est plus un visuel de post. */
const TAILLE_MAX = 25 * 1024 * 1024;

/**
 * Nettoie un nom de fichier.
 *
 * Les `..` et les `/` sont retirés, pas échappés : un nom fabriqué ne doit pas
 * pouvoir sortir de `partage/`, et le seul moyen sûr est qu'il n'y ait rien à
 * interpréter.
 */
const nomSur = (brut: string): string => {
  const base = brut.split("/").pop() ?? "";
  const propre = base.replace(/[^A-Za-z0-9._-]/g, "-").replace(/^\.+/, "").slice(0, 120);
  return propre || `visuel-${Date.now()}.jpg`;
};

/**
 * Une erreur du bucket (compte de service sans droit Storage, bucket mal
 * nommé) sortait en 500 sans corps : impossible à diagnostiquer depuis
 * l'extérieur, et les journaux Vercel ne sont pas toujours lisibles. On la
 * renvoie en clair — le message vient de Google, pas d'un secret.
 */
const erreurStockage = (verbe: string, e: unknown) => {
  const detail = (e as Error).message ?? String(e);
  console.error(`[social/media] impossible de ${verbe} dans le bucket :`, detail);
  return NextResponse.json({ error: "storage_error", verbe, detail }, { status: 502 });
};

const bucketOuErreur = () => {
  const b = adminBucket();
  if (!b) {
    return NextResponse.json(
      {
        error: "storage_not_configured",
        detail: "FIREBASE_SERVICE_ACCOUNT ou NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET manquant.",
      },
      { status: 503 }
    );
  }
  return b;
};

/** Liste les fichiers de la médiathèque. */
export async function GET(req: Request) {
  const refus = await autoriser(req);
  if (refus) return refus;

  const bucket = bucketOuErreur();
  if (bucket instanceof NextResponse) return bucket;

  const url = new URL(req.url);
  const dossier = url.searchParams.get("dossier");
  const prefix = dossier ? `${RACINE}/${nomSur(dossier)}/` : `${RACINE}/`;

  let fichiers: FichierStorage[];
  try {
    [fichiers] = await bucket.getFiles({ prefix });
  } catch (e) {
    return erreurStockage("lister", e);
  }
  const items = fichiers
    // Storage n'a pas de répertoires : un objet dont le nom finit par « / » est
    // un dossier factice, pas un fichier.
    .filter((f) => !f.name.endsWith("/"))
    .map((f) => ({
      path: f.name,
      name: f.name.split("/").pop(),
      taille: Number(f.metadata.size ?? 0),
      type: f.metadata.contentType ?? null,
      modifie: f.metadata.updated ?? null,
      url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(f.name)}?alt=media&token=${f.metadata.metadata?.firebaseStorageDownloadTokens ?? ""}`,
    }));

  return NextResponse.json({ total: items.length, prefix, fichiers: items });
}

/**
 * Dépose une image dans la médiathèque.
 *
 * Deux entrées, un seul chemin d'écriture :
 *
 * - JSON `{ url, nom?, dossier? }` : l'image est rapatriée depuis son URL.
 *   C'est ce que fait l'admin pour un `imageUrl` externe.
 * - multipart/form-data `fichier` (+ `nom?`, `dossier?`) : l'image est jointe.
 *   C'est ce que fait un compositeur qui tourne sur le Mac — son JPEG n'a pas
 *   d'URL, et lui en fabriquer une ailleurs pour la rapatrier ensuite serait
 *   un détour pour rien.
 *
 * Mêmes refus dans les deux cas : type, taille, nom nettoyé.
 */
export async function POST(req: Request) {
  const refus = await autoriser(req);
  if (refus) return refus;

  const bucket = bucketOuErreur();
  if (bucket instanceof NextResponse) return bucket;

  const contentType = (req.headers.get("content-type") ?? "").split(";")[0].trim();
  if (contentType === "multipart/form-data") {
    return deposerFichier(req, bucket);
  }

  let corps: { url?: string; nom?: string; dossier?: string };
  try {
    corps = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!corps.url || !/^https:\/\//i.test(corps.url)) {
    return NextResponse.json(
      { error: "url_requise", detail: "Une adresse https:// est attendue." },
      { status: 400 }
    );
  }

  let reponse: Response;
  try {
    reponse = await fetch(corps.url);
  } catch (e) {
    return NextResponse.json(
      { error: "source_injoignable", detail: (e as Error).message },
      { status: 502 }
    );
  }
  if (!reponse.ok) {
    return NextResponse.json(
      { error: "source_en_erreur", detail: `${reponse.status} sur ${corps.url}` },
      { status: 502 }
    );
  }

  const type = (reponse.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!TYPES.has(type)) {
    return NextResponse.json(
      { error: "type_refuse", detail: `${type || "type inconnu"} — attendu ${[...TYPES].join(", ")}.` },
      { status: 415 }
    );
  }

  const octets = Buffer.from(await reponse.arrayBuffer());
  if (octets.length > TAILLE_MAX) {
    return NextResponse.json(
      { error: "trop_gros", detail: `${Math.round(octets.length / 1024 / 1024)} Mo, maximum ${TAILLE_MAX / 1024 / 1024} Mo.` },
      { status: 413 }
    );
  }

  return ecrire(bucket, octets, type, corps.nom ?? new URL(corps.url).pathname, corps.dossier);
}

/** Branche multipart : l'image est dans le corps de la requête. */
const deposerFichier = async (req: Request, bucket: Bucket) => {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_multipart" }, { status: 400 });
  }
  const fichier = form.get("fichier");
  if (!(fichier instanceof File)) {
    return NextResponse.json(
      { error: "fichier_requis", detail: "Un champ multipart `fichier` est attendu." },
      { status: 400 }
    );
  }

  const type = (fichier.type ?? "").split(";")[0].trim();
  if (!TYPES.has(type)) {
    return NextResponse.json(
      { error: "type_refuse", detail: `${type || "type inconnu"} — attendu ${[...TYPES].join(", ")}.` },
      { status: 415 }
    );
  }

  const octets = Buffer.from(await fichier.arrayBuffer());
  if (octets.length > TAILLE_MAX) {
    return NextResponse.json(
      { error: "trop_gros", detail: `${Math.round(octets.length / 1024 / 1024)} Mo, maximum ${TAILLE_MAX / 1024 / 1024} Mo.` },
      { status: 413 }
    );
  }

  const nom = form.get("nom");
  const dossier = form.get("dossier");
  return ecrire(
    bucket,
    octets,
    type,
    typeof nom === "string" && nom ? nom : fichier.name,
    typeof dossier === "string" && dossier ? dossier : undefined
  );
};

/** Écrit dans `partage/<dossier>/<nom>` et renvoie l'URL de téléchargement. */
const ecrire = async (
  bucket: Bucket,
  octets: Buffer,
  type: string,
  nomBrut: string,
  dossierBrut?: string
) => {
  const dossier = nomSur(dossierBrut ?? DOSSIER_DEFAUT);
  const nom = nomSur(nomBrut);
  const chemin = `${RACINE}/${dossier}/${nom}`;

  // Le jeton de téléchargement est posé à l'écriture : sans lui, l'URL publique
  // renvoyée ci-dessous serait refusée, et l'appelant croirait le dépôt réussi
  // en récupérant un lien mort.
  const jetonTelechargement = crypto.randomUUID();
  try {
    await bucket.file(chemin).save(octets, {
      contentType: type,
      metadata: { metadata: { firebaseStorageDownloadTokens: jetonTelechargement } },
    });
  } catch (e) {
    return erreurStockage("écrire", e);
  }

  return NextResponse.json({
    ok: true,
    path: chemin,
    url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(chemin)}?alt=media&token=${jetonTelechargement}`,
    taille: octets.length,
    type,
  });
};
