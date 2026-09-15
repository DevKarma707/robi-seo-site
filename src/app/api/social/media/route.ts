import { NextResponse } from "next/server";
import { verifierJeton } from "@/lib/apiToken";
import { adminBucket, adminDepuisJeton } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

/**
 * La médiathèque, atteignable par une automatisation.
 *
 * GET  → ce qu'il y a dans `partage/`
 * POST → y déposer une image, depuis son URL
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

  const [fichiers] = await bucket.getFiles({ prefix });
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

/** Dépose une image dans la médiathèque, depuis son URL. */
export async function POST(req: Request) {
  const refus = await autoriser(req);
  if (refus) return refus;

  const bucket = bucketOuErreur();
  if (bucket instanceof NextResponse) return bucket;

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

  const dossier = nomSur(corps.dossier ?? DOSSIER_DEFAUT);
  const nom = nomSur(corps.nom ?? new URL(corps.url).pathname);
  const chemin = `${RACINE}/${dossier}/${nom}`;

  // Le jeton de téléchargement est posé à l'écriture : sans lui, l'URL publique
  // renvoyée ci-dessous serait refusée, et l'appelant croirait le dépôt réussi
  // en récupérant un lien mort.
  const jetonTelechargement = crypto.randomUUID();
  await bucket.file(chemin).save(octets, {
    contentType: type,
    metadata: { metadata: { firebaseStorageDownloadTokens: jetonTelechargement } },
  });

  return NextResponse.json({
    ok: true,
    path: chemin,
    url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(chemin)}?alt=media&token=${jetonTelechargement}`,
    taille: octets.length,
    type,
  });
}
